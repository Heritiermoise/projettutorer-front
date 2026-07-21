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
      
      // Accessible si Directeur ou Admin
      (isAdmin || isDirecteur) ? apiRequest('direction/services').catch(() => ({})) : Promise.resolve({}),
      
      // Uniquement accessible si RH ou Admin
      (isAdmin || isRH) ? apiRequest('rh/contrats').catch(() => ({})) : Promise.resolve({}),
      
      // Accessible si Directeur ou Admin
      (isAdmin || isDirecteur) ? apiRequest('direction/postes').catch(() => ({})) : Promise.resolve({}),
      
      congeAPI.getAll().catch(() => ({})),
      presenceAPI.getAll().catch(() => ({})),
      fichesPaieAPI.getAll().catch(() => ({})),
      avantageAPI.getAll().catch(() => ({})),
      
      // Récupération dynamique selon le rôle
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

    // Extraction globale brute pour appliquer la hiérarchie relationnelle (Entreprise -> Service -> Poste -> Employé)
    const rawEmployes = extractArray(employesResponse, 'employes')
      .concat(extractArray(employesResponse, 'direction/membres'))
      .concat(Array.isArray(employesResponse) ? employesResponse : [])

    const rawServices = extractArray(servicesResponse, 'services')
      .concat(extractArray(servicesResponse, 'direction/services'))
      .concat(Array.isArray(servicesResponse) ? servicesResponse : [])

    const rawPostes = extractArray(postesResponse, 'postes')
      .concat(extractArray(postesResponse, 'direction/postes'))
      .concat(Array.isArray(postesResponse) ? postesResponse : [])

    // 1. Filtrer les services rattachés à l'entreprise
    const services = entrepriseId 
      ? rawServices.filter((s: any) => Number(s.id_entreprise) === Number(entrepriseId))
      : rawServices

    const serviceIdsSet = new Set(services.map((s: any) => Number(s.id_service)))

    // 2. Filtrer les postes rattachés aux services de l'entreprise (ou directement liés par id_entreprise si présent)
    const postes = entrepriseId
      ? rawPostes.filter((p: any) => serviceIdsSet.has(Number(p.id_service)) || Number(p.id_entreprise) === Number(entrepriseId))
      : rawPostes

    const posteIdsSet = new Set(postes.map((p: any) => Number(p.id_poste)))

    // 3. Filtrer les employés rattachés aux postes de l'entreprise
    const employes = entrepriseId
      ? rawEmployes.filter((e: any) => posteIdsSet.has(Number(e.id_poste)) || Number(e.id_entreprise) === Number(entrepriseId))
      : rawEmployes

    const contrats = filterByEntreprise(extractArray(contratsResponse, 'rh/contrats'))
    const conges = filterByEntreprise(extractArray(congesResponse, 'rh/conges'))
    const presences = filterByEntreprise(extractArray(presencesResponse, 'rh/presences'))
    const fichesPaie = filterByEntreprise(extractArray(fichesPaieResponse, 'rh/fichesPaies'))
    const avantages = filterByEntreprise(extractArray(avantagesResponse, 'rh/avantages'))
    const documents = filterByEntreprise(extractArray(documentsResponse, 'rh/documents'))
    const offres = filterByEntreprise(extractArray(offresResponse, 'rh/offres'))

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