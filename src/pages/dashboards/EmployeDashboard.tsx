import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse,
  faDollarSign,
  faClock,
  faFileLines,
  faRightFromBracket,
  faBars,
  faXmark,
  faSun,
  faMoon,
  faBell,
  faUser,
  faGear,
  faChartPie,
  faSpinner,
  faCircleExclamation,
  faCalendarAlt,
  faUserCheck,
  faEnvelope,
  faGift,
  faWallet,
  faReceipt,
  faCircle,
  faTh
} from '@fortawesome/free-solid-svg-icons'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts'
import { NotificationBell } from '../../components/NotificationBell'
import { notificationAPI } from '../../services/api'
import { loadDashboardContext } from '../../services/dashboardData'
import { EmployeCongesPage } from './EmployeCongesPage'
import { EmployeDocumentsPage } from './EmployeDocumentsPage'
import { EmployeNotificationsPage } from './EmployeNotificationsPage'
import { EmployeParametresPage } from './EmployeParametresPage'
import { EmployePaiePage } from './EmployePaiePage'
import { EmployePresencesPage } from './EmployePresencesPage'
import { EmployeAvantagesPage } from './EmployeAvantagesPage'

// Animations
const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

const floatAnimation = {
  animate: {
    y: [0, -4, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Items du menu
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

  const fetchData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const context = await loadDashboardContext(true)
      setDashboardData(context)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger votre espace personnel.')
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
    loadDashboardContext(true)
      .then((context) => {
        if (mounted) {
          setDashboardData(context)
        }
      })
      .catch((error) => {
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : 'Impossible de charger votre espace personnel.')
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
    const intervalId = window.setInterval(() => void loadNotifications(), 10000)
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
    if (id === 'logout') {
      navigate('/')
      return
    }
    setShowCircleMenu(false)
    navigate(path)
  }, [navigate])

  const user = dashboardData?.user
  const userPaies = useMemo(() => {
    if (!dashboardData?.fichesPaie) return []
    return [...dashboardData.fichesPaie].sort((first: any, second: any) => {
      const firstPeriod = Number(first.annee_paiement) * 100 + Number(first.mois_paiement)
      const secondPeriod = Number(second.annee_paiement) * 100 + Number(second.mois_paiement)
      return secondPeriod - firstPeriod || Number(second.id_paie) - Number(first.id_paie)
    })
  }, [dashboardData])

  const userConges = useMemo(() => dashboardData?.conges || [], [dashboardData])
  const userPresences = useMemo(() => dashboardData?.presences || [], [dashboardData])
  const userDocuments = useMemo(() => dashboardData?.documents || [], [dashboardData])
  const userAvantages = useMemo(() => dashboardData?.avantages || [], [dashboardData])

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const normalizeStatus = useCallback((status: string | undefined) => 
    (status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  , [])

  const currentMonthPresences = useMemo(() => {
    return userPresences.filter((presence: any) => {
      const date = new Date(`${presence.date_presence}T00:00:00`)
      return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth
    })
  }, [userPresences, currentYear, currentMonth])

  const stats = useMemo(() => ({
    dernierSalaire: Number(userPaies[0]?.montant || 0),
    cumulAnnuel: userPaies
      .filter((paie: any) => Number(paie.annee_paiement) === currentYear)
      .reduce((sum: number, paie: any) => sum + Number(paie.montant || 0), 0),
    joursPresence: currentMonthPresences.filter((presence: any) => normalizeStatus(presence.statut) === 'present').length,
    joursRetard: currentMonthPresences.filter((presence: any) => normalizeStatus(presence.statut) === 'retard').length,
    joursAbsence: currentMonthPresences.filter((presence: any) => normalizeStatus(presence.statut) === 'absent').length,
    congesEnAttente: userConges.filter((c: any) => c.statut === 'En attente').length,
    congesApprouves: userConges.filter((c: any) => c.statut === 'Approuve').length,
    documentsTotal: userDocuments.length,
    avantagesTotal: userAvantages.length,
  }), [userPaies, userConges, userPresences, userDocuments, userAvantages, currentYear, currentMonthPresences, normalizeStatus])

  const formatCurrency = useCallback((amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount), [])

  const presenceData = useMemo(() => [
    { name: 'Présents', value: stats.joursPresence, color: '#00A86B' },
    { name: 'Retards', value: stats.joursRetard, color: '#F5A623' },
    { name: 'Absences', value: stats.joursAbsence, color: '#FF4757' },
  ], [stats])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] dark:bg-[#0F172A]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="w-12 h-12 rounded-full border-4 border-[#E8F5EE] dark:border-[#00A86B]/30 border-t-[#00A86B] dark:border-t-[#00A86B]"></div>
        </motion.div>
        <p className="mt-4 text-sm text-[#4A5568] dark:text-[#94A3B8] font-medium">Chargement...</p>
      </div>
    )
  }

  if (loadError || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] dark:bg-[#0F172A] p-6">
        <div className="w-16 h-16 rounded-full bg-[#FFF0F0] dark:bg-[#FF4757]/20 flex items-center justify-center mb-4">
          <FontAwesomeIcon icon={faCircleExclamation} className="w-8 h-8 text-[#FF4757]" />
        </div>
        <p className="text-[#FF4757] dark:text-[#FF4757] text-center font-medium text-sm">
          {loadError || 'Votre identité n\'a pas pu être vérifiée.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2.5 bg-[#00A86B] text-white rounded-2xl shadow-lg shadow-[#00A86B]/30 text-sm font-medium"
        >
          Retour
        </button>
      </div>
    )
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
      case 'profil': return <EmployeProfilPage user={user} stats={stats} formatCurrency={formatCurrency} />
      default:
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 pb-20"
          >
            {/* Header profil */}
            <motion.div 
              variants={slideUp}
              initial="initial"
              animate="animate"
              className="relative overflow-hidden bg-gradient-to-r from-[#00A86B] via-[#00B97A] to-[#00C97A] rounded-3xl p-5 shadow-xl shadow-[#00A86B]/25"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <span className="text-white font-bold text-2xl">{user.prenom?.[0] || 'E'}</span>
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg leading-tight">
                        {user.prenom} {user.nom}
                      </h2>
                      <p className="text-white/80 text-xs flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faEnvelope} className="text-[10px]" />
                        <span className="truncate max-w-[150px]">{user.email}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/70 text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full">
                          {user.matricule}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
                          <FontAwesomeIcon icon={faCircle} className="text-[6px] text-[#00FF88]" />
                          Actif
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button 
                      onClick={fetchData}
                      disabled={isRefreshing}
                      className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20"
                    >
                      <FontAwesomeIcon icon={faSpinner} className={`w-3.5 h-3.5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <span className="text-[10px] text-white/60 font-medium">RH Pro</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-4 gap-2"
            >
              {[
                { label: 'Présents', value: stats.joursPresence, color: '#00A86B', max: 22 },
                { label: 'Retards', value: stats.joursRetard, color: '#F5A623', max: 22 },
                { label: 'Congés', value: stats.congesApprouves, color: '#0088CC', max: 30 },
                { label: 'Docs', value: stats.documentsTotal, color: '#6C5CE7', max: 10 },
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  variants={slideUp}
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-[#1E293B] rounded-2xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-[#F0F0F0] dark:border-[#2D3748]"
                >
                  <p className="text-[10px] text-[#718096] dark:text-[#94A3B8] text-center">{item.label}</p>
                  <p className="text-center font-bold text-lg" style={{ color: item.color }}>
                    {item.value}
                  </p>
                  <div className="w-full h-1 bg-[#F0F0F0] dark:bg-[#2D3748] rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ 
                      width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                      backgroundColor: item.color 
                    }} />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* KPI Cards */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 gap-3"
            >
              {[
                { icon: faWallet, label: 'Dernière paie', value: formatCurrency(stats.dernierSalaire), color: '#00A86B', bg: '#E8F5EE' },
                { icon: faChartPie, label: 'Cumul annuel', value: formatCurrency(stats.cumulAnnuel), color: '#0088CC', bg: '#E8F4F9' },
                { icon: faFileLines, label: 'Documents', value: stats.documentsTotal, color: '#6C5CE7', bg: '#F0EEFF' },
                { icon: faUserCheck, label: 'Présences', value: `${stats.joursPresence}j`, color: '#F5A623', bg: '#FEF8ED' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={slideUp}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-[#F0F0F0] dark:border-[#2D3748]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                      <FontAwesomeIcon icon={item.icon} className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#718096] dark:text-[#94A3B8]">{item.label}</p>
                  <p className="font-bold text-[#1A202C] dark:text-white text-sm">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Graphique Présences - Version corrigée */}
            <motion.div 
              variants={slideUp}
              className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-[#F0F0F0] dark:border-[#2D3748]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartPie} className="text-[#00A86B]" />
                  Présences du mois
                </h3>
                <span className="text-[10px] text-[#718096] dark:text-[#94A3B8]">
                  {currentMonthPresences.length} enreg.
                </span>
              </div>
              <div style={{ width: '100%', height: 180, minHeight: 180 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie 
                      data={presenceData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={35} 
                      outerRadius={60} 
                      paddingAngle={2} 
                      dataKey="value" 
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {presenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ 
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                      border: 'none', 
                      borderRadius: '12px', 
                      color: isDark ? '#FFFFFF' : '#1A202C',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Dernières paies */}
            <motion.div 
              variants={slideUp}
              className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-[#F0F0F0] dark:border-[#2D3748]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faReceipt} className="text-[#00A86B]" />
                  Dernières paies
                </h3>
                {userPaies.length > 0 && (
                  <span className="text-[10px] text-[#00A86B] bg-[#E8F5EE] dark:bg-[#00A86B]/20 px-2 py-0.5 rounded-full">
                    {userPaies.length}
                  </span>
                )}
              </div>
              {userPaies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <FontAwesomeIcon icon={faReceipt} className="w-8 h-8 text-[#CBD5E0] dark:text-[#4A5568] mb-2" />
                  <p className="text-sm text-[#718096] dark:text-[#94A3B8]">Aucune paie</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userPaies.slice(0, 3).map((paie: any, index: number) => (
                    <div 
                      key={paie.id_paie}
                      className="flex items-center justify-between p-3 bg-[#F7FAFC] dark:bg-[#2D3748] rounded-2xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#E8F5EE] dark:bg-[#00A86B]/20 flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon icon={faDollarSign} className="w-3.5 h-3.5 text-[#00A86B]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1A202C] dark:text-white text-sm">
                            {paie.mois_paiement} {paie.annee_paiement}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-bold text-[#1A202C] dark:text-white text-sm">
                          {formatCurrency(Number(paie.montant || 0))}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          paie.statut === 'Payee' 
                            ? 'bg-[#E8F5EE] text-[#00A86B] dark:bg-[#00A86B]/20 dark:text-[#00A86B]' 
                            : 'bg-[#FEF8ED] text-[#F5A623] dark:bg-[#F5A623]/20 dark:text-[#F5A623]'
                        }`}>
                          {paie.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Congés */}
            <motion.div 
              variants={slideUp}
              className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-[#F0F0F0] dark:border-[#2D3748]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-[#00A86B]" />
                  Congés
                </h3>
                {stats.congesEnAttente > 0 && (
                  <span className="text-[10px] text-[#F5A623] bg-[#FEF8ED] dark:bg-[#F5A623]/20 px-2 py-0.5 rounded-full font-medium animate-pulse">
                    {stats.congesEnAttente} en attente
                  </span>
                )}
              </div>
              {userConges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-8 h-8 text-[#CBD5E0] dark:text-[#4A5568] mb-2" />
                  <p className="text-sm text-[#718096] dark:text-[#94A3B8]">Aucune demande</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userConges.slice(0, 2).map((conge: any, index: number) => {
                    const statusColors = {
                      'Approuve': 'bg-[#E8F5EE] text-[#00A86B] dark:bg-[#00A86B]/20 dark:text-[#00A86B]',
                      'En attente': 'bg-[#FEF8ED] text-[#F5A623] dark:bg-[#F5A623]/20 dark:text-[#F5A623]',
                      'Refuse': 'bg-[#FFF0F0] text-[#FF4757] dark:bg-[#FF4757]/20 dark:text-[#FF4757]',
                    }
                    return (
                      <div 
                        key={conge.id_conge}
                        className="flex items-center justify-between p-3 bg-[#F7FAFC] dark:bg-[#2D3748] rounded-2xl"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#F0F7FF] dark:bg-[#0088CC]/20 flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5 text-[#0088CC]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1A202C] dark:text-white text-sm">{conge.type_conge}</p>
                            <p className="text-[10px] text-[#718096] dark:text-[#94A3B8]">
                              {conge.date_debut} → {conge.date_fin}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 flex-shrink-0 ml-2 ${statusColors[conge.statut as keyof typeof statusColors] || 'bg-[#F7FAFC] text-[#718096] dark:bg-[#2D3748] dark:text-[#94A3B8]'}`}>
                          {conge.statut}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Avantages */}
            <motion.div 
              variants={slideUp}
              className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-[#F0F0F0] dark:border-[#2D3748]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faGift} className="text-[#00A86B]" />
                  Avantages
                </h3>
                {stats.avantagesTotal > 0 && (
                  <span className="text-[10px] text-[#00A86B] bg-[#E8F5EE] dark:bg-[#00A86B]/20 px-2 py-0.5 rounded-full">
                    {stats.avantagesTotal}
                  </span>
                )}
              </div>
              {userAvantages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <FontAwesomeIcon icon={faGift} className="w-8 h-8 text-[#CBD5E0] dark:text-[#4A5568] mb-2" />
                  <p className="text-sm text-[#718096] dark:text-[#94A3B8]">Aucun avantage</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userAvantages.slice(0, 2).map((avantage: any, index: number) => (
                    <div 
                      key={avantage.id_avantage}
                      className="flex items-center justify-between p-3 bg-[#F7FAFC] dark:bg-[#2D3748] rounded-2xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#FEF8ED] dark:bg-[#F5A623]/20 flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon icon={faGift} className="w-3.5 h-3.5 text-[#F5A623]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1A202C] dark:text-white text-sm truncate">{avantage.libelle}</p>
                          <p className="text-[10px] text-[#718096] dark:text-[#94A3B8]">{avantage.type_avantage}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#00A86B] dark:text-[#00A86B] text-sm flex-shrink-0 ml-2">
                        {formatCurrency(Number(avantage.valeur || 0))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-[#F5F7FA] dark:bg-[#0F172A]">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-[280px] bg-white dark:bg-[#1A1A2E] shadow-2xl dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] transform transition-all duration-300 flex-col">
          <div className="flex items-center p-4 border-b border-[#F0F0F0] dark:border-[#2D3748] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#00A86B] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">RH</span>
              </div>
              <span className="font-bold text-[#1A202C] dark:text-white">RH<span className="text-[#00A86B]">Pro</span></span>
            </div>
          </div>

          <div className="px-4 py-4 border-b border-[#F0F0F0] dark:border-[#2D3748]">
            <div className="flex items-center gap-3 p-3 bg-[#F7FAFC] dark:bg-[#2D3748] rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A86B] to-[#00C97A] flex items-center justify-center shadow-lg shadow-[#00A86B]/20">
                <span className="text-white font-bold text-sm">{user.prenom?.[0] || 'E'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1A202C] dark:text-white text-sm truncate">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-[10px] text-[#718096] dark:text-[#94A3B8] truncate">{user.matricule}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse"></div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {MAIN_MENU_ITEMS.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium ${
                  activeSection === item.id 
                    ? 'bg-[#00A86B] text-white shadow-lg shadow-[#00A86B]/25' 
                    : item.id === 'logout'
                      ? 'text-[#FF4757] hover:bg-[#FFF0F0] dark:hover:bg-[#FF4757]/10'
                      : 'text-[#4A5568] dark:text-[#94A3B8] hover:bg-[#F7FAFC] dark:hover:bg-[#2D3748]'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : ''}`} />
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <div className="ml-auto w-1.5 h-6 rounded-full bg-white/50" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Overlay mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <div 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-[280px]">
          {/* Header mobile */}
          <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1A1A2E]/95 backdrop-blur-xl border-b border-[#F0F0F0] dark:border-[#2D3748] px-4 py-2.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)} 
                  className="lg:hidden p-2 rounded-xl hover:bg-[#F7FAFC] dark:hover:bg-[#2D3748] transition-colors text-[#4A5568] dark:text-[#94A3B8]"
                >
                  <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2 ml-1">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00A86B] to-[#00C97A] flex items-center justify-center shadow-lg shadow-[#00A86B]/30">
                    <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-[#1A202C] dark:text-white text-sm">
                      Mon Espace
                    </span>
                    <span className="text-[8px] text-[#718096] dark:text-[#94A3B8] font-medium">
                      {user.prenom}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <NotificationBell
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDelete={handleDelete}
                />
                <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-[#F7FAFC] dark:hover:bg-[#2D3748] transition-colors">
                  <FontAwesomeIcon 
                    icon={isDark ? faSun : faMoon} 
                    className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-[#4A5568]'}`} 
                  />
                </button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 pb-28 lg:pb-6">
            <AnimatePresence mode="wait">
              <div
                key={activeSection}
                className="max-w-lg mx-auto"
              >
                {renderContent()}
              </div>
            </AnimatePresence>
          </main>
        </div>

        {/* Bottom Navigation - Style Movie Box */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#1A1A2E]/95 backdrop-blur-xl border-t border-[#F0F0F0] dark:border-[#2D3748] shadow-lg px-2 pb-3 pt-1">
          <div className="flex items-center justify-around relative">
            {CIRCLE_MENU_ITEMS.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(`/dashboard/employe/${item.id === 'dashboard' ? '' : item.id}`, item.id)}
                  className="flex flex-col items-center py-1 px-2 relative"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-[#00A86B] shadow-lg shadow-[#00A86B]/30' 
                      : 'hover:bg-[#F7FAFC] dark:hover:bg-[#2D3748]'
                  }`}>
                    <FontAwesomeIcon 
                      icon={item.icon} 
                      className={`w-5 h-5 transition-all ${
                        isActive ? 'text-white' : 'text-[#718096] dark:text-[#94A3B8]'
                      }`} 
                    />
                  </div>
                  <span className={`text-[9px] font-medium mt-0.5 ${
                    isActive ? 'text-[#00A86B]' : 'text-[#718096] dark:text-[#94A3B8]'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#00A86B]" />
                  )}
                </button>
              )
            })}

            {/* Bouton Menu Central */}
            <button
              onClick={() => setShowCircleMenu(true)}
              className="flex flex-col items-center py-1 px-2 relative"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00A86B] to-[#00C97A] flex items-center justify-center shadow-xl shadow-[#00A86B]/30 border-4 border-white dark:border-[#1A1A2E]">
                <FontAwesomeIcon icon={faTh} className="w-6 h-6 text-white" />
              </div>
              <span className="text-[9px] font-medium mt-0.5 text-[#00A86B]">Menu</span>
            </button>
          </div>
        </div>

        {/* Modal Menu Circulaire */}
        <AnimatePresence>
          {showCircleMenu && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
              onClick={() => setShowCircleMenu(false)}
            >
              <div 
                className="relative w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowCircleMenu(false)}
                  className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-white dark:bg-[#1A1A2E] shadow-lg flex items-center justify-center border border-[#F0F0F0] dark:border-[#2D3748]"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-[#4A5568] dark:text-[#94A3B8]" />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <FontAwesomeIcon icon={faTh} className="text-[#00A86B] text-sm" />
                    <span className="text-white font-bold text-sm">Menu Principal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                  {MAIN_MENU_ITEMS.map((item, index) => {
                    const isActive = activeSection === item.id
                    const isLogout = item.id === 'logout'
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (isLogout) {
                            navigate('/')
                          } else {
                            handleNavigation(`/dashboard/employe/${item.id === 'dashboard' ? '' : item.id}`, item.id)
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                          isActive 
                            ? 'bg-[#00A86B] text-white shadow-lg shadow-[#00A86B]/30' 
                            : isLogout
                              ? 'bg-[#FFF0F0] dark:bg-[#FF4757]/10 text-[#FF4757] hover:bg-[#FFE8E8] dark:hover:bg-[#FF4757]/20'
                              : 'bg-white/80 dark:bg-[#1A1A2E]/80 text-[#4A5568] dark:text-[#94A3B8] hover:bg-white dark:hover:bg-[#2D3748]'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isActive 
                            ? 'bg-white/20' 
                            : isLogout
                              ? 'bg-[#FF4757]/10'
                              : 'bg-[#F7FAFC] dark:bg-[#2D3748]'
                        }`}>
                          <FontAwesomeIcon 
                            icon={item.icon} 
                            className={`w-5 h-5 ${
                              isActive 
                                ? 'text-white' 
                                : isLogout
                                  ? 'text-[#FF4757]'
                                  : 'text-[#4A5568] dark:text-[#94A3B8]'
                            }`} 
                          />
                        </div>
                        <span className={`text-[10px] font-medium mt-1.5 ${
                          isActive 
                            ? 'text-white' 
                            : isLogout
                              ? 'text-[#FF4757]'
                              : 'text-[#4A5568] dark:text-[#94A3B8]'
                        }`}>
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="text-center mt-4">
                  <span className="text-[10px] text-white/40">Mon Espace v2.0</span>
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
const EmployeProfilPage = ({ user, stats, formatCurrency }: any) => {
  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-[#F0F0F0] dark:border-[#2D3748]">
        <h2 className="text-lg font-bold text-[#1A202C] dark:text-white mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-[#00A86B]" />
          Mon Profil
        </h2>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00A86B] to-[#00C97A] flex items-center justify-center shadow-xl shadow-[#00A86B]/20">
            <span className="text-white font-bold text-3xl">{user.prenom?.[0] || 'E'}</span>
          </div>
          <h3 className="text-xl font-bold text-[#1A202C] dark:text-white mt-3">{user.prenom} {user.nom}</h3>
          <p className="text-sm text-[#718096] dark:text-[#94A3B8]">{user.email}</p>
          <p className="text-xs text-[#00A86B] bg-[#E8F5EE] dark:bg-[#00A86B]/20 px-3 py-1 rounded-full mt-2">Matricule: {user.matricule}</p>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex justify-between py-2 border-b border-[#F0F0F0] dark:border-[#2D3748]">
            <span className="text-sm text-[#718096] dark:text-[#94A3B8]">Poste</span>
            <span className="text-sm font-medium text-[#1A202C] dark:text-white">Développeur</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#F0F0F0] dark:border-[#2D3748]">
            <span className="text-sm text-[#718096] dark:text-[#94A3B8]">Département</span>
            <span className="text-sm font-medium text-[#1A202C] dark:text-white">IT</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#F0F0F0] dark:border-[#2D3748]">
            <span className="text-sm text-[#718096] dark:text-[#94A3B8]">Congés restants</span>
            <span className="text-sm font-medium text-[#00A86B]">{20 - stats.congesApprouves} jours</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-[#718096] dark:text-[#94A3B8]">Statut</span>
            <span className="text-sm font-medium text-[#00A86B] flex items-center gap-1">
              <FontAwesomeIcon icon={faCircle} className="text-[6px] text-[#00A86B]" />
              Actif
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}