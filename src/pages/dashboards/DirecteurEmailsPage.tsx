import { useState } from 'react'
import { Mail, Search, CheckCircle2, XCircle, Star, Trash2, Eye, Clock, Calendar, Users, Briefcase, DollarSign, Filter, X, Send, Edit, Plus } from 'lucide-react'
import { emailService, EmailNotification, EmailTemplate } from '../../services/emailNotificationService'

export const DirecteurEmailsPage = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'templates' | 'stats'>('inbox')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterLu, setFilterLu] = useState('all')
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null)
  const [notifications, setNotifications] = useState<EmailNotification[]>(emailService.getAllNotifications())
  const [templates, setTemplates] = useState<EmailTemplate[]>(emailService.getTemplates())
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)

  const refreshNotifications = () => {
    setNotifications(emailService.getAllNotifications())
  }

  const filteredEmails = notifications.filter(email => {
    const matchesSearch = email.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.destinataire.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || email.type === filterType
    const matchesLu = filterLu === 'all' || 
                     (filterLu === 'lu' && email.lu) || 
                     (filterLu === 'nonlu' && !email.lu)
    return matchesSearch && matchesType && matchesLu
  })

  const stats = emailService.getStats()

  const handleMarkAsRead = (id: number) => {
    emailService.markAsRead(id)
    refreshNotifications()
  }

  const handleMarkAllAsRead = () => {
    emailService.markAllAsRead()
    refreshNotifications()
  }

  const handleDelete = (id: number) => {
    emailService.deleteNotification(id)
    refreshNotifications()
    if (selectedEmail?.id === id) setSelectedEmail(null)
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'entretien': Calendar,
      'validation': CheckCircle2,
      'candidature': Users,
      'poste': Briefcase,
      'paie': DollarSign,
      'conge': Clock,
      'document': Mail,
      'systeme': Mail,
    }
    return icons[type] || Mail
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'entretien': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'validation': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'candidature': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'poste': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'paie': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      'conge': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    }
    return colors[type] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Centre de Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Toutes vos notifications par email</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
            {stats.nonLus} non lu(s)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'from-amber-500 to-orange-600', icon: Mail },
          { label: 'Non lus', value: stats.nonLus, color: 'from-red-500 to-rose-600', icon: XCircle },
          { label: 'Entretiens', value: stats.parType.entretien, color: 'from-blue-500 to-cyan-600', icon: Calendar },
          { label: 'Validations', value: stats.parType.validation, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Action requise', value: stats.actionRequise, color: 'from-pink-500 to-rose-600', icon: Star },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {[
              { id: 'inbox', label: 'Boite de reception', icon: Mail, count: notifications.length },
              { id: 'templates', label: 'Modeles email', icon: Edit, count: templates.length },
              { id: 'stats', label: 'Statistiques', icon: Star, count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'inbox' && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">
                  <option value="all">Tous les types</option>
                  <option value="entretien">Entretiens</option>
                  <option value="validation">Validations</option>
                  <option value="candidature">Candidatures</option>
                  <option value="poste">Postes</option>
                  <option value="paie">Paies</option>
                  <option value="conge">Conges</option>
                </select>
                <select value={filterLu} onChange={(e) => setFilterLu(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">
                  <option value="all">Tous</option>
                  <option value="nonlu">Non lus</option>
                  <option value="lu">Lus</option>
                </select>
                <button onClick={handleMarkAllAsRead} className="px-4 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-sm font-semibold hover:bg-amber-200">
                  Tout marquer lu
                </button>
              </div>

              <div className="space-y-2">
                {filteredEmails.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 dark:text-slate-400">Aucune notification</p>
                  </div>
                ) : (
                  filteredEmails.map(email => {
                    const TypeIcon = getTypeIcon(email.type)
                    return (
                      <div
                        key={email.id}
                        onClick={() => { setSelectedEmail(email); handleMarkAsRead(email.id) }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                          selectedEmail?.id === email.id
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                            : email.lu
                            ? 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-l-4 border-l-amber-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(email.type)}`}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className={`font-semibold text-slate-800 dark:text-white truncate ${!email.lu ? 'text-base' : 'text-sm'}`}>
                                  {email.titre}
                                </p>
                                {email.important && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                                {email.actionRequise && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">Action</span>}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{email.message}</p>
                              <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>A: {email.destinataire}</span>
                                <span>•</span>
                                <span>{new Date(email.date).toLocaleString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(email.id) }}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-600 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Modeles d'email</h3>
                <button onClick={() => { setEditingTemplate(null); setShowTemplateModal(true) }} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm">
                  <Plus className="w-4 h-4" />
                  <span>Nouveau modele</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{template.nom}</h4>
                        <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">{template.categorie}</span>
                      </div>
                      <button onClick={() => { setEditingTemplate(template); setShowTemplateModal(true) }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg">
                        <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>Sujet:</strong> {template.sujet}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">{template.contenu}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.variables.map((v, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                          {'{'}{v}{'}'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Statistiques des notifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.parType).map(([type, count]) => {
                  const TypeIcon = getTypeIcon(type)
                  return (
                    <div key={type} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(type)}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">{type}</p>
                          <p className="text-2xl font-bold text-slate-800 dark:text-white">{count}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingTemplate ? 'Modifier le modele' : 'Nouveau modele'}
              </h3>
              <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <TemplateForm
              template={editingTemplate}
              onSave={(template) => {
                emailService.saveTemplate(template)
                setTemplates(emailService.getTemplates())
                setShowTemplateModal(false)
              }}
              onCancel={() => setShowTemplateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Composant formulaire de template
const TemplateForm = ({ template, onSave, onCancel }: { template: EmailTemplate | null, onSave: (t: EmailTemplate) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<EmailTemplate>(
    template || { id: 0, nom: '', sujet: '', contenu: '', categorie: 'entretien', variables: [] }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Extraire les variables du contenu
    const vars = formData.contenu.match(/\{(\w+)\}/g)?.map(v => v.slice(1, -1)) || []
    onSave({ ...formData, variables: vars })
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom du modele</label>
        <input type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Categorie</label>
        <select value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
          <option value="entretien">Entretien</option>
          <option value="validation">Validation</option>
          <option value="candidature">Candidature</option>
          <option value="poste">Poste</option>
          <option value="paie">Paie</option>
          <option value="conge">Conge</option>
          <option value="document">Document</option>
          <option value="systeme">Systeme</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sujet de l'email</label>
        <input type="text" value={formData.sujet} onChange={(e) => setFormData({...formData, sujet: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required placeholder="Utilisez {variable} pour les variables" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contenu de l'email</label>
        <textarea value={formData.contenu} onChange={(e) => setFormData({...formData, contenu: e.target.value})} rows={8} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" required placeholder="Utilisez {variable} pour les variables dynamiques" />
      </div>
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">Variables disponibles :</p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Utilisez {'{candidat}'}, {'{poste}'}, {'{date}'}, {'{heure}'}, {'{type}'}, {'{entreprise}'}, {'{email}'}, {'{mot_de_passe}'}, {'{employe}'}, {'{mois}'}, {'{montant}'}, {'{jours}'}, {'{date_debut}'}, {'{date_fin}'}
        </p>
      </div>
      <div className="flex space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
        <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Sauvegarder</button>
      </div>
    </form>
  )
}