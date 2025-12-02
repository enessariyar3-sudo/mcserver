import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: { value: string };
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ 
          setting_value: { value },
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Settings updated',
        description: 'Website settings have been updated successfully.',
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

  const getSetting = (key: string): string => {
    const setting = settings?.find(s => s.setting_key === key);
    return setting?.setting_value?.value || '';
  };

  return {
    settings,
    isLoading,
    updateSetting: updateSetting.mutate,
    getSetting,
  };
};
