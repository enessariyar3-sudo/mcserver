import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
import { PlayerManagement } from "@/components/admin/PlayerManagement";
import { ServerPerformance } from "@/components/admin/ServerPerformance";
import { CommandScheduler } from "@/components/admin/CommandScheduler";
import { IntegrationSettings } from "@/components/admin/IntegrationSettings";
import { MarketingTools } from "@/components/admin/MarketingTools";
import { PaymentGatewaySettings } from "@/components/admin/PaymentGatewaySettings";
import { NewsManagement } from "@/components/admin/NewsManagement";
import { useNavigate } from "react-router-dom";
import { maskEmail, maskUsername } from "@/lib/utils";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Receipt, 
  Terminal, 
  Settings, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  EyeOff,
  DollarSign,
  TrendingUp,
  Server,
  UserCog,
  Activity,
  Clock,
  Webhook,
  Newspaper
} from "lucide-react";

// Validation schemas
const VALID_RANKS = ['member', 'vip', 'vipplus', 'mvp', 'mvpplus', 'elite', 'legend'];

const productSchema = z.object({
  name: z.string()
    .trim()
    .min(3, 'Product name must be at least 3 characters')
    .max(50, 'Product name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Product name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string()
    .trim()
    .max(500, 'Description must be less than 500 characters'),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(10000, 'Price must be less than $10,000'),
  category: z.string().refine(
    (val) => ['ranks', 'coins', 'currency', 'kits', 'cosmetics', 'perks'].includes(val),
    { message: 'Invalid category. Must be one of: ranks, coins, currency, kits, cosmetics, perks' }
  ),
  tier: z.string()
    .trim()
    .regex(/^[a-z0-9_]*$/, 'Tier must be lowercase alphanumeric with underscores only')
    .max(20, 'Tier name must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  features: z.array(
    z.string()
      .trim()
      .max(100, 'Feature description must be less than 100 characters')
  ).max(10, 'Maximum 10 features allowed'),
  is_active: z.boolean(),
  is_popular: z.boolean()
});

const paymentPlanSchema = z.object({
  name: z.string()
    .trim()
    .min(3, 'Plan name must be at least 3 characters')
    .max(50, 'Plan name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Plan name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string()
    .trim()
    .max(500, 'Description must be less than 500 characters'),
  amount: z.number()
    .min(0, 'Amount cannot be negative')
    .max(10000, 'Amount must be less than $10,000'),
  interval: z.enum(['month', 'year'] as const),
  features: z.array(
    z.string()
      .trim()
      .max(100, 'Feature description must be less than 100 characters')
  ).max(10, 'Maximum 10 features allowed'),
  rcon_commands: z.array(
    z.string()
      .trim()
      .max(200, 'Command must be less than 200 characters')
  ).max(5, 'Maximum 5 commands allowed'),
  is_active: z.boolean()
});

interface User {
  id: string;
  user_id: string;
  display_name: string;
  minecraft_username: string;
  created_at: string;
  role?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tier: string;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  fulfillment_status: string;
  created_at: string;
}

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  interval: string;
  features: string[];
  rcon_commands: string[];
  is_active: boolean;
  created_at: string;
}

interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  customer_email: string;
  created_at: string;
}

