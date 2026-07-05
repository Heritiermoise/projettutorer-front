import { authAPI } from './api';
import { mockUsers } from '../data/mockData';

export interface User {
  id: number;
  nom: string;
  post_nom?: string;
  prenom: string;
  name: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: string;
  statut: string;
  id_entreprise?: number | null;
  created_at?: string;
  password?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const response = await authAPI.login(email, password);
      const user = response.user as User | undefined;
      if (!response.token || !user) {
        return { success: false, message: response.message || 'Réponse serveur invalide' };
      }

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth_token', response.token);
      return { success: true, user };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Email ou mot de passe incorrect' };
    }
  },

  register: async (data: any): Promise<{ success: boolean; user?: User; message?: string; token?: string }> => {
    try {
      const response = await authAPI.register(data);
      const user = response.user as User | undefined;
      if (!response.token || !user) {
        return { success: false, message: response.message || 'Inscription reussie mais reponse incomplete' };
      }

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth_token', response.token);
      return { success: true, user, token: response.token };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Erreur lors de l\'inscription' };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  getTestAccounts: () => {
    return mockUsers.map(u => ({
      email: u.email,
      password: u.password || 'password',
      role: u.role,
      name: u.name,
    }));
  },
};