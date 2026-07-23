import { useEffect, useState, useMemo, useCallback } from 'react'
import { Clock, Search, CheckCircle2, XCircle, AlertCircle, Calendar, Download, Fingerprint, X, RefreshCw } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { loadDashboardRHContext } from '../../services/dashboardRHData'
import { apiRequest } from '../../services/api'

export const RHPresencesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Fonction utilitaire pour s'assurer du format HH:mm strict (H:i pour Laravel)
  const formatTimeForApi = useCallback((dateObj: Date) => {
    return dateObj.toTimeString().slice(0, 5)
  }, [])

  // Formulaire de pointage dynamique basé sur l'heure actuelle
  const [formData, setFormData] = useState({
    matricule: '',
    date_presence: new Date().toISOString().split('T')[0],
    heure_arrivee: '',
    heure_depart: '',
    statut: 'Present',
    justification: ''
  })
  
  const [existingPresenceToday, setExistingPresenceToday] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await loadDashboardRHContext()
      setDashboardData(data)
    } catch {
      setDashboardData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const rawEmployes = useMemo(() => dashboardData?.employes || [], [dashboardData])
  const rawPresences = useMemo(() => dashboardData?.presences || [], [dashboardData])

  // Filtrer uniquement les employés valides (rôle employé)
  const employes = useMemo(() => {
    if (!rawEmployes.length) return []
    return rawEmployes.filter((emp: any) => {
      const roleName = emp.role_name || emp.role?.name || emp.user?.role_name || emp.user?.role?.name || 'employe'
      return roleName.toLowerCase() === 'employe'
    })
  }, [rawEmployes])

  const getEmployeInfo = useMemo(() => {
    const map = new Map()
    employes.forEach((emp: any) => map.set(String(emp.matricule), emp))
    return map
  }, [employes])

  const getEmployeDetails = useCallback((matricule: string) => getEmployeInfo.get(String(matricule)), [getEmployeInfo])

  // Fonction utilitaire pour déterminer automatiquement le statut selon les règles horaires
  const determineStatutByTime = useCallback((timeStr: string) => {
    if (!timeStr) return 'Present'
    const [hours, minutes] = timeStr.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes

    if (totalMinutes <= 510) { // 8h30 (8 * 60 + 30)
      return 'Present'
    } else if (totalMinutes <= 1020) { // 17h00 (17 * 60)
      return 'Retard'
    } else {
      return 'Absent'
    }
  }, [])

  // Gestion dynamique lorsqu'on change d'employé dans le modal
  const handleEmployeChange = useCallback((matricule: string) => {
    const today = new Date().toISOString().split('T')[0]
    const found = rawPresences.find((p: any) => 
      String(p.matricule) === String(matricule) && String(p.date_presence) === String(today)
    )

    const now = new Date()
    const currentTime = formatTimeForApi(now)
    const autoStatut = determineStatutByTime(currentTime)

    setExistingPresenceToday(found || null)

    if (found && found.heure_arrivee && !found.heure_depart) {
      const arriveeClean = found.heure_arrivee.slice(0, 5)
      let departClean = currentTime

      if (departClean <= arriveeClean) {
        const [h, m] = arriveeClean.split(':').map(Number)
        const dateComputed = new Date()
        dateComputed.setHours(h, m + 1, 0)
        departClean = formatTimeForApi(dateComputed)
      }

      setFormData({
        matricule,
        date_presence: today,
        heure_arrivee: arriveeClean,
        heure_depart: departClean,
        statut: found.statut || 'Present',
        justification: found.justification || ''
      })
    } else {
      setFormData({
        matricule,
        date_presence: today,
        heure_arrivee: currentTime,
        heure_depart: '',
        statut: autoStatut,
        justification: autoStatut === 'Present' ? '' : 'Pointage après l\'heure limite'
      })
    }
  }, [rawPresences, formatTimeForApi, determineStatutByTime])

  const handleStatutChange = useCallback((statut: string) => {
    const now = new Date()
    const currentTime = formatTimeForApi(now)

    setFormData(prev => ({
      ...prev,
      statut,
      heure_arrivee: ['Present', 'Retard'].includes(statut) ? (prev.heure_arrivee || currentTime) : '',
      heure_depart: ['Present', 'Retard'].includes(statut) ? prev.heure_depart : '',
      justification: statut === 'Present' ? '' : prev.justification
    }))
  }, [formatTimeForApi])

  const filteredPresences = useMemo(() => {
    return rawPresences.filter((p: any) => {
      const emp = getEmployeDetails(p.matricule)
      const empName = emp ? `${emp.prenom} ${emp.nom}`.toLowerCase() : ''
      const matricule = (p.matricule || '').toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      const matchesSearch = empName.includes(searchLower) || matricule.includes(searchLower)
      const matchesStatut = filterStatut === 'all' || p.statut?.toLowerCase() === filterStatut.toLowerCase()
      return matchesSearch && matchesStatut
    })
  }, [rawPresences, searchTerm, filterStatut, getEmployeDetails])

  const stats = useMemo(() => {
    const presents = rawPresences.filter((p: any) => ['present', 'présent'].includes(p.statut?.toLowerCase())).length
    const retards = rawPresences.filter((p: any) => p.statut?.toLowerCase() === 'retard').length
    const absents = rawPresences.filter((p: any) => p.statut?.toLowerCase() === 'absent').length
    return {
      total: rawPresences.length,
      presents,
      retards,
      absents
    }
  }, [rawPresences])

  const presenceData = useMemo(() => [
    { name: 'Présents', value: stats.presents, color: '#10b981' },
    { name: 'Retards', value: stats.retards, color: '#f59e0b' },
    { name: 'Absents', value: stats.absents, color: '#ef4444' },
  ], [stats])

  const handlePointageSubmit = async (e: React.FormEvent) => {
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
        heure_arrivee: '',
        heure_depart: '',
        statut: 'Present',
        justification: ''
      })
      setExistingPresenceToday(null)
      loadData()
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement du pointage.")
    } finally {
      setSubmitting(false)
    }
  }

  const getSubmitButtonLabel = () => {
    if (submitting) return 'Enregistrement...'
    if (existingPresenceToday && existingPresenceToday.heure_arrivee && !existingPresenceToday.heure_depart) {
      return 'Valider le départ'
    }
    if (formData.statut === 'Absent') return 'Enregistrer l\'absence'
    if (formData.statut === 'Retard') return 'Enregistrer le retard'
    return 'Valider l\'arrivée'
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gestion des Présences</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Suivi et pointages quotidiens automatisés</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadData}
            title="Rafraîchir"
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center space-x-2 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-all shadow-sm">
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button 
            onClick={() => {
              const now = new Date()
              const currentTime = formatTimeForApi(now)
              const autoStatut = determineStatutByTime(currentTime)
              setFormData({
                matricule: '',
                date_presence: now.toISOString().split('T')[0],
                heure_arrivee: currentTime,
                heure_depart: '',
                statut: autoStatut,
                justification: autoStatut === 'Present' ? '' : 'Pointage après l\'heure limite'
              })
              setExistingPresenceToday(null)
              setShowAddModal(true)
            }} 
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Fingerprint className="w-4 h-4 animate-pulse" />
            <span>Pointage</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pointages', value: stats.total, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/50', icon: Clock },
          { label: 'Présents', value: stats.presents, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50', icon: CheckCircle2 },
          { label: 'Retards', value: stats.retards, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50', icon: AlertCircle },
          { label: 'Absents', value: stats.absents, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50', icon: XCircle },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/85 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/85 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Aperçu Global</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={presenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/85 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Répartition</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={presenceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={6} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {presenceData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="none" />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/85 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Liste des présences</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Rechercher un employé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" />
            </div>
            <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white">
              <option value="all">Tous les statuts</option>
              <option value="Present">Présent</option>
              <option value="Retard">Retard</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredPresences.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Aucune présence trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[500px] overflow-y-auto">
            {filteredPresences.map((presence: any) => {
              const emp = getEmployeDetails(presence.matricule)
              const fullName = emp ? `${emp.prenom} ${emp.nom}` : 'Employé inconnu'
              const sexe = emp?.sexe || 'M'
              const initial = emp?.prenom?.[0] || '?'
              const isPresentOrRetard = ['present', 'présent', 'retard'].includes(presence.statut?.toLowerCase())
              const statutLower = presence.statut?.toLowerCase()

              return (
                <div key={presence.id_presence || presence.id} className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${sexe === 'M' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'}`}>
                      {initial}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{fullName}</p>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /><span>{presence.date_presence}</span></span>
                        <span>•</span>
                        <span className="font-mono">Mat: {presence.matricule}</span>
                      </div>
                      {presence.justification && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 italic mt-1.5 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md inline-block border border-amber-200/50 dark:border-amber-900/50">
                          Motif : "{presence.justification}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      statutLower === 'present' || statutLower === 'présent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                      statutLower === 'retard' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>{presence.statut}</span>
                    {isPresentOrRetard && presence.heure_arrivee && (
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1.5 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{presence.heure_arrivee.slice(0, 5)} {presence.heure_depart ? `→ ${presence.heure_depart.slice(0, 5)}` : '(En cours)'}</span>
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Pointage */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pointage</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enregistrement dynamique basé sur l'heure</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <form onSubmit={handlePointageSubmit} className="p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-xl text-sm border border-rose-200 dark:border-rose-900">{errorMsg}</div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Employé</label>
                <select 
                  required 
                  value={formData.matricule} 
                  onChange={(e) => handleEmployeChange(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                >
                  <option value="">Sélectionner un employé...</option>
                  {employes.map((emp: any) => (
                    <option key={emp.matricule} value={emp.matricule}>{emp.prenom} {emp.nom} ({emp.matricule})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Statut du pointage (Automatique selon l'heure)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Present', label: 'Présent', activeClass: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20' },
                    { id: 'Retard', label: 'Retard', activeClass: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20' },
                    { id: 'Absent', label: 'Absent', activeClass: 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStatutChange(s.id)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                        formData.statut === s.id ? s.activeClass : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {['Present', 'Retard'].includes(formData.statut) && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Heure d'arrivée</label>
                    <input type="time" disabled value={formData.heure_arrivee} className="w-full px-3 py-2 bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono rounded-xl text-sm cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Heure de départ</label>
                    <input type="time" disabled value={formData.heure_depart || (existingPresenceToday ? formatTimeForApi(new Date()) : '')} className="w-full px-3 py-2 bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono rounded-xl text-sm cursor-not-allowed" />
                  </div>
                </div>
              )}

              {['Absent', 'Retard'].includes(formData.statut) && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Motif {formData.statut === 'Absent' ? "de l'absence" : "du retard"} <span className="text-rose-500">*</span>
                  </label>
                  <textarea rows={3} required value={formData.justification} onChange={(e) => setFormData({...formData, justification: e.target.value})} placeholder="Précisez le motif..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none dark:text-white"></textarea>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">Annuler</button>
                <button type="submit" disabled={submitting || !formData.matricule} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4" />
                  <span>{getSubmitButtonLabel()}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}