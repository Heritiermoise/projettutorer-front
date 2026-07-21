import { apiRequest } from './api'

export async function loadDashboardRHContext() {
  try {
    console.log("🔍 [DEBUG API] Chargement Dashboard RH unifié via indexrh");
    
    // Appel unique vers la route optimisée du backend Laravel
    const response = await apiRequest('rh/dashboard-data');

    if (!response || !response.success) {
      throw new Error(response?.message || "Erreur lors du chargement des données RH");
    }

    console.log("✅ Données RH unifiées chargées avec succès :", response);

    return {
      success: true,
      user: response.user,
      entreprise: response.entreprise,
      services: response.services || [],
      postes: response.postes || [],
      employes: response.employes || [],
      contrats: response.contrats || [],
      conges: response.conges || [],
      presences: response.presences || [],
      avantages: response.avantages || [],
      fichesPaie: response.fiches_paie || [],
      offres: response.offres || [],
    }
  } catch (error) {
    console.error("❌ Erreur critique dans loadDashboardRHContext :", error);
    
    // Structure de secours vide pour éviter le crash de l'interface graphique
    return {
      success: false,
      user: null,
      entreprise: null,
      services: [],
      postes: [],
      employes: [],
      contrats: [],
      conges: [],
      presences: [],
      avantages: [],
      fichesPaie: [],
      offres: [],
    }
  }
}