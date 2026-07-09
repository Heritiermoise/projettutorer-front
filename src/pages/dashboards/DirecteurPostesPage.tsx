import { useEffect, useMemo, useState } from 'react'
import { Briefcase, Plus, Search, Edit, Trash2, Users, CheckCircle2, XCircle, X, Building2, DollarSign } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { posteAPI } from '../../services/api'
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
  statut: 'Actif' | 'Inactif'
  date_creation: string
}

export const DirecteurPostesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPoste, setSelectedPoste] = useState<Poste | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [deletingPosteId, setDeletingPosteId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)

  const [postes, setPostes] = useState<Poste[]>([])

  const [formData, setFormData] = useState({
    titre: '', detail: '', statut: 'Vacant', id_service: '',
  })

  const services = dashboardData?.services || []

  useEffect(() => {
    const loadPostes = async () => {
      setIsLoading(true)
      try {
        const [response, context] = await Promise.all([
          posteAPI.getAll(),
          loadDashboardContext().catch(() => null),
        ])
        setDashboardData(context)
        setPostes((response.postes || []).map((poste: any) => ({
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
          statut: poste.statut === 'Archivé' ? 'Inactif' : 'Actif',
          date_creation: poste.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        })))
        setFeedback({ type: 'info', text: 'Postes chargés avec succès.' })
      } catch (error) {
        console.error('Erreur chargement postes:', error)
        setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors du chargement des postes' })
      } finally {
        setIsLoading(false)
      }
    }

    loadPostes()
  }, [])

  const filteredPostes = postes.filter(p => {
    const matchesSearch = p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.departement.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || p.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  const stats = {
    total: postes.length,
    actifs: postes.filter(p => p.statut === 'Actif').length,
    inactifs: postes.filter(p => p.statut === 'Inactif').length,
    disponibles: postes.reduce((sum, p) => sum + (p.nombre_postes - p.postes_occupes), 0),
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id_service) {
      setFeedback({ type: 'error', text: 'Veuillez sélectionner un service existant.' })
      return
    }

    const selectedService = services.find((service: any) => String(service.id_service) === String(formData.id_service))
    if (!selectedService) {
      setFeedback({ type: 'error', text: 'Le service sélectionné est introuvable dans la base de données.' })
      return
    }

    setIsSubmittingCreate(true)
    void (async () => {
      try {
        const response = await posteAPI.create({
          titre_poste: formData.titre,
          detail: formData.detail,
          statut: formData.statut,
          id_service: Number(formData.id_service),
        })
        const created = response.poste
        setPostes((current) => [{
          id: created.id_poste,
          titre: created.titre_poste,
          type: 'CDI',
          niveau: 'Junior',
          departement: 'N/A',
          nombre_postes: 1,
          postes_occupes: 0,
          salaire_min: 0,
          salaire_max: 0,
          description: created.detail || '',
          competences: '',
          statut: created.statut === 'Archivé' ? 'Inactif' : 'Actif',
          date_creation: new Date().toISOString().split('T')[0],
        }, ...current])
        setShowCreateModal(false)
        setFormData({ titre: '', detail: '', statut: 'Vacant', id_service: '' })
        setFeedback({ type: 'success', text: 'Poste créé avec succès.' })
      } catch (error) {
        console.error('Erreur creation poste:', error)
        setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la creation du poste' })
      } finally {
        setIsSubmittingCreate(false)
      }
    })()
  }

  const handleDelete = (id: number) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer ce poste ?')) {
      return
    }

    void (async () => {
      try {
        await posteAPI.delete(id)
        setPostes(postes.filter(p => p.id !== id))
        setFeedback({ type: 'success', text: 'Poste supprimé avec succès.' })
      } catch (error) {
        console.error('Erreur suppression poste:', error)
        setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la suppression du poste' })
      } finally {
        setDeletingPosteId(null)
      }
    })()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Postes</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Creer et gerer les postes de votre entreprise</p>
        </div>
        <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Creer un poste</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total postes', value: stats.total, color: 'from-amber-500 to-orange-600', icon: Briefcase },
          { label: 'Postes actifs', value: stats.actifs, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Postes inactifs', value: stats.inactifs, color: 'from-red-500 to-rose-600', icon: XCircle },
          { label: 'Postes disponibles', value: stats.disponibles, color: 'from-primary-500 to-purple-600', icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {feedback && (
        <Toast message={feedback.text} type={feedback.type} onClose={() => setFeedback(null)} />
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un poste..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          Chargement des postes...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPostes.map(poste => (
              <div key={poste.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    poste.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>{poste.statut}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{poste.titre}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{poste.departement}</p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Type:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{poste.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Niveau:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{poste.niveau}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Salaire:</span>
                    <span className="font-bold text-amber-600">${poste.salaire_min} - ${poste.salaire_max}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Disponibles:</span>
                    <span className="font-bold text-primary-600">{poste.nombre_postes - poste.postes_occupes}/{poste.nombre_postes}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => { setSelectedPoste(poste); setShowEditModal(true) }} className="flex-1 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm hover:bg-amber-200 dark:hover:bg-amber-900/50 flex items-center justify-center space-x-1">
                    <Edit className="w-4 h-4" /><span>Modifier</span>
                  </button>
                  <button type="button" onClick={() => { setDeletingPosteId(poste.id); handleDelete(poste.id) }} disabled={deletingPosteId === poste.id} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-60 disabled:cursor-not-allowed">
                    {deletingPosteId === poste.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Creer un nouveau poste</h3>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre du poste *</label>
                    <input type="text" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Service *</label>
                    <select value={formData.id_service} onChange={(e) => setFormData({ ...formData, id_service: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required>
                      <option value="">Sélectionner un service</option>
                      {services.map((service: any) => (
                        <option key={service.id_service} value={service.id_service}>{service.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                    <textarea value={formData.detail} onChange={(e) => setFormData({...formData, detail: e.target.value})} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                    <button type="submit" disabled={isSubmittingCreate} className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isSubmittingCreate && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{isSubmittingCreate ? 'Création...' : 'Creer le poste'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showEditModal && selectedPoste && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Modifier le poste</h3>
                  <button type="button" onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); setPostes(postes.map(p => p.id === selectedPoste.id ? selectedPoste : p)); setShowEditModal(false); }} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre du poste</label>
                    <input type="text" value={selectedPoste.titre} onChange={(e) => setSelectedPoste({...selectedPoste, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                      <select value={selectedPoste.type} onChange={(e) => setSelectedPoste(selectedPoste ? { ...selectedPoste, type: e.target.value as Poste['type'] } : selectedPoste)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="Stage">Stage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Niveau</label>
                      <select value={selectedPoste.niveau} onChange={(e) => setSelectedPoste(selectedPoste ? { ...selectedPoste, niveau: e.target.value as Poste['niveau'] } : selectedPoste)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                        <option value="Junior">Junior</option>
                        <option value="Mid">Mid-Level</option>
                        <option value="Senior">Senior</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Statut</label>
                    <select value={selectedPoste.statut} onChange={(e) => setSelectedPoste(selectedPoste ? { ...selectedPoste, statut: e.target.value as Poste['statut'] } : selectedPoste)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                    <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Sauvegarder</button>
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