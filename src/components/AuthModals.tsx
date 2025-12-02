import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModals = ({ isOpen, onClose }: AuthModalsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  const handleGoToAuth = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center font-futuristic text-2xl text-foreground">
            Join IndusNetwork
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <p className="text-center text-muted-foreground">
            Create your account or login to access the ultimate Minecraft experience
          </p>
          
          <Button
            onClick={handleGoToAuth}
            variant="gaming"
            className="w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Go to Login/Register
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};