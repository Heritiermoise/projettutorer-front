import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartPie,
  faChartLine,
  faUsers,
  faUserPlus,
  faFileContract,
  faDollarSign,
  faClock,
  faGear,
  faSignOutAlt,
  faBars,
  faTimes,
  faSun,
  faMoon,
  faSearch,
  faBell,
  faSync,
  faArrowUp,
  faCheckCircle,
  faInfoCircle,
  faCalendarAlt,
  faGift,
  faEnvelope,
  faTimesCircle,
  faHouse,
  faBuilding,
  faCrown
} from '@fortawesome/free-solid-svg-icons'
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { NotificationBell } from '../../components/NotificationBell'
import { RHProLogo } from '../../components/brand/RHProLogo'
import { notificationAPI } from '../../services/api'
import { loadDashboardRHContext } from '../../services/dashboardRHData'

import { RHEmployesPage } from './RHEmployesPage'
import { RHContratsPage } from './RHContratsPage'
import { RHPaiePage } from './RHPaiePage'
import { RHCongesPage } from './RHCongesPage'
import { RHPresencesPage } from './RHPresencesPage'
import { RHAvantagesPage } from './RHAvantagesPage'
import { RHRecrutementPage } from './RHRecrutementPage'
import { RHNotificationsPage } from './RHNotificationsPage'
import { RHParametresPage } from './RHParametresPage'

const SECTIONS_ROUTES = ['employes', 'contrats', 'paie', 'conges', 'presences', 'avantages', 'recrutement', 'notifications', 'parametres']

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
}

