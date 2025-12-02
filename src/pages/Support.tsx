import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { 
  Ticket, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Plus,
  ExternalLink
} from 'lucide-react';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Support = () => {
  const ticketSchema = z.object({
    title: z.string()
      .trim()
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must be less than 100 characters")
      .regex(/^[a-zA-Z0-9\s.,!?'"()\-_]+$/, "Title contains invalid characters"),
    description: z.string()
      .trim()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be less than 2000 characters"),
    category: z.enum(['account', 'gameplay', 'technical', 'billing', 'report', 'appeal', 'other']),
    priority: z.enum(['low', 'medium', 'high', 'urgent'])
  });

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch tickets: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate input
    const validationResult = ticketSchema.safeParse(newTicket);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error(`Validation Error: ${firstError.message}`);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('support_tickets')
        .insert({
          title: validationResult.data.title,
          description: validationResult.data.description,
          category: validationResult.data.category,
          priority: validationResult.data.priority,
          status: 'open',
          user_id: user.id
        });

      if (error) throw error;

      toast.success('Support ticket submitted successfully!');
      setNewTicket({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
      setActiveTab('tickets');
      fetchTickets();
    } catch (error: any) {
      toast.error('Failed to submit ticket: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <MessageSquare className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="mb-8 sm:mb-10 space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-2 min-h-[44px]"
          >
            ← Back to Dashboard
          </Button>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Support Center</h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">Get help with your account, report issues, or contact our team</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="new">New Ticket</TabsTrigger>
            <TabsTrigger value="discord">Discord Support</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Support Tickets</h2>
              <Button onClick={() => setActiveTab('new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>

            {tickets.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any support tickets yet.
                  </p>
                  <Button onClick={() => setActiveTab('new')}>
                    Create Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{ticket.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            #{ticket.id.slice(0, 8)} • {ticket.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(ticket.status)}
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {ticket.description.length > 150 
                          ? ticket.description.substring(0, 150) + '...'
                          : ticket.description
                        }
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                        <span>Updated: {new Date(ticket.updated_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Support Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm sm:text-base font-medium">Title</Label>
                    <Input
                      id="title"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of your issue"
                      maxLength={100}
                      required
                      className="h-12 text-base"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      5-100 characters, letters, numbers, and common punctuation only
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm sm:text-base font-medium">Category</Label>
                      <Select 
                        value={newTicket.category} 
                        onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                        required
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account">Account Issues</SelectItem>
                          <SelectItem value="gameplay">Gameplay Problems</SelectItem>
                          <SelectItem value="technical">Technical Issues</SelectItem>
                          <SelectItem value="billing">Billing & Purchases</SelectItem>
                          <SelectItem value="report">Report Player</SelectItem>
                          <SelectItem value="appeal">Ban Appeal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm sm:text-base font-medium">Priority</Label>
                      <Select 
                        value={newTicket.priority} 
                        onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm sm:text-base font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Please provide detailed information about your issue..."
                      maxLength={2000}
                      rows={6}
                      required
                      className="text-base leading-relaxed resize-none"
                    />
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      20-2000 characters required
                    </p>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold mt-2">
                    {submitting ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discord">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Discord Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="bg-[#5865F2] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Join Our Discord Server</h3>
                  <p className="text-muted-foreground mb-4">
                    Get instant help from our community and staff members on Discord. 
                    Perfect for quick questions and real-time support.
                  </p>
                  <Button asChild className="bg-[#5865F2] hover:bg-[#4752C4]">
                    <a 
                      href="https://discord.gg/indusnetwork" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join Discord Server
                    </a>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-medium mb-2">#support</h4>
                    <p className="text-sm text-muted-foreground">
                      General support and questions about the server
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-medium mb-2">#bug-reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Report bugs and technical issues
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-medium mb-2">#appeals</h4>
                    <p className="text-sm text-muted-foreground">
                      Submit ban appeals and punishment reviews
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-medium mb-2">#suggestions</h4>
                    <p className="text-sm text-muted-foreground">
                      Share ideas for server improvements
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-1">Discord Benefits</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Instant responses from community members</li>
                    <li>• Direct access to staff and moderators</li>
                    <li>• Server announcements and updates</li>
                    <li>• Community events and giveaways</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Support;