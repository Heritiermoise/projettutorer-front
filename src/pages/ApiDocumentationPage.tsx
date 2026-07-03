import { useState } from 'react'
import { Api, CheckCircle2, XCircle, Clock, Copy, Check, Search, Filter, BookOpen, Server, Shield, Users, Briefcase, DollarSign, Calendar, FileText, MessageSquare, Bell, Settings } from 'lucide-react'

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  module: string
  status: 'success' | 'pending' | 'error'
  auth: boolean
  example?: string
}

const apiEndpoints: ApiEndpoint[] = [
  // Authentification
  { method: 'POST', path: '/api/auth/register', description: 'Inscription d\'un nouvel utilisateur', module: 'Auth', status: 'success', auth: false, example: '{ "nom": "Doe", "email": "doe@test.com", "password": "secret" }' },
  { method: 'POST', path: '/api/auth/login', description: 'Connexion utilisateur', module: 'Auth', status: 'success', auth: false },
  { method: 'POST', path: '/api/auth/logout', description: 'Déconnexion', module: 'Auth', status: 'success', auth: true },
  { method: 'GET', path: '/api/auth/user', description: 'Récupérer l\'utilisateur connecté', module: 'Auth', status: 'success', auth: true },
  { method: 'POST', path: '/api/auth/forgot-password', description: 'Mot de passe oublié', module: 'Auth', status: 'success', auth: false },
  { method: 'POST', path: '/api/auth/reset-password', description: 'Réinitialiser mot de passe', module: 'Auth', status: 'success', auth: false },

  // Entreprises
  { method: 'GET', path: '/api/entreprises', description: 'Liste des entreprises', module: 'Entreprises', status: 'success', auth: false },
  { method: 'POST', path: '/api/entreprises', description: 'Créer une entreprise', module: 'Entreprises', status: 'success', auth: true },
  { method: 'GET', path: '/api/entreprises/{id}', description: 'Détails entreprise', module: 'Entreprises', status: 'success', auth: false },
  { method: 'PUT', path: '/api/entreprises/{id}', description: 'Modifier entreprise', module: 'Entreprises', status: 'success', auth: true },
  { method: 'DELETE', path: '/api/entreprises/{id}', description: 'Supprimer entreprise', module: 'Entreprises', status: 'success', auth: true },

  // Employés
  { method: 'GET', path: '/api/employes', description: 'Liste des employés', module: 'Employes', status: 'success', auth: true },
  { method: 'POST', path: '/api/employes', description: 'Créer un employé', module: 'Employes', status: 'success', auth: true },
  { method: 'GET', path: '/api/employes/{id}', description: 'Détails employé', module: 'Employes', status: 'success', auth: true },
  { method: 'PUT', path: '/api/employes/{id}', description: 'Modifier employé', module: 'Employes', status: 'success', auth: true },
  { method: 'DELETE', path: '/api/employes/{id}', description: 'Supprimer employé', module: 'Employes', status: 'success', auth: true },

  // Postes
  { method: 'GET', path: '/api/postes', description: 'Liste des postes', module: 'Postes', status: 'success', auth: true },
  { method: 'POST', path: '/api/postes', description: 'Créer un poste', module: 'Postes', status: 'success', auth: true },
  { method: 'PUT', path: '/api/postes/{id}', description: 'Modifier poste', module: 'Postes', status: 'success', auth: true },
  { method: 'DELETE', path: '/api/postes/{id}', description: 'Supprimer poste', module: 'Postes', status: 'success', auth: true },

  // Offres d'emploi
  { method: 'GET', path: '/api/offres', description: 'Liste des offres (publique)', module: 'Offres', status: 'success', auth: false },
  { method: 'POST', path: '/api/offres', description: 'Publier une offre', module: 'Offres', status: 'success', auth: true },
  { method: 'GET', path: '/api/offres/{id}', description: 'Détails offre', module: 'Offres', status: 'success', auth: false },
  { method: 'PUT', path: '/api/offres/{id}', description: 'Modifier offre', module: 'Offres', status: 'success', auth: true },
  { method: 'DELETE', path: '/api/offres/{id}', description: 'Supprimer offre', module: 'Offres', status: 'success', auth: true },

  // Candidatures
  { method: 'POST', path: '/api/candidatures', description: 'Postuler à une offre', module: 'Candidatures', status: 'success', auth: false },
  { method: 'GET', path: '/api/candidatures', description: 'Liste candidatures', module: 'Candidatures', status: 'success', auth: true },
  { method: 'GET', path: '/api/candidatures/{id}', description: 'Détails candidature', module: 'Candidatures', status: 'success', auth: true },
  { method: 'PUT', path: '/api/candidatures/{id}/statut', description: 'Changer statut candidature', module: 'Candidatures', status: 'success', auth: true },

  // Contrats
  { method: 'GET', path: '/api/contrats', description: 'Liste des contrats', module: 'Contrats', status: 'success', auth: true },
  { method: 'POST', path: '/api/contrats', description: 'Créer un contrat', module: 'Contrats', status: 'success', auth: true },
  { method: 'PUT', path: '/api/contrats/{id}', description: 'Modifier contrat', module: 'Contrats', status: 'success', auth: true },
  { method: 'DELETE', path: '/api/contrats/{id}', description: 'Supprimer contrat', module: 'Contrats', status: 'success', auth: true },

  // Paie
  { method: 'GET', path: '/api/paie', description: 'Liste bulletins de paie', module: 'Paie', status: 'success', auth: true },
  { method: 'POST', path: '/api/paie/generer', description: 'Générer paie mensuelle', module: 'Paie', status: 'success', auth: true },
  { method: 'GET', path: '/api/paie/{id}', description: 'Détails bulletin', module: 'Paie', status: 'success', auth: true },
  { method: 'POST', path: '/api/paie/{id}/valider', description: 'Valider bulletin', module: 'Paie', status: 'success', auth: true },

  // Congés
  { method: 'GET', path: '/api/conges', description: 'Liste des congés', module: 'Conges', status: 'success', auth: true },
  { method: 'POST', path: '/api/conges', description: 'Demander un congé', module: 'Conges', status: 'success', auth: true },
  { method: 'PUT', path: '/api/conges/{id}/statut', description: 'Approuver/refuser congé', module: 'Conges', status: 'success', auth: true },

  // Présences
  { method: 'GET', path: '/api/presences', description: 'Liste des présences', module: 'Presences', status: 'success', auth: true },
  { method: 'POST', path: '/api/presences/pointer', description: 'Pointer arrivée/départ', module: 'Presences', status: 'success', auth: true },
  { method: 'GET', path: '/api/presences/rapport', description: 'Rapport de présences', module: 'Presences', status: 'success', auth: true },

  // Évaluations
  { method: 'GET', path: '/api/evaluations', description: 'Liste évaluations', module: 'Evaluations', status: 'success', auth: true },
  { method: 'POST', path: '/api/evaluations', description: 'Créer évaluation', module: 'Evaluations', status: 'success', auth: true },
  { method: 'PUT', path: '/api/evaluations/{id}', description: 'Modifier évaluation', module: 'Evaluations', status: 'success', auth: true },

  // Formations
  { method: 'GET', path: '/api/formations', description: 'Liste formations', module: 'Formations', status: 'success', auth: true },
  { method: 'POST', path: '/api/formations', description: 'Créer formation', module: 'Formations', status: 'success', auth: true },
  { method: 'POST', path: '/api/formations/{id}/inscrire', description: 'Inscrire employé', module: 'Formations', status: 'success', auth: true },

  // Documents
  { method: 'GET', path: '/api/documents', description: 'Liste documents', module: 'Documents', status: 'success', auth: true },
  { method: 'POST', path: '/api/documents/upload', description: 'Uploader document', module: 'Documents', status: 'success', auth: true },
  { method: 'GET', path: '/api/documents/{id}/download', description: 'Télécharger document', module: 'Documents', status: 'success', auth: true },
  { method: 'DELETE', path: '/api/documents/{id}', description: 'Supprimer document', module: 'Documents', status: 'success', auth: true },

  // Messagerie
  { method: 'GET', path: '/api/messages/conversations', description: 'Liste conversations', module: 'Messagerie', status: 'success', auth: true },
  { method: 'POST', path: '/api/messages/conversations', description: 'Créer conversation', module: 'Messagerie', status: 'success', auth: true },
  { method: 'GET', path: '/api/messages/conversations/{id}', description: 'Messages conversation', module: 'Messagerie', status: 'success', auth: true },
  { method: 'POST', path: '/api/messages', description: 'Envoyer message', module: 'Messagerie', status: 'success', auth: true },

  // Notifications
  { method: 'GET', path: '/api/notifications', description: 'Liste notifications', module: 'Notifications', status: 'success', auth: true },
  { method: 'PUT', path: '/api/notifications/{id}/lu', description: 'Marquer comme lu', module: 'Notifications', status: 'success', auth: true },
  { method: 'POST', path: '/api/notifications/mark-all-read', description: 'Tout marquer lu', module: 'Notifications', status: 'success', auth: true },

  // Services
  { method: 'GET', path: '/api/services', description: 'Liste services', module: 'Services', status: 'success', auth: true },
  { method: 'POST', path: '/api/services', description: 'Créer service', module: 'Services', status: 'success', auth: true },
  { method: 'PUT', path: '/api/services/{id}', description: 'Modifier service', module: 'Services', status: 'success', auth: true },

  // Avantages
  { method: 'GET', path: '/api/avantages', description: 'Liste avantages', module: 'Avantages', status: 'success', auth: true },
  { method: 'POST', path: '/api/avantages', description: 'Créer avantage', module: 'Avantages', status: 'success', auth: true },
  { method: 'PUT', path: '/api/avantages/{id}', description: 'Modifier avantage', module: 'Avantages', status: 'success', auth: true },

  // Notes de frais
  { method: 'GET', path: '/api/notes-frais', description: 'Liste notes de frais', module: 'NotesFrais', status: 'success', auth: true },
  { method: 'POST', path: '/api/notes-frais', description: 'Créer note de frais', module: 'NotesFrais', status: 'success', auth: true },
  { method: 'PUT', path: '/api/notes-frais/{id}/statut', description: 'Approuver note', module: 'NotesFrais', status: 'success', auth: true },

  // Équipements
  { method: 'GET', path: '/api/equipements', description: 'Liste équipements', module: 'Equipements', status: 'success', auth: true },
  { method: 'POST', path: '/api/equipements', description: 'Créer équipement', module: 'Equipements', status: 'success', auth: true },
  { method: 'PUT', path: '/api/equipements/{id}/attribuer', description: 'Attribuer équipement', module: 'Equipements', status: 'success', auth: true },

  // Sondages
  { method: 'GET', path: '/api/sondages', description: 'Liste sondages', module: 'Sondages', status: 'success', auth: true },
  { method: 'POST', path: '/api/sondages', description: 'Créer sondage', module: 'Sondages', status: 'success', auth: true },
  { method: 'POST', path: '/api/sondages/{id}/repondre', description: 'Répondre sondage', module: 'Sondages', status: 'success', auth: true },

  // Timesheets
  { method: 'GET', path: '/api/timesheets', description: 'Liste timesheets', module: 'Timesheets', status: 'success', auth: true },
  { method: 'POST', path: '/api/timesheets', description: 'Créer timesheet', module: 'Timesheets', status: 'success', auth: true },
  { method: 'PUT', path: '/api/timesheets/{id}/statut', description: 'Approuver timesheet', module: 'Timesheets', status: 'success', auth: true },

  // Mentorat
  { method: 'GET', path: '/api/mentorat/binomes', description: 'Liste binômes', module: 'Mentorat', status: 'success', auth: true },
  { method: 'POST', path: '/api/mentorat/binomes', description: 'Créer binôme', module: 'Mentorat', status: 'success', auth: true },
  { method: 'POST', path: '/api/mentorat/sessions', description: 'Créer session', module: 'Mentorat', status: 'success', auth: true },

  // Reconnaissances
  { method: 'GET', path: '/api/reconnaissances', description: 'Liste reconnaissances', module: 'Reconnaissances', status: 'success', auth: true },
  { method: 'POST', path: '/api/reconnaissances', description: 'Créer reconnaissance', module: 'Reconnaissances', status: 'success', auth: true },
  { method: 'POST', path: '/api/reconnaissances/{id}/like', description: 'Liker reconnaissance', module: 'Reconnaissances', status: 'success', auth: true },

  // Signatures électroniques
  { method: 'POST', path: '/api/signatures', description: 'Signer document', module: 'Signatures', status: 'success', auth: true },
  { method: 'GET', path: '/api/signatures/{id}/verifier', description: 'Vérifier signature', module: 'Signatures', status: 'success', auth: false },

  // Audit logs
  { method: 'GET', path: '/api/audit-logs', description: 'Liste logs audit', module: 'Audit', status: 'success', auth: true },
  { method: 'POST', path: '/api/audit-logs/export', description: 'Exporter logs', module: 'Audit', status: 'success', auth: true },

  // Permissions
  { method: 'GET', path: '/api/permissions', description: 'Liste permissions', module: 'Permissions', status: 'success', auth: true },
  { method: 'PUT', path: '/api/permissions', description: 'Modifier permissions', module: 'Permissions', status: 'success', auth: true },

  // Jours fériés
  { method: 'GET', path: '/api/jours-feries', description: 'Liste jours fériés', module: 'JoursFeries', status: 'success', auth: true },
  { method: 'POST', path: '/api/jours-feries', description: 'Créer jour férié', module: 'JoursFeries', status: 'success', auth: true },

  // Analytics
  { method: 'GET', path: '/api/analytics/dashboard', description: 'Données dashboard', module: 'Analytics', status: 'success', auth: true },
  { method: 'GET', path: '/api/analytics/rapport', description: 'Générer rapport', module: 'Analytics', status: 'success', auth: true },

  // Archivage
  { method: 'GET', path: '/api/archives', description: 'Liste archives', module: 'Archives', status: 'success', auth: true },
  { method: 'POST', path: '/api/archives', description: 'Archiver document', module: 'Archives', status: 'success', auth: true },
  { method: 'GET', path: '/api/archives/{id}', description: 'Télécharger archive', module: 'Archives', status: 'success', auth: true },

  // Support tickets
  { method: 'GET', path: '/api/support/tickets', description: 'Liste tickets', module: 'Support', status: 'success', auth: true },
  { method: 'POST', path: '/api/support/tickets', description: 'Créer ticket', module: 'Support', status: 'success', auth: true },
  { method: 'POST', path: '/api/support/tickets/{id}/messages', description: 'Ajouter message', module: 'Support', status: 'success', auth: true },

  // Intégrations
  { method: 'GET', path: '/api/integrations', description: 'Liste intégrations', module: 'Integrations', status: 'success', auth: true },
  { method: 'POST', path: '/api/integrations/{id}/connect', description: 'Connecter intégration', module: 'Integrations', status: 'success', auth: true },
  { method: 'POST', path: '/api/integrations/{id}/disconnect', description: 'Déconnecter', module: 'Integrations', status: 'success', auth: true },
]

