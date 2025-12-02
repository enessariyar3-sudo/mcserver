import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  tier?: string;
  features?: string[];
  is_active: boolean;
  is_popular: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: string;
  features?: string[];
  rcon_commands?: string[];
  is_active: boolean;
  stripe_price_id?: string;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['payment-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('is_active', true)
        .order('amount', { ascending: true });

      if (error) throw error;
      return data as PaymentPlan[];
    },
  });

  const getProductsByCategory = (category: string) => {
    return products?.filter(p => p.category === category) || [];
  };

  return {
    products: products || [],
    plans: plans || [],
    isLoading: isLoadingProducts || isLoadingPlans,
    getProductsByCategory,
  };
};
