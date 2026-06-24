const API_URL = 'https://rhmanager-877l.onrender.com/Api';

export interface ApiResponse {
  message?: string;
  user?: any;
  token?: string;
  entreprise?: any;
  errors?: any;
  status?: string;
  redirect?: string;
}

function isHtmlResponse(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('<') || trimmed.includes('<html') || trimmed.includes('<br') || trimmed.includes('<!DOCTYPE');
}

async function request(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
  const token = localStorage.getItem('token');
  
  const headers: any = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // Pour FormData, ne pas forcer Content-Type
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  let response: Response;
  let text: string;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });
    text = await response.text();
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Backend inaccessible. Verifiez votre connexion internet.');
    }
    throw error;
  }

  if (isHtmlResponse(text)) {
    console.error('Reponse HTML recue:', text.substring(0, 500));
    const titleMatch = text.match(/<title>(.*?)<\/title>/i);
    const h1Match = text.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const errorMsg = h1Match?.[1] || titleMatch?.[1] || 'Erreur serveur inconnue';
    throw new Error(`Erreur serveur: ${errorMsg}`);
  }

  let data: ApiResponse;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error('Reponse serveur invalide (JSON malforme)');
  }

  if (!response.ok) {
    const message = data.message || (data.errors && typeof data.errors === 'object' 
      ? Object.values(data.errors).flat().join(', ') 
      : data.errors) || `Erreur ${response.status}`;
    throw new Error(message);
  }

  return data;
}

// Fonction pour tester la connexion au backend
export async function testBackendConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_URL}/entreprises`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok || response.status === 401) {
      return { success: true, message: 'Backend accessible !' };
    }
    return { success: false, message: `Erreur ${response.status}` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export const api = {
  // AUTH
  register: (data: any) => request('/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (email: string, password: string) => request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  logout: () => request('/logout', { method: 'POST' }),

  getUser: () => request('/user'),

  // ENTREPRISES
  createEntreprise: (formData: FormData) => request('/entreprises', {
    method: 'POST',
    body: formData,
  }),

  getEntreprises: () => request('/entreprises'),

  // EMPLOYES
  getEmployes: () => request('/employes'),

  // SERVICES
  getServices: () => request('/services'),

  // POSTES
  getPostes: () => request('/postes'),

  // CONTRATS
  getContrats: () => request('/contrats'),

  // AVANTAGES
  getAvantages: () => request('/avantages'),

  // DOCUMENTS
  getDocuments: () => request('/documents'),

  // CONGES
  getConges: () => request('/conges'),

  // PRESENCES
  getPresences: () => request('/presences'),

  // FICHES PAIES
  getFichesPaies: () => request('/fiches_paies'),

  // OFFRES EMPLOI
  getOffresEmploi: () => request('/offres'),

  // CANDIDATS
  getCandidats: () => request('/candidats'),

  // POSTULATIONS
  getPostulations: () => request('/postulations'),

  // ENTRETIENS
  getEntretiens: () => request('/entretiens'),
};