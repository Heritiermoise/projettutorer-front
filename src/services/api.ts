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

const buildUrl = (path: string) => {
  // On s'assure que BASE se termine proprement et que path commence sans doublon de slash
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleanPath}`;
};

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
  
  // 1. Détecter si on envoie un fichier / FormData
  const isFormData = options.body instanceof FormData;

  // 2. Initialiser les en-têtes de base
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // N'ajouter le Content-Type JSON que si ce N'EST PAS un FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Fusionner avec d'éventuels en-têtes spécifiques passés en option
  if (options.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers[key] = value;
    });
  }

  // Ajouter le jeton Bearer d'authentification s'il existe
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 3. Préparer le corps de la requête de façon adaptative
  let requestBody = options.body;
  if (requestBody && !isFormData && typeof requestBody !== 'string') {
    requestBody = JSON.stringify(requestBody);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: requestBody, // Utilise le body traité (FormData natif ou chaîne JSON)
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
  // Some backend endpoints use `company_id` (english), accept both keys
  company_id?: number;
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
    // Force la présence d'un slash au début du chemin s'il n'existe pas
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return await requestJson(cleanEndpoint, options);
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
    const response = await requestWithFallback(['/auth/login', '/login'], {
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
    return await requestWithFallback(['/auth/register', '/register'], {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    await requestWithFallback(['/auth/logout', '/logout'], { method: 'POST' });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getUser: async () => {
    return await apiRequest('/user');
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

  /**
   * Crée une entreprise.
   * Accepte un objet JSON classique ou un FormData (fichiers)
   */
  create: async (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    
    return await apiRequest('/entreprises', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  /**
   * Met à jour une entreprise.
   * Astuce Laravel : On utilise POST + _method: PUT quand on transmet des fichiers.
   */
  update: async (id: number, data: FormData | any) => {
    const isFormData = data instanceof FormData;

    if (isFormData) {
      // Laravel ne sait pas intercepter un flux 'multipart/form-data' avec la méthode PUT.
      // On force la méthode en POST et on injecte le paramètre de triche '_method' pour Laravel.
      if (!data.has('_method')) {
        data.append('_method', 'PUT');
      }
      return await apiRequest(`/entreprises/${id}`, {
        method: 'POST', 
        body: data,
      });
    }

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
// MEMBRES
// ═══════════════════════════════════════════════════════════════
export const membreAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/direction/membres?entreprise_id=${entrepriseId}` : '/direction/membres';
    return await apiRequest(url);
  },

  getById: async (id: number) => {
    return await apiRequest(`/direction/membres/${id}`);
  },

  getByMatricule: async (matricule: string) => {
    return await apiRequest(`/direction/membres/${matricule}`);
  },

  create: async (data: Partial<Employe>) => {
    return await apiRequest('direction/membres', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Employe>) => {
    return await apiRequest(`/direction/membres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/direction/membres/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// EMPLOYES
// ═══════════════════════════════════════════════════════════════
export const employeAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/rh/employes?entreprise_id=${entrepriseId}` : '/rh/employes';
    return await apiRequest(url);
  },

  getById: async (id: number) => {
    return await apiRequest(`/rh/employes/${id}`);
  },

  getByMatricule: async (matricule: string) => {
    return await apiRequest(`/rh/employes/${matricule}`);
  },

  create: async (data: Partial<Employe>) => {
    return await apiRequest('/rh/employes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Employe>) => {
    return await apiRequest(`/rh/employes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/rh/employes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════
export const serviceAPI = {
  getAll: async (entrepriseId?: number) => {
    // Added /direction prefix
    const url = entrepriseId ? `/direction/services?id_entreprise=${entrepriseId}` : '/direction/services';
    return await apiRequest(url);
  },

  create: async (data: Record<string, any>) => {
    // Added /direction prefix
    return await apiRequest('/direction/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Record<string, any>) => {
    // Modified path to match Laravel's: /services/update/{id}
    return await apiRequest(`/direction/services/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    // Modified path to match Laravel's: /services/delete/{id}
    return await apiRequest(`/direction/services/delete/${id}`, {
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
    return await apiRequest('/direction/postes');
  },

  create: async (data: Record<string, any>) => {
    return await apiRequest('/direction/postes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Record<string, any>) => {
    return await apiRequest(`/direction/postes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/direction/postes/${id}`, {
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
    return await apiRequest('/rh/fiches_paies');
  },

  getById: async (id: number) => {
    return await apiRequest(`/rh/fiches_paies/${id}`);
  },

  create: async (data: Partial<FichePaie>) => {
    return await apiRequest('/rh/fiches_paies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<FichePaie>) => {
    return await apiRequest(`/rh/fiches_paies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/rh/fiches_paies/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// AVANTAGES
// ═══════════════════════════════════════════════════════════════
export const avantageAPI = {
  getAll: async () => {
    return await apiRequest('/rh/avantages');
  },

  getById: async (id: number) => {
    return await apiRequest(`/rh/avantages/${id}`);
  },

  create: async (data: Partial<Avantage>) => {
    return await apiRequest('/rh/avantages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Avantage>) => {
    return await apiRequest(`/rh/avantages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/rh/avantages/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════════
export const documentAPI = {
  /**
   * Récupère les documents.
   * @param context 'rh' pour la liste globale (RH) ou 'personnel' pour ses propres documents
   */
  getAll: async (context: 'rh' | 'personnel' = 'rh') => {
    const endpoint = context === 'personnel' ? '/mon-espace/mes-documents' : '/rh/documents';
    return await apiRequest(endpoint);
  },

  getById: async (id: number) => {
    return await apiRequest(`/rh/documents/${id}`);
  },

  /**
   * Crée/Téléverse un document. Supports JSON et FormData (fichiers).
   */
  create: async (data: Partial<Document> | FormData, context: 'rh' | 'personnel' = 'rh') => {
    // Sélection de la route selon qui envoie le document
    const endpoint = context === 'personnel' ? '/mon-espace/mes-documents/store' : '/rh/documents/store';
    const isFormData = data instanceof FormData;

    if (isFormData) {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(buildUrl(endpoint), {
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

    return await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Document>) => {
    return await apiRequest(`/rh/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/rh/documents/${id}`, {
      method: 'DELETE',
    });
  },

  upload: async (formData: FormData, context: 'rh' | 'personnel' = 'rh') => {
    return await documentAPI.create(formData, context);
  },
};

// ═══════════════════════════════════════════════════════════════
// PRESENCES
// ═══════════════════════════════════════════════════════════════
export const presenceAPI = {
  getAll: async () => {
    return await apiRequest('/rh/presences');
  },

  getById: async (id: number) => {
    return await apiRequest(`/rh/presences/${id}`);
  },

  create: async (data: Partial<Presence>) => {
    return await apiRequest('/rh/presences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Presence>) => {
    return await apiRequest(`/rh/presences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/rh/presences/${id}`, {
      method: 'DELETE',
    });
  },

  pointer: async (data: any) => {
    return await apiRequest('/rh/presences/pointer', {
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
  /**
   * Récupère la liste des membres. 
   * Par défaut, cible l'espace direction, ou l'espace système IT.
   */
  getAll: async (context: 'direction' | 'it' = 'direction') => {
    const endpoint = context === 'it' ? '/it/utilisateurs' : '/direction/membres';
    return await apiRequest(endpoint);
  },

  getById: async (id: number) => {
    // Les détails d'un membre s'exécutent généralement dans l'espace direction
    return await apiRequest(`/direction/membres/${id}`);
  },

  create: async (data: any) => {
    return await apiRequest('/direction/membres', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: any) => {
    return await apiRequest(`/direction/membres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/direction/membres/${id}`, {
      method: 'DELETE',
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// CONGES
// ═══════════════════════════════════════════════════════════════
export const congeAPI = {
  getAll: async (entrepriseId?: number) => {
    const url = entrepriseId ? `/conges?entreprise_id=${entrepriseId}` : '/rh/conges';
    return await apiRequest(url);
  },

  getMesConges: async () => {
    return await apiRequest('/rh/conges/mes-conges');
  },

  create: async (data: Partial<Conge>) => {
    return await apiRequest('/rh/conges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  approuver: async (id: number) => {
    return await apiRequest(`/rh/conges/${id}/approuver`, {
      method: 'PUT',
    });
  },

  refuser: async (id: number) => {
    return await apiRequest(`/rh/conges/${id}/refuser`, {
      method: 'PUT',
    });
  },
};
