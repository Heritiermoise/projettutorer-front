import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const DashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const paths: Record<string, string> = {
        admin: '/dashboard/admin',
        it: '/dashboard/admin',
        directeur: '/dashboard/directeur',
        rh: '/dashboard/rh',
        manager: '/dashboard/directeur',
        utilisateur: '/dashboard/employe',
        employe: '/dashboard/employe',
      };
      const path = paths[user.role] || '/dashboard';
      if (window.location.pathname === '/dashboard') {
        navigate(path, { replace: true });
      }
    } else if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-accent-50 dark:from-slate-900 dark:via-primary-900/20 dark:to-accent-900/20">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Chargement du tableau de bord...</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Redirection en cours</p>
      </div>
    </div>
  );
};