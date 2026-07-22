import { useEffect, useMemo, useState, useCallback } from 'react'
import { 
  Briefcase, Plus, Search, Edit, Trash2, Users, 
  CheckCircle2, EyeOff, LayoutGrid, List, Eye, Loader2, RefreshCw 
} from 'lucide-react'
import { posteAPI, serviceAPI } from '../../services/api'
import { loadDashboardContext } from '../../services/dashboardData'
import { Toast } from '../../components/ui/Toast'

type Poste = {
  id: number
  titre: string
  type: 'CDI' | 'CDD' | 'Stage' | 'Freelance'
  niveau: 'Junior' | 'Mid' | 'Senior' | 'Manager'
  departement: string
  nombre_postes: number
  postes_occupes: number
  salaire_min: number
  salaire_max: number
  description: string
  competences: string
  statut: 'Actif' | 'Archivé'
  date_creation: string
}

type Service = {
  id_service: number
  nom: string
  id_entreprise: number
  statut?: string
}

type DashboardContext = {
  id_entreprise?: number
  entreprise?: {
    id_entreprise: number
  }
}

export const DirecteurPostesPage = () => {
  // UI States
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showArchived, setShowArchived] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPoste, setSelectedPoste] = useState<Poste | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Loading & Submission States
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false) // 👈 Indicateur de synchro en arrière-plan
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [deletingPosteId, setDeletingPosteId] = useState<number | null>(null)
  const [archivingPosteId, setArchivingPosteId] = useState<number | null>(null)
  
  // Data States
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardContext | null>(null)
  const [postes, setPostes] = useState<Poste[]>([])
  const [services, setServices] = useState<Service[]>([])

  // Form States
  const [formData, setFormData] = useState({
    titre: '', 
    detail: '', 
    statut: 'Actif', 
    id_service: '',
  })

  // Fonction de chargement des données (réutilisable pour le polling et le rafraîchissement manuel)
  const loadData = useCallback(async (isBackground = false) => {
    if (isBackground) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const [postesRes, context, servicesRes] = await Promise.all([
        posteAPI.getAll(),
        loadDashboardContext().catch(() => null),
        serviceAPI.getAll().catch(() => ({ services: [] }))
      ])

      setDashboardData(context)
      setServices(servicesRes.services || servicesRes || [])
      
      setPostes((postesRes.postes || []).map((p: any) => ({
        id: p.id_poste,
        titre: p.titre_poste || '',
        type: 'CDI',
        niveau: 'Junior',
        departement: p.service_nom || 'N/A',
        nombre_postes: 1,
        postes_occupes: p.total_employes || 0,
        salaire_min: 0,
        salaire_max: 0,
        description: p.detail || '',
        competences: '',
        statut: p.statut === 'Archivé' ? 'Archivé' : 'Actif',
        date_creation: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      })))
    } catch (error) {
      console.error('Erreur chargement données:', error)
      if (!isBackground) {
        setFeedback({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Erreur lors du chargement des données' 
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
      loadData(true) // Actualisation discrète en arrière-plan
    }, 60000)

    return () => clearInterval(intervalId)
  }, [loadData])

  // Filtrer les services : uniquement ceux de l'entreprise connectée ET actifs
  const servicesDeLentrepriseActifs = useMemo(() => {
    if (!services || services.length === 0) return []
    const entrepriseId = dashboardData?.id_entreprise || dashboardData?.entreprise?.id_entreprise

    return services.filter((service: any) => {
      if (!service) return false
      const sEntrepriseId = service.id_entreprise ?? service.entreprise_id;
      const isCorrectEntreprise = entrepriseId ? String(sEntrepriseId) === String(entrepriseId) : true;
      const statutService = (service.statut || '').toLowerCase();
      const isActif = statutService !== 'archivé' && statutService !== 'inactif';
      return isCorrectEntreprise && isActif;
    })
  }, [services, dashboardData])

  // Filtrer et trier les postes selon la recherche et l'état d'archivage
  const filteredPostes = useMemo(() => {
    if (!postes) return []
    return postes.filter(p => {
      const titre = (p.titre || '').toLowerCase()
      const departement = (p.departement || '').toLowerCase()
      const search = (searchTerm || '').toLowerCase()

      const matchesSearch = titre.includes(search) || departement.includes(search)
      const matchesArchiveStatus = showArchived ? p.statut === 'Archivé' : p.statut === 'Actif'
      return matchesSearch && matchesArchiveStatus
    })
  }, [postes, searchTerm, showArchived])

  // Statistiques dynamiques
  const stats = useMemo(() => {
    const list = postes || []
    return {
      total: list.length,
      actifs: list.filter(p => p.statut === 'Actif').length,
      archives: list.filter(p => p.statut === 'Archivé').length,
      disponibles: list.reduce((sum, p) => sum + (p.nombre_postes - p.postes_occupes), 0),
    }
  }, [postes])

  // Soumission Création Poste
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id_service) {
      setFeedback({ type: 'error', text: 'Veuillez sélectionner un service.' })
      return
    }

    setIsSubmittingCreate(true)
    try {
      const response = await posteAPI.create({
        titre_poste: formData.titre,
        detail: formData.detail || 'Aucun détail fourni',
        statut: formData.statut,
        id_service: Number(formData.id_service),
      })
      
      const created = response?.poste || response
      if (!created || !created.id_poste) {
        throw new Error("Format de réponse invalide lors de la création du poste.")
      }
      
      setShowCreateModal(false)
      setFormData({ titre: '', detail: '', statut: 'Actif', id_service: '' })
      
      // 🔄 Rechargement immédiat et silencieux des données
      await loadData(true)
      setFeedback({ type: 'success', text: 'Poste créé avec succès !' })
    } catch (error) {
      console.error('Erreur creation poste:', error)
      setFeedback({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erreur lors de la création du poste.' 
      })
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  // Soumission Modification Poste
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPoste) return

    setIsSubmittingEdit(true)
    try {
      await posteAPI.update(selectedPoste.id, {
        titre_poste: selectedPoste.titre,
        statut: selectedPoste.statut,
        detail: selectedPoste.description,
      })

      setShowEditModal(false)
      
      // 🔄 Rechargement immédiat et silencieux
      await loadData(true)
      setFeedback({ type: 'success', text: 'Poste mis à jour avec succès.' })
    } catch (error) {
      console.error('Erreur mise à jour poste:', error)
      setFeedback({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erreur de modification.' 
      })
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // Archiver / Désarchiver un poste
  const handleToggleArchive = async (id: number, currentStatut: 'Actif' | 'Archivé') => {
    const newStatut = currentStatut === 'Actif' ? 'Archivé' : 'Actif'
    setArchivingPosteId(id)
    try {
      await posteAPI.update(id, { statut: newStatut })
      
      // 🔄 Rechargement immédiat et silencieux
      await loadData(true)
      setFeedback({ 
        type: 'success', 
        text: newStatut === 'Archivé' ? 'Poste archivé avec succès.' : 'Poste restauré avec succès.' 
      })
    } catch (error) {
      console.error('Erreur basculement archive:', error)
      setFeedback({ type: 'error', text: "Impossible de modifier le statut d'archivage." })
    } finally {
      setArchivingPosteId(null)
    }
  }

  // Supprimer définitivement un poste
  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce poste ?')) {
      return
    }

    setDeletingPosteId(id)
    try {
      await posteAPI.delete(id)
      
      // 🔄 Rechargement immédiat et silencieux
      await loadData(true)
      setFeedback({ type: 'success', text: 'Poste supprimé définitivement.' })
    } catch (error) {
      console.error('Erreur suppression poste:', error)
      setFeedback({ type: 'error', text: 'Erreur lors de la suppression.' })
    } finally {
      setDeletingPosteId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Postes</h1>
            {isRefreshing && (
              <span className="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sync...</span>
              </span>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {showArchived ? 'Visualisation de vos postes archivés' : 'Créer et gérer les postes de votre entreprise'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            type="button" 
            onClick={() => loadData(true)}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm"
            title="Rafraîchir manuellement"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button 
            type="button" 
            onClick={() => setShowCreateModal(true)} 
            className="flex items-center space-x-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm transition-all shadow-md font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau poste</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total postes', value: stats.total, color: 'from-amber-500 to-orange-600', icon: Briefcase },
          { label: 'Postes actifs', value: stats.actifs, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Postes archivés', value: stats.archives, color: 'from-slate-500 to-slate-700', icon: EyeOff },
          { label: 'Postes disponibles', value: stats.disponibles, color: 'from-purple-500 to-indigo-600', icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 sm:w-6 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {feedback && (
        <Toast message={feedback.text} type={feedback.type} onClose={() => setFeedback(null)} />
      )}

      {/* Barre d'outils (Recherche, Vue, Option Archivée) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un poste ou un département..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm dark:text-white" 
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showArchived 
                ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 text-slate-800 dark:text-white' 
                : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {showArchived ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{showArchived ? 'Afficher les actifs' : 'Afficher archivés'}</span>
          </button>

          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-amber-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-amber-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <span>Chargement en cours...</span>
        </div>
      ) : (
        <>
          {filteredPostes.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {showArchived ? 'Aucun poste archivé trouvé.' : 'Aucun poste actif trouvé.'}
            </div>
          ) : (
            viewMode === 'grid' ? (
              /* --- MODE GRILLE --- */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPostes.map(pItem => (
                  <div key={pItem.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          pItem.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>{pItem.statut}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 line-clamp-1">{pItem.titre}</h3>
                      <p className="text-sm text-amber-600 dark:text-amber-500 font-medium mb-3">{pItem.departement}</p>
                      
                      <div className="space-y-2 mb-6 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Type:</span>
                          <span className="font-semibold text-slate-800 dark:text-white">{pItem.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Niveau:</span>
                          <span className="font-semibold text-slate-800 dark:text-white">{pItem.niveau}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <button 
                        type="button" 
                        onClick={() => { setSelectedPoste(pItem); setShowEditModal(true) }} 
                        className="flex-1 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center justify-center space-x-1 transition-all"
                      >
                        <Edit className="w-4 h-4" /><span>Modifier</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleToggleArchive(pItem.id, pItem.statut)} 
                        disabled={archivingPosteId === pItem.id}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 text-sm transition-all flex items-center justify-center"
                        title={pItem.statut === 'Actif' ? 'Archiver' : 'Désarchiver'}
                      >
                        {archivingPosteId === pItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (pItem.statut === 'Actif' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(pItem.id)} 
                        disabled={deletingPosteId === pItem.id} 
                        className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center"
                      >
                        {deletingPosteId === pItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* --- MODE TABLEAU / LISTE --- */
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold">
                      <th className="p-4">Poste</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Type / Niveau</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm text-slate-800 dark:text-white">
                    {filteredPostes.map(pItem => (
                      <tr key={pItem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all">
                        <td className="p-4 font-semibold">{pItem.titre}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{pItem.departement}</td>
                        <td className="p-4">{pItem.type} / {pItem.niveau}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            pItem.statut === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>{pItem.statut}</span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end space-x-2">
                          <button 
                            type="button" 
                            onClick={() => { setSelectedPoste(pItem); setShowEditModal(true) }} 
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleToggleArchive(pItem.id, pItem.statut)} 
                            disabled={archivingPosteId === pItem.id}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                          >
                            {archivingPosteId === pItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (pItem.statut === 'Actif' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(pItem.id)} 
                            disabled={deletingPosteId === pItem.id} 
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            {deletingPosteId === pItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {/* Modal de Création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Créer un nouveau poste</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <Users className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Titre du poste</label>
                <input 
                  type="text" 
                  required
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: Développeur Full Stack"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Service / Département</label>
                <select 
                  required
                  value={formData.id_service}
                  onChange={(e) => setFormData({ ...formData, id_service: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm dark:text-white"
                >
                  <option value="">Sélectionner un service</option>
                  {servicesDeLentrepriseActifs.map((s) => (
                    <option key={s.id_service} value={s.id_service}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Description / Détails</label>
                <textarea 
                  rows={3}
                  value={formData.detail}
                  onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  placeholder="Description du poste..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center space-x-2"
                >
                  {isSubmittingCreate && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Créer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Modification */}
      {showEditModal && selectedPoste && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Modifier le poste</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
              >
                <Users className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Titre du poste</label>
                <input 
                  type="text" 
                  required
                  value={selectedPoste.titre}
                  onChange={(e) => setSelectedPoste({ ...selectedPoste, titre: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Statut</label>
                <select 
                  value={selectedPoste.statut}
                  onChange={(e) => setSelectedPoste({ ...selectedPoste, statut: e.target.value as 'Actif' | 'Archivé' })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm dark:text-white"
                >
                  <option value="Actif">Actif</option>
                  <option value="Archivé">Archivé</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Description / Détails</label>
                <textarea 
                  rows={3}
                  value={selectedPoste.description}
                  onChange={(e) => setSelectedPoste({ ...selectedPoste, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center space-x-2"
                >
                  {isSubmittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}