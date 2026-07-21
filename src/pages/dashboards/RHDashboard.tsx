import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Users, FileText, DollarSign, Calendar,
  LogOut, Menu, X, Moon, Sun, Search, Bell,
  Clock, Award, UserPlus, Settings
} from 'lucide-react'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import { NotificationBell } from '../../components/NotificationBell'
import { rhNotifications } from '../../data/notifications'
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

export const RHDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [notifications, setNotifications] = useState(rhNotifications)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    loadDashboardRHContext()
      .then((context) => {
        if (mounted) {
          setDashboardData(context)
        }
      })
      .catch((err) => {
        console.error("Erreur lors du chargement du contexte RH :", err)
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

  const toggleDark = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', path: '/dashboard/rh' },
    { icon: Users, label: 'Employés', id: 'employes', path: '/dashboard/rh/employes' },
    { icon: FileText, label: 'Contrats', id: 'contrats', path: '/dashboard/rh/contrats' },
    { icon: DollarSign, label: 'Paie', id: 'paie', path: '/dashboard/rh/paie' },
    { icon: Calendar, label: 'Congés', id: 'conges', path: '/dashboard/rh/conges' },
    { icon: Clock, label: 'Présences', id: 'presences', path: '/dashboard/rh/presences' },
    { icon: Award, label: 'Avantages', id: 'avantages', path: '/dashboard/rh/avantages' },
    { icon: UserPlus, label: 'Recrutement', id: 'recrutement', path: '/dashboard/rh/recrutement' },
    { icon: Bell, label: 'Notifications', id: 'notifications', path: '/dashboard/rh/notifications' },
    { icon: Settings, label: 'Paramètres', id: 'parametres', path: '/dashboard/rh/parametres' },
  ]

  const getCurrentSection = () => {
    const path = location.pathname
    if (path.includes('/employes')) return 'employes'
    if (path.includes('/contrats')) return 'contrats'
    if (path.includes('/paie')) return 'paie'
    if (path.includes('/conges')) return 'conges'
    if (path.includes('/presences')) return 'presences'
    if (path.includes('/avantages')) return 'avantages'
    if (path.includes('/recrutement')) return 'recrutement'
    if (path.includes('/notifications')) return 'notifications'
    if (path.includes('/parametres')) return 'parametres'
    return 'dashboard'
  }

  const activeSection = getCurrentSection()

  const rawEmployes = dashboardData?.employes || []
  const contrats = dashboardData?.contrats || []
  const conges = dashboardData?.conges || []
  const presences = dashboardData?.presences || []
  const services = dashboardData?.services || []
  const postes = dashboardData?.postes || []
  const entrepriseActuelle = dashboardData?.entreprise

  // Filtrage sécurisé des employés
  const employes = useMemo(() => {
    if (!rawEmployes.length) return []
    return rawEmployes.filter((emp: any) => {
      const roleName = emp.role_name || emp.role?.name || emp.user?.role_name || emp.user?.role?.name || 'employe'
      return roleName.toLowerCase() === 'employe'
    })
  }, [rawEmployes])

  const stats = {
    totalEmployes: employes.length,
    contratsActifs: contrats.filter((c: any) => c.statut === 'Actif').length,
    congesEnAttente: conges.filter((c: any) => c.statut === 'En attente').length,
    masseSalariale: contrats.reduce((sum: number, c: any) => sum + Number(c.salaire_base || 0), 0),
    presencesAujourdhui: presences.filter((p: any) => p.statut === 'Present').length,
    offresActives: dashboardData?.offres?.length || 0,
  }

  const kpiCards = [
    { icon: Users, label: 'Total Employés', value: stats.totalEmployes, change: '+12', color: 'from-primary-500 to-primary-700' },
    { icon: FileText, label: 'Contrats Actifs', value: stats.contratsActifs, change: '+3', color: 'from-accent-500 to-accent-700' },
    { icon: DollarSign, label: 'Masse Salariale', value: '$' + (stats.masseSalariale / 1000).toFixed(1) + 'K', change: '+8%', color: 'from-warm-500 to-warm-600' },
    { icon: Calendar, label: 'Congés en attente', value: stats.congesEnAttente, change: '', color: 'from-slate-500 to-slate-700' },
  ]

  // Données factices de démonstration pour le graphique d'évolution
  const evolutionData = [
    { mois: 'Jan', employes: stats.totalEmployes > 5 ? stats.totalEmployes - 5 : 2, nouveaux: 2 },
    { mois: 'Fév', employes: stats.totalEmployes > 4 ? stats.totalEmployes - 4 : 3, nouveaux: 1 },
    { mois: 'Mar', employes: stats.totalEmployes > 2 ? stats.totalEmployes - 2 : 4, nouveaux: 2 },
    { mois: 'Avr', employes: stats.totalEmployes > 1 ? stats.totalEmployes - 1 : 5, nouveaux: 1 },
    { mois: 'Mai', employes: stats.totalEmployes, nouveaux: 3 },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      )
    }

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
          <div className="space-y-6">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Tableau de bord RH</h1>
                <p className="text-slate-600 dark:text-slate-400">Gestion des ressources humaines</p>
              </div>
              {entrepriseActuelle && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 px-4 py-2 rounded-xl text-primary-700 dark:text-primary-300 font-medium text-sm">
                  Entreprise : <span className="font-bold">{entrepriseActuelle.nom}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {kpiCards.map((kpi, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <kpi.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    {kpi.change && <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">{kpi.change}</span>}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{kpi.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Évolution des effectifs</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="mois" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="employes" name="Total Employés" stroke="#3b82f6" strokeWidth={3} />
                    <Line type="monotone" dataKey="nouveaux" name="Nouveaux" stroke="#06b6d4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Répartition par service</h3>
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
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Derniers employés ajoutés</h3>
                <div className="space-y-3">
                  {employes.slice(0, 5).map((emp: any) => (
                    <div key={emp.matricule || emp.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-accent-100 dark:bg-accent-900/30'}`}>
                          <span className={`font-bold ${emp.sexe === 'M' ? 'text-primary-600 dark:text-primary-300' : 'text-accent-600 dark:text-accent-300'}`}>{emp.prenom?.[0] || 'E'}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm">{emp.prenom} {emp.nom}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">{emp.statut || 'Actif'}</span>
                    </div>
                  ))}
                  {employes.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">Aucun employé trouvé.</p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Demandes de congés</h3>
                <div className="space-y-3">
                  {conges.slice(0, 5).map((conge: any) => {
                    const emp = employes.find((e: any) => Number(e.matricule || e.id) === Number(conge.matricule || conge.id_employe))
                    return (
                      <div key={conge.id_conge || conge.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{emp?.prenom ? `${emp.prenom} ${emp.nom}` : 'Employé'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{conge.type_conge} - {conge.nombre_jours} jours</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          conge.statut === 'Approuve' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
                          conge.statut === 'En attente' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {conge.statut}
                        </span>
                      </div>
                    )
                  })}
                  {conges.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">Aucune demande de congé récente.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">RH Pro</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">{entrepriseActuelle?.nom || 'RH'}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="w-6 h-6" /></button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-primary-500 to-accent-600 text-white shadow-lg' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <button onClick={() => navigate('/')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Menu className="w-6 h-6" /></button>
              <div className="flex-1 max-w-md mx-4 hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Rechercher un employé..." className="w-full pl-11 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationBell
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDelete={handleDelete}
                />
                <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{dashboardData?.user?.prenom?.[0] || 'RH'}</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      {dashboardData?.user?.prenom ? `${dashboardData.user.prenom} ${dashboardData.user.nom || ''}` : 'Utilisateur'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Responsable RH</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
};