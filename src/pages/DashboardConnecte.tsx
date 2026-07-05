import { useState, useEffect } from 'react';
import { entrepriseAPI, employeAPI, offreAPI, type Entreprise, type Employe, type OffreEmploi } from '../services/api';

export const DashboardConnecte = () => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [offres, setOffres] = useState<OffreEmploi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [entreprisesData, employesData, offresData] = await Promise.all([
        entrepriseAPI.getAll(),
        employeAPI.getAll(),
        offreAPI.getAll(),
      ]);
      setEntreprises(entreprisesData || []);
      setEmployes(employesData || []);
      setOffres(offresData || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Erreur de connexion</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button onClick={loadData} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Dashboard Connecté
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Données réelles depuis l'API Laravel
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Entreprises</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{entreprises.length}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Membres</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{employes.length}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Offres</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{offres.length}</p>
          </div>
        </div>

        {/* Liste Entreprises */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
            Entreprises ({entreprises.length})
          </h2>
          {entreprises.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">
              Aucune entreprise trouvée
            </p>
          ) : (
            <div className="space-y-3">
              {entreprises.map(entreprise => (
                <div key={entreprise.id_entreprise} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">{entreprise.nom}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{entreprise.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      entreprise.statut === 'Actif' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {entreprise.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liste Offres */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
            Offres d'emploi ({offres.length})
          </h2>
          {offres.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">
              Aucune offre trouvée
            </p>
          ) : (
            <div className="space-y-3">
              {offres.map(offre => (
                <div key={offre.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">{offre.titre}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{offre.description.substring(0, 100)}...</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{offre.type_contrat}</span>
                        <span>•</span>
                        <span>{offre.niveau}</span>
                        <span>•</span>
                        <span>{offre.localisation}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      offre.statut === 'Publiee'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      {offre.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};