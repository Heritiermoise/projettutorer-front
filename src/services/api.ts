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

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

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

const requestJson = async (
  path: string,
  options: RequestInit = {}
): Promise<any> => {
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

const requestWithFallback = async (
  paths: string[],
  options: RequestInit = {}
): Promise<any> => {
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

export interface Candidat {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  statut: string;
  id_entreprise?: number;
}

export interface FichePaie {
  id: number;
  matricule: string;
  mois_paiement: string;
  annee_paiement: string;
  montant: number;
  statut: string;
  id_entreprise?: number;
}

export interface Avantage {
  id: number;
  matricule: string;
  libelle: string;
  description?: string;
  type_avantage: string;
  valeur?: string;
  date_expiration?: string;
  statut: string;
  id_entreprise?: number;
}

export interface Document {
  id: number;
  matricule: string;
  type_document: string;
  fichier: string;
  statut: string;
  id_entreprise?: number;
}

export interface Presence {
  id: number;
  matricule: string;
  date_presence: string;
  heure_arrivee?: string;
  heure_depart?: string;
  statut: string;
  justification?: string | null;
  id_entreprise?: number;
}

export interface Postulation {
  id: number;
  cv?: string;
  lettre?: string;
  statut: string;
  id_candidat?: number;
  id_offre?: number;
  id_entreprise?: number;
}

export interface Entretien {
  id: number;
  date: string;
  heure: string;
  type: string;
  resultat?: string;
  id_candidat?: number;
  id_offre?: number;
  id_entreprise?: number;
}

export interface Participant {
  matricule: string;
  id_entretien: number;
  statut?: string;
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
    const response = await fetch(buildUrl('/user'), {
      headers: {
        Accept: 'application/json',
      },
    });

    return {
      success: true,
      message: response.ok
        ? 'Connexion backend etablie avec succes'
        : `Backend accessible (HTTP ${response.status})`,
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
  try {
    return await requestJson(endpoint, options);
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
    const response = await requestWithFallback(['/login', '/login'], {
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
    return await requestWithFallback(['/register', '/register'], {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    await requestWithFallback(['/logout', '/logout'], { method: 'POST' });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getUser: async () => {
    return await requestWithFallback(['/user', '/user']);
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

  getByMatricule: async (matricule: string) => {
    return await apiRequest(`/employes/${matricule}`);
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
// SERVICES
// ═══════════════════════════════════════════════════════════════
export const serviceAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/services?id_entreprise=${entrepriseId}` : '/services';
    return await apiRequest(url);
  },

  create: async (data: Record<string, any>) => {
    return await apiRequest('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Record<string, any>) => {
    return await apiRequest(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/services/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// ROLES
// ═══════════════════════════════════════════════════════════════
export const roleAPI = {
  getAll: async () => {
    return await apiRequest('/roles');
  },

  create: async (data: Record<string, any>) => {
    return await apiRequest('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Record<string, any>) => {
    return await apiRequest(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/roles/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// POSTES
// ═══════════════════════════════════════════════════════════════
export const posteAPI = {
  getAll: async () => {
    return await apiRequest('/postes');
  },

  create: async (data: Record<string, any>) => {
    return await apiRequest('/postes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Record<string, any>) => {
    return await apiRequest(`/postes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/postes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// INVITATIONS RH
// ═══════════════════════════════════════════════════════════════
export const invitationAPI = {
  send: async (data: Record<string, any>) => {
    return await apiRequest('/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getByToken: async (token: string) => {
    return await apiRequest(`/invitations/${token}`);
  },

  accept: async (token: string, data: Record<string, any>) => {
    return await apiRequest(`/invitations/${token}/accept`, {
      method: 'POST',
      body: JSON.stringify(data),
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

  getByOffreId: async (id: string | number) => {
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

  postuler: async (offreId: number, candidatureData: FormData | Record<string, any>) => {
    if (candidatureData instanceof FormData) {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(buildUrl(`/offres/${offreId}/postuler`), {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          Accept: 'application/json',
        },
        body: candidatureData,
      });

      if (!response.ok) {
        throw await normalizeResponseError(response);
      }

      return await response.json();
    }

    return await apiRequest(`/offres/${offreId}/postuler`, {
      method: 'POST',
      body: JSON.stringify(candidatureData),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// CANDIDATS
// ═══════════════════════════════════════════════════════════════
export const candidatAPI = {
  getAll: async () => {
    return await apiRequest('/candidats');
  },

  getById: async (id: number) => {
    return await apiRequest(`/candidats/${id}`);
  },

  create: async (data: Partial<Candidat>) => {
    return await apiRequest('/candidats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Candidat>) => {
    return await apiRequest(`/candidats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/candidats/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// FICHES DE PAIE
// ═══════════════════════════════════════════════════════════════
export const fichesPaieAPI = {
  getAll: async () => {
    return await apiRequest('/fiches_paies');
  },

  getById: async (id: number) => {
    return await apiRequest(`/fiches_paies/${id}`);
  },

  create: async (data: Partial<FichePaie>) => {
    return await apiRequest('/fiches_paies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<FichePaie>) => {
    return await apiRequest(`/fiches_paies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/fiches_paies/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// AVANTAGES
// ═══════════════════════════════════════════════════════════════
export const avantageAPI = {
  getAll: async () => {
    return await apiRequest('/avantages');
  },

  getById: async (id: number) => {
    return await apiRequest(`/avantages/${id}`);
  },

  create: async (data: Partial<Avantage>) => {
    return await apiRequest('/avantages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Avantage>) => {
    return await apiRequest(`/avantages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/avantages/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════════
export const documentAPI = {
  getAll: async () => {
    return await apiRequest('/documents');
  },

  getById: async (id: number) => {
    return await apiRequest(`/documents/${id}`);
  },

  create: async (data: Partial<Document> | FormData) => {
    if (data instanceof FormData) {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(buildUrl('/documents'), {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          Accept: 'application/json',
        },
        body: data,
      });

      if (!response.ok) {
        throw await normalizeResponseError(response);
      }

      return await response.json();
    }

    return await apiRequest('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Document>) => {
    return await apiRequest(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  upload: async (formData: FormData) => {
    return await documentAPI.create(formData);
  },
};

// ═══════════════════════════════════════════════════════════════
// PRESENCES
// ═══════════════════════════════════════════════════════════════
export const presenceAPI = {
  getAll: async () => {
    return await apiRequest('/presences');
  },

  getById: async (id: number) => {
    return await apiRequest(`/presences/${id}`);
  },

  create: async (data: Partial<Presence>) => {
    return await apiRequest('/presences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Presence>) => {
    return await apiRequest(`/presences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/presences/${id}`, {
      method: 'DELETE',
    });
  },

  pointer: async (data: any) => {
    return await apiRequest('/presences/pointer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// POSTULATIONS
// ═══════════════════════════════════════════════════════════════
export const postulationAPI = {
  getAll: async () => {
    return await apiRequest('/postulations');
  },

  getById: async (id: number) => {
    return await apiRequest(`/postulations/${id}`);
  },

  create: async (data: Partial<Postulation>) => {
    return await apiRequest('/postulations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Postulation>) => {
    return await apiRequest(`/postulations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/postulations/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// ENTRETIENS
// ═══════════════════════════════════════════════════════════════
export const entretienAPI = {
  getAll: async () => {
    return await apiRequest('/entretiens');
  },

  getById: async (id: number) => {
    return await apiRequest(`/entretiens/${id}`);
  },

  create: async (data: Partial<Entretien>) => {
    return await apiRequest('/entretiens', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Entretien>) => {
    return await apiRequest(`/entretiens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/entretiens/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// PARTICIPANTS
// ═══════════════════════════════════════════════════════════════
export const participantAPI = {
  getAll: async () => {
    return await apiRequest('/participants');
  },

  getById: async (matricule: string, idEntretien: number) => {
    return await apiRequest(`/participants/${matricule}/${idEntretien}`);
  },

  create: async (data: Participant) => {
    return await apiRequest('/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (matricule: string, idEntretien: number, data: Partial<Participant>) => {
    return await apiRequest(`/participants/${matricule}/${idEntretien}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (matricule: string, idEntretien: number) => {
    return await apiRequest(`/participants/${matricule}/${idEntretien}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════
export const userAPI = {
  getAll: async () => {
    return await apiRequest('/users');
  },

  getById: async (id: number) => {
    return await apiRequest(`/users/${id}`);
  },

  create: async (data: any) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE',
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
