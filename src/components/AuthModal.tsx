import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal = ({ open, onClose, onSuccess }: AuthModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { authUrl } = await api.getAuthUrl('google');
      window.location.href = authUrl;
    } catch (error) {
      toast.error('Ошибка при входе через Google');
      setLoading(false);
    }
  };

  const handleYandexLogin = async () => {
    setLoading(true);
    try {
      const { authUrl } = await api.getAuthUrl('yandex');
      window.location.href = authUrl;
    } catch (error) {
      toast.error('Ошибка при входе через Яндекс');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Добро пожаловать! 💜</DialogTitle>
          <DialogDescription className="text-center">
            Войдите, чтобы сохранять ваши данные и получать персональные рекомендации
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-6">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 text-lg rounded-xl bg-white hover:bg-gray-50 text-gray-900 border-2"
            variant="outline"
          >
            <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Войти через Google
          </Button>

          <Button
            onClick={handleYandexLogin}
            disabled={loading}
            className="w-full h-14 text-lg rounded-xl bg-[#FC3F1D] hover:bg-[#E03616] text-white"
          >
            <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm4.3 18.4h-2.8l-3.4-8.4H9.5v8.4H7.1V5.6h4.8c3 0 4.7 1.4 4.7 3.9 0 2-1.1 3.3-2.8 3.7l3.5 5.2z"/>
            </svg>
            Войти через Яндекс
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground px-4">
          Нажимая кнопку входа, вы соглашаетесь с обработкой персональных данных
        </p>
      </DialogContent>
    </Dialog>
  );
};
