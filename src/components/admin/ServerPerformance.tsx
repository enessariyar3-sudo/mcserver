import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertTriangle, CheckCircle, Activity, HardDrive, Cpu } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ServerPerformanceProps {
  selectedServer: string;
}

export const ServerPerformance = ({ selectedServer }: ServerPerformanceProps) => {
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchServerStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('server-status', {
        body: { server: selectedServer }
      });

      if (error) throw error;
      setServerStatus(data.status);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch server status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [selectedServer]);

  const executeCommand = async (command: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rcon-command', {
        body: { 
          command,
          server: selectedServer 
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Command executed: ${command}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restartServer = () => {
    if (confirm('Are you sure you want to restart the server? All players will be disconnected.')) {
      executeCommand('stop');
    }
  };

  const saveAll = () => {
    executeCommand('save-all');
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthIcon = (health: string) => {
    if (health === 'excellent' || health === 'good') {
      return <CheckCircle className="h-5 w-5" />;
    }
    return <AlertTriangle className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Server Performance</CardTitle>
              <CardDescription>
                Monitor {selectedServer} server health and performance
              </CardDescription>
            </div>
            <Button
              onClick={fetchServerStatus}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {serverStatus ? (
            <>
              {/* Overall Health */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={getHealthColor(serverStatus.health)}>
                    {getHealthIcon(serverStatus.health)}
                  </div>
                  <div>
                    <p className="font-semibold">Server Health</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {serverStatus.health || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {serverStatus.online ? 'Online' : 'Offline'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {serverStatus.latency}ms latency
                  </p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">TPS</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {serverStatus.performance?.tps?.toFixed(2) || 'N/A'}
                    </p>
                    <Progress 
                      value={(serverStatus.performance?.tps || 0) / 20 * 100} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <HardDrive className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Memory Usage</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {serverStatus.performance?.memory_usage || 'N/A'}%
                    </p>
                    <Progress 
                      value={serverStatus.performance?.memory_usage || 0} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Cpu className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {serverStatus.performance?.cpu_usage || 'N/A'}%
                    </p>
                    <Progress 
                      value={serverStatus.performance?.cpu_usage || 0} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Player Stats */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Players Online</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold">
                      {serverStatus.players?.online || 0}
                    </p>
                    <p className="text-muted-foreground">
                      / {serverStatus.players?.max || 0} max
                    </p>
                  </div>
                  <Progress 
                    value={(serverStatus.players?.online || 0) / (serverStatus.players?.max || 1) * 100} 
                    className="mt-2"
                  />
                  {serverStatus.players?.list && serverStatus.players.list.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Online Players:</p>
                      <div className="flex flex-wrap gap-2">
                        {serverStatus.players.list.map((player: string, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-muted rounded text-sm"
                          >
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* World Info */}
              {serverStatus.world && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">World Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">World Name</p>
                        <p className="font-medium">{serverStatus.world.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Difficulty</p>
                        <p className="font-medium">{serverStatus.world.difficulty}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Button
                  onClick={saveAll}
                  disabled={loading || !serverStatus.online}
                  variant="outline"
                >
                  Save World
                </Button>
                <Button
                  onClick={restartServer}
                  disabled={loading || !serverStatus.online}
                  variant="destructive"
                >
                  Restart Server
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Loading server status...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
