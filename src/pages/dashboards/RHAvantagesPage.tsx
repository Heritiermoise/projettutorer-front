import { useEffect, useState, useMemo, useCallback } from 'react'
import { Award, Search, Plus, Edit, Trash2, DollarSign, Calendar, X, RefreshCw } from 'lucide-react'
import { loadDashboardContext } from '../../services/dashboardData'
import { avantageAPI } from '../../services/api'

export const RHAvantagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [avantagesData, setAvantagesData] = useState<any[]>([])
  const [statsData, setStatsData] = useState<any>({ total: 0, actifs: 0, valeurTotale: 0 })
  const [loading, setLoading] = useState(true)

  // États pour les modals et formulaires
  const [showModal, setShowModal] = useState(false)
  const [editingAvantage, setEditingAvantage] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    matricule: '',
    libelle: '',
    description: '',
    type_avantage: 'Sante',
    valeur: '',
    date_expiration: '',
    statut: 'Actif'
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Chargement en parallèle du contexte dashboard et des avantages de l'API dédiée
      const [dashRes, avRes] = await Promise.all([
        loadDashboardContext().catch(() => null),
        avantageAPI.getAll().catch(() => null)
      ])

      setDashboardData(dashRes)

      if (avRes) {
        // Gère si l'API retourne { success: true, data: [...], stats: {...} } ou directement un tableau
        const list = avRes.data || avRes.avantages || (Array.isArray(avRes) ? avRes : [])
        setAvantagesData(list)
        if (avRes.stats) {
          setStatsData(avRes.stats)
        }
      }
    } catch (err) {
      console.error("Erreur de chargement des données :", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const employes = useMemo(() => dashboardData?.employes || [], [dashboardData])
  const utilisateurConnecte = useMemo(() => dashboardData?.user || null, [dashboardData])
  const entrepriseActuelle = useMemo(() => dashboardData?.entreprise || null, [dashboardData])

  const getEmployeName = useCallback((matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp ? `${emp.prenom} ${emp.nom}` : 'Employé inconnu'
  }, [employes])

  const filteredAvantages = useMemo(() => {
    return avantagesData.filter((a: any) => {
      const empName = getEmployeName(a.matricule).toLowerCase()
      const libelle = (a.libelle || '').toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      const matchesSearch = empName.includes(searchLower) || libelle.includes(searchLower)
      const matchesType = filterType === 'all' || a.type_avantage === filterType
      return matchesSearch && matchesType
    })
  }, [avantagesData, searchTerm, filterType, getEmployeName])

  const stats = useMemo(() => {
    if (statsData && statsData.total > 0) {
      return statsData
    }
    const actifs = avantagesData.filter((a: any) => a.statut?.toLowerCase() === 'actif').length
    const valeurTotale = avantagesData.reduce((sum: number, a: any) => sum + parseFloat(a.valeur || '0'), 0)
    return {
      total: avantagesData.length,
      actifs,
      valeurTotale
    }
  }, [avantagesData, statsData])

  const handleOpenAdd = useCallback(() => {
    setEditingAvantage(null)
    setFormData({
      matricule: '',
      libelle: '',
      description: '',
      type_avantage: 'Sante',
      valeur: '',
      date_expiration: '',
      statut: 'Actif'
    })
    setErrorMsg('')
    setShowModal(true)
  }, [])

  const handleOpenEdit = useCallback((avantage: any) => {
    setEditingAvantage(avantage)
    setFormData({
      matricule: avantage.matricule || '',
      libelle: avantage.libelle || '',
      description: avantage.description || '',
      type_avantage: avantage.type_avantage || 'Sante',
      valeur: avantage.valeur || '',
      date_expiration: avantage.date_expiration ? avantage.date_expiration.split('T')[0] : '',
      statut: avantage.statut || 'Actif'
    })
    setErrorMsg('')
    setShowModal(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const avantageId = editingAvantage?.id_avantage || editingAvantage?.id
      if (avantageId) {
        await avantageAPI.update(avantageId, formData)
      } else {
        await avantageAPI.create(formData)
      }
      setShowModal(false)
      loadData()
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue lors de l'enregistrement.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avantage ?")) return

    try {
      await avantageAPI.delete(Number(id))
      loadData()
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression.")
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Avantages</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {stats.total} avantages attribués {entrepriseActuelle ? `• ${entrepriseActuelle.nom}` : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {utilisateurConnecte && (
            <div className="hidden md:flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-sm">
              <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center font-bold text-xs">
                {utilisateurConnecte.prenom?.[0] || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {utilisateurConnecte.prenom} {utilisateurConnecte.nom || ''}
              </span>
            </div>
          )}

          <button 
            onClick={loadData}
            title="Rafraîchir"
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvel avantage</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {[
          { label: 'Total avantages', value: stats.total, color: 'from-primary-500 to-purple-600', icon: Award },
          { label: 'Avantages actifs', value: stats.actifs, color: 'from-green-500 to-emerald-600', icon: Award },
          { label: 'Valeur totale', value: '$' + Number(stats.valeurTotale || 0).toLocaleString(), color: 'from-amber-500 to-orange-600', icon: DollarSign },
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
            <input 
              type="text" 
              placeholder="Rechercher par employé ou avantage..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm dark:text-white" 
            />
          </div>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm dark:text-white"
          >
            <option value="all">Tous les types</option>
            <option value="Sante">Santé</option>
            <option value="Alimentation">Alimentation</option>
            <option value="Transport">Transport</option>
            <option value="Formation">Formation</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredAvantages.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <Award className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun avantage trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAvantages.map((avantage: any) => {
            const isActif = avantage.statut?.toLowerCase() === 'actif'
            const avantageId = avantage.id_avantage || avantage.id

            return (
              <div key={avantageId} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isActif ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {avantage.statut || 'Inconnu'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{avantage.libelle}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{avantage.description || 'Aucune description fournie.'}</p>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Bénéficiaire :</span>
                      <span className="truncate">{getEmployeName(avantage.matricule)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span className="font-bold text-amber-600">${avantage.valeur}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Expire : {avantage.date_expiration ? new Date(avantage.date_expiration).toLocaleDateString() : 'Indéterminée'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                  <button 
                    onClick={() => handleOpenEdit(avantage)}
                    className="flex-1 px-3 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" /><span>Modifier</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(avantageId)}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Ajout / Modification */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-primary-500/10 to-primary-500/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-600/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingAvantage ? "Modifier l'avantage" : "Attribuer un avantage"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Remplissez les informations de l'avantage</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-xl text-sm border border-rose-200 dark:border-rose-900">{errorMsg}</div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Employé bénéficiaire</label>
                <select 
                  required 
                  value={formData.matricule} 
                  onChange={(e) => setFormData({...formData, matricule: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                >
                  <option value="">Sélectionner un employé...</option>
                  {employes.map((emp: any) => (
                    <option key={emp.matricule} value={emp.matricule}>{emp.prenom} {emp.nom} ({emp.matricule})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Libellé</label>
                <input 
                  type="text" 
                  required 
                  value={formData.libelle} 
                  onChange={(e) => setFormData({...formData, libelle: e.target.value})} 
                  placeholder="Ex: Mutuelle santé, Chèques-repas..." 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Type</label>
                  <select 
                    value={formData.type_avantage} 
                    onChange={(e) => setFormData({...formData, type_avantage: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  >
                    <option value="Sante">Santé</option>
                    <option value="Alimentation">Alimentation</option>
                    <option value="Transport">Transport</option>
                    <option value="Formation">Formation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Valeur ($)</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.valeur} 
                    onChange={(e) => setFormData({...formData, valeur: e.target.value})} 
                    placeholder="150" 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Date d'expiration</label>
                  <input 
                    type="date" 
                    value={formData.date_expiration} 
                    onChange={(e) => setFormData({...formData, date_expiration: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Statut</label>
                  <select 
                    value={formData.statut} 
                    onChange={(e) => setFormData({...formData, statut: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Expiré">Expiré</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
                <textarea 
                  rows={2} 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Détails de l'avantage..." 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none dark:text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">Annuler</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-600/25 transition-all disabled:opacity-50">
                  {submitting ? "Enregistrement..." : (editingAvantage ? "Mettre à jour" : "Créer l'avantage")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}