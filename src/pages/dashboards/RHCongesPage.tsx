import { useEffect, useState, useMemo, useCallback } from 'react'
import { Calendar, Search, Plus, CheckCircle2, XCircle, Clock, X } from 'lucide-react'
import { loadDashboardRHContext } from '../../services/dashboardRHData'
import { apiRequest } from '../../services/api'

export const RHCongesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Formulaire d'ajout
  const [formData, setFormData] = useState({
    matricule: '',
    type_conge: 'Annuel',
    date_debut: '',
    date_fin: '',
    nombre_jours: '',
    motif: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = useCallback(() => {
    setLoading(true)
    loadDashboardRHContext()
      .then((data) => setDashboardData(data))
      .catch(() => setDashboardData(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const rawEmployes = useMemo(() => dashboardData?.employes || [], [dashboardData])
  const rawConges = useMemo(() => dashboardData?.conges || [], [dashboardData])

  // Filtrer uniquement les employés valides
  const employes = useMemo(() => {
    if (!rawEmployes.length) return []
    return rawEmployes.filter((emp: any) => {
      const roleName = emp.role_name || emp.role?.name || emp.user?.role_name || emp.user?.role?.name || 'employe'
      return roleName.toLowerCase() === 'employe'
    })
  }, [rawEmployes])

  const getEmployeName = useCallback((matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }, [employes])

  const filteredConges = useMemo(() => {
    return rawConges.filter((c: any) => {
      const empName = getEmployeName(c.matricule).toLowerCase()
      const typeConge = (c.type_conge || '').toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      const matchesSearch = empName.includes(searchLower) || typeConge.includes(searchLower) || (c.matricule || '').toLowerCase().includes(searchLower)
      const matchesType = filterType === 'all' || c.type_conge === filterType
      const matchesStatut = filterStatut === 'all' || c.statut === filterStatut
      return matchesSearch && matchesType && matchesStatut
    })
  }, [rawConges, getEmployeName, searchTerm, filterType, filterStatut])

  const stats = useMemo(() => ({
    total: rawConges.length,
    approuves: rawConges.filter((c: any) => c.statut === 'Approuve').length,
    enAttente: rawConges.filter((c: any) => c.statut === 'En attente').length,
    refuses: rawConges.filter((c: any) => c.statut === 'Refuse').length,
  }), [rawConges])

  const handleStatutChange = async (id: number, nouveauStatut: string) => {
    try {
      await apiRequest(`rh/conges/${id}/statut`, {
        method: 'PATCH',
        body: JSON.stringify({ statut: nouveauStatut })
      })
      loadData()
    } catch (err: any) {
      alert(err.message || "Erreur lors de la modification du statut.")
    }
  }

  const handleAddConge = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    try {
      await apiRequest('rh/conges', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      setShowAddModal(false)
      setFormData({
        matricule: '',
        type_conge: 'Annuel',
        date_debut: '',
        date_fin: '',
        nombre_jours: '',
        motif: ''
      })
      loadData()
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement de la demande.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Congés</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{stats.total} demandes de congé</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle demande</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total demandes', value: stats.total, color: 'from-primary-500 to-purple-600', icon: Calendar },
          { label: 'Approuvés', value: stats.approuves, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'En attente', value: stats.enAttente, color: 'from-amber-500 to-orange-600', icon: Clock },
          { label: 'Refusés', value: stats.refuses, color: 'from-red-500 to-rose-600', icon: XCircle },
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher par employé ou type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm text-slate-800 dark:text-white" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm text-slate-800 dark:text-white">
            <option value="all">Tous les types</option>
            <option value="Annuel">Annuel</option>
            <option value="Maladie">Maladie</option>
            <option value="Maternité">Maternité</option>
            <option value="Paternité">Paternité</option>
            <option value="Exceptionnel">Exceptionnel</option>
            <option value="Sans solde">Sans solde</option>
            <option value="Mariage">Mariage</option>
            <option value="Décès d'un proche">Décès d'un proche</option>
          </select>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm text-slate-800 dark:text-white">
            <option value="all">Tous les statuts</option>
            <option value="Approuve">Approuvé</option>
            <option value="En attente">En attente</option>
            <option value="Refuse">Refusé</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredConges.map((conge: any) => (
            <div key={conge.id_conge} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{getEmployeName(conge.matricule)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{conge.type_conge}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  conge.statut === 'Approuve' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                  conge.statut === 'En attente' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>{conge.statut}</span>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{conge.date_debut} → {conge.date_fin}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{conge.nombre_jours} jours</span>
                </div>
              </div>
              {conge.motif && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-4">"{conge.motif}"</p>
              )}
              {conge.statut === 'En attente' && (
                <div className="flex space-x-2">
                  <button onClick={() => handleStatutChange(conge.id_conge, 'Approuve')} className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center justify-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" /><span>Approuver</span>
                  </button>
                  <button onClick={() => handleStatutChange(conge.id_conge, 'Refuse')} className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center space-x-1">
                    <XCircle className="w-4 h-4" /><span>Refuser</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Nouvelle Demande de Congé */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nouvelle demande de congé</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6 text-slate-500" /></button>
            </div>
            <form onSubmit={handleAddConge} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm">{errorMsg}</div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Employé</label>
                <select required value={formData.matricule} onChange={(e) => setFormData({...formData, matricule: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white">
                  <option value="">Sélectionner un employé</option>
                  {employes.map((emp: any) => (
                    <option key={emp.matricule} value={emp.matricule}>
                      {emp.prenom} {emp.nom} ({emp.matricule})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Type de congé</label>
                <select value={formData.type_conge} onChange={(e) => setFormData({...formData, type_conge: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white">
                  <option value="Annuel">Annuel</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Maternité">Maternité</option>
                  <option value="Paternité">Paternité</option>
                  <option value="Exceptionnel">Exceptionnel</option>
                  <option value="Sans solde">Sans solde</option>
                  <option value="Mariage">Mariage</option>
                  <option value="Décès d'un proche">Décès d'un proche</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date début</label>
                  <input type="date" required value={formData.date_debut} onChange={(e) => setFormData({...formData, date_debut: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date fin</label>
                  <input type="date" required value={formData.date_fin} onChange={(e) => setFormData({...formData, date_fin: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre de jours</label>
                <input type="number" min="1" required value={formData.nombre_jours} onChange={(e) => setFormData({...formData, nombre_jours: e.target.value})} placeholder="5" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Motif</label>
                <textarea rows={3} value={formData.motif} onChange={(e) => setFormData({...formData, motif: e.target.value})} placeholder="Raison de la demande..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white"></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold">Annuler</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}