import { useEffect, useMemo, useState } from 'react'
import { Briefcase, Users, Plus, Edit, Trash2, Search, Grid, List, X, Loader2 } from 'lucide-react'
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

  const loadData = async () => {
    setIsLoading(true)
    try {
      const context = await loadDashboardContext()
      setDashboardData(context)
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

  const services = dashboardData?.services || []
  const postes = dashboardData?.postes || []
  const employes = dashboardData?.employes || []

  const filteredServices = useMemo(() => services.filter((s: any) => s.nom.toLowerCase().includes(searchTerm.toLowerCase())), [services, searchTerm])

  const getServiceStats = (serviceId: number) => {
    const servicePostes = postes.filter((p: any) => p.id_service === serviceId)
    const serviceEmployes = employes.filter((e: any) => servicePostes.some((p: any) => p.id_poste === e.id_poste))
    return { postes: servicePostes.length, employes: serviceEmployes.length }
  }

  const entrepriseId = dashboardData?.entreprise?.id_entreprise || dashboardData?.user?.id_entreprise

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingCreate(true)

    try {
      const payload = entrepriseId ? { ...formData, id_entreprise: entrepriseId } : { ...formData }
      await serviceAPI.create(payload)
      setShowCreateModal(false)
      setFormData({ nom: '', description: '', statut: 'Actif' })
      setFeedback({ type: 'success', text: 'Service créé avec succès.' })
      await loadData()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la creation du service' })
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService) {
      return
    }

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
    if (!window.confirm('Supprimer ce service ?')) {
      return
    }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Services de l'entreprise</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{services.length} services actifs</p>
        </div>
        <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-4 h-4" />
          <span>Ajouter un service</span>
        </button>
      </div>

      {feedback && (
        <Toast message={feedback.text} type={feedback.type} onClose={() => setFeedback(null)} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total services', value: services.length, color: 'from-amber-500 to-orange-600' },
          { label: 'Total postes', value: postes.length, color: 'from-primary-500 to-purple-600' },
          { label: 'Postes occupes', value: postes.filter((p: any) => p.statut === 'Occupe').length, color: 'from-green-500 to-emerald-600' },
          { label: 'Postes vacants', value: postes.filter((p: any) => p.statut === 'Vacant').length, color: 'from-red-500 to-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un service..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
          </div>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><Grid className="w-4 h-4" /></button>
            <button type="button" onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">Chargement des services...</div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServices.map(service => {
            const stats = getServiceStats(service.id_service)
            return (
              <div key={service.id_service} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{service.statut}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{service.nom}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{service.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Postes</p>
                    <p className="font-bold text-slate-800 dark:text-white">{stats.postes}</p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Employes</p>
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
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Employes</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => {
                const stats = getServiceStats(service.id_service)
                return (
                  <tr key={service.id_service} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center"><Briefcase className="w-4 h-4 text-white" /></div>
                        <span className="font-semibold text-slate-800 dark:text-white text-sm">{service.nom}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{service.description}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white">{stats.postes}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white">{stats.employes}</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{service.statut}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ajouter un service</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom du service *</label>
                <input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" disabled={isSubmittingCreate} className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSubmittingCreate && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmittingCreate ? 'Création...' : 'Créer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Modifier le service</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom du service *</label>
                <input value={selectedService.nom} onChange={(e) => setSelectedService({ ...selectedService, nom: e.target.value })} type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={selectedService.description || ''} onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })} rows={4} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Statut</label>
                <select value={selectedService.statut || 'Actif'} onChange={(e) => setSelectedService({ ...selectedService, statut: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" disabled={isSubmittingEdit} className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSubmittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmittingEdit ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}