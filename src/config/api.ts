// Configuration API
const DEFAULT_API_BASE_URL = 'https://rhmanager-877l.onrender.com/api/';

const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)?.trim();

export const API_BASE_URL = (() => {
  if (!rawApiBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  const normalizedBaseUrl = rawApiBaseUrl.replace(/\/$/, '');
  return normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;
})();

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
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
      const errorData = await response.json().catch(() => ({} as any));
      const validationErrors = errorData?.errors && typeof errorData.errors === 'object'
        ? Object.values(errorData.errors).flat().filter(Boolean)
        : [];
      const baseMessage = errorData?.message || `HTTP error! status: ${response.status}`;
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

      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};