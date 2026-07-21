// import { apiRequest, authAPI, entrepriseAPI, employeAPI, congeAPI, presenceAPI, fichesPaieAPI, avantageAPI, documentAPI, offreAPI, userAPI } from './api'

// export interface DashboardContext {
//   user: any
//   entreprise: any
//   entreprises: any[]
//   users: any[]
//   employes: any[]
//   postes: any[]
//   services: any[]
//   contrats: any[]
//   conges: any[]
//   presences: any[]
//   fichesPaie: any[]
//   avantages: any[]
//   documents: any[]
//   offres: any[]
// }

// const extractArray = (response: any, key: string) => {
//   if (Array.isArray(response)) {
//     return response
//   }

//   if (Array.isArray(response?.[key])) {
//     return response[key]
//   }

//   return []
// }

// let dashboardContextCache: DashboardContext | null = null
// let dashboardContextPromise: Promise<DashboardContext> | null = null

// export const clearDashboardContextCache = () => {
//   dashboardContextCache = null
//   dashboardContextPromise = null
// }

// export const loadDashboardContext = async () => {
//   try {
//     const response = await apiRequest('direction/dashboard'); // ou l'endpoint correspondant
    
//     // 🔍 AJOUTEZ CE CONSOLE.LOG POUR VOIR LA RÉPONSE BRUTE
//     console.log("DONNÉES BRUTES DE L'API DIRECTION :", response);

//     return response;
//   } catch (error) {
//     console.error("Erreur lors du chargement du dashboard :", error);
//     return null;
//   }
// };

import { apiRequest, authAPI, entrepriseAPI, employeAPI, congeAPI, presenceAPI, fichesPaieAPI, avantageAPI, documentAPI, offreAPI, userAPI } from './api'

export interface DashboardContext {
  user: any
  entreprise: any
  entreprises: any[]
  users: any[]
  employes: any[]
  postes: any[]
  services: any[]
  contrats: any[]
  conges: any[]
  presences: any[]
  fichesPaie: any[]
  avantages: any[]
  documents: any[]
  offres: any[]
}

const extractArray = (response: any, key: string) => {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response?.[key])) {
    return response[key]
  }

  return []
}

let dashboardContextCache: DashboardContext | null = null
let dashboardContextPromise: Promise<DashboardContext> | null = null

export const clearDashboardContextCache = () => {
  dashboardContextCache = null
  dashboardContextPromise = null
}

export const loadDashboardContext = async (forceRefresh = false): Promise<DashboardContext> => {
  if (!forceRefresh && dashboardContextCache) {
    return dashboardContextCache
  }

  if (!forceRefresh && dashboardContextPromise) {
    return dashboardContextPromise
  }

  dashboardContextPromise = (async () => {
    const localUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || 'null')
      } catch {
        return null
      }
    })()

    const currentUserResponse = await authAPI.getUser().catch(() => null)
    const currentUser = currentUserResponse?.user ?? currentUserResponse ?? localUser

    // Extraction sécurisée du rôle pour éviter les erreurs 403 (Forbidden)
    const userRole = currentUser?.role?.toLowerCase() || '';
    const isAdmin = userRole === 'admin';
    const isRH = userRole === 'rh';
    const isDirecteur = userRole === 'directeur';

    const [
      usersResponse, 
      entreprisesResponse, 
      employesResponse, 
      servicesResponse, 
      contratsResponse, 
      postesResponse, 
      congesResponse, 
      presencesResponse, 
      fichesPaieResponse, 
      avantagesResponse, 
      documentsResponse, 
      offresResponse
    ] = await Promise.all([
      // Uniquement accessible par Direction / Admin
      (isAdmin || isDirecteur) ? userAPI.getAll('direction').catch(() => ({})) : Promise.resolve({}),
      
      entrepriseAPI.getAll().catch(() => ({})),
      employeAPI.getAll().catch(() => ({})),
      
      // Correction URL : directeur/services -> direction/services (Accessible si Directeur ou Admin)
      (isAdmin || isDirecteur) ? apiRequest('direction/services').catch(() => ({})) : Promise.resolve({}),
      
      // Uniquement accessible si RH ou Admin
      (isAdmin || isRH) ? apiRequest('rh/contrats').catch(() => ({})) : Promise.resolve({}),
      
      // Correction URL : directeur/postes -> direction/postes (Accessible si Directeur ou Admin)
      (isAdmin || isDirecteur) ? apiRequest('direction/postes').catch(() => ({})) : Promise.resolve({}),
      
      congeAPI.getAll().catch(() => ({})),
      presenceAPI.getAll().catch(() => ({})),
      fichesPaieAPI.getAll().catch(() => ({})),
      avantageAPI.getAll().catch(() => ({})),
      
      // Récupération dynamique selon le rôle (Espace RH global vs Espace Personnel)
      documentAPI.getAll(isRH || isAdmin ? 'rh' : 'personnel').catch(() => ({})),
      
      offreAPI.getAll().catch(() => ({})),
    ])

    const users = extractArray(usersResponse, 'users')

    const entrepriseList = extractArray(entreprisesResponse, 'entreprises')
    const entrepriseId = currentUser?.id_entreprise
      ?? currentUser?.entreprise?.id_entreprise
      ?? entrepriseList.find((entreprise: any) => entreprise.user_id === currentUser?.id)?.id_entreprise
      ?? entrepriseList.find((entreprise: any) => entreprise.email && entreprise.email === currentUser?.email)?.id_entreprise
      ?? null

    const entreprise = entrepriseId
      ? entrepriseList.find((item: any) => item.id_entreprise === entrepriseId)
      : entrepriseList.find((item: any) => item.user_id === currentUser?.id) ?? null

    const filterByEntreprise = (items: any[], key = 'id_entreprise') => {
      if (!entrepriseId) {
        return items
      }

      return items.filter((item: any) => item[key] === entrepriseId)
    }

const usersFiltrees = filterByEntreprise(users)
const employes = filterByEntreprise(extractArray(employesResponse, 'employes'))
const services = filterByEntreprise(extractArray(servicesResponse, 'services'))
const postes = filterByEntreprise(extractArray(postesResponse, 'postes'))
const contrats = filterByEntreprise(extractArray(contratsResponse, 'contrats'))
const conges = filterByEntreprise(extractArray(congesResponse, 'conges'))
const presences = filterByEntreprise(extractArray(presencesResponse, 'presences'))
const fichesPaie = filterByEntreprise(extractArray(fichesPaieResponse, 'fichesPaies'))
const avantages = filterByEntreprise(extractArray(avantagesResponse, 'avantages'))
const documents = filterByEntreprise(extractArray(documentsResponse, 'documents'))
const offres = filterByEntreprise(extractArray(offresResponse, 'offres'))

    const context = {
      user: currentUser,
      entreprise,
      entreprises: entrepriseList,
      users: usersFiltrees,
      employes,
      postes,
      services,
      contrats,
      conges,
      presences,
      fichesPaie,
      avantages,
      documents,
      offres,
    }

    dashboardContextCache = context
    return context
  })()

  try {
    return await dashboardContextPromise
  } finally {
    dashboardContextPromise = null
  }
}