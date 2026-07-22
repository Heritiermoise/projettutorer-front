import { useEffect, useState, useMemo } from 'react'
import { FileText, Search, Plus, Eye, Edit, Trash2, Download, Calendar, DollarSign, User, X } from 'lucide-react'
import { loadDashboardRHContext } from '../../services/dashboardRHData'
import { apiRequest } from '../../services/api'

export const RHContratsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [selectedContrat, setSelectedContrat] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Formulaire d'ajout de contrat
  const [formData, setFormData] = useState({
    matricule: '',
    type: 'CDI',
    date_debut: '',
    date_fin: '',
    salaire_base: '',
    details: '',
    statut: 'Actif'
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = () => {
    setLoading(true)
    loadDashboardRHContext()
      .then((data) => setDashboardData(data))
      .catch(() => setDashboardData(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const rawEmployes = dashboardData?.employes || []
  const postes = dashboardData?.postes || []
  const rawContrats = dashboardData?.contrats || []

  // Filtrer uniquement les employés ayant le rôle 'employe'
  const employes = useMemo(() => {
    if (!rawEmployes.length) return []
    return rawEmployes.filter((emp: any) => {
      const roleName = emp.role_name || emp.role?.name || emp.user?.role_name || emp.user?.role?.name || 'employe'
      return roleName.toLowerCase() === 'employe'
    })
  }, [rawEmployes])

  const contrats = useMemo(() => {
    if (!rawContrats.length) return []
    return rawContrats.map((c: any) => ({
      ...c,
      reference: c.contrat || c.reference || `CTR-${c.id_contrat}`,
      type_contrat: c.type || c.type_contrat || 'CDI'
    }))
  }, [rawContrats])

  const filteredContrats = contrats.filter((c: any) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(c.matricule))
    const searchLower = searchTerm.toLowerCase()
    
    const matchesSearch = 
      (c.reference?.toLowerCase() || '').includes(searchLower) || 
      (emp?.nom?.toLowerCase() || '').includes(searchLower) ||
      (emp?.prenom?.toLowerCase() || '').includes(searchLower) ||
      (c.matricule?.toLowerCase() || '').includes(searchLower)

    const matchesType = filterType === 'all' || c.type_contrat === filterType
    const matchesStatut = filterStatut === 'all' || c.statut === filterStatut
    return matchesSearch && matchesType && matchesStatut
  })

  const getEmployeName = (matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }

  const getPosteTitle = (matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    if (!emp) return 'N/A'
    const poste = postes.find((p: any) => Number(p.id_poste ?? p.id) === Number(emp.id_poste))
    return poste?.titre_poste || poste?.nom || 'N/A'
  }

  const handleAddContrat = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    try {
      await apiRequest('rh/contrats', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      setShowAddModal(false)
      // Réinitialiser le formulaire
      setFormData({
        matricule: '',
        type: 'CDI',
        date_debut: '',
        date_fin: '',
        salaire_base: '',
        details: '',
        statut: 'Actif'
      })
      loadData()
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement du contrat.")
    } finally {
      setSubmitting(false)
    }
  }

  const stats = {
    total: contrats.length,
    actifs: contrats.filter((c: any) => c.statut === 'Actif').length,
    cdi: contrats.filter((c: any) => c.type_contrat === 'CDI').length,
    cdd: contrats.filter((c: any) => c.type_contrat === 'CDD').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Contrats</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{stats.total} contrats enregistrés</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau contrat</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total contrats', value: stats.total, color: 'from-primary-500 to-purple-600', icon: FileText },
          { label: 'Contrats actifs', value: stats.actifs, color: 'from-green-500 to-emerald-600', icon: FileText },
          { label: 'CDI', value: stats.cdi, color: 'from-blue-500 to-blue-600', icon: FileText },
          { label: 'CDD', value: stats.cdd, color: 'from-amber-500 to-orange-600', icon: FileText },
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
            <input type="text" placeholder="Rechercher par référence ou employé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les types</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
          </select>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Expire">Expiré</option>
            <option value="En_attente">En attente</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Référence</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Employé</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Poste</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Type</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Salaire</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Début</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Fin</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContrats.map((contrat: any) => (
                <tr key={contrat.id_contrat} onClick={() => setSelectedContrat(contrat)} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-primary-600" />
                      <span className="font-mono text-sm font-semibold text-slate-800 dark:text-white">{contrat.reference}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{getEmployeName(contrat.matricule)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{getPosteTitle(contrat.matricule)}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{getPosteTitle(contrat.matricule)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      contrat.type_contrat === 'CDI' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      contrat.type_contrat === 'CDD' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    }`}>{contrat.type_contrat}</span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white hidden lg:table-cell">${contrat.salaire_base || 0}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{contrat.date_debut || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{contrat.date_fin || 'Indéterminée'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      contrat.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      contrat.statut === 'Expire' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>{contrat.statut || 'En attente'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setSelectedContrat(contrat)} className="p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Détails */}
      {selectedContrat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Détails du contrat</h3>
              <button onClick={() => setSelectedContrat(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Référence</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white font-mono">{selectedContrat.reference}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${selectedContrat.statut === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedContrat.statut}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: User, label: 'Employé', value: getEmployeName(selectedContrat.matricule) },
                  { icon: FileText, label: 'Poste', value: getPosteTitle(selectedContrat.matricule) },
                  { icon: FileText, label: 'Type de contrat', value: selectedContrat.type_contrat },
                  { icon: DollarSign, label: 'Salaire de base', value: '$' + (selectedContrat.salaire_base || 0) },
                  { icon: Calendar, label: 'Date de début', value: selectedContrat.date_debut || 'N/A' },
                  { icon: Calendar, label: 'Date de fin', value: selectedContrat.date_fin || 'Indéterminée' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm flex items-center space-x-2"><item.icon className="w-4 h-4" /><span>{item.value}</span></p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Détails</p>
                <p className="text-slate-800 dark:text-white text-sm">{selectedContrat.details || 'Aucun détail supplémentaire spécifié.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout Contrat */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Créer un nouveau contrat</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddContrat} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm">{errorMsg}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Employé</label>
                  <select required value={formData.matricule} onChange={(e) => setFormData({...formData, matricule: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">
                    <option value="">Sélectionner un employé</option>
                    {employes.map((emp: any) => (
                      <option key={emp.matricule} value={emp.matricule}>
                        {emp.prenom} {emp.nom} ({emp.matricule})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Type de contrat</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Salaire de base ($)</label>
                  <input type="number" step="0.01" required value={formData.salaire_base} onChange={(e) => setFormData({...formData, salaire_base: e.target.value})} placeholder="1500" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date de début</label>
                  <input type="date" required value={formData.date_debut} onChange={(e) => setFormData({...formData, date_debut: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date de fin (Optionnel)</label>
                  <input type="date" value={formData.date_fin} onChange={(e) => setFormData({...formData, date_fin: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Détails / Clauses</label>
                  <textarea rows={3} value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} placeholder="Clauses particulières..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"></textarea>
                </div>
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