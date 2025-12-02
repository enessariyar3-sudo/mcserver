import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Server, Users, Zap, Clock, Activity, Globe, Cpu, MemoryStick } from 'lucide-react';

interface ServerStatusData {
  online: boolean;
  players: {
    online: number;
    max: number;
    list?: string[];
  };
  version: string;
  latency: number;
  motd?: string;
  health?: "excellent" | "good" | "fair" | "poor";
  performance?: {
    tps?: number;
    memory_usage?: number;
    cpu_usage?: number;
  };
  world?: {
    name?: string;
    difficulty?: string;
  };
  lastCheck?: string;
  region?: string;
}

export const ServerStatus = () => {
  const [status, setStatus] = useState<ServerStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchServerStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('server-status');
      
      if (error) {
        console.error('Error fetching server status:', error);
        toast.error('Failed to fetch server status');
        return;
      }
      
      setStatus(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
    // Refresh every 15 seconds for more live updates
    const interval = setInterval(fetchServerStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health?: string) => {
    switch (health) {
      case "excellent": return "bg-gradient-status-online text-primary-foreground";
      case "good": return "bg-primary text-primary-foreground";
      case "fair": return "bg-accent text-accent-foreground";
      case "poor": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return "text-primary";
    if (latency < 100) return "text-accent";
    if (latency < 200) return "text-orange-400";
    return "text-destructive";
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground mb-4">Live Server Status</h2>
            <p className="text-muted-foreground">Real-time server monitoring & analytics</p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-gradient-glass border-border/50 shadow-card animate-pulse">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-20 bg-muted/30" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2 bg-muted/30" />
                    <Skeleton className="h-4 w-24 bg-muted/30" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className={`h-6 w-6 ${status?.online ? 'text-primary animate-pulse-status' : 'text-destructive'}`} />
            <h2 className="text-3xl font-bold text-foreground">Live Server Status</h2>
          </div>
          <p className="text-muted-foreground">Real-time server monitoring & analytics</p>
          {status?.lastCheck && (
            <p className="text-xs text-muted-foreground/70 mt-2">
              Last updated: {new Date(status.lastCheck).toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {/* Server Status */}
            <Card className="bg-gradient-glass border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Server Status</CardTitle>
                <div className="relative">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  {status?.online && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping-dot" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge className={`${status?.online ? "bg-gradient-status-online shadow-status-online" : "bg-gradient-status-offline shadow-status-offline"} animate-scale-in`}>
                    {status?.online ? "Online" : "Offline"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {status?.online ? "Server is running" : "Server is down"}
                </p>
              </CardContent>
            </Card>

            {/* Players Online */}
            <Card className="bg-gradient-glass border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Players Online</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {status?.players ? `${status.players.online}/${status.players.max}` : "0/0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active players
                </p>
                {status?.players && status.players.online > 0 && (
                  <div className="mt-2 w-full bg-muted/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-500" 
                      style={{width: `${(status.players.online / status.players.max) * 100}%`}}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Server Version */}
            <Card className="bg-gradient-glass border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Version</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-diamond">
                  {status?.version || "Unknown"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Server version
                </p>
              </CardContent>
            </Card>

            {/* Latency */}
            <Card className="bg-gradient-glass border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latency</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getLatencyColor(status?.latency || 0)}`}>
                  {status?.latency ? `${status.latency}ms` : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Response time
                </p>
              </CardContent>
            </Card>

            {/* Server Health */}
            <Card className="bg-gradient-glass border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={`${getHealthColor(status?.health)} capitalize animate-glow-pulse`}>
                  {status?.health || "Unknown"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Overall performance
                </p>
              </CardContent>
            </Card>

            {/* TPS Performance */}
            <Card className="bg-gradient-glass border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up" style={{animationDelay: '0.5s'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">TPS</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(status?.performance?.tps || 0) >= 19 ? 'text-primary' : (status?.performance?.tps || 0) >= 15 ? 'text-accent' : 'text-destructive'}`}>
                  {status?.performance?.tps?.toFixed(1) || "20.0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ticks per second
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Stats */}
          {status?.performance && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-glass border-border/50 shadow-card animate-slide-up" style={{animationDelay: '0.6s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span className="text-primary">{status.performance.cpu_usage}%</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-500" 
                        style={{width: `${status.performance.cpu_usage}%`}}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span className="text-accent">{status.performance.memory_usage}%</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-gold h-2 rounded-full transition-all duration-500" 
                        style={{width: `${status.performance.memory_usage}%`}}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-glass border-border/50 shadow-card animate-slide-up" style={{animationDelay: '0.7s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-diamond" />
                    World Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">World Name</span>
                    <span className="text-foreground font-medium">{status.world?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span className="text-foreground font-medium">{status.world?.difficulty || "Normal"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Region</span>
                    <span className="text-foreground font-medium">{status.region || "Unknown"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* MOTD */}
          {status?.motd && status.motd.trim() && (
            <Card className="mt-6 bg-gradient-glass border-border/50 shadow-card animate-slide-up" style={{animationDelay: '0.8s'}}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Message of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-center text-lg font-medium">{status.motd}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};