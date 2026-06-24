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
  login: (email: string, password: string): { success: boolean; user?: User; message?: string } => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('token', 'mock-token-' + user.id);
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, message: 'Email ou mot de passe incorrect' };
  },

  register: (data: any): { success: boolean; user?: User; message?: string } => {
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      return { success: false, message: 'Cet email est deja utilise' };
    }
    const newUser: User = {
      id: mockUsers.length + 1,
      nom: data.nom || '',
      post_nom: data.post_nom || '',
      prenom: data.prenom || '',
      name: (data.prenom || '') + ' ' + (data.nom || ''),
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
    const { password, ...userWithoutPassword } = newUser;
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    localStorage.setItem('token', 'mock-token-' + newUser.id);
    return { success: true, user: userWithoutPassword };
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