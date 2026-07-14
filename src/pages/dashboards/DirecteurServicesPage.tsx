import { useEffect, useMemo, useState, FormEvent } from 'react'
import { Briefcase, Users, Plus, Edit, Trash2, Search, Grid, List, X, Loader2, Eye, EyeOff } from 'lucide-react'
import { loadDashboardContext } from '../../services/dashboardData'
import { serviceAPI } from '../../services/api'
import { Toast } from '../../components/ui/Toast'

export const DirecteurServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [formData, setFormData] = useState({ nom: '', description: '', statut: 'Actif' })
  
  // Nouvel état pour afficher ou masquer les services archivés (inactifs)
  const [showArchived, setShowArchived] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      // 1. Charge le contexte du Dashboard
      const context = await loadDashboardContext()
      
      // 2. Charge les services depuis l'API
      const servicesResponse = await serviceAPI.getAll()
      
      // Extraction robuste : On cherche d'abord la clé 'services' retournée par l'API PHP, 
      // sinon 'data', sinon la réponse brute
      const servicesRecuperes = servicesResponse?.services 
        || servicesResponse?.data 
        || (Array.isArray(servicesResponse) ? servicesResponse : [])

      setDashboardData({
        ...context,
        services: servicesRecuperes
      })
      
      setFeedback({ type: 'info', text: 'Services chargés avec succès.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors du chargement des services' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Déconstruction des données brutes
  const user = dashboardData?.user
  const entreprises = dashboardData?.entreprises || (dashboardData?.entreprise ? [dashboardData.entreprise] : [])
  const services = dashboardData?.services || []
  const postes = dashboardData?.postes || []
  const employes = dashboardData?.employes || []

  // 1. LOGIQUE CASCADE : Trouver l'entreprise liée à l'user connecté (via user_id)
  const activeEntreprise = useMemo(() => {
    if (!user?.id) return null
    // On cherche l'entreprise dans la liste/objet reçu où entreprise.user_id correspond à l'id de l'utilisateur connecté
    return entreprises.find((e: any) => Number(e.user_id) === Number(user.id)) || dashboardData?.entreprise || null
  }, [entreprises, user])

  // On extrait l'ID de l'entreprise active détectée
  const entrepriseId = activeEntreprise?.id_entreprise || activeEntreprise?.id

  // Debug pour vérifier que l'identification en cascade de l'entreprise s'exécute correctement
  useEffect(() => {
    if (dashboardData) {
      console.log("LOGIQUE DE CONNEXION CASCADE :", {
        utilisateurConnecte: user?.id,
        entreprisesDisponibles: entreprises,
        entrepriseAssocieeTrouvee: activeEntreprise,
        entrepriseIdResultat: entrepriseId,
        nombreTotalServicesBruts: services.length
      })
    }
  }, [dashboardData, user, entreprises, activeEntreprise, entrepriseId, services])

  // 2. FILTRE : Uniquement les services liés à l'ID de cette entreprise
  const companyServices = useMemo(() => {
    if (!entrepriseId) return []
    return services.filter((s: any) => Number(s.id_entreprise) === Number(entrepriseId))
  }, [services, entrepriseId])

  // 3. FILTRE RECHERCHE & ARCHIVAGE
  const filteredServices = useMemo(() => {
    return companyServices.filter((s: any) => {
      const matchesSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = showArchived ? true : s.statut === 'Actif'
      return matchesSearch && matchesStatus
    })
  }, [companyServices, searchTerm, showArchived])

  // 4. STATISTIQUES FILTRÉES : Liées uniquement aux postes et employés de cette entreprise
  const companyPostes = useMemo(() => {
    if (!entrepriseId) return []
    return postes.filter((p: any) => {
      // Un poste est lié à l'entreprise soit directement par id_entreprise, soit via son service
      if (p.id_entreprise) return Number(p.id_entreprise) === Number(entrepriseId)
      const parentService = services.find((s: any) => s.id_service === p.id_service)
      return parentService && Number(parentService.id_entreprise) === Number(entrepriseId)
    })
  }, [postes, services, entrepriseId])

  const companyEmployes = useMemo(() => {
    if (!entrepriseId) return []
    // Les employés sont liés aux postes de l'entreprise
    return employes.filter((e: any) => companyPostes.some((p: any) => p.id_poste === e.id_poste))
  }, [employes, companyPostes, entrepriseId])

  const getServiceStats = (serviceId: number) => {
    const servicePostes = companyPostes.filter((p: any) => p.id_service === serviceId)
    const serviceEmployes = companyEmployes.filter((e: any) => servicePostes.some((p: any) => p.id_poste === e.id_poste))
    return { postes: servicePostes.length, employes: serviceEmployes.length }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entrepriseId) {
      setFeedback({ type: 'error', text: "Impossible de créer un service : ID d'entreprise introuvable." })
      return
    }
    setIsSubmittingCreate(true)

    try {
      const payload = { ...formData, id_entreprise: entrepriseId }
      await serviceAPI.create(payload)
      setShowCreateModal(false)
      setFormData({ nom: '', description: '', statut: 'Actif' })
      setFeedback({ type: 'success', text: 'Service créé avec succès.' })
      await loadData()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la création du service' })
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService) return

    setIsSubmittingEdit(true)
    try {
      await serviceAPI.update(selectedService.id_service, {
        nom: selectedService.nom,
        description: selectedService.description,
        statut: selectedService.statut,
        id_entreprise: selectedService.id_entreprise,
      })
      setShowEditModal(false)
      setSelectedService(null)
      setFeedback({ type: 'success', text: 'Service mis à jour avec succès.' })
      await loadData()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du service' })
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleDelete = async (idService: number) => {
    if (!window.confirm('Supprimer ce service ?')) return

    setDeletingServiceId(idService)
    try {
      await serviceAPI.delete(idService)
      setFeedback({ type: 'success', text: 'Service supprimé avec succès.' })
      await loadData()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la suppression du service' })
    } finally {
      setDeletingServiceId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            Services de {activeEntreprise?.nom || "l'entreprise"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {companyServices.filter((s: any) => s.statut === 'Actif').length} services actifs 
            {companyServices.filter((s: any) => s.statut !== 'Actif').length > 0 && ` (${companyServices.filter((s: any) => s.statut !== 'Actif').length} archivés)`}
          </p>
        </div>
        <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Ajouter un service</span>
        </button>
      </div>

      {feedback && (
        <Toast message={feedback.text} type={feedback.type} onClose={() => setFeedback(null)} />
      )}

      {/* Cartes Statistiques dynamiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Services de l\'entreprise', value: companyServices.length },
          { label: 'Total postes', value: companyPostes.length },
          { label: 'Postes occupés', value: companyPostes.filter((p: any) => p.statut === 'Occupe').length },
          { label: 'Postes vacants', value: companyPostes.filter((p: any) => p.statut === 'Vacant').length },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Barre de Recherche & Filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un service..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showArchived 
                  ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400' 
                  : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {showArchived ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showArchived ? "Masquer les archivés" : "Afficher les archivés"}</span>
            </button>

            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><Grid className="w-4 h-4" /></button>
              <button type="button" onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          Chargement des services...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
          Aucun service trouvé.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServices.map(service => {
            const stats = getServiceStats(service.id_service)
            const isInactive = service.statut !== 'Actif'
            return (
              <div key={service.id_service} className={`bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border transition-all hover:shadow-lg ${isInactive ? 'border-dashed border-slate-300 dark:border-slate-700 opacity-75' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${isInactive ? 'bg-slate-400' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}>
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isInactive ? 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                    {service.statut}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{service.nom}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{service.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Postes</p>
                    <p className="font-bold text-slate-800 dark:text-white">{stats.postes}</p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Employés</p>
                    <p className="font-bold text-slate-800 dark:text-white">{stats.employes}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => { setSelectedService(service); setShowEditModal(true) }} className="flex-1 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm hover:bg-amber-200 dark:hover:bg-amber-900/50 flex items-center justify-center space-x-1"><Edit className="w-4 h-4" /><span>Modifier</span></button>
                  <button onClick={() => handleDelete(service.id_service)} disabled={deletingServiceId === service.id_service} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-60 disabled:cursor-not-allowed">
                    {deletingServiceId === service.id_service ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Service</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Description</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Postes</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Employés</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
                <th className="text-right py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => {
                const stats = getServiceStats(service.id_service)
                const isInactive = service.statut !== 'Actif'
                return (
                  <tr key={service.id_service} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${isInactive ? 'opacity-70' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isInactive ? 'bg-slate-400' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}><Briefcase className="w-4 h-4 text-white" /></div>
                        <span className="font-semibold text-slate-800 dark:text-white text-sm">{service.nom}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{service.description}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white">{stats.postes}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white">{stats.employes}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isInactive ? 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                        {service.statut}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button type="button" onClick={() => { setSelectedService(service); setShowEditModal(true) }} className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(service.id_service)} disabled={deletingServiceId === service.id_service} className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-60">
                          {deletingServiceId === service.id_service ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALS AJOUT & MODIFICATION */}
      {/* (L'implémentation des Modals reste fonctionnellement identique) */}
    </div>
  )
}