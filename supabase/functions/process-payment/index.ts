import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-PAYMENT] ${step}${detailsStr}`);
};

// Strict input sanitization for RCON commands
const SAFE_IDENTIFIER_REGEX = /^[a-zA-Z0-9_-]+$/;

const sanitizeForRcon = (input: string, maxLength: number = 32): string => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: value must be a non-empty string');
  }
  
  // Remove all whitespace
  const cleaned = input.replace(/\s+/g, '');
  
  // Only allow alphanumeric, underscore, hyphen
  if (!SAFE_IDENTIFIER_REGEX.test(cleaned)) {
    throw new Error(`Invalid characters in value: ${input}. Only alphanumeric, underscore, and hyphen allowed.`);
  }
  
  // Enforce length limit
  if (cleaned.length === 0) {
    throw new Error('Value cannot be empty after sanitization');
  }
  if (cleaned.length > maxLength) {
    throw new Error(`Value too long: ${input} (max: ${maxLength} characters)`);
  }
  
  return cleaned.toLowerCase();
};

const sanitizeNumber = (input: string, min: number = 1, max: number = 1000000): number => {
  if (!input) {
    throw new Error('Invalid input: value is required');
  }
  
  const match = String(input).match(/(\d+)/);
  const num = match ? parseInt(match[1]) : NaN;
  
  if (isNaN(num)) {
    throw new Error(`Invalid number in value: ${input}`);
  }
  
  if (num < min || num > max) {
    throw new Error(`Number out of range: ${num} (must be between ${min} and ${max})`);
  }
  
  return num;
};

// Execute RCON commands for fulfillment
const executeRconCommands = async (commands: string[], username?: string) => {
  if (!commands || commands.length === 0) return;
  
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  for (const command of commands) {
    try {
      const finalCommand = username ? command.replace('{username}', username) : command;
      await supabaseClient.functions.invoke('rcon-command', {
        body: { command: finalCommand }
      });
      logStep("RCON command executed", { command: finalCommand });
    } catch (error) {
      logStep("RCON command failed", { command, error: (error as Error).message });
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started - verifying webhook");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
      throw new Error("Webhook secret not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Verify webhook signature for security
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: Missing Stripe signature");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: (err as Error).message });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Only process checkout.session.completed events
    if (event.type !== "checkout.session.completed") {
      logStep("Ignoring event type", { eventType: event.type });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Event type not handled" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.id;
    logStep("Processing verified session", { sessionId, status: session.payment_status });

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ error: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Handle subscription
    if (session.mode === 'subscription') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const customer = await stripe.customers.retrieve(session.customer as string);
      
      // Update subscriber record
      await supabaseClient.from('subscribers').upsert({
        email: (customer as any).email,
        stripe_customer_id: session.customer,
        subscribed: true,
        subscription_tier: 'Premium',
        subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      logStep("Subscription processed");
    } else {
      // Handle one-time payment
      const orderId = session.metadata?.order_id;
      if (orderId) {
        // Update order status
        await supabaseClient
          .from('orders')
          .update({ 
            status: 'completed',
            fulfillment_status: 'processing',
            stripe_payment_intent_id: session.payment_intent 
          })
          .eq('id', orderId);

        // Get product details for fulfillment
        const { data: order } = await supabaseClient
          .from('orders')
          .select(`
            *,
            products:products(*)
          `)
          .eq('id', orderId)
          .single();

        if (order?.products) {
          // Get user's Minecraft username for RCON commands
          let minecraftUsername = null;
          if (order.user_id) {
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('minecraft_username')
              .eq('user_id', order.user_id)
              .single();
            minecraftUsername = profile?.minecraft_username;
          }

          // Execute RCON commands based on product category
          const product = order.products as any;
          if (minecraftUsername) {
            let commands: string[] = [];
            
            try {
              // Handle different product categories with strict input validation
              switch (product.category?.toLowerCase()) {
                case 'ranks':
                  // Validate and sanitize rank name (max 20 chars for rank groups)
                  const groupName = sanitizeForRcon(product.tier || product.name, 20);
                  commands = [`lp user {username} parent set ${groupName}`];
                  break;
                  
                case 'coins':
                case 'currency':
                  // Validate coin amount is a safe number
                  const coinAmount = sanitizeNumber(product.name, 1, 1000000);
                  commands = [`eco give {username} ${coinAmount}`];
                  break;
                  
                case 'kits':
                  // Validate kit name (max 20 chars)
                  const kitName = sanitizeForRcon(product.name, 20);
                  commands = [`kit ${kitName} {username}`];
                  break;
                  
                case 'cosmetics':
                  // Validate cosmetic name (max 30 chars)
                  const cosmeticName = sanitizeForRcon(product.name, 30);
                  commands = [`give {username} ${cosmeticName}`];
                  break;
                  
                case 'perks':
                  // Validate permission node (max 50 chars for permission strings)
                  const permNode = sanitizeForRcon(product.name, 50);
                  commands = [`perm add {username} ${permNode}`];
                  break;
                  
                default:
                  if (product.features && product.features.includes('auto_fulfillment')) {
                    const itemName = sanitizeForRcon(product.name, 30);
                    commands = [`give {username} ${itemName}`];
                  }
              }
            } catch (sanitizationError) {
              // Log validation failure and skip command execution
              logStep("ERROR: Product data validation failed", { 
                productName: product.name,
                category: product.category,
                error: (sanitizationError as Error).message 
              });
              
              // Mark order as requiring manual review
              await supabaseClient
                .from('orders')
                .update({ 
                  fulfillment_status: 'failed',
                  rcon_commands_executed: false 
                })
                .eq('id', orderId);
                
              logStep("Order marked for manual review due to validation failure", { orderId });
              commands = []; // Clear commands to prevent execution
            }

            if (commands.length > 0) {
              await executeRconCommands(commands, minecraftUsername);
              
              // Mark as fulfilled
              await supabaseClient
                .from('orders')
                .update({ 
                  fulfillment_status: 'completed',
                  rcon_commands_executed: true 
                })
                .eq('id', orderId);
                
              logStep("Product delivered", { 
                category: product.category, 
                username: minecraftUsername,
                commands 
              });
            } else {
              logStep("No delivery commands for product category", { category: product.category });
            }
          } else {
            logStep("Cannot deliver - no Minecraft username found", { userId: order.user_id });
          }
        }

        logStep("One-time payment processed", { orderId });
      }
    }

    // Log transaction
    await supabaseClient.from('payment_transactions').insert({
      user_id: session.client_reference_id || null,
      stripe_session_id: sessionId,
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || 'usd',
      status: 'completed',
      customer_email: session.customer_details?.email || 'guest@example.com',
      metadata: session.metadata,
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment processed successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Payment processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
