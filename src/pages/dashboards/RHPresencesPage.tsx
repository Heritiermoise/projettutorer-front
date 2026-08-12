import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock, faSearch, faCheckCircle, faTimesCircle, faExclamationCircle,
  faCalendar, faDownload, faFingerprint, faX, faSync, faSpinner,
  faUsers, faUserCheck, faUserClock, faUserTimes, faChartPie,
  faChartBar, faSun, faHistory, faCalendarDay
} from '@fortawesome/free-solid-svg-icons'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { loadDashboardRHContext } from '../../services/dashboardRHData'
import { apiRequest, entrepriseParametresAPI } from '../../services/api'

// Animations artistiques
const fadeInUp = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.95 }
}

const floatAnimation: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const slideInFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
}

const slideInFromRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
}

const rotateIn = {
  initial: { opacity: 0, rotate: -180, scale: 0.5 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 180, scale: 0.5 }
}

const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(99, 102, 241, 0.3)",
      "0 0 40px rgba(99, 102, 241, 0.6)",
      "0 0 20px rgba(99, 102, 241, 0.3)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
}

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
    if (filteredAndSortedPresences.length === 0) {
      setErrorMsg('Aucune présence disponible pour l\'export.')
      return
    }

    setExporting(true)
    try {
      const rows = filteredAndSortedPresences.map((presence: any, index: number) => {
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
      
      const headers = Object.keys(rows[0])
      const escapeCsv = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
      const csv = [headers.map(escapeCsv).join(';'), ...rows.map((row) => headers.map((header) => escapeCsv(row[header as keyof typeof row])).join(';'))].join('\r\n')
      const downloadUrl = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `presences-${viewMode}-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(downloadUrl)
      setSuccessMsg(`${rows.length} présence(s) exportée(s) avec succès.`)
      window.setTimeout(() => setSuccessMsg(''), 4500)
    } catch (error) {
      console.error('Erreur export Excel :', error)
      setErrorMsg('L\'export Excel n\'a pas pu être généré.')
    } finally {
      setExporting(false)
    }
  }

  const getStatutColor = (statut: string) => {
    const colors = {
      'Present': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      'Présent': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      'Retard': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      'Absent': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    }
    return colors[statut as keyof typeof colors] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
  }

  const getStatutIcon = (statut: string) => {
    const icons = {
      'Present': faCheckCircle,
      'Présent': faCheckCircle,
      'Retard': faExclamationCircle,
      'Absent': faTimesCircle,
    }
    return icons[statut as keyof typeof icons] || faClock
  }

  const getInitial = (emp: any) => emp?.prenom?.[0] || '?'

  // Composant Switch animé
  const ViewSwitch = () => (
    <div className="relative inline-flex bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 border border-slate-200 dark:border-slate-600">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setViewMode('today')}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
          viewMode === 'today' 
            ? 'text-white' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
        }`}
      >
        <FontAwesomeIcon icon={faSun} className="w-4 h-4" />
        <span className="hidden sm:inline">Aujourd'hui</span>
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setViewMode('history')}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
          viewMode === 'history' 
            ? 'text-white' 
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
        }`}
      >
        <FontAwesomeIcon icon={faHistory} className="w-4 h-4" />
        <span className="hidden sm:inline">Historique</span>
      </motion.button>
      
      <motion.div
        className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg shadow-primary-500/30"
        initial={false}
        animate={{
          left: viewMode === 'today' ? '4px' : 'calc(50% + 2px)',
          width: viewMode === 'today' ? 'calc(50% - 4px)' : 'calc(50% - 4px)',
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
    </div>
  )

  // Composant carte de statistique
  const StatCard = ({ label, value, icon, color, bg, delay = 0 }: any) => (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { type: "spring", stiffness: 300 }
      }}
      className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-slate-200/80 dark:border-slate-700/85 group relative overflow-hidden"
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{
          x: ['-100%', '100%'],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }
        }}
      />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <motion.p 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.1, type: "spring", stiffness: 200 }}
            className="text-2xl font-bold text-slate-900 dark:text-white mt-1"
          >
            {value}
          </motion.p>
          <motion.div 
            className="mt-2 h-1 w-12 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
          >
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: delay + 0.2, duration: 1, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${color} rounded-full`}
            />
          </motion.div>
        </div>
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all`}
        >
          <FontAwesomeIcon icon={icon} className={`w-6 h-6 ${color} bg-gradient-to-r ${color} bg-clip-text text-transparent`} />
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12 p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen"
    >
      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed right-5 top-5 z-[70] max-w-sm rounded-2xl border border-white/40 bg-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-950 shadow-xl shadow-emerald-950/20 backdrop-blur-xl dark:border-emerald-300/20 dark:bg-emerald-400/15 dark:text-emerald-100"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 shrink-0" />
            {successMsg}
          </div>
        </motion.div>
      )}

      {/* Header avec Switch */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/80 dark:bg-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            variants={floatAnimation}
            animate="animate"
            className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl shadow-primary-500/30"
          >
            <FontAwesomeIcon icon={faClock} className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-primary-600 to-slate-800 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent bg-300 animate-gradient">
              Gestion des Présences
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-300">
                <FontAwesomeIcon icon={faClock} className="text-xs" />
                Arrivée {workRules.heure_arrivee}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-slate-600 dark:text-slate-400">
                <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                Fermeture {workRules.heure_depart}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-300">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-xs" />
                Tolérance {workRules.tolerance_retard_minutes} min
              </span>
            </p>
          </div>
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
            <FontAwesomeIcon icon={faSync} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportPresences} 
            disabled={exporting || loading} 
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? (
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin text-primary-500" />
            ) : (
              <FontAwesomeIcon icon={faDownload} className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden sm:inline">{exporting ? 'Export...' : 'Exporter'}</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
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
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all"
          >
            <FontAwesomeIcon icon={faFingerprint} className="w-4 h-4 animate-pulse" />
            <span>Pointage</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Statistiques avec animation de transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard 
            label="Total Pointages" 
            value={currentStats.total} 
            icon={faUsers}
            color="from-primary-500 to-primary-600"
            bg="bg-primary-50 dark:bg-primary-950/50"
            delay={0.05}
          />
          <StatCard 
            label="Présents" 
            value={currentStats.presents} 
            icon={faUserCheck}
            color="from-emerald-500 to-teal-600"
            bg="bg-emerald-50 dark:bg-emerald-950/50"
            delay={0.1}
          />
          <StatCard 
            label="Retards" 
            value={currentStats.retards} 
            icon={faUserClock}
            color="from-amber-500 to-orange-600"
            bg="bg-amber-50 dark:bg-amber-950/50"
            delay={0.15}
          />
          <StatCard 
            label="Absents" 
            value={currentStats.absents} 
            icon={faUserTimes}
            color="from-rose-500 to-red-600"
            bg="bg-rose-50 dark:bg-rose-950/50"
            delay={0.2}
          />
        </motion.div>
      </AnimatePresence>

      {/* Graphiques avec animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`charts-${viewMode}`}
          initial={{ opacity: 0, scale: 0.95, rotateX: 5 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.95, rotateX: -5 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-slate-200/80 dark:border-slate-700/85 lg:col-span-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartBar} className="text-primary-500" />
              {viewMode === 'today' ? 'Présences du Jour' : 'Historique des Présences'}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={presenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} 
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher un employé..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" 
              />
            </div>
            <select 
              value={filterStatut} 
              onChange={(e) => setFilterStatut(e.target.value)} 
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="Present">Présent</option>
              <option value="Retard">Retard</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-900/30 border-t-primary-600 dark:border-t-primary-400"></div>
            </motion.div>
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
                  <motion.div 
                    key={presence.id_presence || presence.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.04)' }}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${sexe === 'M' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'}`}
                      >
                        {initial}
                      </motion.div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{fullName}</p>
                        <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <FontAwesomeIcon icon={faCalendar} className="w-3.5 h-3.5" />
                            <span>{presence.date_presence}</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono">Mat: {presence.matricule}</span>
                        </div>
                        {presence.justification && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-amber-600 dark:text-amber-400 italic mt-1.5 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md inline-block border border-amber-200/50 dark:border-amber-900/50"
                          >
                            Motif : "{presence.justification}"
                          </motion.p>
                        )}
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

      {/* MODAL POINTAGE - Version améliorée */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={() => {
              if (!submitting) setShowAddModal(false)
            }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-primary-500/10 to-primary-600/10">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-600/30"
                  >
                    <FontAwesomeIcon icon={faFingerprint} className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      Pointage
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enregistrement dynamique basé sur l'heure</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!submitting) setShowAddModal(false)
                  }} 
                  className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
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
                  <select 
                    required 
                    value={formData.matricule} 
                    onChange={(e) => handleEmployeChange(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  >
                    <option value="">Sélectionner un employé...</option>
                    {employes.map((emp: any) => (
                      <option key={emp.matricule} value={emp.matricule}>
                        {emp.prenom} {emp.nom} ({emp.matricule})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                    Statut du pointage
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Present', label: 'Présent', color: 'emerald', icon: faCheckCircle },
                      { id: 'Retard', label: 'Retard', color: 'amber', icon: faExclamationCircle },
                      { id: 'Absent', label: 'Absent', color: 'rose', icon: faTimesCircle },
                    ].map((s) => (
                      <motion.button
                        key={s.id}
                        type="button"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatutChange(s.id)}
                        className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          formData.statut === s.id 
                            ? `border-${s.color}-500 bg-${s.color}-50 dark:bg-${s.color}-950/40 text-${s.color}-700 dark:text-${s.color}-300 ring-2 ring-${s.color}-500/20` 
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <FontAwesomeIcon icon={s.icon} className="w-3.5 h-3.5" />
                        {s.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {['Present', 'Retard'].includes(formData.statut) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Heure d'arrivée</label>
                      <input 
                        type="time" 
                        disabled 
                        value={formData.heure_arrivee} 
                        className="w-full px-3 py-2 bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono rounded-xl text-sm cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Heure de départ</label>
                      <input 
                        type="time" 
                        disabled 
                        value={formData.heure_depart || (existingPresenceToday ? formatTimeForApi(new Date()) : '')} 
                        className="w-full px-3 py-2 bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono rounded-xl text-sm cursor-not-allowed" 
                      />
                    </div>
                  </motion.div>
                )}

                {['Absent', 'Retard'].includes(formData.statut) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faExclamationCircle} className="w-3 h-3 text-rose-500" />
                      Motif {formData.statut === 'Absent' ? "de l'absence" : "du retard"} *
                    </label>
                    <textarea 
                      rows={3} 
                      required 
                      value={formData.justification} 
                      onChange={(e) => setFormData({...formData, justification: e.target.value})} 
                      placeholder="Précisez le motif..." 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none dark:text-white"
                    />
                  </motion.div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button" 
                    onClick={() => {
                      if (!submitting) setShowAddModal(false)
                    }} 
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={submitting || !formData.matricule} 
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/40 transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    {submitting ? (
                      <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                    ) : (
                      <FontAwesomeIcon icon={faFingerprint} className="w-4 h-4" />
                    )}
                    <span>{getSubmitButtonLabel()}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles CSS */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bg-300 { background-size: 300% 300%; }
        .animate-gradient { animation: gradient 6s ease infinite; }
      `}</style>
    </motion.div>
  )
}