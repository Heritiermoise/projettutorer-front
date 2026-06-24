import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Building2, Users, Briefcase, Calendar,
  DollarSign, LogOut, Menu, X, Moon, Sun, Search, Bell,
  Target, UserCheck, Settings, FileText, BookOpen, Award, 
  MessageSquare, TrendingUp, CheckSquare, BarChart3,
  FileSignature, Plug, Headphones, Archive, Shield, Flag
} from 'lucide-react'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import { NotificationBell } from '../../components/NotificationBell'
import { directeurNotifications } from '../../data/notifications'
import { mockEmployes, mockContrats, mockPostes, mockStatsEvolution, mockEntreprises, mockServices } from '../../data/mockData'
import { DirecteurEntreprisePage } from './DirecteurEntreprisePage'
import { DirecteurMembresPage } from './DirecteurMembresPage'
import { DirecteurServicesPage } from './DirecteurServicesPage'
import { DirecteurStatistiquesPage } from './DirecteurStatistiquesPage'
import { DirecteurNotificationsPage } from './DirecteurNotificationsPage'
import { DirecteurParametresPage } from './DirecteurParametresPage'
import { DirecteurPostesPage } from './DirecteurPostesPage'
import { DirecteurCandidatsPage } from './DirecteurCandidatsPage'
import { DirecteurOffresPage } from './DirecteurOffresPage'
import { DirecteurEvaluationsPage } from './DirecteurEvaluationsPage'
import { DirecteurFormationsPage } from './DirecteurFormationsPage'
import { DirecteurOrganigrammePage } from './DirecteurOrganigrammePage'
import { DirecteurPaieAvanceePage } from './DirecteurPaieAvanceePage'
import { DirecteurOnboardingPage } from './DirecteurOnboardingPage'
import { DirecteurCommunicationPage } from './DirecteurCommunicationPage'
import { DirecteurAnalyticsPage } from './DirecteurAnalyticsPage'
import { DirecteurSignaturePage } from './DirecteurSignaturePage'
import { DirecteurIntegrationsPage } from './DirecteurIntegrationsPage'
import { DirecteurTicketsPage } from './DirecteurTicketsPage'
import { DirecteurArchivagePage } from './DirecteurArchivagePage'
import { DirecteurAuditLogsPage } from './DirecteurAuditLogsPage'
import { DirecteurJoursFeriesPage } from './DirecteurJoursFeriesPage'

