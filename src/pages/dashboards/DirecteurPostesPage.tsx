import { useEffect, useMemo, useState } from 'react'
import { 
  Briefcase, Plus, Search, Edit, Trash2, Users, 
  CheckCircle2, XCircle, X, Loader2, Eye, EyeOff, LayoutGrid, List 
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

  // Charger les données initiales au montage
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        const [postesRes, context, servicesRes] = await Promise.all([
          posteAPI.getAll(),
          loadDashboardContext().catch(() => null),
          serviceAPI.getAll().catch(() => ({ services: [] }))
        ])

        setDashboardData(context)
        setServices(servicesRes.services || servicesRes || [])
        
        setPostes((postesRes.postes || []).map((poste: any) => ({
          id: poste.id_poste,
          titre: poste.titre_poste,
          type: 'CDI',
          niveau: 'Junior',
          departement: poste.service_nom || 'N/A',
          nombre_postes: 1,
          postes_occupes: poste.total_employes || 0,
          salaire_min: 0,
          salaire_max: 0,
          description: poste.detail || '',
          competences: '',
          statut: poste.statut === 'Archivé' ? 'Archivé' : 'Actif',
          date_creation: poste.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        })))
      } catch (error) {
        console.error('Erreur chargement données:', error)
        setFeedback({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Erreur lors du chargement des données' 
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Filtrer les services : uniquement ceux de l'entreprise connectée ET actifs
  const servicesDeLentrepriseActifs = useMemo(() => {
    if (services.length === 0) return []
    const entrepriseId = dashboardData?.id_entreprise || dashboardData?.entreprise?.id_entreprise

    return services.filter((service: any) => {
      const sEntrepriseId = service.id_entreprise ?? service.entreprise_id;
      const isCorrectEntreprise = entrepriseId ? String(sEntrepriseId) === String(entrepriseId) : true;
      const isActif = service.statut?.toLowerCase() !== 'archivé' && service.statut?.toLowerCase() !== 'inactif';
      return isCorrectEntreprise && isActif;
    })
  }, [services, dashboardData])

  // Filtrer et trier les postes selon la recherche et l'état d'archivage
  const filteredPostes = useMemo(() => {
    return postes.filter(p => {
      const matchesSearch = p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.departement.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesArchiveStatus = showArchived ? p.statut === 'Archivé' : p.statut === 'Actif'
      return matchesSearch && matchesArchiveStatus
    })
  }, [postes, searchTerm, showArchived])

  // Statistiques dynamiques
  const stats = useMemo(() => {
    return {
      total: postes.length,
      actifs: postes.filter(p => p.statut === 'Actif').length,
      archives: postes.filter(p => p.statut === 'Archivé').length,
      disponibles: postes.reduce((sum, p) => sum + (p.nombre_postes - p.postes_occupes), 0),
    }
  }, [postes])

  // Soumission Création Poste
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id_service) {
      setFeedback({ type: 'error', text: 'Veuillez sélectionner un service.' })
      return
    }

    const selectedService = servicesDeLentrepriseActifs.find(
      (s) => String(s.id_service) === String(formData.id_service)
    )

    setIsSubmittingCreate(true)
    try {
      const response = await posteAPI.create({
        titre_poste: formData.titre,
        detail: formData.detail,
        statut: formData.statut,
        id_service: Number(formData.id_service),
      })
      
      const created = response.poste
      setPostes((current) => [
        {
          id: created.id_poste,
          titre: created.titre_poste,
          type: 'CDI',
          niveau: 'Junior',
          departement: selectedService ? selectedService.nom : 'N/A',
          nombre_postes: 1,
          postes_occupes: 0,
          salaire_min: 0,
          salaire_max: 0,
          description: created.detail || '',
          competences: '',
          statut: 'Actif',
          date_creation: new Date().toISOString().split('T')[0],
        },
        ...current,
      ])
      
      setShowCreateModal(false)
      setFormData({ titre: '', detail: '', statut: 'Actif', id_service: '' })
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

      setPostes((current) =>
        current.map((p) => (p.id === selectedPoste.id ? selectedPoste : p))
      )
      setShowEditModal(false)
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
      setPostes((current) =>
        current.map((p) => (p.id === id ? { ...p, statut: newStatut } : p))
      )
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
      setPostes((current) => current.filter((p) => p.id !== id))
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Postes</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {showArchived ? 'Visualisation de vos postes archivés' : 'Créer et gérer les postes de votre entreprise'}
          </p>
        </div>
        <button 
          type="button" 
          onClick={() => setShowCreateModal(true)} 
          className="flex items-center space-x-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm transition-all shadow-md font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau poste</span>
        </button>
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
          {/* Bouton d'archivage */}
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

          {/* Sélecteurs de vue */}
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
                {filteredPostes.map(poste => (
                  <div key={poste.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          poste.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>{poste.statut}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 line-clamp-1">{poste.titre}</h3>
                      <p className="text-sm text-amber-600 dark:text-amber-500 font-medium mb-3">{poste.departement}</p>
                      
                      <div className="space-y-2 mb-6 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Type:</span>
                          <span className="font-semibold text-slate-800 dark:text-white">{poste.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Niveau:</span>
                          <span className="font-semibold text-slate-800 dark:text-white">{poste.niveau}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <button 
                        type="button" 
                        onClick={() => { setSelectedPoste(poste); setShowEditModal(true) }} 
                        className="flex-1 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center justify-center space-x-1 transition-all"
                      >
                        <Edit className="w-4 h-4" /><span>Modifier</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleToggleArchive(poste.id, poste.statut)} 
                        disabled={archivingPosteId === poste.id}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 text-sm transition-all flex items-center justify-center"
                        title={poste.statut === 'Actif' ? 'Archiver' : 'Désarchiver'}
                      >
                        {archivingPosteId === poste.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (poste.statut === 'Actif' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(poste.id)} 
                        disabled={deletingPosteId === poste.id} 
                        className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center"
                      >
                        {deletingPosteId === poste.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
                    {filteredPostes.map(poste => (
                      <tr key={poste.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all">
                        <td className="p-4 font-semibold">{poste.titre}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{poste.departement}</td>
                        <td className="p-4">{poste.type} / {poste.niveau}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            poste.statut === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>{poste.statut}</span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end space-x-2">
                          <button 
                            type="button" 
                            onClick={() => { setSelectedPoste(poste); setShowEditModal(true) }} 
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleToggleArchive(poste.id, poste.statut)} 
                            disabled={archivingPosteId === poste.id}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                          >
                            {archivingPosteId === id ? <Loader2 className="w-4 h-4 animate-spin" /> : (poste.statut === 'Actif' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(poste.id)} 
                            disabled={deletingPosteId === poste.id}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            {deletingPosteId === poste.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Modal de Création */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Créer un nouveau poste</h3>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg dark:text-white"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre du poste *</label>
                    <input 
                      type="text" 
                      value={formData.titre} 
                      onChange={(e) => setFormData({...formData, titre: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Service (Actifs uniquement) *</label>
                    {servicesDeLentrepriseActifs.length === 0 ? (
                      <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
                        ⚠️ Aucun service actif trouvé. Allez sur l'onglet "Services" pour en créer un avant de rajouter un poste.
                      </div>
                    ) : (
                      <select 
                        value={formData.id_service} 
                        onChange={(e) => setFormData({ ...formData, id_service: e.target.value })} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                        required
                      >
                        <option value="">Sélectionner un service</option>
                        {servicesDeLentrepriseActifs.map((service) => (
                          <option key={service.id_service} value={service.id_service}>
                            {service.nom}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description / Détails</label>
                    <textarea 
                      value={formData.detail} 
                      onChange={(e) => setFormData({...formData, detail: e.target.value})} 
                      rows={3} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium">Annuler</button>
                    <button 
                      type="submit" 
                      disabled={isSubmittingCreate || servicesDeLentrepriseActifs.length === 0} 
                      className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                      {isSubmittingCreate && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{isSubmittingCreate ? 'Création...' : 'Créer le poste'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Modification */}
          {showEditModal && selectedPoste && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Modifier le poste</h3>
                  <button type="button" onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg dark:text-white"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre du poste</label>
                    <input 
                      type="text" 
                      value={selectedPoste.titre} 
                      onChange={(e) => setSelectedPoste({...selectedPoste, titre: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                      <select 
                        value={selectedPoste.type} 
                        onChange={(e) => setSelectedPoste({ ...selectedPoste, type: e.target.value as Poste['type'] })} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                      >
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="Stage">Stage</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Niveau</label>
                      <select 
                        value={selectedPoste.niveau} 
                        onChange={(e) => setSelectedPoste({ ...selectedPoste, niveau: e.target.value as Poste['niveau'] })} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                      >
                        <option value="Junior">Junior</option>
                        <option value="Mid">Mid-Level</option>
                        <option value="Senior">Senior</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                    <textarea 
                      value={selectedPoste.description} 
                      onChange={(e) => setSelectedPoste({...selectedPoste, description: e.target.value})} 
                      rows={3} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                    <button 
                      type="submit" 
                      disabled={isSubmittingEdit}
                      className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 flex items-center justify-center gap-2 disabled:opacity-75 font-medium"
                    >
                      {isSubmittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}