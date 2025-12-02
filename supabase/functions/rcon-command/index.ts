import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Command validation schema
const commandSchema = z.object({
  command: z.string()
    .min(1, "Command cannot be empty")
    .max(500, "Command too long")
    .regex(/^[a-zA-Z0-9\s\-_@.:\/]+$/, "Invalid characters in command"),
  server: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9\-_]+$/, "Invalid server name")
    .optional()
    .default('main')
});

// Whitelist of allowed command prefixes
const ALLOWED_COMMANDS = [
  'kick', 'ban', 'pardon', 'op', 'deop',
  'whitelist', 'list', 'save-all', 'stop',
  'time', 'weather', 'gamemode', 'tp',
  'give', 'clear', 'say', 'tell', 'msg',
  'xp', 'effect', 'enchant', 'setblock',
  'fill', 'summon', 'kill', 'difficulty'
];

function validateCommand(command: string): boolean {
  const firstWord = command.trim().split(/\s+/)[0].toLowerCase();
  return ALLOWED_COMMANDS.some(allowed => firstWord === allowed);
}

interface RconCommand {
  command: string;
  server?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Check authentication and admin role
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      throw new Error("Admin access required");
    }

    // Validate input
    const body = await req.json();
    const validationResult = commandSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new Error("Invalid command format");
    }

    const { command, server } = validationResult.data;

    // Validate command against whitelist
    if (!validateCommand(command)) {
      throw new Error("Command not allowed");
    }

    // Get client IP and user agent for audit logging
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Get RCON server configuration from database (without password)
    const { data: serverConfig, error: serverError } = await supabaseClient
      .from('rcon_servers')
      .select('id, name, host, port, is_active')
      .eq('name', server)
      .eq('is_active', true)
      .single();

    if (serverError || !serverConfig) {
      // Log failed access attempt
      await supabaseClient.rpc('log_rcon_access', {
        p_server_id: null,
        p_access_type: 'server_lookup',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_success: false,
        p_error_message: `Server '${server}' not found or inactive`
      });
      throw new Error(`RCON server '${server}' not found or inactive`);
    }

    // Get encryption key from environment
    const encryptionKey = Deno.env.get("RCON_ENCRYPTION_KEY");
    if (!encryptionKey) {
      throw new Error("RCON encryption key not configured");
    }

    // Securely get the decrypted RCON password
    const { data: passwordData, error: passwordError } = await supabaseClient
      .rpc('get_rcon_password_for_operation', {
        server_id: serverConfig.id,
        encryption_key: encryptionKey
      });

    if (passwordError || !passwordData) {
      // Log failed password access
      await supabaseClient.rpc('log_rcon_access', {
        p_server_id: serverConfig.id,
        p_access_type: 'password_access',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_success: false,
        p_error_message: 'Failed to decrypt RCON password'
      });
      throw new Error("Failed to access RCON credentials");
    }

    // Log successful password access
    await supabaseClient.rpc('log_rcon_access', {
      p_server_id: serverConfig.id,
      p_access_type: 'password_access',
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_success: true
    });

    // Connect to Minecraft server via RCON with the decrypted password
    const result = await executeRconCommand(serverConfig.host, serverConfig.port, passwordData, command);

    // Log successful command execution
    await supabaseClient.rpc('log_rcon_access', {
      p_server_id: serverConfig.id,
      p_access_type: 'command_execution',
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_success: true
    });

    // Also log to the existing audit log for backward compatibility
    await supabaseClient
      .from('rcon_audit_log')
      .insert({
        user_id: user.id,
        server_name: server,
        command,
        result,
        success: true
      });

    // Log the command execution
    console.log(`Admin ${user.email} executed RCON command: ${command}`);

    return new Response(JSON.stringify({ 
      success: true, 
      result,
      command,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("RCON command error:", error);
    
    // Try to log the error if we have enough info
    try {
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      
      // Get Supabase client for error logging
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      
      await supabaseClient.rpc('log_rcon_access', {
        p_server_id: null,
        p_access_type: 'command_execution',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_success: false,
        p_error_message: (error as Error).message
      });
    } catch (logError) {
      console.error("Failed to log RCON error:", logError);
    }
    
    // Sanitize error message for client
    const errorMessage = (error as Error).message;
    const sanitizedError = errorMessage.includes("not allowed") || 
                          errorMessage.includes("Invalid") ||
                          errorMessage.includes("required") ||
                          errorMessage.includes("Admin access")
      ? errorMessage
      : "Command execution failed";
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: sanitizedError 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

// RCON Protocol Implementation
async function executeRconCommand(host: string, port: number, password: string, command: string): Promise<string> {
  let socket: Deno.Conn | null = null;
  
  try {
    // Connect to RCON server
    socket = await Deno.connect({ hostname: host, port });
    
    // Authenticate
    await sendRconPacket(socket, 1, 3, password); // SERVERDATA_AUTH
    const authResponse = await receiveRconPacket(socket);
    
    if (authResponse.id === -1) {
      throw new Error("RCON authentication failed");
    }

    // Send command
    await sendRconPacket(socket, 2, 2, command); // SERVERDATA_EXECCOMMAND
    const commandResponse = await receiveRconPacket(socket);
    
    return commandResponse.body;
    
  } finally {
    if (socket) {
      socket.close();
    }
  }
}

async function sendRconPacket(socket: Deno.Conn, id: number, type: number, body: string) {
  const bodyBytes = new TextEncoder().encode(body + '\0\0');
  const packet = new ArrayBuffer(4 + 4 + 4 + bodyBytes.length);
  const view = new DataView(packet);
  
  view.setInt32(0, 4 + 4 + bodyBytes.length, true); // Length
  view.setInt32(4, id, true); // Request ID
  view.setInt32(8, type, true); // Type
  
  const packetBytes = new Uint8Array(packet);
  packetBytes.set(bodyBytes, 12);
  
  await socket.write(packetBytes);
}

async function receiveRconPacket(socket: Deno.Conn) {
  // Read length
  const lengthBuffer = new Uint8Array(4);
  await socket.read(lengthBuffer);
  const length = new DataView(lengthBuffer.buffer).getInt32(0, true);
  
  // Read the rest of the packet
  const packetBuffer = new Uint8Array(length);
  await socket.read(packetBuffer);
  
  const view = new DataView(packetBuffer.buffer);
  const id = view.getInt32(0, true);
  const type = view.getInt32(4, true);
  const body = new TextDecoder().decode(packetBuffer.slice(8, -2));
  
  return { id, type, body };
}

serve(handler);