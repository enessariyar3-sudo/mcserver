import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check authentication and admin role
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user is admin with elevated permissions
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role, created_at')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      throw new Error("Admin access required");
    }

    // Additional security check - admin must have been created more than 24 hours ago
    const adminCreatedAt = new Date(roleData.created_at);
    const now = new Date();
    const hoursSinceAdminRole = (now.getTime() - adminCreatedAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceAdminRole < 24) {
      throw new Error("Admin role must be active for at least 24 hours to perform this operation");
    }

    // Get encryption key from environment
    const encryptionKey = Deno.env.get("RCON_ENCRYPTION_KEY");
    if (!encryptionKey) {
      throw new Error("RCON encryption key not configured");
    }

    // Find all servers with unencrypted passwords
    const { data: serversToEncrypt, error: fetchError } = await supabaseClient
      .from('rcon_servers')
      .select('id, name, password, password_encrypted')
      .eq('password_encrypted', false);

    if (fetchError) {
      throw new Error(`Failed to fetch servers: ${fetchError.message}`);
    }

    if (!serversToEncrypt || serversToEncrypt.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "All RCON passwords are already encrypted",
        encrypted_count: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Encrypt each server's password
    for (const server of serversToEncrypt) {
      try {
        // Encrypt the password using the database function
        const { data: encryptedPassword, error: encryptError } = await supabaseClient
          .rpc('encrypt_rcon_password', {
            password_text: server.password,
            encryption_key: encryptionKey
          });

        if (encryptError || !encryptedPassword) {
          throw new Error(`Failed to encrypt password: ${encryptError?.message}`);
        }

        // Update the server with encrypted password
        const { error: updateError } = await supabaseClient
          .from('rcon_servers')
          .update({
            password: encryptedPassword,
            password_encrypted: true
          })
          .eq('id', server.id);

        if (updateError) {
          throw new Error(`Failed to update server: ${updateError.message}`);
        }

        results.push({
          server_id: server.id,
          server_name: server.name,
          status: 'success',
          message: 'Password encrypted successfully'
        });
        successCount++;

        // Log the encryption operation
        await supabaseClient
          .rpc('log_rcon_access', {
            p_server_id: server.id,
            p_access_type: 'password_encryption',
            p_ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            p_user_agent: req.headers.get('user-agent') || 'unknown',
            p_success: true
          });

        } catch (error: any) {
          results.push({
            server_id: server.id,
            server_name: server.name,
            status: 'error',
            message: error.message
          });
          errorCount++;

          // Log the failed encryption attempt
          await supabaseClient
            .rpc('log_rcon_access', {
              p_server_id: server.id,
              p_access_type: 'password_encryption',
              p_ip_address: req.headers.get('x-forwarded-for') || 'unknown',
              p_user_agent: req.headers.get('user-agent') || 'unknown',
              p_success: false,
              p_error_message: error.message
            });
        }
    }

    console.log(`RCON password encryption completed by admin ${user.email}: ${successCount} success, ${errorCount} errors`);

    return new Response(JSON.stringify({
      success: true,
      message: `Encryption completed: ${successCount} successful, ${errorCount} failed`,
      encrypted_count: successCount,
      error_count: errorCount,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("RCON password encryption error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);