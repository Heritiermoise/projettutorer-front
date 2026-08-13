import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse, faDollarSign, faClock, faFileLines, faRightFromBracket,
  faBars, faXmark, faSun, faMoon, faBell, faUser, faGear,
  faChartPie, faSpinner, faCircleExclamation, faCalendarAlt,
  faUserCheck, faEnvelope, faGift, faWallet, faReceipt, faCircle, faTh,
  faCheckCircle, faTimesCircle, faHourglassHalf, faCalendar, faBuilding,
  faBriefcase, faBuildingUser, faCoins, faUserTie, faArrowRight,
  faChevronRight, faCreditCard, faIdCard, faPhone, faMapMarkerAlt,
  faCake, faFlag, faCrown, faStar, faMedal, faTrophy
} from '@fortawesome/free-solid-svg-icons'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { NotificationBell } from '../../components/NotificationBell'
import { notificationAPI, apiRequest } from '../../services/api'
import { EmployeCongesPage } from './EmployeCongesPage'
import { EmployeDocumentsPage } from './EmployeDocumentsPage'
import { EmployeNotificationsPage } from './EmployeNotificationsPage'
import { EmployeParametresPage } from './EmployeParametresPage'
import { EmployePaiePage } from './EmployePaiePage'
import { EmployePresencesPage } from './EmployePresencesPage'
import { EmployeAvantagesPage } from './EmployeAvantagesPage'

// Animations
const slideUp = {
  initial: { opacity: 0, y: 30, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.96 }
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08
    }
  }
}

