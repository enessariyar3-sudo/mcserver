import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Trash2, Play } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

const commandNameSchema = z.string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name too long")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Only letters, numbers, spaces, hyphens and underscores allowed");

const commandSchema = z.string()
  .trim()
  .min(1, "Command is required")
  .max(500, "Command too long")
  .regex(/^[a-zA-Z0-9\s\-_@.:\/]+$/, "Invalid characters in command");

interface ScheduledCommand {
  id: string;
  name: string;
  command: string;
  schedule: string;
  server: string;
  enabled: boolean;
  last_run?: string;
}

interface CommandSchedulerProps {
  selectedServer: string;
  servers: any[];
}

export const CommandScheduler = ({ selectedServer, servers }: CommandSchedulerProps) => {
  const [scheduledCommands, setScheduledCommands] = useState<ScheduledCommand[]>([]);
  const [newCommand, setNewCommand] = useState({
    name: '',
    command: '',
    schedule: 'hourly',
    server: selectedServer,
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Quick action commands
  const quickCommands = [
    { name: 'Save World', command: 'save-all', icon: '💾' },
    { name: 'Clear Chat', command: 'clear', icon: '🧹' },
    { name: 'Announce Restart', command: 'say Server restarting in 5 minutes!', icon: '📢' },
    { name: 'Time Day', command: 'time set day', icon: '☀️' },
    { name: 'Weather Clear', command: 'weather clear', icon: '🌤️' },
    { name: 'Give All Players XP', command: 'xp add @a 100', icon: '⭐' }
  ];

  const executeCommand = async (command: string, server: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rcon-command', {
        body: { 
          command,
          server 
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

  const addScheduledCommand = () => {
    if (!newCommand.name || !newCommand.command) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      commandNameSchema.parse(newCommand.name);
      commandSchema.parse(newCommand.command);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: error instanceof z.ZodError ? error.issues[0].message : "Invalid input",
        variant: "destructive",
      });
      return;
    }

    const cmd: ScheduledCommand = {
      id: Date.now().toString(),
      ...newCommand
    };

    setScheduledCommands([...scheduledCommands, cmd]);
    setNewCommand({
      name: '',
      command: '',
      schedule: 'hourly',
      server: selectedServer,
      enabled: true
    });

    toast({
      title: "Success",
      description: "Scheduled command added (Note: This is a demo - real scheduling requires backend setup)",
    });
  };

  const removeScheduledCommand = (id: string) => {
    setScheduledCommands(scheduledCommands.filter(cmd => cmd.id !== id));
    toast({
      title: "Success",
      description: "Scheduled command removed",
    });
  };

  const toggleCommand = (id: string) => {
    setScheduledCommands(scheduledCommands.map(cmd => 
      cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd
    ));
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Execute common commands instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickCommands.map((cmd, index) => (
              <Button
                key={index}
                onClick={() => executeCommand(cmd.command, selectedServer)}
                disabled={loading}
                variant="outline"
                className="h-auto py-4"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{cmd.icon}</div>
                  <div className="text-sm font-medium">{cmd.name}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule New Command */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Command</CardTitle>
          <CardDescription>
            Set up automated commands to run on a schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cmd-name">Command Name</Label>
              <Input
                id="cmd-name"
                placeholder="e.g., Daily Backup"
                value={newCommand.name}
                onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <Select
                value={newCommand.schedule}
                onValueChange={(value) => setNewCommand({ ...newCommand, schedule: value })}
              >
                <SelectTrigger id="schedule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom (Cron)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="command">Command</Label>
            <Input
              id="command"
              placeholder="e.g., save-all"
              value={newCommand.command}
              onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="server-select">Target Server</Label>
            <Select
              value={newCommand.server}
              onValueChange={(value) => setNewCommand({ ...newCommand, server: value })}
            >
              <SelectTrigger id="server-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server) => (
                  <SelectItem key={server.id} value={server.name}>
                    {server.name} ({server.host}:{server.port})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={addScheduledCommand} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Scheduled Command
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Commands List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Commands</CardTitle>
          <CardDescription>
            Manage your automated commands
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledCommands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled commands yet</p>
              <p className="text-sm">Add commands above to automate server tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledCommands.map((cmd) => (
                <div
                  key={cmd.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={cmd.enabled}
                        onCheckedChange={() => toggleCommand(cmd.id)}
                      />
                      <div>
                        <p className="font-medium">{cmd.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {cmd.command} • {cmd.schedule} • {cmd.server}
                        </p>
                        {cmd.last_run && (
                          <p className="text-xs text-muted-foreground">
                            Last run: {cmd.last_run}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => executeCommand(cmd.command, cmd.server)}
                      disabled={loading}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeScheduledCommand(cmd.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
