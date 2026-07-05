// Service API principal
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Types
export interface User {
  id: number;
  nom: string;
  post_nom?: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: string;
  statut: string;
  id_entreprise?: number;
}

export interface Entreprise {
  id_entreprise: number;
  code_entreprise: string;
  nom: string;
  nom_commercial?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  description?: string;
  statut: string;
}

export interface Employe {
  id: number;
  matricule: string;
  nom: string;
  post_nom?: string;
  prenom: string;
  sexe: string;
  date_naissance?: string;
  lieu_naissance?: string;
  adresse?: string;
  telephone?: string;
  email: string;
  date_embauche: string;
  statut: string;
  id_poste: number;
  id_entreprise: number;
}

export interface OffreEmploi {
  id: number;
  titre: string;
  description: string;
  exigences?: string[];
  avantages?: string[];
  type_contrat: string;
  niveau: string;
  departement: string;
  salaire_min?: number;
  salaire_max?: number;
  localisation: string;
  remote: string;
  date_publication: string;
  date_expiration: string;
  statut: string;
  id_entreprise: number;
}

export interface Conge {
  id: number;
  type_conge: string;
  date_debut: string;
  date_fin: string;
  nombre_jours: number;
  motif?: string;
  statut: string;
  matricule: string;
  id_entreprise: number;
}

export interface Contrat {
  id: number;
  contrat: string;
  type: string;
  date_debut: string;
  date_fin?: string;
  salaire_base: number;
  details?: string;
  statut: string;
  matricule: string;
  id_entreprise: number;
}

export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Backend inaccessible (${response.status})`,
      };
    }

    return {
      success: true,
      message: 'Connexion backend etablie avec succes',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Impossible de joindre le backend',
    };
  }
};

// Fonction de requête API générique
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// AUTHENTIFICATION
// ═══════════════════════════════════════════════════════════════
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
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
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getUser: async () => {
    return await apiRequest('/auth/user');
  },
};

// ═══════════════════════════════════════════════════════════════
// ENTREPRISES
// ═══════════════════════════════════════════════════════════════
export const entrepriseAPI = {
  getAll: async () => {
    return await apiRequest('/entreprises');
  },

  getById: async (id: number) => {
    return await apiRequest(`/entreprises/${id}`);
  },

  getByCode: async (code: string) => {
    return await apiRequest(`/entreprises/code/${code}`);
  },

  create: async (data: Partial<Entreprise>) => {
    return await apiRequest('/entreprises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Entreprise>) => {
    return await apiRequest(`/entreprises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/entreprises/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// EMPLOYES
// ═══════════════════════════════════════════════════════════════
export const employeAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/employes?entreprise_id=${entrepriseId}` : '/employes';
    return await apiRequest(url);
  },

  getById: async (id: number) => {
    return await apiRequest(`/employes/${id}`);
  },

  create: async (data: Partial<Employe>) => {
    return await apiRequest('/employes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Employe>) => {
    return await apiRequest(`/employes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/employes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// OFFRES D'EMPLOI
// ═══════════════════════════════════════════════════════════════
export const offreAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/offres?entreprise_id=${entrepriseId}` : '/offres';
    return await apiRequest(url);
  },

  getPubliees: async () => {
    return await apiRequest('/offres/publiees');
  },

  getById: async (id: number) => {
    return await apiRequest(`/offres/${id}`);
  },

  create: async (data: Partial<OffreEmploi>) => {
    return await apiRequest('/offres', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<OffreEmploi>) => {
    return await apiRequest(`/offres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/offres/${id}`, {
      method: 'DELETE',
    });
  },

  postuler: async (offreId: number, candidatureData: any) => {
    return await apiRequest(`/offres/${offreId}/postuler`, {
      method: 'POST',
      body: JSON.stringify(candidatureData),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// CONGES
// ═══════════════════════════════════════════════════════════════
export const congeAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/conges?entreprise_id=${entrepriseId}` : '/conges';
    return await apiRequest(url);
  },

  getMesConges: async () => {
    return await apiRequest('/conges/mes-conges');
  },

  create: async (data: Partial<Conge>) => {
    return await apiRequest('/conges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  approuver: async (id: number) => {
    return await apiRequest(`/conges/${id}/approuver`, {
      method: 'PUT',
    });
  },

  refuser: async (id: number) => {
    return await apiRequest(`/conges/${id}/refuser`, {
      method: 'PUT',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// CONTRATS
// ═══════════════════════════════════════════════════════════════
export const contratAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/contrats?entreprise_id=${entrepriseId}` : '/contrats';
    return await apiRequest(url);
  },

  create: async (data: Partial<Contrat>) => {
    return await apiRequest('/contrats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Contrat>) => {
    return await apiRequest(`/contrats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════
export const serviceAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/services?entreprise_id=${entrepriseId}` : '/services';
    return await apiRequest(url);
  },

  create: async (data: any) => {
    return await apiRequest('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// POSTES
// ═══════════════════════════════════════════════════════════════
export const posteAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/postes?entreprise_id=${entrepriseId}` : '/postes';
    return await apiRequest(url);
  },

  create: async (data: any) => {
    return await apiRequest('/postes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// CANDIDATURES
// ═══════════════════════════════════════════════════════════════
export const candidatureAPI = {
  getAll: async (offreId?: number) => {
    const url = offreId ? `/candidatures?offre_id=${offreId}` : '/candidatures';
    return await apiRequest(url);
  },

  updateStatut: async (id: number, statut: string) => {
    return await apiRequest(`/candidatures/${id}/statut`, {
      method: 'PUT',
      body: JSON.stringify({ statut }),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// PRESENCES
// ═══════════════════════════════════════════════════════════════
export const presenceAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/presences?entreprise_id=${entrepriseId}` : '/presences';
    return await apiRequest(url);
  },

  pointer: async (data: any) => {
    return await apiRequest('/presences/pointer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════════
export const documentAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/documents?entreprise_id=${entrepriseId}` : '/documents';
    return await apiRequest(url);
  },

  upload: async (formData: FormData) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return await response.json();
  },
};

// ═══════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════
export const dashboardAPI = {
  getStats: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/dashboard/stats?entreprise_id=${entrepriseId}` : '/dashboard/stats';
    return await apiRequest(url);
  },
};