const floatAnimation = {
  animate: {
    y: [0, -5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const MAIN_MENU_ITEMS = [
  { icon: faHouse, label: 'Accueil', id: 'dashboard', path: '/dashboard/employe' },
  { icon: faDollarSign, label: 'Paies', id: 'paies', path: '/dashboard/employe/paies' },
  { icon: faCalendarAlt, label: 'Congés', id: 'conges', path: '/dashboard/employe/conges' },
  { icon: faClock, label: 'Présences', id: 'presences', path: '/dashboard/employe/presences' },
  { icon: faFileLines, label: 'Documents', id: 'documents', path: '/dashboard/employe/documents' },
  { icon: faGift, label: 'Avantages', id: 'avantages', path: '/dashboard/employe/avantages' },
  { icon: faBell, label: 'Notifications', id: 'notifications', path: '/dashboard/employe/notifications' },
  { icon: faUser, label: 'Profil', id: 'profil', path: '/dashboard/employe/profil' },
  { icon: faGear, label: 'Paramètres', id: 'parametres', path: '/dashboard/employe/parametres' },
  { icon: faRightFromBracket, label: 'Déconnexion', id: 'logout', path: '#logout' },
]

const CIRCLE_MENU_ITEMS = [
  { icon: faHouse, label: 'Accueil', id: 'dashboard' },
  { icon: faDollarSign, label: 'Paies', id: 'paies' },
  { icon: faCalendarAlt, label: 'Congés', id: 'conges' },
  { icon: faClock, label: 'Présences', id: 'presences' },
]

const normalizeStatus = (status: string | undefined) => {
  if (!status) return ''
  return status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export const EmployeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [notifications, setNotifications] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCircleMenu, setShowCircleMenu] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const getCurrentSection = useCallback(() => {
    const path = location.pathname
    if (path.includes('/paies')) return 'paies'
    if (path.includes('/conges')) return 'conges'
    if (path.includes('/presences')) return 'presences'
    if (path.includes('/documents')) return 'documents'
    if (path.includes('/avantages')) return 'avantages'
    if (path.includes('/notifications')) return 'notifications'
    if (path.includes('/parametres')) return 'parametres'
    if (path.includes('/profil')) return 'profil'
    return 'dashboard'
  }, [location.pathname])

  const activeSection = getCurrentSection()

  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await apiRequest('/employe/dashboard', { method: 'GET' })
      if (response.success) {
        setDashboardData(response.data)
        setLoadError(null)
      } else {
        setLoadError(response.message || 'Erreur lors du chargement des données')
      }
    } catch (error: any) {
      setLoadError(error.message || 'Erreur de connexion au serveur')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const loadNotifications = useCallback(async () => {
    try {
      const response = await notificationAPI.getAll()
      setNotifications((response.notifications || []).map((notification: any) => ({
        id: notification.id,
        title: notification.titre,
        message: notification.message,
        type: notification.type,
        date: new Date(notification.created_at).toLocaleString('fr-FR'),
        read: Boolean(notification.lu),
      })))
    } catch (error) {
      console.error('Erreur lors du chargement des notifications employé :', error)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([fetchDashboardData(), loadNotifications()]).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [fetchDashboardData, loadNotifications])

  useEffect(() => {
    const intervalId = window.setInterval(() => loadNotifications(), 10000)
    return () => window.clearInterval(intervalId)
  }, [loadNotifications])

  const toggleDark = useCallback(() => {
    const newDarkState = !isDark
    setIsDark(newDarkState)
    document.documentElement.classList.toggle('dark', newDarkState)
  }, [isDark])

  const handleMarkAsRead = useCallback((id: number) => {
    void notificationAPI.markRead(id).then(loadNotifications).catch(console.error)
  }, [loadNotifications])

  const handleMarkAllAsRead = useCallback(() => {
    void notificationAPI.markAllRead().then(loadNotifications).catch(console.error)
  }, [loadNotifications])

  const handleDelete = useCallback((id: number) => {
    void notificationAPI.delete(id).then(loadNotifications).catch(console.error)
  }, [loadNotifications])

  const handleNavigation = useCallback((path: string, id: string) => {
    if (id === 'logout') { navigate('/'); return }
    setShowCircleMenu(false)
    navigate(path)
  }, [navigate])

  // Données
  const currentUser = dashboardData?.user
  const currentEmploye = dashboardData?.employe
  const currentPoste = dashboardData?.poste
  const currentService = dashboardData?.service
  const currentEntreprise = dashboardData?.entreprise

  const userPaies = useMemo(() => {
    if (!dashboardData?.fiches_paie) return []
    return [...dashboardData.fiches_paie].sort((first: any, second: any) => {
      const firstPeriod = Number(first.annee_paiement) * 100 + Number(first.mois_paiement)
      const secondPeriod = Number(second.annee_paiement) * 100 + Number(second.mois_paiement)
      return secondPeriod - firstPeriod || Number(second.id_paie) - Number(first.id_paie)
    })
  }, [dashboardData])

  const userConges = useMemo(() => dashboardData?.conges || [], [dashboardData])
  const userPresences = useMemo(() => dashboardData?.presences || [], [dashboardData])
  const userDocuments = useMemo(() => dashboardData?.documents || [], [dashboardData])
  const userAvantages = useMemo(() => dashboardData?.avantages || [], [dashboardData])
  const stats = useMemo(() => dashboardData?.stats || {}, [dashboardData])

  const formatCurrency = useCallback((amount: number) => new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2
  }).format(amount), [])

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const currentMonthPresences = useMemo(() => {
    return userPresences.filter((presence: any) => {
      const date = new Date(`${presence.date_presence}T00:00:00`)
      return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth
    })
  }, [userPresences, currentYear, currentMonth])

  const presenceData = useMemo(() => [
    { name: 'Présents', value: stats.jours_presence || 0, color: '#10B981' },
    { name: 'Retards', value: stats.jours_retard || 0, color: '#F59E0B' },
    { name: 'Absences', value: stats.jours_absence || 0, color: '#EF4444' },
  ], [stats])

  const congesData = useMemo(() => [
    { name: 'Approuvés', value: stats.conges_approuves || 0, color: '#10B981' },
    { name: 'En attente', value: stats.conges_en_attente || 0, color: '#F59E0B' },
    { name: 'Refusés', value: stats.conges_refuses || 0, color: '#EF4444' },
  ], [stats])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-[#E2E8F0] dark:border-[#334155] border-t-[#10B981] dark:border-t-[#10B981]"></div>
        </motion.div>
        <p className="mt-5 text-[#64748B] dark:text-[#94A3B8] font-medium text-sm animate-pulse">Chargement...</p>
      </div>
    )
  }

  if (loadError || !currentUser || !currentEmploye) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A] p-6">
        <div className="w-20 h-20 rounded-full bg-[#FEE2E2] dark:bg-[#450A0A] flex items-center justify-center mb-5">
          <FontAwesomeIcon icon={faCircleExclamation} className="w-10 h-10 text-[#EF4444]" />
        </div>
        <p className="text-[#EF4444] dark:text-[#F87171] text-center font-medium">{loadError || 'Employé non trouvé'}</p>
        <button onClick={() => navigate('/')} className="mt-5 px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-[#10B981]/25">
          Retour à l'accueil
        </button>
      </div>
    )
  }

  const employeInfo = {
    ...currentEmploye,
    poste: currentPoste?.titre_poste || 'Non défini',
    service: currentService?.nom || 'Non défini',
    entreprise: currentEntreprise?.nom || 'Non défini'
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'paies': return <EmployePaiePage />
      case 'conges': return <EmployeCongesPage />
      case 'presences': return <EmployePresencesPage />
      case 'documents': return <EmployeDocumentsPage />
      case 'avantages': return <EmployeAvantagesPage />
      case 'notifications': return <EmployeNotificationsPage />
      case 'parametres': return <EmployeParametresPage />
      case 'profil': return <EmployeProfilPage user={currentUser} employe={employeInfo} stats={stats} formatCurrency={formatCurrency} />
      default:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pb-24">
            {/* Header */}
            <motion.div variants={slideUp} initial="initial" animate="animate" 
              className="relative overflow-hidden bg-gradient-to-br from-[#10B981] via-[#34D399] to-[#6EE7B7] dark:from-[#065F46] dark:via-[#047857] dark:to-[#059669] rounded-2xl p-5 shadow-xl shadow-[#10B981]/20">
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                    <span className="text-white font-bold text-xl">{currentEmploye?.prenom?.[0] || currentUser?.prenom?.[0] || 'E'}</span>
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-base">
                      {currentEmploye?.prenom || currentUser?.prenom || currentUser?.name} {currentEmploye?.nom || currentUser?.nom || ''}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-white/80 text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <FontAwesomeIcon icon={faEnvelope} className="text-[8px]" />
                        {currentUser?.email}
                      </span>
                      <span className="text-white/70 text-[10px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full">
                        {currentEmploye?.matricule || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] text-white bg-green-300/20 px-2.5 py-0.5 rounded-full">
                        <FontAwesomeIcon icon={faCircle} className="text-[5px] text-[#86EFAC]" />
                        {currentEmploye?.statut || 'Actif'}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={fetchDashboardData} disabled={isRefreshing}
                  className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/30 transition-all">
                  <FontAwesomeIcon icon={faSpinner} className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-4 gap-2">
              {[
                { label: 'Présents', value: stats.jours_presence || 0, icon: faUserCheck, color: '#10B981' },
                { label: 'Retards', value: stats.jours_retard || 0, icon: faClock, color: '#F59E0B' },
                { label: 'Congés', value: stats.conges_approuves || 0, icon: faCalendarAlt, color: '#3B82F6' },
                { label: 'Docs', value: stats.documents_total || 0, icon: faFileLines, color: '#8B5CF6' },
              ].map((item, index) => (
                <motion.div key={index} variants={slideUp} whileHover={{ y: -2 }} className="bg-white dark:bg-[#1E293B] rounded-xl p-3 shadow-sm border border-[#E2E8F0] dark:border-[#334155] transition-all">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8] font-medium">{item.label}</p>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + '15' }}>
                      <FontAwesomeIcon icon={item.icon} className="w-3 h-3" style={{ color: item.color }} />
                    </div>
                  </div>
                  <p className="font-bold text-lg" style={{ color: item.color }}>{item.value}</p>
                  <div className="w-full h-1 bg-[#E2E8F0] dark:bg-[#334155] rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: item.color }} />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* KPI Cards */}
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 gap-3">
              {[
                { icon: faWallet, label: 'Dernière paie', value: formatCurrency(stats.dernier_salaire || 0) },
                { icon: faCoins, label: 'Cumul annuel', value: formatCurrency(stats.cumul_annuel || 0) },
                { icon: faFileLines, label: 'Documents', value: stats.documents_total || 0 },
                { icon: faUserCheck, label: 'Présences', value: `${stats.jours_presence || 0}j` },
              ].map((item, index) => (
                <motion.div key={index} variants={slideUp} whileHover={{ y: -2 }} className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-[#E2E8F0] dark:border-[#334155] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#10B981]/10 dark:bg-[#10B981]/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={item.icon} className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8] font-medium">{item.label}</p>
                      <p className="font-semibold text-[#0F172A] dark:text-white text-sm truncate">{item.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Graphiques */}
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 gap-4">
              <motion.div variants={slideUp} className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartPie} className="text-[#10B981]" />
                    Présences du mois
                  </h3>
                  <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#334155] px-2.5 py-0.5 rounded-full">
                    {currentMonthPresences.length} enreg.
                  </span>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={presenceData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {presenceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', border: 'none', borderRadius: '8px', color: isDark ? '#FFFFFF' : '#0F172A' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={slideUp} className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-[#10B981]" />
                    Statistiques des congés
                  </h3>
                  <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#334155] px-2.5 py-0.5 rounded-full">
                    {userConges.length} demandes
                  </span>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={congesData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {congesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', border: 'none', borderRadius: '8px', color: isDark ? '#FFFFFF' : '#0F172A' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </motion.div>

            {/* Dernières paies */}
            <motion.div variants={slideUp} className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-[#E2E8F0] dark:border-[#334155]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faReceipt} className="text-[#10B981]" />
                  Dernières paies
                </h3>
                {userPaies.length > 0 && (
                  <span className="text-[9px] text-[#10B981] bg-[#10B981]/10 dark:bg-[#10B981]/20 px-2.5 py-0.5 rounded-full font-medium">
                    {userPaies.length}
                  </span>
                )}
              </div>
              {userPaies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <FontAwesomeIcon icon={faReceipt} className="w-8 h-8 text-[#94A3B8] dark:text-[#475569] mb-2" />
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Aucune paie disponible</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userPaies.slice(0, 3).map((paie: any, index: number) => (
                    <motion.div key={paie.id_paie} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
                      className="flex items-center justify-between p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#10B981]/10 dark:bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4 text-[#10B981]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0F172A] dark:text-white text-sm">
                            {paie.mois_paiement} {paie.annee_paiement}
                          </p>
                          <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8]">#{paie.id_paie}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-bold text-[#0F172A] dark:text-white text-sm">
                          {formatCurrency(Number(paie.montant || 0))}
                        </p>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                          paie.statut === 'Payee' || paie.statut === 'payée' || paie.statut === 'Payée'
                            ? 'bg-[#10B981]/10 text-[#10B981] dark:bg-[#10B981]/20' 
                            : 'bg-[#F59E0B]/10 text-[#F59E0B] dark:bg-[#F59E0B]/20'
                        }`}>
                          {paie.statut || 'Générée'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Congés et Avantages */}
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
              <motion.div variants={slideUp} className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-[#10B981]" />
                    Mes congés
                  </h3>
                  {stats.conges_en_attente > 0 && (
                    <span className="text-[9px] text-[#F59E0B] bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 px-2.5 py-0.5 rounded-full font-medium">
                      {stats.conges_en_attente} en attente
                    </span>
                  )}
                </div>
                {userConges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-8 h-8 text-[#94A3B8] dark:text-[#475569] mb-2" />
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Aucune demande de congé</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {userConges.slice(0, 3).map((conge: any, index: number) => {
                      const statusColors: { [key: string]: string } = {
                        'Approuve': 'bg-[#10B981]/10 text-[#10B981] dark:bg-[#10B981]/20',
                        'En attente': 'bg-[#F59E0B]/10 text-[#F59E0B] dark:bg-[#F59E0B]/20',
                        'Refuse': 'bg-[#EF4444]/10 text-[#EF4444] dark:bg-[#EF4444]/20',
                      }
                      const statusIcons: { [key: string]: any } = {
                        'Approuve': faCheckCircle,
                        'En attente': faHourglassHalf,
                        'Refuse': faTimesCircle,
                      }
                      return (
                        <motion.div key={conge.id_conge} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
                          className="flex items-center justify-between p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                              <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-[#3B82F6]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#0F172A] dark:text-white text-sm">{conge.type_conge}</p>
                              <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8]">
                                {conge.date_debut} → {conge.date_fin} ({conge.nombre_jours}j)
                              </p>
                            </div>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 flex-shrink-0 ml-2 ${statusColors[conge.statut] || 'bg-[#E2E8F0] text-[#64748B] dark:bg-[#334155] dark:text-[#94A3B8]'}`}>
                            <FontAwesomeIcon icon={statusIcons[conge.statut] || faCircle} className="w-2.5 h-2.5" />
                            {conge.statut}
                          </span>
                        </motion.div>
                      )
                    })}
                    {userConges.length > 3 && (
                      <p className="text-[9px] text-center text-[#64748B] dark:text-[#94A3B8]">+ {userConges.length - 3} autres demandes</p>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.div variants={slideUp} className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white flex items-center gap-2">
                    <FontAwesomeIcon icon={faGift} className="text-[#10B981]" />
                    Mes avantages
                  </h3>
                  {stats.avantages_total > 0 && (
                    <span className="text-[9px] text-[#10B981] bg-[#10B981]/10 dark:bg-[#10B981]/20 px-2.5 py-0.5 rounded-full font-medium">
                      {stats.avantages_total}
                    </span>
                  )}
                </div>
                {userAvantages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <FontAwesomeIcon icon={faGift} className="w-8 h-8 text-[#94A3B8] dark:text-[#475569] mb-2" />
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Aucun avantage disponible</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {userAvantages.slice(0, 3).map((avantage: any, index: number) => (
                      <motion.div key={avantage.id_avantage} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
                        className="flex items-center justify-between p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faGift} className="w-4 h-4 text-[#F59E0B]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#0F172A] dark:text-white text-sm truncate">{avantage.libelle}</p>
                            <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8]">{avantage.type_avantage}</p>
                          </div>
                        </div>
                        <span className="font-bold text-[#10B981] dark:text-[#34D399] text-sm flex-shrink-0 ml-2">
                          {formatCurrency(Number(avantage.valeur || 0))}
                        </span>
                      </motion.div>
                    ))}
                    {userAvantages.length > 3 && (
                      <p className="text-[9px] text-center text-[#64748B] dark:text-[#94A3B8]">+ {userAvantages.length - 3} autres avantages</p>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A]">
        {/* Sidebar */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-[#1E293B] shadow-xl border-r border-[#E2E8F0] dark:border-[#334155] flex-col">
          <div className="flex items-center p-5 border-b border-[#E2E8F0] dark:border-[#334155] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg shadow-[#10B981]/25">
                <span className="text-white font-bold text-sm">RH</span>
              </div>
              <div>
                <span className="font-bold text-[#0F172A] dark:text-white text-base">RH<span className="text-[#10B981]">Pro</span></span>
                <p className="text-[8px] text-[#64748B] dark:text-[#94A3B8] font-medium">Gestion RH</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-b border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center gap-3 p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg shadow-[#10B981]/20 flex-shrink-0">
                <span className="text-white font-bold text-sm">{currentEmploye?.prenom?.[0] || currentUser?.prenom?.[0] || 'E'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0F172A] dark:text-white text-sm truncate">
                  {currentEmploye?.prenom || currentUser?.prenom || currentUser?.name}
                </p>
                <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8] truncate font-mono">{currentEmploye?.matricule || 'N/A'}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {MAIN_MENU_ITEMS.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(item.path, item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  activeSection === item.id 
                    ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/25' 
                    : item.id === 'logout'
                      ? 'text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#450A0A]'
                      : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]'
                }`}>
                <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 ${activeSection === item.id ? 'text-white' : ''}`} />
                <span>{item.label}</span>
                {activeSection === item.id && <div className="ml-auto w-1 h-5 rounded-full bg-white/50" />}
              </motion.button>
            ))}
          </nav>

          <div className="p-4 border-t border-[#E2E8F0] dark:border-[#334155] flex-shrink-0">
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#450A0A] transition-all text-sm font-medium">
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Overlay mobile */}
        <AnimatePresence>
          {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" />}
        </AnimatePresence>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-[260px]">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-[#334155] px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors text-[#475569] dark:text-[#94A3B8]">
                  <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg shadow-[#10B981]/25">
                    <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold text-[#0F172A] dark:text-white text-sm">Mon Espace</span>
                    <span className="text-[8px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                      {currentEmploye?.prenom || currentUser?.prenom || currentUser?.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell notifications={notifications} onMarkAsRead={handleMarkAsRead} onMarkAllAsRead={handleMarkAllAsRead} onDelete={handleDelete} />
                <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors">
                  <FontAwesomeIcon icon={isDark ? faSun : faMoon} className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-[#475569]'}`} />
                </button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 pb-28 lg:pb-6">
            <AnimatePresence mode="wait">
              <div key={activeSection} className="max-w-lg mx-auto">
                {renderContent()}
              </div>
            </AnimatePresence>
          </main>
        </div>

        {/* Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl border-t border-[#E2E8F0] dark:border-[#334155] shadow-lg px-2 pb-3 pt-1">
          <div className="flex items-center justify-around relative">
            {CIRCLE_MENU_ITEMS.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button key={item.id} onClick={() => handleNavigation(`/dashboard/employe/${item.id === 'dashboard' ? '' : item.id}`, item.id)}
                  className="flex flex-col items-center py-1 px-2 relative">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-[#10B981] shadow-lg shadow-[#10B981]/30' : 'hover:bg-[#F1F5F9] dark:hover:bg-[#334155]'}`}>
                    <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 transition-all ${isActive ? 'text-white' : 'text-[#64748B] dark:text-[#94A3B8]'}`} />
                  </div>
                  <span className={`text-[8px] font-medium mt-0.5 ${isActive ? 'text-[#10B981]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
                    {item.label}
                  </span>
                  {isActive && <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#10B981]" />}
                </button>
              )
            })}

            <button onClick={() => setShowCircleMenu(true)} className="flex flex-col items-center py-1 px-2 relative">
              <div className="w-13 h-13 rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center shadow-xl shadow-[#10B981]/30 border-3 border-white dark:border-[#1E293B]">
                <FontAwesomeIcon icon={faTh} className="w-5 h-5 text-white" />
              </div>
              <span className="text-[8px] font-medium mt-0.5 text-[#10B981]">Menu</span>
            </button>
          </div>
        </div>

        {/* Modal Menu Circulaire */}
        <AnimatePresence>
          {showCircleMenu && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setShowCircleMenu(false)}>
              <div className="relative w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setShowCircleMenu(false)} className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#1E293B] shadow-lg flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155]">
                  <FontAwesomeIcon icon={faXmark} className="w-4 h-4 text-[#475569] dark:text-[#94A3B8]" />
                </button>
                <div className="text-center mb-5">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <FontAwesomeIcon icon={faTh} className="text-[#10B981] text-xs" />
                    <span className="text-white font-medium text-sm">Menu Principal</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl">
                  {MAIN_MENU_ITEMS.map((item) => {
                    const isActive = activeSection === item.id
                    const isLogout = item.id === 'logout'
                    return (
                      <button key={item.id} onClick={() => {
                        if (isLogout) navigate('/')
                        else handleNavigation(`/dashboard/employe/${item.id === 'dashboard' ? '' : item.id}`, item.id)
                      }} className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                        isActive ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30' : isLogout
                          ? 'bg-[#FEE2E2] dark:bg-[#450A0A] text-[#EF4444] hover:bg-[#FECACA] dark:hover:bg-[#7F1D1D]'
                          : 'bg-white/80 dark:bg-[#1E293B]/80 text-[#475569] dark:text-[#94A3B8] hover:bg-white dark:hover:bg-[#334155]'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-white/20' : isLogout ? 'bg-[#EF4444]/10' : 'bg-[#F1F5F9] dark:bg-[#334155]'}`}>
                          <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 ${isActive ? 'text-white' : isLogout ? 'text-[#EF4444]' : 'text-[#64748B] dark:text-[#94A3B8]'}`} />
                        </div>
                        <span className={`text-[8px] font-medium mt-1.5 ${isActive ? 'text-white' : isLogout ? 'text-[#EF4444]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="text-center mt-4">
                  <span className="text-[8px] text-white/30">Mon Espace v2.0</span>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Composant Profil
const EmployeProfilPage = ({ user, employe, stats, formatCurrency }: any) => {
  return (
    <div className="space-y-4 pb-24">
      <div className="bg-white dark:bg-[#1E293B] rounded-xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 dark:bg-[#10B981]/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faUserTie} className="w-4 h-4 text-[#10B981]" />
          </div>
          <h2 className="text-base font-semibold text-[#0F172A] dark:text-white">Mon Profil</h2>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center shadow-xl shadow-[#10B981]/25 ring-4 ring-[#10B981]/10">
            <span className="text-white font-bold text-3xl">
              {employe?.prenom?.[0] || user?.prenom?.[0] || user?.name?.[0] || 'E'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mt-3">
            {employe?.prenom || user?.prenom || user?.name} {employe?.nom || user?.nom || ''}
          </h3>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-[#10B981] bg-[#10B981]/10 dark:bg-[#10B981]/20 px-3 py-0.5 rounded-full font-medium">
              {employe?.matricule || 'N/A'}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#10B981] bg-[#10B981]/10 dark:bg-[#10B981]/20 px-3 py-0.5 rounded-full font-medium">
              <FontAwesomeIcon icon={faCircle} className="text-[5px] text-[#10B981]" />
              {employe?.statut || 'Actif'}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {[
            { icon: faBriefcase, label: 'Poste', value: employe?.poste || 'Non défini' },
            { icon: faBuildingUser, label: 'Service', value: employe?.service || 'Non défini' },
            { icon: faBuilding, label: 'Entreprise', value: employe?.entreprise || 'Non définie' },
            { icon: faCalendar, label: 'Embauche', value: employe?.date_embauche ? new Date(employe.date_embauche).toLocaleDateString('fr-FR') : 'Non renseignée' },
          ].map((item, index) => (
            <div key={index} className="p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg">
              <p className="text-[8px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                <FontAwesomeIcon icon={item.icon} className="w-2.5 h-2.5 text-[#10B981]" />
                {item.label}
              </p>
              <p className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {[
            { label: 'Congés restants', value: `${20 - (stats?.conges_approuves || 0)} jours`, color: '#10B981' },
            { label: 'Présences ce mois', value: `${stats?.jours_presence || 0} jours`, color: '#3B82F6' },
            { label: 'Documents', value: stats?.documents_total || 0, color: '#8B5CF6' },
            { label: 'Avantages', value: stats?.avantages_total || 0, color: '#F59E0B' },
          ].map((item, index) => (
            <div key={index} className="p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg text-center">
              <p className="text-[8px] text-[#64748B] dark:text-[#94A3B8]">{item.label}</p>
              <p className="font-semibold text-sm" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}