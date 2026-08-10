import { useEffect, useState, useMemo, useCallback } from 'react'
import { Clock, Search, CheckCircle2, XCircle, AlertCircle, Calendar, Download, Fingerprint, X, RefreshCw, LoaderCircle } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import * as XLSX from 'xlsx'
import { loadDashboardRHContext } from '../../services/dashboardRHData'
import { apiRequest, entrepriseParametresAPI } from '../../services/api'

export const RHPresencesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [workRules, setWorkRules] = useState({ heure_arrivee: '08:00', heure_depart: '17:00', tolerance_retard_minutes: 15 })
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState<'today' | 'history'>('today')
  const [sortField, setSortField] = useState<string>('date_presence')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const formatTimeForApi = useCallback((dateObj: Date) => {
    return dateObj.toTimeString().slice(0, 5)
  }, [])

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
  const [exporting, setExporting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

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

  useEffect(() => {
    void entrepriseParametresAPI.get()
      .then((response) => setWorkRules((current) => ({ ...current, ...(response.parametres || {}) })))
      .catch((error) => console.error('Impossible de charger les règles de présence :', error))
  }, [])

  const rawEmployes = useMemo(() => dashboardData?.employes || [], [dashboardData])
  const rawPresences = useMemo(() => dashboardData?.presences || [], [dashboardData])

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

  // Présences du jour
  const today = new Date().toISOString().split('T')[0]
  const todayPresences = useMemo(() => {
    return rawPresences.filter((p: any) => String(p.date_presence) === String(today))
  }, [rawPresences, today])

  // Statistiques du jour
  const todayStats = useMemo(() => {
    const presents = todayPresences.filter((p: any) => ['present', 'présent'].includes(p.statut?.toLowerCase())).length
    const retards = todayPresences.filter((p: any) => p.statut?.toLowerCase() === 'retard').length
    const absents = todayPresences.filter((p: any) => p.statut?.toLowerCase() === 'absent').length
    return { total: todayPresences.length, presents, retards, absents }
  }, [todayPresences])

  // Statistiques historiques
  const historyStats = useMemo(() => {
    const presents = rawPresences.filter((p: any) => ['present', 'présent'].includes(p.statut?.toLowerCase())).length
    const retards = rawPresences.filter((p: any) => p.statut?.toLowerCase() === 'retard').length
    const absents = rawPresences.filter((p: any) => p.statut?.toLowerCase() === 'absent').length
    return { total: rawPresences.length, presents, retards, absents }
  }, [rawPresences])

  const determineStatutByTime = useCallback((timeStr: string) => {
    if (!timeStr) return 'Present'
    const [hours, minutes] = timeStr.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes

    const [startHours, startMinutes] = workRules.heure_arrivee.split(':').map(Number)
    const lateThreshold = startHours * 60 + startMinutes + workRules.tolerance_retard_minutes

    if (totalMinutes <= lateThreshold) {
      return 'Present'
    } else {
      return 'Retard'
    }
  }, [workRules])

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Filtrer et trier les présences selon le mode
  const filteredAndSortedPresences = useMemo(() => {
    let source = viewMode === 'today' ? todayPresences : rawPresences
    
    let filtered = source.filter((p: any) => {
      const emp = getEmployeDetails(p.matricule)
      const empName = emp ? `${emp.prenom} ${emp.nom}`.toLowerCase() : ''
      const matricule = (p.matricule || '').toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      const matchesSearch = empName.includes(searchLower) || matricule.includes(searchLower)
      const matchesStatut = filterStatut === 'all' || p.statut?.toLowerCase() === filterStatut.toLowerCase()
      return matchesSearch && matchesStatut
    })

    // Tri
    filtered.sort((a: any, b: any) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''
      
      if (sortField === 'date_presence') {
        valA = new Date(valA).getTime() || 0
        valB = new Date(valB).getTime() || 0
      }
      
      if (typeof valA === 'string') {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [viewMode, todayPresences, rawPresences, searchTerm, filterStatut, getEmployeDetails, sortField, sortDirection])

  const currentStats = viewMode === 'today' ? todayStats : historyStats

  const presenceData = useMemo(() => [
    { name: 'Présents', value: currentStats.presents, color: '#10b981' },
    { name: 'Retards', value: currentStats.retards, color: '#f59e0b' },
    { name: 'Absents', value: currentStats.absents, color: '#ef4444' },
  ], [currentStats])

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
      setSuccessMsg('Pointage enregistré avec succès.')
      window.setTimeout(() => setSuccessMsg(''), 4500)
      await loadData()
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

  const exportPresences = () => {
    if (rawPresences.length === 0) {
      setErrorMsg('Aucune présence réelle n’est disponible pour l’export.')
      return
    }

    setExporting(true)
    try {
      const rows = [...rawPresences]
        .sort((first: any, second: any) => String(second.date_presence).localeCompare(String(first.date_presence)))
        .map((presence: any, index: number) => {
          const employee = getEmployeDetails(presence.matricule)
          return {
            'N°': index + 1,
            Date: presence.date_presence || '',
            Matricule: presence.matricule || '',
            Employé: employee ? `${employee.prenom || ''} ${employee.nom || ''}`.trim() : 'Employé non résolu',
            Statut: presence.statut || 'Non renseigné',
            'Heure arrivée': presence.heure_arrivee ? String(presence.heure_arrivee).slice(0, 5) : '',
            'Heure départ': presence.heure_depart ? String(presence.heure_depart).slice(0, 5) : '',
            Justification: presence.justification || '',
          }
        })
      const summary = [
        ['RAPPORT DE PRÉSENCE RH'],
        ['Données vérifiables de l’entreprise'],
        [],
        ['Généré le', new Date().toLocaleString('fr-FR')],
        ['Total des pointages', stats.total],
        ['Présents', stats.presents],
        ['Retards', stats.retards],
        ['Absents', stats.absents],
        [],
        ['Contrôle', 'Valeur'],
        ['Période couverte', `${rows.at(-1)?.Date || '—'} au ${rows.at(0)?.Date || '—'}`],
        ['Source', 'API RH / présences de votre entreprise'],
      ]
      const workbook = XLSX.utils.book_new()
      const summarySheet = XLSX.utils.aoa_to_sheet(summary)
      summarySheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }]
      summarySheet['!cols'] = [{ wch: 28 }, { wch: 34 }, { wch: 18 }]
      const detailSheet = XLSX.utils.json_to_sheet(rows)
      detailSheet['!freeze'] = { xSplit: 0, ySplit: 1 }
      detailSheet['!autofilter'] = { ref: `A1:H${rows.length + 1}` }
      detailSheet['!cols'] = [{ wch: 7 }, { wch: 14 }, { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 46 }]
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Synthèse')
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Présences détaillées')
      XLSX.writeFile(workbook, `presences-rh-${new Date().toISOString().slice(0, 10)}.xlsx`)
      setSuccessMsg(`${rows.length} pointage(s) réel(s) ont été exportés dans Excel.`)
      window.setTimeout(() => setSuccessMsg(''), 4500)
    } catch (error) {
      console.error('Erreur export Excel :', error)
      setErrorMsg('L’export Excel n’a pas pu être généré.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gestion des Présences</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Arrivée {workRules.heure_arrivee} · fermeture {workRules.heure_depart} · tolérance {workRules.tolerance_retard_minutes} min</p>
        </div>
        <div className="flex items-center space-x-3">
          <ViewSwitch />
          
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            title="Rafraîchir"
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportPresences} disabled={exporting || loading} className="flex items-center space-x-2 px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
            {exporting ? <LoaderCircle className="w-4 h-4 animate-spin text-primary-500" /> : <Download className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{exporting ? 'Export...' : 'Exporter Excel'}</span>
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
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-600/20 transition-all active:scale-95"
          >
            <FontAwesomeIcon icon={faFingerprint} className="w-4 h-4 animate-pulse" />
            <span>Pointage</span>
          </motion.button>
        </div>
      </motion.div>

      {successMsg && <div className="fixed right-5 top-5 z-[70] max-w-sm rounded-2xl border border-white/40 bg-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-950 shadow-xl shadow-emerald-950/20 backdrop-blur-xl dark:border-emerald-300/20 dark:bg-emerald-400/15 dark:text-emerald-100"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 shrink-0" />{successMsg}</div></div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pointages', value: stats.total, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/50', icon: Clock },
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

          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-slate-200/80 dark:border-slate-700/85 flex flex-col justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartPie} className="text-primary-500" />
              Répartition
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={presenceData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={55} 
                    outerRadius={80} 
                    paddingAngle={6} 
                    dataKey="value" 
                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                    labelLine={false}
                  >
                    {presenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Liste des présences */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700/85 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={viewMode === 'today' ? faCalendarDay : faHistory} className="text-primary-500" />
            {viewMode === 'today' ? 'Présences du Jour' : 'Historique complet'}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              ({filteredAndSortedPresences.length})
            </span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Rechercher un employé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" />
            </div>
            <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white">
              <option value="all">Tous les statuts</option>
              <option value="Present">Présent</option>
              <option value="Retard">Retard</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPresences.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Aucune présence trouvée</p>
          </div>
        ) : filteredAndSortedPresences.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <FontAwesomeIcon icon={faClock} className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {viewMode === 'today' ? 'Aucune présence enregistrée aujourd\'hui' : 'Aucune présence dans l\'historique'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[500px] overflow-y-auto"
            >
              {filteredAndSortedPresences.map((presence: any, index: number) => {
                const emp = getEmployeDetails(presence.matricule)
                const fullName = emp ? `${emp.prenom} ${emp.nom}` : 'Employé inconnu'
                const sexe = emp?.sexe || 'M'
                const initial = emp?.prenom?.[0] || '?'
                const StatutIcon = getStatutIcon(presence.statut)
                const isPresentOrRetard = ['present', 'présent', 'retard'].includes(presence.statut?.toLowerCase())
                const statutColor = getStatutColor(presence.statut)

              return (
                <div key={presence.id_presence || presence.id} className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${sexe === 'M' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'}`}>
                      {initial}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{fullName}</p>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /><span>{presence.date_presence}</span></span>
                        <span>•</span>
                        <span className="font-mono">Mat: {presence.matricule}</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statutColor}`}>
                        <FontAwesomeIcon icon={StatutIcon} className="mr-1.5 w-3 h-3" />
                        {presence.statut}
                      </span>
                      {isPresentOrRetard && presence.heure_arrivee && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1.5 flex items-center space-x-1"
                        >
                          <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-slate-400" />
                          <span>{presence.heure_arrivee.slice(0, 5)} {presence.heure_depart ? `→ ${presence.heure_depart.slice(0, 5)}` : '(En cours)'}</span>
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Modal Pointage */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-primary-500/10 to-primary-500/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-600/30">
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
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                >
                  <FontAwesomeIcon icon={faX} className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>
              
              <form onSubmit={handlePointageSubmit} className="p-6 space-y-5">
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-xl text-sm border border-rose-200 dark:border-rose-900 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4" />
                    {errorMsg}
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                    Employé *
                  </label>
                  <textarea rows={3} required value={formData.justification} onChange={(e) => setFormData({...formData, justification: e.target.value})} placeholder="Précisez le motif..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none dark:text-white"></textarea>
                </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">Annuler</button>
                <button type="submit" disabled={submitting || !formData.matricule} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-600/25 transition-all disabled:opacity-50 flex items-center space-x-2">
                  {submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
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