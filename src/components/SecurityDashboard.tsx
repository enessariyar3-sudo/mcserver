import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, X, History, Server } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SecurityStatus {
  total_servers: number;
  encrypted_servers: number;
  unencrypted_servers: number;
  recent_access_attempts: number;
  failed_access_attempts: number;
}

interface RconAccessLog {
  id: string;
  access_type: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  error_message: string;
  accessed_at: string;
  profiles?: {
    display_name?: string;
    minecraft_username?: string;
  };
}

interface RconServer {
  id: string;
  name: string;
  host: string;
  port: number;
  password_encrypted: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const SecurityDashboard = () => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [accessLogs, setAccessLogs] = useState<RconAccessLog[]>([]);
  const [servers, setServers] = useState<RconServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [encryptingPasswords, setEncryptingPasswords] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Fetch security status
      const { data: serverData } = await supabase
        .from('rcon_servers')
        .select('id, name, host, port, password_encrypted, is_active, created_at, updated_at');

      if (serverData) {
        setServers(serverData);
        
        const totalServers = serverData.length;
        const encryptedServers = serverData.filter(s => s.password_encrypted).length;
        const unencryptedServers = totalServers - encryptedServers;

        setSecurityStatus({
          total_servers: totalServers,
          encrypted_servers: encryptedServers,
          unencrypted_servers: unencryptedServers,
          recent_access_attempts: 0, // Will be updated from logs
          failed_access_attempts: 0, // Will be updated from logs
        });
      }

      // Fetch recent access logs
      const { data: logsData } = await supabase
        .from('rcon_access_log')
        .select('*')
        .order('accessed_at', { ascending: false })
        .limit(50);

      if (logsData) {
        setAccessLogs(logsData);
        
        // Update security status with log data
        const recentLogs = logsData.filter(log => {
          const logDate = new Date(log.accessed_at);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return logDate > dayAgo;
        });

        const failedAttempts = recentLogs.filter(log => !log.success).length;

        setSecurityStatus(prev => prev ? {
          ...prev,
          recent_access_attempts: recentLogs.length,
          failed_access_attempts: failedAttempts
        } : null);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch security data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const encryptPasswords = async () => {
    setEncryptingPasswords(true);
    try {
      const { data, error } = await supabase.functions.invoke('encrypt-rcon-passwords', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Encryption Complete",
        description: `${data.encrypted_count} passwords encrypted successfully`,
      });

      // Refresh security data
      await fetchSecurityData();
    } catch (error: any) {
      toast({
        title: "Encryption Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEncryptingPasswords(false);
    }
  };

  const getSecurityLevel = () => {
    if (!securityStatus) return 'unknown';
    if (securityStatus.unencrypted_servers === 0) return 'secure';
    if (securityStatus.unencrypted_servers <= securityStatus.total_servers / 2) return 'warning';
    return 'critical';
  };

  const getSecurityBadge = () => {
    const level = getSecurityLevel();
    switch (level) {
      case 'secure':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Secure</Badge>;
      case 'warning':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading security dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor and manage RCON security</p>
        </div>
        {getSecurityBadge()}
      </div>

      {/* Security Alerts */}
      {securityStatus && securityStatus.unencrypted_servers > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Risk Detected</AlertTitle>
          <AlertDescription className="mt-2">
            {securityStatus.unencrypted_servers} RCON server(s) have unencrypted passwords. 
            This poses a critical security risk if admin accounts are compromised.
            <div className="mt-3">
              <Button 
                onClick={encryptPasswords} 
                disabled={encryptingPasswords}
                size="sm"
              >
                <Lock className="h-4 w-4 mr-2" />
                {encryptingPasswords ? 'Encrypting...' : 'Encrypt All Passwords'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStatus?.total_servers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encrypted</CardTitle>
            <Lock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {securityStatus?.encrypted_servers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unencrypted</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {securityStatus?.unencrypted_servers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Attempts (24h)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityStatus?.failed_access_attempts || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="servers" className="w-full">
        <TabsList>
          <TabsTrigger value="servers">Server Status</TabsTrigger>
          <TabsTrigger value="logs">Access Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RCON Servers</CardTitle>
              <CardDescription>
                Status of all registered RCON servers and their encryption status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {servers.map((server) => (
                  <div
                    key={server.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{server.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {server.host}:{server.port}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {server.password_encrypted ? (
                        <Badge className="bg-green-500">
                          <Lock className="h-3 w-3 mr-1" />
                          Encrypted
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Plain Text
                        </Badge>
                      )}
                      {server.is_active ? (
                        <Badge variant="outline">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Access Logs
              </CardTitle>
              <CardDescription>
                Recent RCON access attempts and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 border rounded-lg ${
                      log.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium capitalize">
                          {log.access_type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          User: Staff
                        </div>
                        <div className="text-sm text-muted-foreground">
                          IP: {log.ip_address} • {new Date(log.accessed_at).toLocaleString()}
                        </div>
                        {!log.success && log.error_message && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {log.error_message}
                          </div>
                        )}
                      </div>
                      <div>
                        {log.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};