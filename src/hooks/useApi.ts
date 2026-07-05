import { useState, useEffect } from 'react';

// Hook générique pour les requêtes API
export const useApi = <T,>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Hook pour l'authentification
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: any, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('auth_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
};

// Hook pour les entreprises
export const useEntreprises = () => {
  return useApi(async () => {
    const { entrepriseAPI } = await import('../services/api');
    return await entrepriseAPI.getAll();
  });
};

// Hook pour les employés
export const useEmployes = (entrepriseId?: number) => {
  return useApi(async () => {
    const { employeAPI } = await import('../services/api');
    return await employeAPI.getAll(entrepriseId);
  }, [entrepriseId]);
};

// Hook pour les offres
export const useOffres = (entrepriseId?: number) => {
  return useApi(async () => {
    const { offreAPI } = await import('../services/api');
    return await offreAPI.getAll(entrepriseId);
  }, [entrepriseId]);
};

// Hook pour les congés
export const useConges = (entrepriseId?: number) => {
  return useApi(async () => {
    const { congeAPI } = await import('../services/api');
    return await congeAPI.getAll(entrepriseId);
  }, [entrepriseId]);
};