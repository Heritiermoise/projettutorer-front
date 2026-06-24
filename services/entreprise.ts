import api from '../lib/axios';
import { Entreprise } from '../types';

export const entrepriseAPI = {
  create: async (data: FormData) => {
    const response = await api.post('/entreprises', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getAll: async (): Promise<Entreprise[]> => {
    const response = await api.get('/entreprises');
    return response.data.entreprises;
  },
  
  getById: async (id: number): Promise<Entreprise> => {
    const response = await api.get(`/entreprises/${id}`);
    return response.data.entreprise;
  },
};