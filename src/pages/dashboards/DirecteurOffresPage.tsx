import { useState } from 'react'
import { Briefcase, Plus, Search, Edit, Trash2, Eye, Send, Pause, Play, TrendingUp, Users, Calendar, MapPin, DollarSign, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { mockOffresPublication } from '../../data/advancedData'
import type { OffrePublication } from '../../data/advancedData'

export const DirecteurOffresPage = () => {
  const [offres, setOffres] = useState<OffrePublication[]>(mockOffresPublication)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOffre, setSelectedOffre] = useState<OffrePublication | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'expired'>('all')

  const [formData, setFormData] = useState({
    titre: '', description: '', type_contrat: 'CDI', niveau: 'Junior',
    departement: '', salaire_min: '', salaire_max: '', localisation: '',
    date_expiration: '', experience_requise: '', niveau_etude: '', remote: 'Presentiel',
    exigences: '', avantages: '', competences: ''
  })

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
    totalVues: offres.reduce((sum, o) => sum + o.nombre_vues, 0),
    totalCandidatures: offres.reduce((sum, o) => sum + o.nombre_candidatures, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newOffre: OffrePublication = {
      id: Date.now(),
      poste_id: 0,
      ...formData,
      remote: formData.remote as OffrePublication['remote'],
      salaire_min: parseInt(formData.salaire_min),
      salaire_max: parseInt(formData.salaire_max),
      date_publication: new Date().toISOString().split('T')[0],
      statut: 'Brouillon',
      nombre_vues: 0,
      nombre_candidatures: 0,
      exigences: formData.exigences.split(',').map(e => e.trim()),
      avantages: formData.avantages.split(',').map(a => a.trim()),
      competences_requises: formData.competences.split(',').map(c => c.trim()),
      langues: ['Francais']
    }
    setOffres([...offres, newOffre])
    setShowCreateModal(false)
    setFormData({ titre: '', description: '', type_contrat: 'CDI', niveau: 'Junior', departement: '', salaire_min: '', salaire_max: '', localisation: '', date_expiration: '', experience_requise: '', niveau_etude: '', remote: 'Presentiel', exigences: '', avantages: '', competences: '' })
  }

  const handlePublish = (id: number) => {
    setOffres(offres.map(o => o.id === id ? { ...o, statut: 'Publiee' as const, date_publication: new Date().toISOString().split('T')[0] } : o))
  }

  const handleUnpublish = (id: number) => {
    setOffres(offres.map(o => o.id === id ? { ...o, statut: 'Suspendue' as const } : o))
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Supprimer cette offre ?')) {
      setOffres(offres.filter(o => o.id !== id))
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
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouvelle offre</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Briefcase, color: 'from-amber-500 to-orange-600' },
          { label: 'Publiees', value: stats.publiees, icon: Send, color: 'from-green-500 to-emerald-600' },
          { label: 'Brouillons', value: stats.brouillons, icon: Edit, color: 'from-slate-500 to-slate-600' },
          { label: 'Expirees', value: stats.expirees, icon: AlertCircle, color: 'from-red-500 to-rose-600' },
          { label: 'Vues', value: stats.totalVues, icon: Eye, color: 'from-blue-500 to-cyan-600' },
          { label: 'Candidatures', value: stats.totalCandidatures, icon: Users, color: 'from-purple-500 to-pink-600' }
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap ${activeTab === tab.id ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
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
            {filteredOffres.map(offre => (
              <div key={offre.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg">{offre.titre}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{offre.departement} • {offre.type_contrat}</p>
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
                    <span>${offre.salaire_min} - ${offre.salaire_max}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{offre.localisation}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Exp: {offre.date_expiration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{offre.nombre_candidatures} candidatures</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{offre.nombre_vues} vues</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{offre.remote}</span>
                    </span>
                  </div>
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
                    <button onClick={() => handleDelete(offre.id)} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200">
                      <Trash2 className="w-4 h-4" />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type de contrat</label>
                  <select value={formData.type_contrat} onChange={(e) => setFormData({...formData, type_contrat: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Niveau</label>
                  <select value={formData.niveau} onChange={(e) => setFormData({...formData, niveau: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mode de travail</label>
                  <select value={formData.remote} onChange={(e) => setFormData({...formData, remote: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="Presentiel">Presentiel</option>
                    <option value="Hybride">Hybride</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Departement</label>
                  <input type="text" value={formData.departement} onChange={(e) => setFormData({...formData, departement: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Localisation</label>
                  <input type="text" value={formData.localisation} onChange={(e) => setFormData({...formData, localisation: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Salaire min ($)</label>
                  <input type="number" value={formData.salaire_min} onChange={(e) => setFormData({...formData, salaire_min: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Salaire max ($)</label>
                  <input type="number" value={formData.salaire_max} onChange={(e) => setFormData({...formData, salaire_max: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date expiration</label>
                  <input type="date" value={formData.date_expiration} onChange={(e) => setFormData({...formData, date_expiration: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Experience requise</label>
                  <input type="text" value={formData.experience_requise} onChange={(e) => setFormData({...formData, experience_requise: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" placeholder="Ex: 3-5 ans" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Niveau d'etude</label>
                  <input type="text" value={formData.niveau_etude} onChange={(e) => setFormData({...formData, niveau_etude: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" placeholder="Ex: Bac+5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Exigences (separees par virgules)</label>
                <input type="text" value={formData.exigences} onChange={(e) => setFormData({...formData, exigences: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" placeholder="Ex: 5 ans d'experience, Maitrise React" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Avantages (separees par virgules)</label>
                <input type="text" value={formData.avantages} onChange={(e) => setFormData({...formData, avantages: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" placeholder="Ex: Teletravail, Mutuelle" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Competences requises (separees par virgules)</label>
                <input type="text" value={formData.competences} onChange={(e) => setFormData({...formData, competences: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" placeholder="Ex: React, Node.js, TypeScript" />
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
                <span className="text-sm text-slate-600 dark:text-slate-400">{selectedOffre.type_contrat} • {selectedOffre.niveau}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Description</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedOffre.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Salaire</p>
                  <p className="font-bold text-slate-800 dark:text-white">${selectedOffre.salaire_min} - ${selectedOffre.salaire_max}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Localisation</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedOffre.localisation}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Experience</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedOffre.experience_requise}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mode de travail</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedOffre.remote}</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Exigences</h4>
                <ul className="space-y-1">
                  {selectedOffre.exigences.map((ex, i) => (
                    <li key={i} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Avantages</h4>
                <ul className="space-y-1">
                  {selectedOffre.avantages.map((av, i) => (
                    <li key={i} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>{av}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Competences requises</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedOffre.competences_requises.map((comp, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{selectedOffre.nombre_vues}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Vues</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{selectedOffre.nombre_candidatures}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Candidatures</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{selectedOffre.date_expiration}</p>
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