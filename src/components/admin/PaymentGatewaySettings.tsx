import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { usePaymentGateways, PaymentGateway } from '@/hooks/usePaymentGateways';
import { CreditCard, Check, Settings2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const PaymentGatewaySettings = () => {
  const { gateways, isLoading, updateGateway } = usePaymentGateways();
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});

  const handleEditGateway = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    setConfigForm(gateway.config || {});
  };

  const handleSaveConfig = () => {
    if (editingGateway) {
      updateGateway({
        id: editingGateway.id,
        config: configForm,
      });
      setEditingGateway(null);
      setConfigForm({});
    }
  };

  const handleToggleActive = (gateway: PaymentGateway) => {
    updateGateway({
      id: gateway.id,
      is_active: !gateway.is_active,
      is_default: !gateway.is_active ? gateway.is_default : false,
    });
  };

  const handleSetDefault = (gateway: PaymentGateway) => {
    if (gateway.is_active) {
      updateGateway({
        id: gateway.id,
        is_default: true,
      });
    }
  };

  const getConfigFields = (provider: string): string[] => {
    const configMap: Record<string, string[]> = {
      stripe: ['api_key', 'webhook_secret'],
      razorpay: ['key_id', 'key_secret'],
      paypal: ['client_id', 'client_secret'],
      phonepe: ['merchant_id', 'salt_key', 'salt_index'],
      paytm: ['merchant_id', 'merchant_key'],
      cashfree: ['app_id', 'secret_key'],
    };
    return configMap[provider] || [];
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading payment gateways...</div>;
  }

  return (
    <>
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Security Warning: Do NOT Store API Secrets Here</AlertTitle>
        <AlertDescription className="text-sm space-y-2 mt-2">
          <p>
            <strong>CRITICAL:</strong> This configuration interface is for testing purposes only. 
            For production use, you MUST store all API keys and secrets in Supabase Secrets (environment variables).
          </p>
          <p className="text-xs opacity-90">
            Storing secrets in the database exposes them to compromise. Always use edge functions 
            to access payment gateway secrets server-side via environment variables.
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Gateway Configuration
          </CardTitle>
          <CardDescription>
            Enable payment gateways. Configure API secrets in Supabase Secrets for production.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gateways.map((gateway) => (
            <Card key={gateway.id} className={`${gateway.is_active ? 'border-primary' : ''}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-base sm:text-lg">{gateway.name}</h4>
                      {gateway.is_active && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}
                      {gateway.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Provider: <code className="bg-muted px-2 py-1 rounded text-xs">{gateway.provider}</code>
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <Label htmlFor={`active-${gateway.id}`} className="text-sm">Enable</Label>
                      <Switch
                        id={`active-${gateway.id}`}
                        checked={gateway.is_active}
                        onCheckedChange={() => handleToggleActive(gateway)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGateway(gateway)}
                        className="flex-1 sm:flex-none"
                      >
                        <Settings2 className="h-4 w-4 mr-2" />
                        <span className="text-xs sm:text-sm">Configure</span>
                      </Button>
                      
                      {gateway.is_active && !gateway.is_default && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSetDefault(gateway)}
                          className="flex-1 sm:flex-none"
                        >
                          <span className="text-xs sm:text-sm">Set Default</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={!!editingGateway} onOpenChange={(open) => !open && setEditingGateway(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {editingGateway?.name}</DialogTitle>
          </DialogHeader>

          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>WARNING:</strong> Storing secrets here is insecure. For production, use Supabase Secrets.
              Store only non-sensitive config like currency or region preferences.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4 py-4">
            {editingGateway && getConfigFields(editingGateway.provider).map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field} className="text-sm font-medium">
                  {field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  {(field.includes('secret') || field.includes('key')) && (
                    <span className="text-destructive ml-1">⚠️ Secret</span>
                  )}
                </Label>
                <Input
                  id={field}
                  type={field.includes('secret') || field.includes('key') ? 'password' : 'text'}
                  value={configForm[field] || ''}
                  onChange={(e) => setConfigForm({ ...configForm, [field]: e.target.value })}
                  placeholder={field.includes('secret') || field.includes('key') ? 'Use Supabase Secrets instead' : `Enter ${field}`}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingGateway(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} className="flex-1">
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
