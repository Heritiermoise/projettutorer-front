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

  const [usersResponse, entreprisesResponse, employesResponse, servicesResponse, contratsResponse, postesResponse, congesResponse, presencesResponse, fichesPaieResponse, avantagesResponse, documentsResponse, offresResponse] = await Promise.all([
    userAPI.getAll().catch(() => ({})),
    entrepriseAPI.getAll().catch(() => ({})),
    employeAPI.getAll().catch(() => ({})),
    apiRequest('/services').catch(() => ({})),
    apiRequest('/contrats').catch(() => ({})),
    apiRequest('/postes').catch(() => ({})),
    congeAPI.getAll().catch(() => ({})),
    presenceAPI.getAll().catch(() => ({})),
    fichesPaieAPI.getAll().catch(() => ({})),
    avantageAPI.getAll().catch(() => ({})),
    documentAPI.getAll().catch(() => ({})),
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
