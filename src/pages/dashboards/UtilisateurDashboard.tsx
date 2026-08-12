import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, Briefcase, User, Bell, Settings, LogOut, 
  Menu, X, Moon, Sun, FileText, CheckCircle2, Clock, XCircle, MessageSquare
} from 'lucide-react'
import { BrandMark } from '../../components/BrandMark'
import { postulationAPI } from '../../services/api'
import { DirecteurMessageriePage } from './DirecteurMessageriePage'

type CandidateApplication = {
  id_postulation: number
  statut: string
  created_at: string
  offre?: { titre?: string; entreprise?: { nom?: string } }
}

type CompanyOffer = {
  id_offre: number
  titre: string
  description?: string
  localisation?: string
  type_contrat?: string
  date_limite: string
  entreprise?: { nom?: string }
}

export const UtilisateurDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [applications, setApplications] = useState<CandidateApplication[]>([])
  const [offers, setOffers] = useState<CompanyOffer[]>([])
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [feedback, setFeedback] = useState('')
  const navigate = useNavigate()
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    Promise.all([postulationAPI.getMine(), postulationAPI.getCompanyOffers()])
      .then(([applicationResponse, offerResponse]) => {
        setApplications(applicationResponse.postulations || [])
        setOffers(offerResponse.offres || [])
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Impossible de charger vos candidatures.'))
      .finally(() => setLoadingApplications(false))
  }, [])

  const toggleDark = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Mon Espace', id: 'dashboard' },
    { icon: Briefcase, label: 'Mes Candidatures', id: 'candidatures' },
    { icon: Briefcase, label: 'Offres de mon entreprise', id: 'offres' },
    { icon: MessageSquare, label: 'Messagerie', id: 'messagerie' },
    { icon: User, label: 'Mon Profil', id: 'profil' },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Settings, label: 'Parametres', id: 'parametres' },
  ]

  const stats = {
    total: applications.length,
    enCours: applications.filter(c => ['Soumise', 'En cours', 'Entretien'].includes(c.statut)).length,
    acceptees: applications.filter(c => c.statut === 'Acceptée').length,
    refusees: applications.filter(c => c.statut === 'Refusée').length
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Soumise': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      'En_revision': 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
      'Entretien': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Acceptée': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Refusée': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
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
              <BrandMark subtitle="Candidat" compact />
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
                    ? 'bg-primary-600 text-white shadow-lg' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <button onClick={() => { localStorage.removeItem('auth_token'); localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{String(storedUser.prenom || storedUser.nom || 'C').charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{[storedUser.prenom, storedUser.nom].filter(Boolean).join(' ') || 'Candidat'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Candidat</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeSection === 'messagerie' ? <DirecteurMessageriePage /> : <div className="space-y-6">
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Mon Espace Candidat</h1>
                <p className="text-slate-600 dark:text-slate-400">Suivez vos candidatures et votre parcours</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: 'Total candidatures', value: stats.total, icon: FileText, color: 'from-primary-500 to-primary-600' },
                  { label: 'En cours', value: stats.enCours, icon: Clock, color: 'from-primary-500 to-primary-600' },
                  { label: 'Acceptees', value: stats.acceptees, icon: CheckCircle2, color: 'from-primary-500 to-primary-600' },
                  { label: 'Refusees', value: stats.refusees, icon: XCircle, color: 'from-red-500 to-primary-600' }
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
                {feedback && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{feedback}</p>}
                <div className="space-y-3">
                  {loadingApplications && <p className="text-sm text-slate-500">Chargement de vos candidatures...</p>}
                  {!loadingApplications && applications.length === 0 && <p className="text-sm text-slate-500">Aucune candidature enregistrée.</p>}
                  {applications.map(cand => (
                    <div key={cand.id_postulation} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 dark:text-white">{cand.offre?.titre || 'Offre d’emploi'}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{cand.offre?.entreprise?.nom || 'Entreprise'} · Postulé le {new Date(cand.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(cand.statut)}`}>
                          {cand.statut}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${cand.statut === 'Acceptée' || cand.statut === 'Refusée' ? 100 : cand.statut === 'Entretien' ? 75 : 25}%` }}></div>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{cand.statut}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Offres de mon entreprise</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {!loadingApplications && offers.length === 0 && <p className="text-sm text-slate-500">Aucune offre active dans votre entreprise.</p>}
                  {offers.map((offer) => (
                    <article key={offer.id_offre} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <p className="text-xs font-semibold text-primary-600">{offer.entreprise?.nom}</p>
                      <h4 className="mt-1 font-bold text-slate-800 dark:text-white">{offer.titre}</h4>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{offer.description}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span>{offer.type_contrat || 'Contrat'} · {offer.localisation || 'À préciser'}</span>
                        <button onClick={() => navigate(`/offres/${offer.id_offre}`)} className="font-semibold text-primary-600 hover:text-primary-700">Voir et postuler</button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>}
          </main>
        </div>
      </div>
    </div>
  )
}