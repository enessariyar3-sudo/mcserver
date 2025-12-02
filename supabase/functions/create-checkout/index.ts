import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Input validation schemas
const itemSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive().max(100000),
  quantity: z.number().int().positive().min(1).max(100),
  category: z.string().min(1).max(50)
});

const checkoutRequestSchema = z.object({
  type: z.enum(['one_time', 'subscription']),
  items: z.array(itemSchema).min(1).max(50).optional(),
  orderId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  planId: z.string().uuid().optional()
});

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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // SECURITY: Require authentication for all checkouts
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authentication header");
      throw new Error("Authentication required for checkout");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      logStep("ERROR: Invalid authentication", { error: authError?.message });
      throw new Error("Invalid authentication token");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Verify user has required profile data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('minecraft_username')
      .eq('user_id', user.id)
      .single();

    if (!profile?.minecraft_username) {
      logStep("ERROR: Missing minecraft username");
      throw new Error("Complete your profile with a Minecraft username before purchasing");
    }

    // SECURITY: Validate input with zod schema
    const requestBody = await req.json();
    const validatedRequest = checkoutRequestSchema.parse(requestBody);
    logStep("Request validated", { type: validatedRequest.type });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const origin = req.headers.get("origin") || "http://localhost:3000";

    let sessionData: any = {
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancelled`,
    };

    // Handle customer creation
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length > 0) {
      sessionData.customer = customers.data[0].id;
    } else {
      sessionData.customer_email = user.email;
    }

    if (validatedRequest.type === "subscription" && validatedRequest.planId) {
      // Subscription checkout
      const { data: plan, error: planError } = await supabaseClient
        .from('payment_plans')
        .select('*')
        .eq('id', validatedRequest.planId)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        logStep("ERROR: Plan not found or inactive");
        throw new Error("Payment plan not found or no longer available");
      }

      sessionData = {
        ...sessionData,
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: plan.currency,
              product_data: { 
                name: plan.name,
                description: plan.description 
              },
              unit_amount: Math.round(plan.amount * 100),
              recurring: { interval: plan.interval },
            },
            quantity: 1,
          },
        ],
      };
    } else if (validatedRequest.items && validatedRequest.items.length > 0) {
      // SECURITY: Validate all items against database and fetch real prices
      const lineItems = [];
      let totalAmount = 0;

      for (const item of validatedRequest.items) {
        // Fetch actual product from database by name
        const { data: product, error: productError } = await supabaseClient
          .from('products')
          .select('*')
          .eq('name', item.name)
          .eq('is_active', true)
          .single();

        if (productError || !product) {
          logStep("ERROR: Product not found or inactive", { name: item.name });
          throw new Error(`Product "${item.name}" not found or no longer available`);
        }

        // SECURITY: Verify price matches database (prevent client-side manipulation)
        if (Math.abs(product.price - item.price) > 0.01) {
          logStep("ERROR: Price mismatch detected", { 
            productName: item.name,
            clientPrice: item.price,
            dbPrice: product.price 
          });
          throw new Error(`Price mismatch detected for "${item.name}". Please refresh and try again.`);
        }

        // SECURITY: Validate category matches
        if (product.category !== item.category) {
          logStep("ERROR: Category mismatch", { 
            productName: item.name,
            clientCategory: item.category,
            dbCategory: product.category 
          });
          throw new Error(`Invalid product data for "${item.name}". Please refresh and try again.`);
        }

        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: { 
              name: product.name,
              description: product.description 
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: item.quantity,
        });

        totalAmount += product.price * item.quantity;
      }

      sessionData = {
        ...sessionData,
        mode: "payment",
        line_items: lineItems,
      };

      // Use existing order ID if provided, otherwise create new order
      let orderId = validatedRequest.orderId;
      if (orderId) {
        // Verify order belongs to user and update amount
        const { data: existingOrder, error: orderCheckError } = await supabaseClient
          .from('orders')
          .select('user_id, total_amount')
          .eq('id', orderId)
          .single();

        if (orderCheckError || !existingOrder || existingOrder.user_id !== user.id) {
          logStep("ERROR: Invalid order ID");
          throw new Error("Invalid order ID");
        }

        // Verify total amount matches
        if (Math.abs(existingOrder.total_amount - totalAmount) > 0.01) {
          logStep("ERROR: Order amount mismatch", {
            orderAmount: existingOrder.total_amount,
            calculatedAmount: totalAmount
          });
          throw new Error("Order amount mismatch. Please try again.");
        }
      } else {
        // Create new order
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .insert({
            user_id: user.id,
            total_amount: totalAmount,
            status: 'pending',
            payment_method: 'stripe'
          })
          .select()
          .single();

        if (orderError || !order) {
          logStep("ERROR: Failed to create order", { error: orderError });
          throw new Error("Failed to create order");
        }

        orderId = order.id;
      }

      sessionData.metadata = {
        order_id: orderId,
        type: 'one_time',
        user_id: user.id
      };

      logStep("Items validated and order prepared", { orderId, itemCount: validatedRequest.items.length, totalAmount });
    } else if (validatedRequest.productId) {
      // Legacy single product checkout
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', validatedRequest.productId)
        .eq('is_active', true)
        .single();

      if (productError || !product) {
        logStep("ERROR: Product not found or inactive");
        throw new Error("Product not found or no longer available");
      }

      sessionData = {
        ...sessionData,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: product.name,
                description: product.description 
              },
              unit_amount: Math.round(product.price * 100),
            },
            quantity: 1,
          },
        ],
      };

      // Create order record
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: product.price,
          status: 'pending',
          payment_method: 'stripe'
        })
        .select()
        .single();

      if (orderError || !order) {
        logStep("ERROR: Failed to create order", { error: orderError });
        throw new Error("Failed to create order");
      }

      sessionData.metadata = {
        order_id: order.id,
        product_id: validatedRequest.productId,
        type: 'one_time',
        user_id: user.id
      };
    } else {
      throw new Error("Either items, productId, or planId must be provided");
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    logStep("Checkout session created", { sessionId: session.id });

    // Update order with session ID if it's a one-time payment
    if (validatedRequest.type !== "subscription" && sessionData.metadata?.order_id) {
      await supabaseClient
        .from('orders')
        .update({ stripe_session_id: session.id })
        .eq('id', sessionData.metadata.order_id);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});