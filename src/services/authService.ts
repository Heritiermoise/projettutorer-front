import { mockUsers } from '../data/mockData';
import { authAPI } from './api';

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
      const user = response.user as User;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth_token', response.token);
      return { success: true, user };
    } catch {
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('token', 'mock-token-' + user.id);
        return { success: true, user: userWithoutPassword };
      }
      return { success: false, message: 'Email ou mot de passe incorrect' };
    }
  },

  register: async (data: any): Promise<{ success: boolean; user?: User; message?: string; token?: string }> => {
    try {
      const response = await authAPI.register(data);
      const user = response.user as User;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth_token', response.token);
      return { success: true, user, token: response.token };
    } catch {
      const existingUser = mockUsers.find(u => u.email === data.email);
      if (existingUser) {
        return { success: false, message: 'Cet email est deja utilise' };
      }

      const newUser: User = {
        id: mockUsers.length + 1,
        nom: data.nom || '',
        post_nom: data.post_nom || '',
        prenom: data.prenom || '',
        name: ((data.prenom || '') + ' ' + (data.nom || '')).trim(),
        email: data.email,
        telephone: data.telephone || '',
        adresse: data.adresse || '',
        role: data.role || 'utilisateur',
        statut: 'actif',
        password: data.password,
        id_entreprise: data.id_entreprise ?? null,
        created_at: new Date().toISOString().slice(0,10),
      };
      mockUsers.push(newUser as any);
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('token', 'mock-token-' + newUser.id);
      return { success: true, user: userWithoutPassword };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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