export const DirecteurDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [notifications, setNotifications] = useState(directeurNotifications)
  const navigate = useNavigate()
  const location = useLocation()

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
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', path: '/dashboard/directeur' },
    { icon: Building2, label: 'Mon Entreprise', id: 'entreprise', path: '/dashboard/directeur/entreprise' },
    { icon: Briefcase, label: 'Postes', id: 'postes', path: '/dashboard/directeur/postes' },
    { icon: FileText, label: 'Offres', id: 'offres', path: '/dashboard/directeur/offres' },
    { icon: Users, label: 'Membres', id: 'membres', path: '/dashboard/directeur/membres' },
    { icon: UserCheck, label: 'Candidats', id: 'candidats', path: '/dashboard/directeur/candidats' },
    { icon: CheckSquare, label: 'Onboarding', id: 'onboarding', path: '/dashboard/directeur/onboarding' },
    { icon: Target, label: 'Evaluations', id: 'evaluations', path: '/dashboard/directeur/evaluations' },
    { icon: BookOpen, label: 'Formations', id: 'formations', path: '/dashboard/directeur/formations' },
    { icon: Award, label: 'Organigramme', id: 'organigramme', path: '/dashboard/directeur/organigramme' },
    { icon: DollarSign, label: 'Paie Avancee', id: 'paie', path: '/dashboard/directeur/paie' },
    { icon: MessageSquare, label: 'Communication', id: 'communication', path: '/dashboard/directeur/communication' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics', path: '/dashboard/directeur/analytics' },
    { icon: FileSignature, label: 'Signature', id: 'signature', path: '/dashboard/directeur/signature' },
    { icon: Plug, label: 'Integrations', id: 'integrations', path: '/dashboard/directeur/integrations' },
    { icon: Headphones, label: 'Support', id: 'support', path: '/dashboard/directeur/support' },
    { icon: Archive, label: 'Archivage', id: 'archivage', path: '/dashboard/directeur/archivage' },
    { icon: Shield, label: 'Audit Logs', id: 'audit', path: '/dashboard/directeur/audit' },
    { icon: Flag, label: 'Jours Feries', id: 'joursferies', path: '/dashboard/directeur/joursferies' },
    { icon: Calendar, label: 'Statistiques', id: 'stats', path: '/dashboard/directeur/stats' },
    { icon: Bell, label: 'Notifications', id: 'notifications', path: '/dashboard/directeur/notifications' },
    { icon: Settings, label: 'Parametres', id: 'parametres', path: '/dashboard/directeur/parametres' },
  ]

  const getCurrentSection = () => {
    const path = location.pathname
    if (path.includes('/entreprise')) return 'entreprise'
    if (path.includes('/postes')) return 'postes'
    if (path.includes('/offres')) return 'offres'
    if (path.includes('/membres')) return 'membres'
    if (path.includes('/candidats')) return 'candidats'
    if (path.includes('/onboarding')) return 'onboarding'
    if (path.includes('/evaluations')) return 'evaluations'
    if (path.includes('/formations')) return 'formations'
    if (path.includes('/organigramme')) return 'organigramme'
    if (path.includes('/paie')) return 'paie'
    if (path.includes('/communication')) return 'communication'
    if (path.includes('/analytics')) return 'analytics'
    if (path.includes('/signature')) return 'signature'
    if (path.includes('/integrations')) return 'integrations'
    if (path.includes('/support')) return 'support'
    if (path.includes('/archivage')) return 'archivage'
    if (path.includes('/audit')) return 'audit'
    if (path.includes('/joursferies')) return 'joursferies'
    if (path.includes('/stats')) return 'stats'
    if (path.includes('/notifications')) return 'notifications'
    if (path.includes('/parametres')) return 'parametres'
    return 'dashboard'
  }

  const activeSection = getCurrentSection()

  const stats = {
    totalMembres: mockEmployes.length,
    hommes: mockEmployes.filter(e => e.sexe === 'M').length,
    femmes: mockEmployes.filter(e => e.sexe === 'F').length,
    masseSalariale: mockContrats.reduce((sum, c) => sum + c.salaire_base, 0),
    postesTotal: mockPostes.length,
    postesOccupes: mockPostes.filter(p => p.statut === 'Occupe').length,
    postesVacants: mockPostes.filter(p => p.statut === 'Vacant').length,
    recrutementMois: 12,
  }

  const kpiCards = [
    { icon: Users, label: 'Total Membres', value: stats.totalMembres, change: '+12', color: 'from-amber-500 to-orange-600' },
    { icon: DollarSign, label: 'Masse Salariale', value: '$' + (stats.masseSalariale / 1000).toFixed(1) + 'K', change: '+8%', color: 'from-green-500 to-emerald-600' },
    { icon: Briefcase, label: 'Postes Occupes', value: stats.postesOccupes + '/' + stats.postesTotal, change: stats.postesVacants + ' vacants', color: 'from-primary-500 to-purple-600' },
    { icon: Target, label: 'Recrutements', value: stats.recrutementMois, change: '+3', color: 'from-pink-500 to-rose-600' },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'entreprise': return <DirecteurEntreprisePage />
      case 'postes': return <DirecteurPostesPage />
      case 'offres': return <DirecteurOffresPage />
      case 'membres': return <DirecteurMembresPage />
      case 'candidats': return <DirecteurCandidatsPage />
      case 'onboarding': return <DirecteurOnboardingPage />
      case 'evaluations': return <DirecteurEvaluationsPage />
      case 'formations': return <DirecteurFormationsPage />
      case 'organigramme': return <DirecteurOrganigrammePage />
      case 'paie': return <DirecteurPaieAvanceePage />
      case 'communication': return <DirecteurCommunicationPage />
      case 'analytics': return <DirecteurAnalyticsPage />
      case 'signature': return <DirecteurSignaturePage />
      case 'integrations': return <DirecteurIntegrationsPage />
      case 'support': return <DirecteurTicketsPage />
      case 'archivage': return <DirecteurArchivagePage />
      case 'audit': return <DirecteurAuditLogsPage />
      case 'joursferies': return <DirecteurJoursFeriesPage />
      case 'stats': return <DirecteurStatistiquesPage />
      case 'notifications': return <DirecteurNotificationsPage />
      case 'parametres': return <DirecteurParametresPage />
      default:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Tableau de bord Direction</h1>
              <p className="text-slate-600 dark:text-slate-400">Vue strategique de {mockEntreprises[0]?.nom}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {kpiCards.map((kpi, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <kpi.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">{kpi.change}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{kpi.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Evolution des effectifs</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockStatsEvolution.effectifs}>
                    <defs>
                      <linearGradient id="colorDir" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="mois" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Area type="monotone" dataKey="employes" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDir)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition par service</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={mockStatsEvolution.repartitionServices} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => name + ' ' + (percent * 100).toFixed(0) + '%'}>
                      {mockStatsEvolution.repartitionServices.map((entry, index) => (
                        <Cell key={'cell-' + index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Etat des postes</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Occupes</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{stats.postesOccupes}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: (stats.postesOccupes / stats.postesTotal * 100) + '%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Vacants</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{stats.postesVacants}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: (stats.postesVacants / stats.postesTotal * 100) + '%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Parite H/F</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl sm:text-3xl font-bold text-white">{stats.hommes}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Hommes</p>
                    <p className="text-xs text-slate-500">{(stats.hommes / stats.totalMembres * 100).toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl sm:text-3xl font-bold text-white">{stats.femmes}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Femmes</p>
                    <p className="text-xs text-slate-500">{(stats.femmes / stats.totalMembres * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Services</h3>
                <div className="space-y-2">
                  {mockServices.slice(0, 5).map((service) => (
                    <div key={service.id_service} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{service.nom}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">{service.statut}</span>
                    </div>
                  ))}
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
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">RH Pro</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Directeur</p>
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
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <button onClick={() => navigate('/')} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Deconnexion</span>
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
                  <input type="text" placeholder="Rechercher..." className="w-full pl-11 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-amber-500" />
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
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">D</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Moise Vita</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Directeur General</p>
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
}