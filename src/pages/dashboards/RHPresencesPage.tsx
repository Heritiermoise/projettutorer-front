import { useEffect, useState, useMemo } from 'react'
import { Clock, Search, CheckCircle2, XCircle, AlertCircle, Calendar, Download, Plus, X } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { loadDashboardRHContext } from '../../services/dashboardRHData'
import { apiRequest } from '../../services/api'

export const RHPresencesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Formulaire de pointage
  const [formData, setFormData] = useState({
    matricule: '',
    date_presence: new Date().toISOString().split('T')[0],
    heure_arrivee: '08:00',
    heure_depart: '17:00',
    statut: 'Present',
    justification: ''
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
  const rawPresences = dashboardData?.presences || []

  // Filtrer uniquement les employés valides
  const employes = useMemo(() => {
    if (!rawEmployes.length) return []
    return rawEmployes.filter((emp: any) => {
      const roleName = emp.role_name || emp.role?.name || emp.user?.role_name || emp.user?.role?.name || 'employe'
      return roleName.toLowerCase() === 'employe'
    })
  }, [rawEmployes])

  const getEmployeName = (matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }

  const getEmployeInitial = (matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp?.prenom?.[0] || '?'
  }

  const getEmployeSexe = (matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp?.sexe || 'M'
  }

  const filteredPresences = rawPresences.filter((p: any) => {
    const empName = getEmployeName(p.matricule).toLowerCase()
    const matricule = (p.matricule || '').toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch = empName.includes(searchLower) || matricule.includes(searchLower)
    const matchesStatut = filterStatut === 'all' || p.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  const stats = {
    total: rawPresences.length,
    presents: rawPresences.filter((p: any) => p.statut === 'Present' || p.statut === 'Présent').length,
    retards: rawPresences.filter((p: any) => p.statut === 'Retard').length,
    absents: rawPresences.filter((p: any) => p.statut === 'Absent').length,
  }

  const presenceData = [
    { name: 'Présents', value: stats.presents, color: '#10b981' },
    { name: 'Retards', value: stats.retards, color: '#f59e0b' },
    { name: 'Absents', value: stats.absents, color: '#ef4444' },
  ]

  const handleAddPresence = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    try {
      await apiRequest('rh/presences', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      setShowAddModal(false)
      setFormData({
        matricule: '',
        date_presence: new Date().toISOString().split('T')[0],
        heure_arrivee: '08:00',
        heure_depart: '17:00',
        statut: 'Present',
        justification: ''
      })
      loadData()
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement du pointage.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Présences</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Suivi des pointages quotidiens</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau pointage</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total pointages', value: stats.total, color: 'from-primary-500 to-purple-600', icon: Clock },
          { label: 'Présents', value: stats.presents, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Retards', value: stats.retards, color: 'from-amber-500 to-orange-600', icon: AlertCircle },
          { label: 'Absents', value: stats.absents, color: 'from-red-500 to-rose-600', icon: XCircle },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Aperçu global</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={presenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Répartition</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={presenceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => name + ' ' + ((percent ?? 0) * 100).toFixed(0) + '%'}>
                {presenceData.map((entry, index) => (<Cell key={'cell-' + index} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Liste des présences</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un employé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="Present">Présent</option>
            <option value="Retard">Retard</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredPresences.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">Aucune présence trouvée</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPresences.map((presence: any) => (
              <div key={presence.id_presence} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                    getEmployeSexe(presence.matricule) === 'M' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'
                  }`}>
                    <span className={`font-bold ${getEmployeSexe(presence.matricule) === 'M' ? 'text-blue-600' : 'text-pink-600'}`}>
                      {getEmployeInitial(presence.matricule)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">{getEmployeName(presence.matricule)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{presence.date_presence}</p>
                    {presence.justification && <p className="text-xs text-amber-600 dark:text-amber-400 italic mt-1">"{presence.justification}"</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    presence.statut === 'Present' || presence.statut === 'Présent' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    presence.statut === 'Retard' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>{presence.statut}</span>
                  {presence.heure_arrivee && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {presence.heure_arrivee} {presence.heure_depart ? `- ${presence.heure_depart}` : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Ajout Pointage / Présence */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Enregistrer un pointage</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddPresence} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm">{errorMsg}</div>
              )}
              <div>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date</label>
                  <input type="date" required value={formData.date_presence} onChange={(e) => setFormData({...formData, date_presence: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Statut</label>
                  <select value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">
                    <option value="Present">Présent</option>
                    <option value="Retard">Retard</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Heure d'arrivée</label>
                  <input type="time" value={formData.heure_arrivee} onChange={(e) => setFormData({...formData, heure_arrivee: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Heure de départ</label>
                  <input type="time" value={formData.heure_depart} onChange={(e) => setFormData({...formData, heure_depart: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Justification (Optionnel)</label>
                <textarea rows={2} value={formData.justification} onChange={(e) => setFormData({...formData, justification: e.target.value})} placeholder="Motif du retard ou de l'absence..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm"></textarea>
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