const floatAnimation = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const RHDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [notifications, setNotifications] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const context = await loadDashboardRHContext()
      setDashboardData(context)
    } catch (err) {
      console.error("Erreur lors du chargement du contexte RH :", err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData(false)

    const intervalId = setInterval(() => {
      fetchData(true)
    }, 60000)

    return () => clearInterval(intervalId)
  }, [fetchData])

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
      console.error('Erreur lors du chargement des notifications RH :', error)
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
    const intervalId = window.setInterval(() => void loadNotifications(), 10000)
    return () => window.clearInterval(intervalId)
  }, [loadNotifications])

  const toggleDark = () => {
    const newDarkState = !isDark
    setIsDark(newDarkState)
    document.documentElement.classList.toggle('dark', newDarkState)
  }

  const handleMarkAsRead = (id: number) => {
    void notificationAPI.markRead(id).then(loadNotifications).catch(console.error)
  }

  const handleMarkAllAsRead = () => {
    void notificationAPI.markAllRead().then(loadNotifications).catch(console.error)
  }

  const handleDelete = (id: number) => {
    void notificationAPI.delete(id).then(loadNotifications).catch(console.error)
  }

  const menuItems = useMemo(() => [
    { icon: faHouse, label: 'Dashboard', id: 'dashboard', path: '/dashboard/rh' },
    { icon: faUsers, label: 'Employés', id: 'employes', path: '/dashboard/rh/employes' },
    { icon: faFileContract, label: 'Contrats', id: 'contrats', path: '/dashboard/rh/contrats' },
    { icon: faDollarSign, label: 'Paie', id: 'paie', path: '/dashboard/rh/paie' },
    { icon: faCalendarAlt, label: 'Congés', id: 'conges', path: '/dashboard/rh/conges' },
    { icon: faClock, label: 'Présences', id: 'presences', path: '/dashboard/rh/presences' },
    { icon: faGift, label: 'Avantages', id: 'avantages', path: '/dashboard/rh/avantages' },
    { icon: faUserPlus, label: 'Recrutement', id: 'recrutement', path: '/dashboard/rh/recrutement' },
    { icon: faBell, label: 'Notifications', id: 'notifications', path: '/dashboard/rh/notifications' },
    { icon: faGear, label: 'Paramètres', id: 'parametres', path: '/dashboard/rh/parametres' },
  ], [])

  const activeSection = useMemo(() => {
    const path = location.pathname
    for (const section of SECTIONS_ROUTES) {
      if (path.includes('/' + section)) return section
    }
    return 'dashboard'
  }, [location.pathname])

  const rawEmployes = useMemo(() => dashboardData?.employes || [], [dashboardData])
  const contrats = useMemo(() => dashboardData?.contrats || [], [dashboardData])
  const conges = useMemo(() => dashboardData?.conges || [], [dashboardData])
  const presences = useMemo(() => dashboardData?.presences || [], [dashboardData])
  const services = useMemo(() => dashboardData?.services || [], [dashboardData])
  const postes = useMemo(() => dashboardData?.postes || [], [dashboardData])
  const entrepriseActuelle = useMemo(() => dashboardData?.entreprise, [dashboardData])

  const employes = useMemo(() => {
    if (!rawEmployes.length) return []
    return rawEmployes.filter((emp: any) => {
      const roleName = emp.role_name || emp.role?.name || emp.user?.role_name || emp.user?.role?.name || 'employe'
      return roleName.toLowerCase() === 'employe'
    })
  }, [rawEmployes])

  const stats = useMemo(() => ({
    totalEmployes: employes.length,
    contratsActifs: contrats.filter((c: any) => c.statut === 'Actif').length,
    congesEnAttente: conges.filter((c: any) => c.statut === 'En attente').length,
    masseSalariale: contrats.reduce((sum: number, c: any) => sum + Number(c.salaire_base || 0), 0),
    presencesAujourdhui: presences.filter((p: any) => p.statut === 'Present').length,
    offresActives: dashboardData?.offres?.length || 0,
  }), [employes, contrats, conges, presences, dashboardData])

  const kpiCards = useMemo(() => [
    { 
      icon: faUsers, 
      label: 'Total Employés', 
      value: stats.totalEmployes, 
      change: '+12', 
      color: 'from-violet-500 to-indigo-600',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      iconBg: 'bg-violet-100 dark:bg-violet-900/40'
    },
    { 
      icon: faFileContract, 
      label: 'Contrats Actifs', 
      value: stats.contratsActifs, 
      change: '+3', 
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40'
    },
    { 
      icon: faDollarSign, 
      label: 'Masse Salariale', 
      value: '$' + (stats.masseSalariale / 1000).toFixed(1) + 'K', 
      change: '+8%', 
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40'
    },
    { 
      icon: faCalendarAlt, 
      label: 'Congés en attente', 
      value: stats.congesEnAttente, 
      change: '', 
      color: 'from-rose-500 to-pink-600',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      iconBg: 'bg-rose-100 dark:bg-rose-900/40'
    },
  ], [stats])

  const evolutionData = useMemo(() => [
    { mois: 'Jan', employes: stats.totalEmployes > 5 ? stats.totalEmployes - 5 : 2, nouveaux: 2 },
    { mois: 'Fév', employes: stats.totalEmployes > 4 ? stats.totalEmployes - 4 : 3, nouveaux: 1 },
    { mois: 'Mar', employes: stats.totalEmployes > 2 ? stats.totalEmployes - 2 : 4, nouveaux: 2 },
    { mois: 'Avr', employes: stats.totalEmployes > 1 ? stats.totalEmployes - 1 : 5, nouveaux: 1 },
    { mois: 'Mai', employes: stats.totalEmployes, nouveaux: 3 },
  ], [stats.totalEmployes])

  const COLORS = useMemo(() => ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'], [])

  // Composant KPI Card avec animation
  const KPICard = ({ kpi, index }: { kpi: any, index: number }) => (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ delay: index * 0.08 }}
      whileHover={{ 
        y: -6,
        scale: 1.02,
        transition: { type: "spring", stiffness: 300 }
      }}
      className={`${kpi.bg} dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm transition-all duration-300 group relative overflow-hidden`}
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
      <div className="flex items-center justify-between mb-4 relative z-10">
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`w-12 h-12 rounded-xl ${kpi.iconBg} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all`}
        >
          <FontAwesomeIcon icon={kpi.icon} className={`w-6 h-6 bg-gradient-to-br ${kpi.color} bg-clip-text text-transparent`} />
        </motion.div>
        {kpi.change && (
          <motion.span 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 + 0.2 }}
            className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5"
          >
            <FontAwesomeIcon icon={faArrowUp} className="w-3 h-3" />
            {kpi.change}
          </motion.span>
        )}
      </div>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1 relative z-10">{kpi.label}</p>
      <motion.p 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.08 + 0.1, type: "spring", stiffness: 200 }}
        className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white relative z-10"
      >
        {kpi.value}
      </motion.p>
      <motion.div 
        className="mt-2 h-1 w-16 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative z-10"
      >
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: index * 0.08 + 0.2, duration: 1, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${kpi.color} rounded-full`}
        />
      </motion.div>
    </motion.div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'employes': return <RHEmployesPage />
      case 'contrats': return <RHContratsPage />
      case 'paie': return <RHPaiePage />
      case 'conges': return <RHCongesPage />
      case 'presences': return <RHPresencesPage />
      case 'avantages': return <RHAvantagesPage />
      case 'recrutement': return <RHRecrutementPage />
      case 'notifications': return <RHNotificationsPage />
      case 'parametres': return <RHParametresPage />
      default:
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Header Dashboard */}
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl"
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  variants={floatAnimation}
                  animate="animate"
                  className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl shadow-primary-500/30"
                >
                  <FontAwesomeIcon icon={faChartPie} className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-primary-600 to-slate-800 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent bg-300 animate-gradient">
                    Tableau de bord RH
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-300">
                      <FontAwesomeIcon icon={faUsers} className="text-xs" />
                      {stats.totalEmployes} employés
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-300">
                      <FontAwesomeIcon icon={faFileContract} className="text-xs" />
                      {stats.contratsActifs} contrats actifs
                    </span>
                    {entrepriseActuelle && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-slate-600 dark:text-slate-400">
                          <FontAwesomeIcon icon={faBuilding} className="text-xs" />
                          {entrepriseActuelle.nom}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm transition-all text-sm font-medium"
                >
                  <FontAwesomeIcon icon={faSync} className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-500' : 'text-slate-400'}`} />
                  <span>{isRefreshing ? 'Mise à jour...' : 'Actualiser'}</span>
                </motion.button>
              </div>
            </motion.div>

            {/* KPI Cards */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {kpiCards.map((kpi, index) => (
                <KPICard key={index} kpi={kpi} index={index} />
              ))}
            </motion.div>

            {/* Graphiques */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Évolution des effectifs */}
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60"
              >
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartLine} className="text-primary-500" />
                  Évolution des effectifs
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} opacity={0.3} />
                    <XAxis dataKey="mois" stroke={isDark ? '#94a3b8' : '#9ca3af'} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#9ca3af'} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="employes" name="Total Employés" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="nouveaux" name="Nouveaux" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Répartition par service */}
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60"
              >
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartPie} className="text-primary-500" />
                  Répartition par service
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={services.map((service: any) => ({ 
                        name: service.nom || service.libelle || 'Service', 
                        value: employes.filter((e: any) => postes.some((p: any) => Number(p.id_service) === Number(service.id_service) && Number(p.id_poste) === Number(e.id_poste))).length 
                      }))} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={100} 
                      paddingAngle={5} 
                      dataKey="value" 
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {services.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>

            {/* Derniers employés et Congés */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Derniers employés */}
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60"
              >
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUserPlus} className="text-primary-500" />
                  Derniers employés ajoutés
                </h3>
                <div className="space-y-3">
                  {employes.slice(0, 5).map((emp: any, index: number) => (
                    <motion.div 
                      key={emp.matricule || emp.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${
                            emp.sexe === 'M' 
                              ? 'from-violet-500 to-indigo-600' 
                              : 'from-pink-500 to-rose-600'
                          } shadow-md`}
                        >
                          <span className="text-white font-bold text-sm">{emp.prenom?.[0] || 'E'}</span>
                        </motion.div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm">{emp.prenom} {emp.nom}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3" />
                            {emp.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                        {emp.statut || 'Actif'}
                      </span>
                    </motion.div>
                  ))}
                  {employes.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">Aucun employé trouvé.</p>
                  )}
                </div>
              </motion.div>

              {/* Demandes de congés */}
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60"
              >
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-500" />
                  Demandes de congés
                  {stats.congesEnAttente > 0 && (
                    <span className="ml-2 text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium">
                      {stats.congesEnAttente} en attente
                    </span>
                  )}
                </h3>
                <div className="space-y-3">
                  {conges.slice(0, 5).map((conge: any, index: number) => {
                    const emp = employes.find((e: any) => Number(e.matricule || e.id) === Number(conge.matricule || conge.id_employe))
                    const statusColors = {
                      'Approuve': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
                      'En attente': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                      'Refuse': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
                    }
                    const statusIcons = {
                      'Approuve': faCheckCircle,
                      'En attente': faClock,
                      'Refuse': faTimesCircle,
                    }
                    return (
                      <motion.div 
                        key={conge.id_conge || conge.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
                          >
                            <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                          </motion.div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">
                              {emp?.prenom ? `${emp.prenom} ${emp.nom}` : 'Employé'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                              {conge.type_conge} - {conge.nombre_jours} jours
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${statusColors[conge.statut as keyof typeof statusColors] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          <FontAwesomeIcon icon={statusIcons[conge.statut as keyof typeof statusIcons] || faInfoCircle} className="w-3 h-3" />
                          {conge.statut}
                        </span>
                      </motion.div>
                    )
                  })}
                  {conges.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">Aucune demande de congé récente.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/60 transform transition-all duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ backdropFilter: 'blur(20px)' }}
        >
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-700/60 flex-shrink-0">
            <motion.div whileHover={{ scale: 1.02 }}>
              <RHProLogo />
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {activeSection === item.id && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-8 rounded-full bg-white/50"
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Déconnexion */}
          <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60 flex-shrink-0">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')} 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </motion.button>
          </div>
        </motion.aside>

        {/* Overlay pour mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 px-4 sm:px-6 py-4 flex-shrink-0"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
              >
                <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
              </motion.button>
              
              <div className="flex-1 max-w-md mx-4 hidden md:block">
                <div className="relative group">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Rechercher un employé..." 
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500/30 focus:bg-white dark:focus:bg-slate-700 transition-all text-slate-800 dark:text-white text-sm" 
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
                <NotificationBell
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDelete={handleDelete}
                />
                
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleDark} 
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <FontAwesomeIcon 
                    icon={isDark ? faSun : faMoon} 
                    className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-slate-600'}`} 
                  />
                </motion.button>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20"
                  >
                    <span className="text-white font-bold text-sm">
                      {dashboardData?.user?.prenom?.[0] || 'RH'}
                    </span>
                  </motion.div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      {dashboardData?.user?.prenom ? `${dashboardData.user.prenom} ${dashboardData.user.nom || ''}` : 'Utilisateur'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={faCrown} className="w-3 h-3 text-amber-500" />
                      Responsable RH
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <div className="rounded-full h-16 w-16 border-4 border-primary-200 dark:border-primary-900/30 border-t-primary-600 dark:border-t-primary-400"></div>
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-300 dark:border-t-primary-200"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>

      {/* Styles CSS */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bg-300 { background-size: 300% 300%; }
        .animate-gradient { animation: gradient 6s ease infinite; }
      `}</style>
    </div>
  )
}