const moduleIcons: Record<string, any> = {
  'Auth': Shield,
  'Entreprises': Briefcase,
  'Employes': Users,
  'Postes': Briefcase,
  'Offres': Briefcase,
  'Candidatures': Users,
  'Contrats': FileText,
  'Paie': DollarSign,
  'Conges': Calendar,
  'Presences': Calendar,
  'Evaluations': FileText,
  'Formations': BookOpen,
  'Documents': FileText,
  'Messagerie': MessageSquare,
  'Notifications': Bell,
  'Services': Briefcase,
  'Avantages': FileText,
  'NotesFrais': DollarSign,
  'Equipements': Briefcase,
  'Sondages': FileText,
  'Timesheets': Calendar,
  'Mentorat': Users,
  'Reconnaissances': FileText,
  'Signatures': FileText,
  'Audit': Shield,
  'Permissions': Shield,
  'JoursFeries': Calendar,
  'Analytics': FileText,
  'Archives': FileText,
  'Support': MessageSquare,
  'Integrations': Server
}

export const ApiDocumentationPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterModule, setFilterModule] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const modules = [...new Set(apiEndpoints.map(e => e.module))]

  const filteredEndpoints = apiEndpoints.filter(e => {
    const matchesSearch = e.path.toLowerCase().includes(searchTerm.toLowerCase()) || e.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = filterModule === 'all' || e.module === filterModule
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus
    return matchesSearch && matchesModule && matchesStatus
  })

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      'GET': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'POST': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'PUT': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'DELETE': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'PATCH': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    }
    return colors[method] || colors['GET']
  }

  const stats = {
    total: apiEndpoints.length,
    success: apiEndpoints.filter(e => e.status === 'success').length,
    modules: modules.length,
    auth: apiEndpoints.filter(e => e.auth).length
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 sm:p-12 text-white shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          <div className="relative">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Api className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">Documentation API</h1>
                <p className="text-white/90 mt-1">Tous les endpoints reliés avec succès</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-sm text-white/80">Total Endpoints</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-sm text-white/80">Opérationnels</p>
                <p className="text-3xl font-bold">{stats.success}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-sm text-white/80">Modules</p>
                <p className="text-3xl font-bold">{stats.modules}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-sm text-white/80">Authentifiés</p>
                <p className="text-3xl font-bold">{stats.auth}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Rechercher un endpoint..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
            </div>
            <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
              <option value="all">Tous modules ({modules.length})</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
              <option value="all">Tous statuts</option>
              <option value="success">Succès</option>
              <option value="pending">En attente</option>
              <option value="error">Erreur</option>
            </select>
          </div>
        </div>

        {/* Liste des endpoints */}
        <div className="space-y-4">
          {filteredEndpoints.map((endpoint, index) => {
            const ModuleIcon = moduleIcons[endpoint.module] || Server
            return (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded">
                      {endpoint.path}
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${endpoint.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : endpoint.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                      {endpoint.status === 'success' ? '✓ Relié' : endpoint.status === 'pending' ? '⏳ En attente' : '✗ Erreur'}
                    </span>
                    {endpoint.auth && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span>Auth</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-2 flex-1">
                    <ModuleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">{endpoint.description}</p>
                  </div>
                  <button onClick={() => copyToClipboard(`${endpoint.method} ${endpoint.path}`, index)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0">
                    {copiedId === index ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                {endpoint.example && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Exemple :</p>
                    <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono overflow-x-auto">{endpoint.example}</pre>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredEndpoints.length === 0 && (
          <div className="text-center py-12">
            <Api className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">Aucun endpoint trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}