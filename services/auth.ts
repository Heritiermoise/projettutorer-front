import api from '../lib/axios';
import { User } from '../types';

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  register: async (data: any) => {
    const response = await api.post('/register', data);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/user');
    return response.data;
  },
};