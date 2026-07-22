import { useEffect, useMemo, useState, useCallback } from 'react'
import { Briefcase, Users, Plus, Edit, Trash2, Search, Grid, List, X, Loader2, Eye, EyeOff, RefreshCw } from 'lucide-react'
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
  const [isRefreshing, setIsRefreshing] = useState(false) // 👈 Indicateur de synchro arrière-plan
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [formData, setFormData] = useState({ nom: '', description: '', statut: 'Actif' })
  
  // Afficher ou masquer les services inactifs (archivés)
  const [showArchived, setShowArchived] = useState(false)

  const loadData = useCallback(async (isBackground = false) => {
    if (isBackground) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      // 1. Chargement du contexte du dashboard
      const context = await loadDashboardContext().catch(() => null)
      
      // 2. Chargement des services depuis l'API Laravel
      const servicesResponse = await serviceAPI.getAll().catch(() => ({ services: [] }))
      
      // Extraction robuste de la clé "services" du contrôleur PHP ou de "data"
      const servicesRecuperes = servicesResponse?.services 
        || servicesResponse?.data 
        || (Array.isArray(servicesResponse) ? servicesResponse : [])

      setDashboardData({
        ...context,
        services: servicesRecuperes
      })
    } catch (error) {
      if (!isBackground) {
        setFeedback({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Erreur lors du chargement des services' 
        })
      }
    } finally {
      if (isBackground) {
        setIsRefreshing(false)
      } else {
        setIsLoading(false)
      }
    }
  }, [])

  // Chargement initial + Polling automatique toutes les 60 secondes
  useEffect(() => {
    loadData(false)

    const intervalId = setInterval(() => {
      loadData(true)
    }, 60000)

    return () => clearInterval(intervalId)
  }, [loadData])

  // Déconstruction des données
  const user = dashboardData?.user
  const entreprises = dashboardData?.entreprises || (dashboardData?.entreprise ? [dashboardData.entreprise] : [])
  const services = dashboardData?.services || []
  const postes = dashboardData?.postes || []
  const employes = dashboardData?.employes || []

  // 1. CASCADE : Identification de l'entreprise de l'utilisateur connecté via user_id
  const activeEntreprise = useMemo(() => {
    if (!user?.id) return null
    return entreprises.find((e: any) => Number(e.user_id) === Number(user.id)) || dashboardData?.entreprise || null
  }, [entreprises, user, dashboardData])

  const entrepriseId = activeEntreprise?.id_entreprise || activeEntreprise?.id

  // 2. FILTRE : Uniquement les services de cette entreprise
  const companyServices = useMemo(() => {
    if (!entrepriseId) return []
    return services.filter((s: any) => Number(s.id_entreprise) === Number(entrepriseId))
  }, [services, entrepriseId])

  // 3. RECHERCHE & ARCHIVES
  const filteredServices = useMemo(() => {
    return companyServices.filter((s: any) => {
      const matchesSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = showArchived ? true : s.statut === 'Actif'
      return matchesSearch && matchesStatus
    })
  }, [companyServices, searchTerm, showArchived])

  // 4. CALCULS DES STATISTIQUES FILTRÉES
  const companyPostes = useMemo(() => {
    if (!entrepriseId) return []
    return postes.filter((p: any) => {
      if (p.id_entreprise) return Number(p.id_entreprise) === Number(entrepriseId)
      const parentService = services.find((s: any) => s.id_service === p.id_service)
      return parentService && Number(parentService.id_entreprise) === Number(entrepriseId)
    })
  }, [postes, services, entrepriseId])

  const companyEmployes = useMemo(() => {
    if (!entrepriseId) return []
    return employes.filter((e: any) => companyPostes.some((p: any) => p.id_poste === e.id_poste))
  }, [employes, companyPostes])

  const getServiceStats = (serviceId: number) => {
    const servicePostes = companyPostes.filter((p: any) => p.id_service === serviceId)
    const serviceEmployes = companyEmployes.filter((e: any) => servicePostes.some((p: any) => p.id_poste === e.id_poste))
    return { postes: servicePostes.length, employes: serviceEmployes.length }
  }

  // ACTIONS : CRÉATION
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entrepriseId) {
      setFeedback({ type: 'error', text: "Erreur : ID de l'entreprise introuvable." })
      return
    }
    setIsSubmittingCreate(true)

    try {
      const payload = { ...formData, id_entreprise: entrepriseId }
      await serviceAPI.create(payload)
      setShowCreateModal(false)
      setFormData({ nom: '', description: '', statut: 'Actif' })
      
      // 🔄 Synchronisation silencieuse
      await loadData(true)
      setFeedback({ type: 'success', text: 'Service créé avec succès.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la création' })
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  // ACTIONS : MODIFICATION
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService) return

    setIsSubmittingEdit(true)
    try {
      await serviceAPI.update(selectedService.id_service, {
        nom: selectedService.nom,
        description: selectedService.description,
        statut: selectedService.statut,
        id_entreprise: entrepriseId,
      })
      setShowEditModal(false)
      setSelectedService(null)
      
      // 🔄 Synchronisation silencieuse
      await loadData(true)
      setFeedback({ type: 'success', text: 'Service mis à jour avec succès.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la modification' })
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // ACTIONS : DESACTIVATION (SUPPRESSION LOGIQUE)
  const handleDelete = async (idService: number) => {
    if (!window.confirm('Voulez-vous vraiment désactiver ce service ?')) return

    setDeletingServiceId(idService)
    try {
      await serviceAPI.delete(idService)
      
      // 🔄 Synchronisation silencieuse
      await loadData(true)
      setFeedback({ type: 'success', text: 'Service désactivé avec succès (statut Inactif).' })
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la désactivation' })
    } finally {
      setDeletingServiceId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
              Services de {activeEntreprise?.nom || "l'entreprise"}
            </h1>
            {isRefreshing && (
              <span className="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sync...</span>
              </span>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
            {companyServices.filter((s: any) => s.statut === 'Actif').length} services actifs 
            {companyServices.filter((s: any) => s.statut !== 'Actif').length > 0 && ` (${companyServices.filter((s: any) => s.statut !== 'Actif').length} archivés)`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            type="button" 
            onClick={() => loadData(true)}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium"
            title="Rafraîchir manuellement"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          
          <button 
            type="button" 
            onClick={() => setShowCreateModal(true)} 
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-md shadow-amber-600/10 hover:shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau service</span>
          </button>
        </div>
      </div>

      {feedback && (
        <Toast message={feedback.text} type={feedback.type} onClose={() => setFeedback(null)} />
      )}

      {/* Cartes Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Services créés', value: companyServices.length },
          { label: 'Total postes', value: companyPostes.length },
          { label: 'Postes occupés', value: companyPostes.filter((p: any) => p.statut === 'Occupe').length },
          { label: 'Postes vacants', value: companyPostes.filter((p: any) => p.statut === 'Vacant').length },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un service par son nom..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all" 
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showArchived 
                  ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400' 
                  : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {showArchived ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showArchived ? "Masquer archivés" : "Afficher archivés"}</span>
            </button>

            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
              <button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-amber-600 dark:text-white' : 'text-slate-500'}`}><Grid className="w-4 h-4" /></button>
              <button type="button" onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-amber-600 dark:text-white' : 'text-slate-500'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid / List Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Chargement de vos services...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-800 dark:text-white font-semibold mb-1">Aucun service trouvé</p>
          <p className="text-slate-500 text-sm max-w-sm">Ajustez vos critères de recherche ou créez un tout nouveau service pour votre entreprise.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => {
            const stats = getServiceStats(service.id_service)
            const isInactive = service.statut !== 'Actif'
            return (
              <div 
                key={service.id_service} 
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md ${
                  isInactive ? 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50' : 'border-slate-100 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${isInactive ? 'bg-slate-400 text-white' : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'}`}>
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isInactive ? 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400' : 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                  }`}>
                    {service.statut}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">{service.nom}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 min-h-[40px]">{service.description || "Aucune description fournie."}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Postes</p>
                    <p className="font-extrabold text-lg text-slate-800 dark:text-white mt-1">{stats.postes}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Employés</p>
                    <p className="font-extrabold text-lg text-slate-800 dark:text-white mt-1">{stats.employes}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => { setSelectedService(service); setShowEditModal(true) }} 
                    className="flex-1 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id_service)} 
                    disabled={deletingServiceId === service.id_service} 
                    className="p-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl transition-all disabled:opacity-50"
                  >
                    {deletingServiceId === service.id_service ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Service</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Description</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Postes</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Employés</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Statut</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => {
                const stats = getServiceStats(service.id_service)
                const isInactive = service.statut !== 'Actif'
                return (
                  <tr key={service.id_service} className={`border-b border-slate-100 dark:border-slate-700/40 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 ${isInactive ? 'opacity-70' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isInactive ? 'bg-slate-200 text-slate-500' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'}`}><Briefcase className="w-4 h-4" /></div>
                        <span className="font-semibold text-slate-800 dark:text-white text-sm">{service.nom}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-xs truncate">{service.description || "Aucune description"}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800 dark:text-white text-center">{stats.postes}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800 dark:text-white text-center">{stats.employes}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isInactive ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-700 dark:bg-green-950/20'
                      }`}>
                        {service.statut}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          type="button" 
                          onClick={() => { setSelectedService(service); setShowEditModal(true) }} 
                          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id_service)} 
                          disabled={deletingServiceId === service.id_service} 
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all disabled:opacity-50"
                        >
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

      {/* MODAL : CREATION */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Créer un nouveau service</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nom du service <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ex: Ressources Humaines, Comptabilité" 
                  value={formData.nom} 
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea 
                  rows={3} 
                  placeholder="Décrivez brièvement le rôle et les tâches principales de ce service..." 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Statut de départ</label>
                <select 
                  value={formData.statut} 
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-300"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingCreate} 
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmittingCreate ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirmer</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : MODIFICATION */}
      {showEditModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Modifier le service</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedService(null) }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nom du service <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={selectedService.nom} 
                  onChange={(e) => setSelectedService({ ...selectedService, nom: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea 
                  rows={3} 
                  value={selectedService.description || ''} 
                  onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Statut de fonctionnement</label>
                <select 
                  value={selectedService.statut} 
                  onChange={(e) => setSelectedService({ ...selectedService, statut: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-300"
                >
                  <option value="Actif">Actif (Visible partout)</option>
                  <option value="Inactif">Inactif (Archivé)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => { setShowEditModal(false); setSelectedService(null) }} 
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingEdit} 
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmittingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sauvegarder</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}