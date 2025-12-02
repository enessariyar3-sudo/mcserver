import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ServerStatusResponse {
  online: boolean;
  players: {
    online: number;
    max: number;
    list?: string[];
  };
  version?: string;
  motd?: string;
  latency?: number;
  uptime?: number;
  performance?: {
    tps?: number;
    memory_usage?: number;
    cpu_usage?: number;
  };
  world?: {
    name?: string;
    seed?: string;
    difficulty?: string;
  };
  health?: "excellent" | "good" | "fair" | "poor";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Only use environment variables for server configuration
    // User-provided host/port parameters removed to prevent SSRF attacks
    const serverHost = Deno.env.get("MINECRAFT_SERVER_HOST") || "localhost";
    const serverPort = parseInt(Deno.env.get("MINECRAFT_SERVER_PORT") || "25565");

    console.log(`Checking server status for ${serverHost}:${serverPort}`);

    const startTime = Date.now();
    
    // Ping the Minecraft server
    const status = await pingMinecraftServer(serverHost, serverPort);
    
    const endTime = Date.now();
    status.latency = endTime - startTime;

    return new Response(JSON.stringify({
      success: true,
      server: `${serverHost}:${serverPort}`,
      status: {
        ...status,
        health: getServerHealth(status),
        lastCheck: new Date().toISOString(),
        region: "US-East"
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Server status check error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      server: "unknown",
      status: {
        online: false,
        players: { online: 0, max: 0 },
        error: (error as Error).message,
        health: "poor" as const
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 even for offline servers
    });
  }
};

async function pingMinecraftServer(host: string, port: number): Promise<ServerStatusResponse> {
  let socket: Deno.Conn | null = null;
  
  try {
    // Connect with timeout
    socket = await Promise.race([
      Deno.connect({ hostname: host, port }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout")), 5000)
      )
    ]);

    // Send handshake packet
    await sendPacket(socket, 0x00, [
      writeVarInt(-1), // Protocol version (-1 for status)
      writeString(host), // Server address
      writeShort(port), // Server port
      writeVarInt(1) // Next state (1 = status)
    ]);

    // Send status request
    await sendPacket(socket, 0x00, []);

    // Read status response
    const response = await readPacket(socket);
    const statusJson = readString(response.data, 0);
    const status = JSON.parse(statusJson.value);

    return {
      online: true,
      players: {
        online: status.players?.online || 0,
        max: status.players?.max || 0,
        list: status.players?.sample?.map((p: any) => p.name) || []
      },
      version: status.version?.name,
      motd: status.description?.text || status.description || "A Minecraft Server",
      performance: {
        tps: Math.round((Math.random() * 2 + 19) * 100) / 100, // Simulated TPS
        memory_usage: Math.round(Math.random() * 70 + 20), // Simulated memory usage %
        cpu_usage: Math.round(Math.random() * 50 + 10) // Simulated CPU usage %
      },
      world: {
        name: "IndusNetwork",
        difficulty: "Normal"
      }
    };

  } finally {
    if (socket) {
      socket.close();
    }
  }
}

// Helper function to determine server health
function getServerHealth(status: ServerStatusResponse): "excellent" | "good" | "fair" | "poor" {
  if (!status.online) return "poor";
  
  const playerLoad = status.players.online / status.players.max;
  const latency = status.latency || 0;
  const tps = status.performance?.tps || 20;
  
  if (tps >= 19.5 && latency < 50 && playerLoad < 0.8) return "excellent";
  if (tps >= 18 && latency < 100 && playerLoad < 0.9) return "good";
  if (tps >= 15 && latency < 200) return "fair";
  return "poor";
}

// Minecraft protocol helper functions
function writeVarInt(value: number): Uint8Array {
  const bytes: number[] = [];
  while ((value & 0x80) !== 0) {
    bytes.push((value & 0x7F) | 0x80);
    value >>>= 7;
  }
  bytes.push(value & 0x7F);
  return new Uint8Array(bytes);
}

function writeString(str: string): Uint8Array {
  const stringBytes = new TextEncoder().encode(str);
  const lengthBytes = writeVarInt(stringBytes.length);
  const result = new Uint8Array(lengthBytes.length + stringBytes.length);
  result.set(lengthBytes, 0);
  result.set(stringBytes, lengthBytes.length);
  return result;
}

function writeShort(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  bytes[0] = (value >> 8) & 0xFF;
  bytes[1] = value & 0xFF;
  return bytes;
}

async function sendPacket(socket: Deno.Conn, packetId: number, data: Uint8Array[]) {
  const packetIdBytes = writeVarInt(packetId);
  const dataLength = data.reduce((sum, d) => sum + d.length, 0);
  const totalLength = packetIdBytes.length + dataLength;
  const lengthBytes = writeVarInt(totalLength);
  
  const packet = new Uint8Array(lengthBytes.length + totalLength);
  let offset = 0;
  
  packet.set(lengthBytes, offset);
  offset += lengthBytes.length;
  
  packet.set(packetIdBytes, offset);
  offset += packetIdBytes.length;
  
  for (const d of data) {
    packet.set(d, offset);
    offset += d.length;
  }
  
  await socket.write(packet);
}

async function readPacket(socket: Deno.Conn) {
  // Read packet length
  const lengthResult = await readVarIntFromSocket(socket);
  const packetLength = lengthResult.value;
  
  // Read packet data
  const packetData = new Uint8Array(packetLength);
  await socket.read(packetData);
  
  // Read packet ID
  const packetIdResult = readVarInt(packetData, 0);
  
  return {
    id: packetIdResult.value,
    data: packetData.slice(packetIdResult.bytesRead)
  };
}

async function readVarIntFromSocket(socket: Deno.Conn): Promise<{ value: number; bytesRead: number }> {
  let value = 0;
  let position = 0;
  let bytesRead = 0;
  
  while (true) {
    const byte = new Uint8Array(1);
    await socket.read(byte);
    bytesRead++;
    
    value |= (byte[0] & 0x7F) << position;
    
    if ((byte[0] & 0x80) === 0) break;
    
    position += 7;
    if (position >= 32) throw new Error("VarInt is too big");
  }
  
  return { value, bytesRead };
}

function readVarInt(data: Uint8Array, offset: number): { value: number; bytesRead: number } {
  let value = 0;
  let position = 0;
  let bytesRead = 0;
  
  while (offset + bytesRead < data.length) {
    const byte = data[offset + bytesRead];
    bytesRead++;
    
    value |= (byte & 0x7F) << position;
    
    if ((byte & 0x80) === 0) break;
    
    position += 7;
    if (position >= 32) throw new Error("VarInt is too big");
  }
  
  return { value, bytesRead };
}

function readString(data: Uint8Array, offset: number): { value: string; bytesRead: number } {
  const lengthResult = readVarInt(data, offset);
  const stringLength = lengthResult.value;
  const stringBytes = data.slice(offset + lengthResult.bytesRead, offset + lengthResult.bytesRead + stringLength);
  const value = new TextDecoder().decode(stringBytes);
  
  return {
    value,
    bytesRead: lengthResult.bytesRead + stringLength
  };
}

serve(handler);