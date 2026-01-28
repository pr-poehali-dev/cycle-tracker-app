import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const provider = searchParams.get('state') || 'google';

      if (!code) {
        toast.error('Ошибка авторизации');
        navigate('/');
        return;
      }

      try {
        const { token, user } = await api.handleAuthCallback(code, provider);
        api.setToken(token);
        
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success(`Добро пожаловать, ${user.name}!`);
        navigate('/');
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Не удалось войти. Попробуйте снова.');
        navigate('/');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--accent))] via-background to-[hsl(var(--secondary))]">
      <div className="text-center">
        <div className="animate-spin mb-6 mx-auto">
          <Icon name="Loader2" size={48} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Входим в систему...</h2>
        <p className="text-muted-foreground">Подождите несколько секунд</p>
      </div>
    </div>
  );
};

export default AuthCallback;
