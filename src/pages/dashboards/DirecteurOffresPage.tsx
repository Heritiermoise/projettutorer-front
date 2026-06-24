import { useState } from 'react'
import { Briefcase, Plus, Search, Edit, Trash2, Eye, Users, Calendar, DollarSign, X } from 'lucide-react'
import { mockOffresEmploi, mockPostulations, mockCandidats } from '../../data/mockData'

export const DirecteurOffresPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedOffre, setSelectedOffre] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    salaire_base: '',
    date_limite: '',
  })

  const filteredOffres = mockOffresEmploi.filter(o => 
    o.titre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Offre créée avec succès !')
    setShowCreateModal(false)
    setFormData({ titre: '', description: '', salaire_base: '', date_limite: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Offres d'Emploi</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{mockOffresEmploi.length} offres publiées</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle offre</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        {[
          { label: 'Offres actives', value: mockOffresEmploi.filter(o => o.statut === 'Publiee').length, color: 'from-amber-500 to-orange-600', icon: Briefcase },
          { label: 'Total postulations', value: mockPostulations.length, color: 'from-primary-500 to-purple-600', icon: Users },
          { label: 'Candidats', value: mockCandidats.length, color: 'from-accent-500 to-emerald-600', icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Rechercher une offre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredOffres.map(offre => {
          const postulationsCount = mockPostulations.filter(p => p.id_offre === offre.id_offre).length
          return (
            <div key={offre.id_offre} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                  {offre.statut}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{offre.titre}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{offre.description}</p>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold text-amber-600">${offre.salaire_base}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Date limite: {offre.date_limite}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  <span>{postulationsCount} postulation(s)</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setSelectedOffre(offre)} className="flex-1 px-3 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 flex items-center justify-center space-x-1">
                  <Eye className="w-4 h-4" /><span>Voir</span>
                </button>
                <button className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Créer une nouvelle offre</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre du poste *</label>
                <input type="text" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={6} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Salaire *</label>
                  <input type="number" value={formData.salaire_base} onChange={(e) => setFormData({...formData, salaire_base: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date limite *</label>
                  <input type="date" value={formData.date_limite} onChange={(e) => setFormData({...formData, date_limite: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500" required />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Publier l'offre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOffre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Détails de l'offre et postulations</h3>
              <button onClick={() => setSelectedOffre(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <h4 className="font-bold text-amber-800 dark:text-amber-200 text-lg">{selectedOffre.titre}</h4>
                <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">{selectedOffre.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-amber-700 dark:text-amber-300">
                  <span>Salaire: ${selectedOffre.salaire_base}</span>
                  <span>Date limite: {selectedOffre.date_limite}</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-4">Postulations reçues ({mockPostulations.filter(p => p.id_offre === selectedOffre.id_offre).length})</h4>
                {mockPostulations.filter(p => p.id_offre === selectedOffre.id_offre).length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucune postulation pour cette offre</p>
                ) : (
                  <div className="space-y-3">
                    {mockPostulations.filter(p => p.id_offre === selectedOffre.id_offre).map(post => {
                      const candidat = mockCandidats.find(c => c.id_candidat === post.id_candidat)
                      return (
                        <div key={post.id_postulation} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-slate-800 dark:text-white">{candidat?.prenom} {candidat?.nom}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              post.statut === 'Soumise' ? 'bg-blue-100 text-blue-700' :
                              post.statut === 'En cours' ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
                            }`}>{post.statut}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{candidat?.email} • {candidat?.telephone}</p>
                          <div className="flex space-x-2 mt-3">
                            <button className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm">Voir CV</button>
                            <button className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">Planifier entretien</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}