interface RconServer {
  id: string;
  name: string;
  host: string;
  port: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);
  const [rconCommand, setRconCommand] = useState('');
  const [rconOutput, setRconOutput] = useState('');
  const [rconLoading, setRconLoading] = useState(false);
  const [rconServers, setRconServers] = useState<RconServer[]>([]);
  const [selectedServer, setSelectedServer] = useState('main');
  const [showServerDialog, setShowServerDialog] = useState(false);
  const [editingServer, setEditingServer] = useState<Partial<RconServer> & { password?: string }>(null);
  const [newPassword, setNewPassword] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    tier: '',
    features: '',
    is_active: true,
    is_popular: false
  });
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    amount: '',
    interval: 'month',
    features: '',
    rcon_commands: '',
    is_active: true
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `)
        .order('created_at', { ascending: false });

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: plansData } = await supabase
        .from('payment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: transactionsData } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      // Use secure function that excludes passwords
      const { data: rconServersData } = await supabase
        .rpc('get_rcon_servers_safe');

      setUsers(usersData || []);
      setProducts(productsData || []);
      setOrders(ordersData || []);
      setPaymentPlans(plansData || []);
      setTransactions(transactionsData || []);
      setRconServers(rconServersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole as 'admin' | 'moderator' | 'user' });
      
      if (error) throw error;
      
      await fetchData();
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);
      
      if (error) throw error;
      
      await fetchData();
      toast({
        title: "Success",
        description: "Product status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId);
      
      if (error) throw error;
      
      await fetchData();
      toast({
        title: "Success",
        description: "Payment plan status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveProduct = async () => {
    try {
      const features = productForm.features.split(',').map(f => f.trim()).filter(f => f);
      
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        tier: productForm.tier || '',
        features,
        is_active: productForm.is_active,
        is_popular: productForm.is_popular
      };

      // Validate the product data
      const validationResult = productSchema.safeParse(productData);
      
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }

      // Additional validation for tier based on category
      if (productData.category === 'ranks' && productData.tier) {
        const tierLower = productData.tier.toLowerCase();
        if (!VALID_RANKS.includes(tierLower)) {
          toast({
            title: "Validation Error",
            description: `Invalid rank tier. Must be one of: ${VALID_RANKS.join(', ')}`,
            variant: "destructive",
          });
          return;
        }
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        if (error) throw error;
      }
      
      await fetchData();
      setShowProductDialog(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        tier: '',
        features: '',
        is_active: true,
        is_popular: false
      });
      toast({
        title: "Success",
        description: "Product saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      await fetchData();
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const savePlan = async () => {
    try {
      const features = planForm.features.split(',').map(f => f.trim()).filter(f => f);
      const rcon_commands = planForm.rcon_commands.split(',').map(f => f.trim()).filter(f => f);
      
      const planData = {
        name: planForm.name,
        description: planForm.description,
        amount: parseFloat(planForm.amount),
        interval: planForm.interval,
        features,
        rcon_commands,
        is_active: planForm.is_active
      };

      // Validate the plan data
      const validationResult = paymentPlanSchema.safeParse(planData);
      
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }

      if (editingPlan) {
        const { error } = await supabase
          .from('payment_plans')
          .update(planData)
          .eq('id', editingPlan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_plans')
          .insert(planData);
        if (error) throw error;
      }
      
      await fetchData();
      setShowPlanDialog(false);
      setEditingPlan(null);
      setPlanForm({
        name: '',
        description: '',
        amount: '',
        interval: 'month',
        features: '',
        rcon_commands: '',
        is_active: true
      });
      toast({
        title: "Success",
        description: "Payment plan saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('payment_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
      
      await fetchData();
      toast({
        title: "Success",
        description: "Payment plan deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const executeRconCommand = async () => {
    if (!rconCommand.trim()) return;

    setRconLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rcon-command', {
        body: { 
          command: rconCommand,
          server: selectedServer 
        }
      });

      if (error) throw error;

      const timestamp = new Date().toLocaleTimeString();
      const output = `[${timestamp}] Server: ${selectedServer} | Command: ${rconCommand}\n${data.result || 'Command executed successfully'}\n\n`;
      setRconOutput(prev => prev + output);
      setRconCommand('');
    } catch (error: any) {
      const timestamp = new Date().toLocaleTimeString();
      const output = `[${timestamp}] Error: ${error.message}\n\n`;
      setRconOutput(prev => prev + output);
    } finally {
      setRconLoading(false);
    }
  };

  const saveRconServer = async () => {
    try {
      if (editingServer?.id) {
        // Update existing server - only update password if a new one is provided
        const updateData: any = {
          name: editingServer.name,
          host: editingServer.host,
          port: editingServer.port,
          is_active: editingServer.is_active
        };
        
        // Only include password if it's being changed
        if (newPassword) {
          updateData.password = newPassword;
        }
        
        const { error } = await supabase
          .from('rcon_servers')
          .update(updateData)
          .eq('id', editingServer.id);
        if (error) throw error;
      } else {
        // Create new server - password is required
        if (!newPassword) {
          toast({
            title: "Error",
            description: "Password is required for new servers",
            variant: "destructive",
          });
          return;
        }
        
        const { error } = await supabase
          .from('rcon_servers')
          .insert({
            name: editingServer.name,
            host: editingServer.host,
            port: editingServer.port,
            password: newPassword,
            is_active: editingServer.is_active
          });
        if (error) throw error;
      }
      
      await fetchData();
      setShowServerDialog(false);
      setEditingServer(null);
      setNewPassword('');
      toast({
        title: "Success",
        description: "RCON server saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRconServer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rcon_servers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchData();
      toast({
        title: "Success",
        description: "RCON server deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your Minecraft server store</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Products</p>
                <p className="text-xl sm:text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Orders</p>
                <p className="text-xl sm:text-2xl font-bold">{orders.length}</p>
              </div>
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
                <p className="text-xl sm:text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Button onClick={() => navigate('/admin/settings')} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Website Settings
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex sm:grid w-full sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1 h-auto p-1 min-w-max sm:min-w-0">
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden md:inline">Payments</span>
              <span className="md:hidden">Plans</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Receipt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden md:inline">Transactions</span>
              <span className="md:hidden">Trans</span>
            </TabsTrigger>
            <TabsTrigger value="rcon" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Terminal className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              RCON
            </TabsTrigger>
            <TabsTrigger value="players" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <UserCog className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Players
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden lg:inline">Performance</span>
              <span className="lg:hidden">Perf</span>
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden lg:inline">Scheduler</span>
              <span className="lg:hidden">Sched</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Webhook className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden lg:inline">Integrations</span>
              <span className="lg:hidden">Int</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden lg:inline">Marketing</span>
              <span className="lg:hidden">Mkt</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">
              <Newspaper className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              News
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-xs sm:text-sm">Display Name</th>
                      <th className="text-left p-2 text-xs sm:text-sm hidden md:table-cell">Minecraft Username</th>
                      <th className="text-left p-2 text-xs sm:text-sm">Role</th>
                      <th className="text-left p-2 text-xs sm:text-sm hidden lg:table-cell">Joined</th>
                      <th className="text-left p-2 text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2 text-xs sm:text-sm">{user.display_name || 'N/A'}</td>
                        <td className="p-2 text-xs sm:text-sm hidden md:table-cell">
                          <span className="text-muted-foreground" title="Masked for privacy">
                            {maskUsername(user.minecraft_username)}
                          </span>
                        </td>
                        <td className="p-2">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                            {user.role || 'user'}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs sm:text-sm hidden lg:table-cell">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Select
                            value={user.role || 'user'}
                            onValueChange={(value) => updateUserRole(user.user_id, value)}
                          >
                            <SelectTrigger className="w-20 sm:w-24 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Product Management</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage store products and pricing</CardDescription>
                </div>
                <Button 
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  size="sm"
                  onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    tier: '',
                    features: '',
                    is_active: true,
                    is_popular: false
                  });
                  setShowProductDialog(true);
                }}>
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Add Product</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-xs sm:text-sm">Name</th>
                      <th className="text-left p-2 text-xs sm:text-sm">Price</th>
                      <th className="text-left p-2 text-xs sm:text-sm hidden md:table-cell">Category</th>
                      <th className="text-left p-2 text-xs sm:text-sm">Status</th>
                      <th className="text-left p-2 text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="p-2 font-medium text-xs sm:text-sm">{product.name}</td>
                        <td className="p-2 text-xs sm:text-sm">${product.price}</td>
                        <td className="p-2 text-xs sm:text-sm hidden md:table-cell">{product.category}</td>
                        <td className="p-2">
                          <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingProduct(product);
                                setProductForm({
                                  name: product.name,
                                  description: product.description || '',
                                  price: product.price.toString(),
                                  category: product.category,
                                  tier: product.tier || '',
                                  features: product.features?.join(', ') || '',
                                  is_active: product.is_active,
                                  is_popular: product.is_popular
                                });
                                setShowProductDialog(true);
                              }}
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              variant={product.is_active ? "secondary" : "default"}
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                            >
                              {product.is_active ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>View and manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Order ID</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Fulfillment</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-2 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                        <td className="p-2">${order.total_amount}</td>
                        <td className="p-2">
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={order.fulfillment_status === 'fulfilled' ? 'default' : 'secondary'}>
                            {order.fulfillment_status}
                          </Badge>
                        </td>
                        <td className="p-2">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Plans Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment Plans</CardTitle>
                  <CardDescription>Manage subscription plans and pricing</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingPlan(null);
                  setPlanForm({
                    name: '',
                    description: '',
                    amount: '',
                    interval: 'month',
                    features: '',
                    rcon_commands: '',
                    is_active: true
                  });
                  setShowPlanDialog(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Interval</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentPlans.map((plan) => (
                      <tr key={plan.id} className="border-b">
                        <td className="p-2 font-medium">{plan.name}</td>
                        <td className="p-2">${plan.amount}</td>
                        <td className="p-2">{plan.interval}</td>
                        <td className="p-2">
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingPlan(plan);
                                setPlanForm({
                                  name: plan.name,
                                  description: plan.description || '',
                                  amount: plan.amount.toString(),
                                  interval: plan.interval,
                                  features: plan.features?.join(', ') || '',
                                  rcon_commands: plan.rcon_commands?.join(', ') || '',
                                  is_active: plan.is_active
                                });
                                setShowPlanDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={plan.is_active ? "secondary" : "default"}
                              size="sm"
                              onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                            >
                              {plan.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deletePlan(plan.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>View all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Transaction ID</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Payment Method</th>
                      <th className="text-left p-2">Customer</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b">
                        <td className="p-2 font-mono text-sm">{transaction.id.slice(0, 8)}...</td>
                        <td className="p-2">${transaction.amount}</td>
                        <td className="p-2">
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="p-2">{transaction.payment_method || 'N/A'}</td>
                        <td className="p-2">
                          <span className="text-muted-foreground" title="Masked for privacy">
                            {maskEmail(transaction.customer_email)}
                          </span>
                        </td>
                        <td className="p-2">{new Date(transaction.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RCON Commands */}
        <TabsContent value="rcon">
          <div className="space-y-6">
            {/* RCON Servers Management */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      RCON Servers
                    </CardTitle>
                    <CardDescription>Manage your Minecraft server RCON connections</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setEditingServer({ name: '', host: 'localhost', port: 25575, is_active: true });
                    setNewPassword('');
                    setShowServerDialog(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Server
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Host</th>
                        <th className="text-left p-2">Port</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rconServers.map((server) => (
                        <tr key={server.id} className="border-b">
                          <td className="p-2 font-medium">{server.name}</td>
                          <td className="p-2">{server.host}</td>
                          <td className="p-2">{server.port}</td>
                          <td className="p-2">
                            <Badge variant={server.is_active ? "default" : "secondary"}>
                              {server.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingServer(server);
                                  setNewPassword(''); // Clear password field when editing
                                  setShowServerDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteRconServer(server.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* RCON Console */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  RCON Console
                </CardTitle>
                <CardDescription>Execute commands on your Minecraft servers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-center">
                  <label className="text-sm font-medium">Server:</label>
                  <select 
                    value={selectedServer} 
                    onChange={(e) => setSelectedServer(e.target.value)}
                    className="px-3 py-1 border rounded-md"
                  >
                    {rconServers.filter(s => s.is_active).map(server => (
                      <option key={server.id} value={server.name}>{server.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-black text-green-400 font-mono p-4 rounded-lg h-48 overflow-y-auto whitespace-pre-wrap">
                  {rconOutput || 'RCON Console - Ready for commands...\n'}
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={rconCommand}
                      onChange={(e) => setRconCommand(e.target.value)}
                      placeholder="Enter RCON command (e.g., list, say Hello World)"
                      onKeyPress={(e) => e.key === 'Enter' && executeRconCommand()}
                      className="font-mono"
                    />
                  </div>
                  <Button 
                    onClick={executeRconCommand} 
                    disabled={rconLoading || !rconCommand.trim() || rconServers.filter(s => s.is_active).length === 0}
                    className="mt-6"
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    Execute
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRconCommand('list')}
                  >
                    List Players
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRconCommand('tps')}
                  >
                    Check TPS
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRconCommand('save-all')}
                  >
                    Save World
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRconOutput('')}
                  >
                    Clear Output
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Warning:</strong> Use RCON commands carefully. Some commands can affect server performance or player experience.</p>
                  <p><strong>Common commands:</strong> list, tps, save-all, whitelist, ban, kick, say, give</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <div className="space-y-6">
            <PaymentGatewaySettings />
            
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Server Management</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage Minecraft server settings and RCON
                      </p>
                      <Button variant="outline" className="w-full">
                        Configure RCON
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Website Settings</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure website name and details
                      </p>
                      <Button variant="outline" className="w-full" onClick={() => navigate('/admin/settings')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Website Config
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Player Management Tab */}
        <TabsContent value="players">
          <PlayerManagement selectedServer={selectedServer} />
        </TabsContent>

        {/* Server Performance Tab */}
        <TabsContent value="performance">
          <ServerPerformance selectedServer={selectedServer} />
        </TabsContent>

        {/* Command Scheduler Tab */}
        <TabsContent value="scheduler">
          <CommandScheduler selectedServer={selectedServer} servers={rconServers} />
        </TabsContent>

        {/* Integration Settings Tab */}
        <TabsContent value="integrations">
          <IntegrationSettings />
        </TabsContent>

        {/* Marketing Tools Tab */}
        <TabsContent value="marketing">
          <MarketingTools />
        </TabsContent>

        {/* News Management Tab */}
        <TabsContent value="news">
          <NewsManagement />
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="VIP Rank"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  3-50 characters. Letters, numbers, spaces, hyphens, and underscores only.
                </p>
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={productForm.category} 
                  onValueChange={(value) => setProductForm({...productForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ranks">Ranks</SelectItem>
                    <SelectItem value="coins">Coins</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="kits">Kits</SelectItem>
                    <SelectItem value="cosmetics">Cosmetics</SelectItem>
                    <SelectItem value="perks">Perks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tier">Tier (optional)</Label>
                <Input
                  id="tier"
                  value={productForm.tier}
                  onChange={(e) => setProductForm({...productForm, tier: e.target.value})}
                  placeholder="vip, elite, legend"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lowercase letters, numbers, and underscores only. For ranks, use: {VALID_RANKS.join(', ')}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows={3}
                  maxLength={500}
                  placeholder="Detailed description of this product..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum 500 characters
                </p>
              </div>
              <div>
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Textarea
                  id="features"
                  value={productForm.features}
                  onChange={(e) => setProductForm({...productForm, features: e.target.value})}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum 10 features, each up to 100 characters
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={productForm.is_active}
                    onCheckedChange={(checked) => setProductForm({...productForm, is_active: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPopular"
                    checked={productForm.is_popular}
                    onCheckedChange={(checked) => setProductForm({...productForm, is_popular: checked})}
                  />
                  <Label htmlFor="isPopular">Popular</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveProduct}>
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Payment Plan' : 'Add New Payment Plan'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="planAmount">Amount ($)</Label>
                <Input
                  id="planAmount"
                  type="number"
                  step="0.01"
                  value={planForm.amount}
                  onChange={(e) => setPlanForm({...planForm, amount: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="planInterval">Billing Interval</Label>
                <Select 
                  value={planForm.interval} 
                  onValueChange={(value) => setPlanForm({...planForm, interval: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="planActive"
                  checked={planForm.is_active}
                  onCheckedChange={(checked) => setPlanForm({...planForm, is_active: checked})}
                />
                <Label htmlFor="planActive">Active</Label>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="planDescription">Description</Label>
                <Textarea
                  id="planDescription"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="planFeatures">Features (comma-separated)</Label>
                <Textarea
                  id="planFeatures"
                  value={planForm.features}
                  onChange={(e) => setPlanForm({...planForm, features: e.target.value})}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="rconCommands">RCON Commands (comma-separated)</Label>
                <Textarea
                  id="rconCommands"
                  value={planForm.rcon_commands}
                  onChange={(e) => setPlanForm({...planForm, rcon_commands: e.target.value})}
                  placeholder="give {username} diamond 64, tp {username} spawn"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={savePlan}>
              {editingPlan ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* RCON Server Dialog */}
      <Dialog open={showServerDialog} onOpenChange={setShowServerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingServer?.id ? 'Edit RCON Server' : 'Add RCON Server'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="serverName">Server Name</Label>
              <Input
                id="serverName"
                value={editingServer?.name || ''}
                onChange={(e) => setEditingServer({...editingServer, name: e.target.value})}
                placeholder="e.g., main, creative, survival"
              />
            </div>
            <div>
              <Label htmlFor="serverHost">Host</Label>
              <Input
                id="serverHost"
                value={editingServer?.host || ''}
                onChange={(e) => setEditingServer({...editingServer, host: e.target.value})}
                placeholder="localhost or server IP"
              />
            </div>
            <div>
              <Label htmlFor="serverPort">Port</Label>
              <Input
                id="serverPort"
                type="number"
                value={editingServer?.port || 25575}
                onChange={(e) => setEditingServer({...editingServer, port: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="serverPassword">
                {editingServer?.id ? 'Change RCON Password (leave blank to keep current)' : 'RCON Password *'}
              </Label>
              <Input
                id="serverPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={editingServer?.id ? "Enter new password to change" : "Enter RCON password"}
                required={!editingServer?.id}
              />
              {editingServer?.id && (
                <p className="text-xs text-muted-foreground mt-1">
                  Password is encrypted and cannot be viewed. Only enter a new password if you want to change it.
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="serverActive"
                checked={editingServer?.is_active || false}
                onCheckedChange={(checked) => setEditingServer({...editingServer, is_active: checked})}
              />
              <Label htmlFor="serverActive">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowServerDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveRconServer}>
                {editingServer?.id ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;