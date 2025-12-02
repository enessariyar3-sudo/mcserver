import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  is_active: boolean;
  is_default: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const usePaymentGateways = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gateways, isLoading } = useQuery({
    queryKey: ['payment-gateways'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as PaymentGateway[];
    },
  });

  const updateGateway = useMutation({
    mutationFn: async ({ id, is_active, is_default, config }: { 
      id: string; 
      is_active?: boolean; 
      is_default?: boolean;
      config?: Record<string, any>;
    }) => {
      const updateData: any = {};
      if (is_active !== undefined) updateData.is_active = is_active;
      if (is_default !== undefined) updateData.is_default = is_default;
      if (config !== undefined) updateData.config = config;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('payment_gateways')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
      toast({
        title: 'Success',
        description: 'Payment gateway updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getActiveGateway = () => {
    return gateways?.find(g => g.is_active && g.is_default);
  };

  return {
    gateways: gateways || [],
    isLoading,
    updateGateway: updateGateway.mutate,
    getActiveGateway,
  };
};
