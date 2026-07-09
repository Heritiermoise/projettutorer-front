import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, DollarSign, Calendar, Clock, FileText,
  Award, LogOut, Menu, X, Moon, Sun, Search, Bell,
  User, Briefcase, Settings, Download
} from 'lucide-react'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import { NotificationBell } from '../../components/NotificationBell'
import { employeNotifications } from '../../data/notifications'
import { loadDashboardContext } from '../../services/dashboardData'
import { EmployeCongesPage } from './EmployeCongesPage'
import { EmployeDocumentsPage } from './EmployeDocumentsPage'
import { EmployeNotificationsPage } from './EmployeNotificationsPage'
import { EmployeParametresPage } from './EmployeParametresPage'
import { EmployePaiePage } from './EmployePaiePage'
import { EmployePresencesPage } from './EmployePresencesPage'
import { EmployeAvantagesPage } from './EmployeAvantagesPage'

export const EmployeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [notifications, setNotifications] = useState(employeNotifications)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    loadDashboardContext()
      .then((context) => {
        if (mounted) {
          setDashboardData(context)
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

  const user = dashboardData?.user || { prenom: 'Utilisateur', nom: 'RH', matricule: 'N/A', role: 'employe' }
  const userPaies = (dashboardData?.fichesPaie || []).filter((p: any) => p.matricule === user.matricule)
  const userConges = (dashboardData?.conges || []).filter((c: any) => c.matricule === user.matricule)
  const userPresences = (dashboardData?.presences || []).filter((p: any) => p.matricule === user.matricule)
  const userDocuments = (dashboardData?.documents || []).filter((d: any) => d.matricule === user.matricule)
  const userAvantages = (dashboardData?.avantages || []).filter((a: any) => a.matricule === user.matricule)

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
    { icon: LayoutDashboard, label: 'Mon Espace', id: 'dashboard', path: '/dashboard/employe' },
    { icon: DollarSign, label: 'Mes Paies', id: 'paies', path: '/dashboard/employe/paies' },
    { icon: Calendar, label: 'Mes Conges', id: 'conges', path: '/dashboard/employe/conges' },
    { icon: Clock, label: 'Mes Presences', id: 'presences', path: '/dashboard/employe/presences' },
    { icon: FileText, label: 'Mes Documents', id: 'documents', path: '/dashboard/employe/documents' },
    { icon: Award, label: 'Mes Avantages', id: 'avantages', path: '/dashboard/employe/avantages' },
    { icon: Bell, label: 'Notifications', id: 'notifications', path: '/dashboard/employe/notifications' },
    { icon: Settings, label: 'Parametres', id: 'parametres', path: '/dashboard/employe/parametres' },
  ]

  const getCurrentSection = () => {
    const path = location.pathname
    if (path.includes('/paies')) return 'paies'
    if (path.includes('/conges')) return 'conges'
    if (path.includes('/presences')) return 'presences'
    if (path.includes('/documents')) return 'documents'
    if (path.includes('/avantages')) return 'avantages'
    if (path.includes('/notifications')) return 'notifications'
    if (path.includes('/parametres')) return 'parametres'
    return 'dashboard'
  }

  const activeSection = getCurrentSection()

  const stats = {
    soldeConges: 20,
    congesPris: 10,
    dernierSalaire: userPaies[userPaies.length - 1]?.montant || 1200,
    cumulAnnuel: userPaies.reduce((sum, p) => sum + p.montant, 0),
    joursPresence: userPresences.filter(p => p.statut === 'Present').length || 22,
    joursRetard: userPresences.filter(p => p.statut === 'Retard').length || 2,
    joursAbsence: userPresences.filter(p => p.statut === 'Absent').length || 1,
  }

  const presenceData = [
    { name: 'Presents', value: stats.joursPresence, color: '#10b981' },
    { name: 'Retards', value: stats.joursRetard, color: '#f59e0b' },
    { name: 'Absences', value: stats.joursAbsence, color: '#ef4444' },
  ]

  const kpiCards = [
    { icon: DollarSign, label: 'Dernier Salaire', value: '$' + stats.dernierSalaire, color: 'from-primary-500 to-purple-600' },
    { icon: Briefcase, label: 'Cumul Annuel', value: '$' + stats.cumulAnnuel, color: 'from-accent-500 to-emerald-600' },
    { icon: Calendar, label: 'Solde Conges', value: stats.soldeConges + ' jours', color: 'from-amber-500 to-orange-600' },
    { icon: Clock, label: 'Jours Presence', value: stats.joursPresence, color: 'from-pink-500 to-rose-600' },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'paies': return <EmployePaiePage />
      case 'conges': return <EmployeCongesPage />
      case 'presences': return <EmployePresencesPage />
      case 'documents': return <EmployeDocumentsPage />
      case 'avantages': return <EmployeAvantagesPage />
      case 'notifications': return <EmployeNotificationsPage />
      case 'parametres': return <EmployeParametresPage />
      default:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Bonjour, {user.prenom} ! 👋</h1>
              <p className="text-slate-600 dark:text-slate-400">Voici un resume de votre espace personnel</p>
            </div>

            <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user.prenom} {user.nom}</h2>
                  <p className="text-white/80 text-sm">{user.email}</p>
                  <p className="text-white/60 text-xs mt-1">Matricule: {user.matricule}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {kpiCards.map((kpi, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
                    <kpi.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{kpi.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes dernieres fiches de paie</h3>
                {userPaies.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucune fiche de paie disponible</p>
                ) : (
                  <div className="space-y-3">
                    {userPaies.slice(-3).reverse().map((paie) => (
                      <div key={paie.id_paie} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{paie.mois_paiement} {paie.annee_paiement}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Ref: #{paie.id_paie}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800 dark:text-white">${paie.montant}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${paie.statut === 'Payee' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}`}>
                            {paie.statut}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes presences ce mois</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={presenceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => name + ': ' + value}>
                      {presenceData.map((entry, index) => (
                        <Cell key={'cell-' + index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes demandes de conges</h3>
                {userConges.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucune demande de conge</p>
                ) : (
                  <div className="space-y-3">
                    {userConges.map((conge) => (
                      <div key={conge.id_conge} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{conge.type_conge}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{conge.date_debut} → {conge.date_fin}</p>
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
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes avantages</h3>
                {userAvantages.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucun avantage disponible</p>
                ) : (
                  <div className="space-y-3">
                    {userAvantages.map((avantage) => (
                      <div key={avantage.id_avantage} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{avantage.libelle}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{avantage.type_avantage}</p>
                          </div>
                        </div>
                        <span className="font-bold text-amber-600 dark:text-amber-300">${avantage.valeur}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes documents</h3>
              {userDocuments.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucun document disponible</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userDocuments.map((doc) => (
                    <div key={doc.id_document} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{doc.type_document}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{doc.created_at}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${doc.statut === 'Valide' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {doc.statut}
                        </span>
                        <button className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">Chargement des données réelles...</div>
      ) : null}
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-secondary-600 to-orange-600 bg-clip-text text-transparent">RH Pro</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Employe</p>
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
                    ? 'bg-gradient-to-r from-secondary-500 to-orange-600 text-white shadow-lg' 
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
              <span className="font-medium">Deconnexion</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Menu className="w-6 h-6" /></button>
              <div className="flex items-center space-x-4 ml-auto">
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
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{user.prenom[0]}</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{user.prenom} {user.nom}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Employe</p>
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