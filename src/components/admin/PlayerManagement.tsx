import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserX, Ban, Shield, UserCheck, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

const playerNameSchema = z.string()
  .trim()
  .min(1, "Player name is required")
  .max(16, "Player name too long")
  .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores allowed");

const reasonSchema = z.string()
  .trim()
  .max(200, "Reason too long")
  .regex(/^[a-zA-Z0-9\s.,!?-]*$/, "Invalid characters in reason");

interface PlayerManagementProps {
  selectedServer: string;
}

export const PlayerManagement = ({ selectedServer }: PlayerManagementProps) => {
  const [playerName, setPlayerName] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<string[]>([]);
  const { toast } = useToast();

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
      
      return data;
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

  const kickPlayer = () => {
    if (!playerName) return;
    
    try {
      playerNameSchema.parse(playerName);
      if (reason) reasonSchema.parse(reason);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: error instanceof z.ZodError ? error.issues[0].message : "Invalid input",
        variant: "destructive",
      });
      return;
    }
    
    const cmd = reason 
      ? `kick ${playerName} ${reason}` 
      : `kick ${playerName}`;
    executeCommand(cmd);
    setPlayerName('');
    setReason('');
  };

  const banPlayer = () => {
    if (!playerName) return;
    
    try {
      playerNameSchema.parse(playerName);
      if (reason) reasonSchema.parse(reason);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: error instanceof z.ZodError ? error.issues[0].message : "Invalid input",
        variant: "destructive",
      });
      return;
    }
    
    const cmd = reason 
      ? `ban ${playerName} ${reason}` 
      : `ban ${playerName}`;
    executeCommand(cmd);
    setPlayerName('');
    setReason('');
  };

  const validateAndExecute = (command: string) => {
    if (!playerName) return;
    
    try {
      playerNameSchema.parse(playerName);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: error instanceof z.ZodError ? error.issues[0].message : "Invalid player name",
        variant: "destructive",
      });
      return;
    }
    
    executeCommand(command);
    setPlayerName('');
  };

  const pardonPlayer = () => validateAndExecute(`pardon ${playerName}`);
  const opPlayer = () => validateAndExecute(`op ${playerName}`);
  const deopPlayer = () => validateAndExecute(`deop ${playerName}`);
  const whitelistAdd = () => validateAndExecute(`whitelist add ${playerName}`);
  const whitelistRemove = () => validateAndExecute(`whitelist remove ${playerName}`);

  const getOnlinePlayers = async () => {
    const result = await executeCommand('list');
    if (result?.result) {
      const players = result.result.match(/There are \d+ of a max of \d+ players online: (.+)/);
      if (players && players[1]) {
        setOnlinePlayers(players[1].split(', '));
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Player Management</CardTitle>
          <CardDescription>
            Manage players on {selectedServer} server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="moderate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="moderate">Moderate</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="whitelist">Whitelist</TabsTrigger>
              <TabsTrigger value="online">Online Players</TabsTrigger>
            </TabsList>

            <TabsContent value="moderate" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="player">Player Name</Label>
                  <Input
                    id="player"
                    placeholder="Enter player name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Input
                    id="reason"
                    placeholder="Enter reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Button 
                    onClick={kickPlayer} 
                    disabled={!playerName || loading}
                    variant="outline"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Kick Player
                  </Button>
                  
                  <Button 
                    onClick={banPlayer} 
                    disabled={!playerName || loading}
                    variant="destructive"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Ban Player
                  </Button>
                  
                    <Button 
                      onClick={pardonPlayer} 
                      disabled={!playerName || loading}
                      variant="outline"
                      className="sm:col-span-2"
                    >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Pardon Player
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="player-perm">Player Name</Label>
                  <Input
                    id="player-perm"
                    placeholder="Enter player name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Button 
                    onClick={opPlayer} 
                    disabled={!playerName || loading}
                    variant="default"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Grant Operator
                  </Button>
                  
                  <Button 
                    onClick={deopPlayer} 
                    disabled={!playerName || loading}
                    variant="outline"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Remove Operator
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="whitelist" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="player-wl">Player Name</Label>
                  <Input
                    id="player-wl"
                    placeholder="Enter player name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <Button 
                    onClick={whitelistAdd} 
                    disabled={!playerName || loading}
                    variant="default"
                  >
                    Add to Whitelist
                  </Button>
                  
                  <Button 
                    onClick={whitelistRemove} 
                    disabled={!playerName || loading}
                    variant="outline"
                  >
                    Remove from Whitelist
                  </Button>
                  
                  <Button 
                    onClick={() => executeCommand('whitelist on')} 
                    disabled={loading}
                    variant="secondary"
                  >
                    Enable Whitelist
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="online" className="space-y-4">
              <Button 
                onClick={getOnlinePlayers} 
                disabled={loading}
                className="w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                Refresh Online Players
              </Button>

              {onlinePlayers.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">
                    Online Players ({onlinePlayers.length})
                  </h3>
                  <div className="space-y-2">
                    {onlinePlayers.map((player, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-muted rounded gap-2">
                        <span className="font-medium">{player}</span>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPlayerName(player);
                            }}
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
