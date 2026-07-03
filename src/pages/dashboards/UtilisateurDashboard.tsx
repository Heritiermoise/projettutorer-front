import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Briefcase, User, Bell, Settings, LogOut, 
  Menu, X, Moon, Sun, Search, FileText, CheckCircle2, Clock, XCircle
} from 'lucide-react'
import { mockCandidatures } from '../../data/phase5Data'

export const UtilisateurDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const navigate = useNavigate()

  const toggleDark = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Mon Espace', id: 'dashboard' },
    { icon: Briefcase, label: 'Mes Candidatures', id: 'candidatures' },
    { icon: User, label: 'Mon Profil', id: 'profil' },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Settings, label: 'Parametres', id: 'parametres' },
  ]

  const stats = {
    total: mockCandidatures.length,
    enCours: mockCandidatures.filter(c => c.statut === 'En_revision' || c.statut === 'Entretien').length,
    acceptees: mockCandidatures.filter(c => c.statut === 'Acceptee').length,
    refusees: mockCandidatures.filter(c => c.statut === 'Refusee').length
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Soumise': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      'En_revision': 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
      'Entretien': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Acceptee': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Refusee': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }
    return colors[statut] || colors['Soumise']
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">RH Pro</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Candidat</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="w-6 h-6" /></button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg' 
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
                <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">U</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Alain Ngoy</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Candidat</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6">
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Mon Espace Candidat</h1>
                <p className="text-slate-600 dark:text-slate-400">Suivez vos candidatures et votre parcours</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: 'Total candidatures', value: stats.total, icon: FileText, color: 'from-primary-500 to-purple-600' },
                  { label: 'En cours', value: stats.enCours, icon: Clock, color: 'from-amber-500 to-orange-600' },
                  { label: 'Acceptees', value: stats.acceptees, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
                  { label: 'Refusees', value: stats.refusees, icon: XCircle, color: 'from-red-500 to-rose-600' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Mes candidatures recentes</h3>
                <div className="space-y-3">
                  {mockCandidatures.map(cand => (
                    <div key={cand.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 dark:text-white">{cand.offre_titre}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{cand.entreprise} • Postule le {cand.date_postulation}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(cand.statut)}`}>
                          {cand.statut}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(cand.etape / 4) * 100}%` }}></div>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Etape {cand.etape}/4</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}