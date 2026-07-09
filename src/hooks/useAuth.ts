import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, entrepriseAPI, testBackendConnection } from '../services/api';
import { clearDashboardContextCache } from '../services/dashboardData';
import { API_BASE_URL } from '../config/api';

export interface User {
  id: number;
  nom?: string;
  post_nom?: string;
  prenom?: string;
  name: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: string;
  statut?: string;
  id_entreprise?: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        if (!token) {
          localStorage.setItem('token', 'local-session-token');
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);

    testBackendConnection()
      .then((result) => setBackendOk(Boolean(result?.success)))
      .catch(() => setBackendOk(false));
  }, []);

  const checkBackendStatus = async () => {
    try {
      const result = await testBackendConnection();
      const ok = Boolean(result?.success);
      setBackendOk(ok);
      return ok;
    } catch {
      setBackendOk(false);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const data = await authAPI.login(email, password);
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: 'Reponse serveur invalide' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const register = async (data: any): Promise<{ success: boolean; message?: string; user?: User; token?: string; redirect?: string }> => {
    try {
      const result = await authAPI.register({ ...data });
      if (result.token && result.user) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        return {
          success: true,
          user: result.user,
          token: result.token,
          redirect: result.redirect || getDashboardPath(result.user.role),
        };
      }
      return { success: false, message: 'Inscription reussie mais reponse incomplete' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const createEntreprise = async (formData: FormData): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const result = await entrepriseAPI.create(formData as any);
      
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        if (result.token) {
          localStorage.setItem('token', result.token);
        }
        return { success: true, user: result.user, message: result.message || 'Entreprise creee' };
      }
      
      if (result.status === 'success') {
        try {
          const userData: any = await authAPI.getUser();
          if (userData && userData.user) {
            localStorage.setItem('user', JSON.stringify(userData.user));
            setUser(userData.user);
            return { success: true, user: userData.user, message: result.message || 'Entreprise creee' };
          }
          return { success: true, message: result.message || 'Entreprise creee. Reconnectez-vous.' };
        } catch (e) {
          return { success: true, message: result.message || 'Entreprise creee. Reconnectez-vous.' };
        }
      }
      
      return { success: false, message: result.message || 'Reponse serveur inattendue' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      clearDashboardContextCache();
      setUser(null);
      navigate('/login');
    }
  };

  const getDashboardPath = (role: string): string => {
    switch (role) {
      case 'admin':
      case 'it':
        return '/dashboard/admin';
      case 'directeur':
        return '/dashboard/directeur';
      case 'rh':
        return '/dashboard/rh';
      case 'manager':
        return '/dashboard/directeur';
      case 'utilisateur':
      case 'employe':
        return '/dashboard/employe';
      default:
        return '/dashboard/employe';
    }
  };

  return { user, loading, backendOk, login, register, createEntreprise, logout, getDashboardPath, checkBackendStatus, setUser };
};