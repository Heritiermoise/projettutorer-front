import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const dashboardPathForRole = (role: string) => {
  if (role === 'admin' || role === 'it') return '/dashboard/admin';
  if (role === 'directeur' || role === 'manager') return '/dashboard/directeur';
  if (role === 'rh') return '/dashboard/rh';
      if (role === 'utilisateur') return '/dashboard/utilisateur';
  return '/dashboard/employe';
};

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to={dashboardPathForRole(user.role.toLowerCase())} replace />;
  }

  return <>{children}</>;
};