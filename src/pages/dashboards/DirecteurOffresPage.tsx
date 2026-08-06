import { useEffect, useState } from 'react'
import { Briefcase, Plus, Search, Edit, Eye, Send, Pause, Users, Calendar, DollarSign, X, AlertCircle } from 'lucide-react'
import { offreAPI } from '../../services/api'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

type OfferDisplay = {
  id: number
  titre: string
  description: string
  type_contrat: string
  localisation: string
  experience_requise: string
  competences_requises: string
  avantages: string
  salaire_base: number
  date_limite: string
  statut: 'Publiee' | 'Brouillon' | 'Expiree' | 'Suspendue'
  nombre_candidatures: number
}

export const DirecteurOffresPage = () => {
  const [offres, setOffres] = useState<OfferDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOffre, setSelectedOffre] = useState<OfferDisplay | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'expired'>('all')

  const [formData, setFormData] = useState({
    titre: '', description: '', type_contrat: '', localisation: '', experience_requise: '', competences_requises: '', avantages: '', salaire_base: '', date_expiration: ''
  })

  const toDisplayOffer = (offre: any): OfferDisplay => ({
    id: offre.id_offre,
    titre: offre.titre,
    description: offre.description,
    type_contrat: offre.type_contrat,
    localisation: offre.localisation,
    experience_requise: offre.experience_requise,
    competences_requises: offre.competences_requises,
    avantages: offre.avantages,
    salaire_base: Number(offre.salaire_base),
    date_limite: offre.date_limite,
    statut: new Date(offre.date_limite) < new Date() ? 'Expiree' : offre.statut === 'Publiée' ? 'Publiee' : offre.statut === 'Archivée' ? 'Suspendue' : 'Brouillon',
    nombre_candidatures: Number(offre.postulations_count ?? 0),
  })

  const loadOffres = async () => {
    setLoading(true)
    try {
      const response = await offreAPI.getForCompany()
      setOffres((response.offres || []).map(toDisplayOffer))
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de charger les offres réelles.')
      setOffres([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOffres()
  }, [])

  const filteredOffres = offres.filter(o => {
    const matchesSearch = o.titre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || o.statut === filterStatut
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'published' && o.statut === 'Publiee') ||
      (activeTab === 'draft' && o.statut === 'Brouillon') ||
      (activeTab === 'expired' && o.statut === 'Expiree')
    return matchesSearch && matchesStatut && matchesTab
  })

  const stats = {
    total: offres.length,
    publiees: offres.filter(o => o.statut === 'Publiee').length,
    brouillons: offres.filter(o => o.statut === 'Brouillon').length,
    expirees: offres.filter(o => o.statut === 'Expiree').length,
    totalCandidatures: offres.reduce((sum, o) => sum + o.nombre_candidatures, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await offreAPI.createForCompany({
        titre: formData.titre,
        description: formData.description,
        type_contrat: formData.type_contrat,
        localisation: formData.localisation,
        experience_requise: formData.experience_requise,
        competences_requises: formData.competences_requises,
        avantages: formData.avantages,
        date_limite: formData.date_expiration,
        salaire_base: Number(formData.salaire_base),
        statut: 'Brouillon',
      })
      await loadOffres()
      setFeedback('Offre créée en brouillon. Publiez-la lorsqu’elle est prête.')
      setShowCreateModal(false)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de créer l’offre.')
    }
  }

  const handlePublish = async (id: number) => {
    try {
      await offreAPI.updateCompanyStatus(id, 'Publiée')
      await loadOffres()
      setFeedback('Offre publiée. Elle est maintenant visible dans l’espace public.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de publier l’offre.')
    }
  }

  const handleUnpublish = async (id: number) => {
    try {
      await offreAPI.updateCompanyStatus(id, 'Archivée')
      await loadOffres()
      setFeedback('Offre archivée: elle n’est plus accessible publiquement.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible d’archiver l’offre.')
    }
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Publiee': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Brouillon': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      'Expiree': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Suspendue': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    }
    return colors[statut] || colors['Brouillon']
  }

  const tabs = [
    { id: 'all' as const, label: 'Toutes' },
    { id: 'published' as const, label: 'Publiées' },
    { id: 'draft' as const, label: 'Brouillons' },
    { id: 'expired' as const, label: 'Expirées' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Publication d'Offres</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gerez vos offres d'emploi</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
          <Plus className="w-5 h-5" />
          <span>Nouvelle offre</span>
        </button>
      </div>

      {feedback && <p className="text-sm text-slate-600 dark:text-slate-300">{feedback}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Briefcase, color: 'from-primary-500 to-primary-700' },
          { label: 'Publiees', value: stats.publiees, icon: Send, color: 'from-primary-600 to-primary-800' },
          { label: 'Brouillons', value: stats.brouillons, icon: Edit, color: 'from-slate-500 to-slate-700' },
          { label: 'Expirees', value: stats.expirees, icon: AlertCircle, color: 'from-primary-700 to-primary-900' },
          { label: 'Candidatures', value: stats.totalCandidatures, icon: Users, color: 'from-primary-500 to-primary-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-2`}>
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
              { id: 'all', label: 'Toutes', count: stats.total },
              { id: 'published', label: 'Publiees', count: stats.publiees },
              { id: 'draft', label: 'Brouillons', count: stats.brouillons },
              { id: 'expired', label: 'Expirees', count: stats.expirees }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap ${activeTab === tab.id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-600 dark:text-slate-400'}`}>
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Rechercher une offre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
            </div>
            <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
              <option value="all">Tous les statuts</option>
              <option value="Publiee">Publiee</option>
              <option value="Brouillon">Brouillon</option>
              <option value="Expiree">Expiree</option>
              <option value="Suspendue">Suspendue</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? <p className="text-sm text-slate-600 dark:text-slate-400">Chargement des offres...</p> : filteredOffres.map(offre => (
              <div key={offre.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg">{offre.titre}</h3>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(offre.statut)}`}>
                    {offre.statut}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{offre.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-bold text-primary-700 dark:text-primary-300">{money.format(offre.salaire_base)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Exp: {offre.date_limite}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{offre.nombre_candidatures} candidatures</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex space-x-2">
                    {offre.statut === 'Brouillon' && (
                      <button onClick={() => handlePublish(offre.id)} className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200">
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {offre.statut === 'Publiee' && (
                      <button onClick={() => handleUnpublish(offre.id)} className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200">
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => { setSelectedOffre(offre); setShowDetailModal(true) }} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Creer une nouvelle offre</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre du poste *</label>
                <input type="text" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type de contrat *</label>
                  <select value={formData.type_contrat} onChange={(e) => setFormData({...formData, type_contrat: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required>
                    <option value="">Sélectionner</option><option value="CDI">CDI</option><option value="CDD">CDD</option><option value="Stage">Stage</option><option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Localisation *</label>
                  <input type="text" value={formData.localisation} onChange={(e) => setFormData({...formData, localisation: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Expérience requise *</label>
                <input type="text" value={formData.experience_requise} onChange={(e) => setFormData({...formData, experience_requise: e.target.value})} placeholder="Ex. 3 ans en développement web" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Compétences requises *</label>
                <textarea value={formData.competences_requises} onChange={(e) => setFormData({...formData, competences_requises: e.target.value})} rows={3} placeholder="Décrivez les compétences techniques et humaines attendues." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Avantages *</label>
                <textarea value={formData.avantages} onChange={(e) => setFormData({...formData, avantages: e.target.value})} rows={3} placeholder="Décrivez les avantages proposés par l’entreprise." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Salaire de base ($)</label>
                  <input type="number" min="0" value={formData.salaire_base} onChange={(e) => setFormData({...formData, salaire_base: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date expiration</label>
                  <input type="date" value={formData.date_expiration} onChange={(e) => setFormData({...formData, date_expiration: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
              </div>
              <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-800 pb-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Creer l'offre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedOffre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedOffre.titre}</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatutColor(selectedOffre.statut)}`}>
                  {selectedOffre.statut}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Description</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedOffre.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Salaire</p>
                  <p className="font-bold text-primary-700 dark:text-primary-300">{money.format(selectedOffre.salaire_base)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Échéance</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedOffre.date_limite}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><p className="text-xs text-slate-500 dark:text-slate-400">Contrat</p><p className="font-bold text-slate-800 dark:text-white">{selectedOffre.type_contrat}</p></div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><p className="text-xs text-slate-500 dark:text-slate-400">Localisation</p><p className="font-bold text-slate-800 dark:text-white">{selectedOffre.localisation}</p></div>
              </div>
              <div><h4 className="font-bold text-slate-800 dark:text-white mb-2">Expérience et compétences</h4><p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{selectedOffre.experience_requise}\n{selectedOffre.competences_requises}</p></div>
              <div><h4 className="font-bold text-slate-800 dark:text-white mb-2">Avantages</h4><p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{selectedOffre.avantages}</p></div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{selectedOffre.nombre_candidatures}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Candidatures</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{selectedOffre.date_limite}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Expiration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}