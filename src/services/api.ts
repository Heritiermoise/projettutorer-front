// Service API principal
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 secondes
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

const buildUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

const normalizeResponseError = async (response: Response) => {
  const errorData = await response.json().catch(() => ({} as any));
  const validationErrors = errorData?.errors && typeof errorData.errors === 'object'
    ? Object.values(errorData.errors).flat().filter(Boolean)
    : [];
  const baseMessage = errorData?.message || `HTTP ${response.status}`;
  const detailedMessage = validationErrors.length > 0
    ? `${baseMessage}: ${validationErrors.join(' · ')}`
    : baseMessage;

  const error = new Error(detailedMessage) as Error & {
    status?: number;
    errors?: Record<string, string[]>;
    payload?: unknown;
  };

  error.status = response.status;
  error.errors = errorData?.errors;
  error.payload = errorData;

  return error;
};

const requestJson = async (path: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw await normalizeResponseError(response);
  }

  return await response.json();
};

const requestWithFallback = async (paths: string[], options: RequestInit = {}): Promise<any> => {
  let lastError: unknown;
  for (const path of paths) {
    try {
      return await requestJson(path, options);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : '';
      if (!message.includes('404')) {
        throw error;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Route introuvable');
};

// Fonction de requête API générique
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  try {
    return await requestJson(endpoint, options);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// AUTHENTIFICATION (Préfixe /auth)
// ═══════════════════════════════════════════════════════════════
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await requestJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  register: async (userData: any) => {
    return await requestJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    await requestJson('/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getUser: async () => {
    return await requestJson('/user'); // Route d'état sous Sanctum
  },
};

// ═══════════════════════════════════════════════════════════════
// ENTREPRISES (Racines Globales & Inscription Publique)
// ═══════════════════════════════════════════════════════════════
export const entrepriseAPI = {
  inscriptionPublique: async (data: any) => {
    return await apiRequest('/entreprise/inscription', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async () => {
    return await apiRequest('/entreprises');
  },

  update: async (id: number, data: any) => {
    return await apiRequest(`/entreprises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// ESPACE DIRECTION (Directeur / Admin)
// ═══════════════════════════════════════════════════════════════
export const directionAPI = {
  getDashboard: async () => {
    return await apiRequest('/direction/dashboard');
  },
  
  // Membres (Gestion des utilisateurs de l'entreprise)
  getMembres: async () => {
    return await apiRequest('/direction/membres');
  },
  createMembre: async (data: any) => {
    return await apiRequest('/direction/membres', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateMembre: async (id: number, data: any) => {
    return await apiRequest(`/direction/membres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteMembre: async (id: number) => {
    return await apiRequest(`/direction/membres/${id}`, {
      method: 'DELETE',
    });
  },

  // Services
  getServices: async () => {
    return await apiRequest('/direction/services');
  },
  createService: async (data: any) => {
    return await apiRequest('/direction/services/store', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateService: async (id: number, data: any) => {
    return await apiRequest(`/direction/services/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteService: async (id: number) => {
    return await apiRequest(`/direction/services/delete/${id}`, {
      method: 'DELETE',
    });
  },

  // Postes
  getPostes: async () => {
    return await apiRequest('/direction/postes');
  },
  createPoste: async (data: any) => {
    return await apiRequest('/direction/postes/store', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updatePoste: async (id: number, data: any) => {
    return await apiRequest(`/direction/postes/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deletePoste: async (id: number) => {
    return await apiRequest(`/direction/postes/delete/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// ESPACE RH (RH / Admin)
// ═══════════════════════════════════════════════════════════════
export const rhAPI = {
  // Employés (Espace RH)
  getEmployes: async () => {
    return await apiRequest('/rh/employes');
  },
  createEmploye: async (data: any) => {
    return await apiRequest('/rh/employes/store', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateEmploye: async (id: number, data: any) => {
    return await apiRequest(`/rh/employes/update/${id}`, {
      method: 'POST', // Ton back attend un POST sur update
      body: JSON.stringify(data),
    });
  },
  deleteEmploye: async (id: number) => {
    return await apiRequest(`/rh/employes/delete/${id}`, {
      method: 'DELETE',
    });
  },

  // Contrats
  getContrats: async () => {
    return await apiRequest('/rh/contrats');
  },
  createContrat: async (data: any) => {
    return await apiRequest('/rh/contrats/store', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  terminerContrat: async (id: number) => {
    return await apiRequest(`/rh/contrats/terminer/${id}`, {
      method: 'PUT',
    });
  },
  renouvelerContrat: async (id: number, data: any) => {
    return await apiRequest(`/rh/contrats/renouveler/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Congés (Supporte le format Web ou Patch)
  getConges: async () => {
    return await apiRequest('/rh/conges');
  },
  changeStatutCongeUrl: async (id: number, statut: string) => {
    return await apiRequest(`/rh/conges/update/${id}/${statut}`);
  },

  // Fiches de paie
  getPaies: async () => {
    return await apiRequest('/rh/paies');
  },
  createPaie: async (data: any) => {
    return await apiRequest('/rh/paie/store', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  validerPaie: async (id: number) => {
    return await apiRequest(`/rh/paie/valider/${id}`, {
      method: 'POST',
    });
  },

  // Recrutement & Offres
  getOffres: async () => {
    return await apiRequest('/rh/recrutement/offres');
  },
  createOffre: async (data: any) => {
    return await apiRequest('/rh/recrutement/offres/store', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateStatutOffre: async (id: number, statut: string) => {
    return await apiRequest(`/rh/recrutement/offres/update-statut/${id}/${statut}`, {
      method: 'POST',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPATIBILITÉ COMPOSANTS COMPLETS (Racines Globales API)
// ═══════════════════════════════════════════════════════════════
export const globalAPI = {
  // Congés Généraux
  getConges: async () => await apiRequest('/conges'),
  createConge: async (data: any) => await apiRequest('/conges', { method: 'POST', body: JSON.stringify(data) }),
  updateStatutConge: async (id: number, statut: string) => await apiRequest(`/conges/${id}/${statut}`),

  // Fiches Paie Générales
  getFichesPaies: async () => await apiRequest('/fiches_paies'),
  createFichePaie: async (data: any) => await apiRequest('/fiches_paies', { method: 'POST', body: JSON.stringify(data) }),

  // Présences (Pointages)
  getPresences: async () => await apiRequest('/presences'),
  pointer: async (data: any) => await apiRequest('/presences/pointer', { method: 'POST', body: JSON.stringify(data) }),
  sortir: async (id: number) => await apiRequest(`/presences/update-sortie/${id}`, { method: 'POST' }),

  // Décisions Candidats
  validerCandidat: async (idPostulation: number) => await apiRequest(`/candidat/${idPostulation}/valider`, { method: 'POST' }),
  refuserCandidat: async (idPostulation: number) => await apiRequest(`/candidat/${idPostulation}/refuser`, { method: 'POST' }),
};

// ═══════════════════════════════════════════════════════════════
// MON ESPACE PERSONNEL (Employé connecté)
// ═══════════════════════════════════════════════════════════════
export const monEspaceAPI = {
  getDashboard: async () => await apiRequest('/mon-espace/dashboard'),
  getMesDocuments: async () => await apiRequest('/mon-espace/mes-documents'),
  getMesAvantages: async () => await apiRequest('/mon-espace/mes-avantages'),
  getMesPresences: async () => await apiRequest('/mon-espace/mes-presences'),
  getMesPaies: async () => await apiRequest('/mon-espace/mes-paies'),
  envoyerTicket: async (data: any) => await apiRequest('/mon-espace/ticket-rh', { method: 'POST', body: JSON.stringify(data) }),
};

// ═══════════════════════════════════════════════════════════════
// OFFRES PUBLIQUES (Sans Token)
// ═══════════════════════════════════════════════════════════════
export const publicAPI = {
  getOffresAccueil: async () => await apiRequest('/offres-accueil'),
  getOffres: async () => await apiRequest('/offres'),
  getOffreDetails: async (id: number) => await apiRequest(`/offres/${id}`),
  postulerExterne: async (data: any) => await apiRequest('/postuler/store', { method: 'POST', body: JSON.stringify(data) }),
};