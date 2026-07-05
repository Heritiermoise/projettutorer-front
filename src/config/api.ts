// Configuration API
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Fonction pour récupérer le token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Fonction pour définir le token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Fonction pour supprimer le token
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Fonction pour les requêtes API
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  
  const headers = {
    ...API_CONFIG.HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};