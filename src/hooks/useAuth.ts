import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

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
  }, []);

  const checkBackendStatus = async () => {
    try {
      const ok = await fetch('http://localhost:8000/api/user', {
        headers: { 'Accept': 'application/json' },
      }).then(() => true).catch(() => false);
      setBackendOk(ok);
      return ok;
    } catch {
      setBackendOk(false);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    const backendOk = await checkBackendStatus();
    if (!backendOk) {
      return { success: false, message: 'Backend Laravel inaccessible. Lancez "php artisan serve".' };
    }
    
    try {
      const data = await api.login(email, password);
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: 'Reponse serveur invalide' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const register = async (data: any): Promise<{ success: boolean; message?: string; user?: User; redirect?: string }> => {
    const backendOk = await checkBackendStatus();
    if (!backendOk) {
      return { success: false, message: 'Backend Laravel inaccessible. Lancez "php artisan serve".' };
    }
    
    try {
      // Si le role est "directeur", on inscrit comme utilisateur puis on redirige
      const registerData = { ...data };
      let redirectPath: string | undefined;
      
      if (data.role === 'directeur') {
        registerData.role = 'utilisateur';
        redirectPath = '/create-entreprise';
      }
      
      const result = await api.register(registerData);
      if (result.token && result.user) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        return { success: true, user: result.user, redirect: redirectPath };
      }
      return { success: false, message: 'Inscription reussie mais reponse incomplete' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const createEntreprise = async (formData: FormData): Promise<{ success: boolean; message?: string; user?: User }> => {
    const backendOk = await checkBackendStatus();
    if (!backendOk) {
      return { success: false, message: 'Backend Laravel inaccessible. Lancez "php artisan serve".' };
    }
    
    try {
      const result = await api.createEntreprise(formData);
      
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
          const userData: any = await api.getUser();
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
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
        return '/dashboard/manager';
      case 'employe':
        return '/dashboard/employe';
      default:
        return '/dashboard';
    }
  };

  return { user, loading, backendOk, login, register, createEntreprise, logout, getDashboardPath, checkBackendStatus, setUser };
};