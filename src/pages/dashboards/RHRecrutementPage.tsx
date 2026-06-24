import { useState } from 'react'
import { Briefcase, Search, Plus, Eye, User, Mail, Phone, Calendar, FileText, X } from 'lucide-react'
import { mockOffresEmploi, mockCandidats, mockPostulations } from '../../data/mockData'

export const RHRecrutementPage = () => {
  const [activeTab, setActiveTab] = useState<'offres' | 'candidats' | 'postulations'>('offres')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOffres = mockOffresEmploi.filter(o => o.titre.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredCandidats = mockCandidats.filter(c => c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || c.prenom.toLowerCase().includes(searchTerm.toLowerCase()))

  const stats = {
    offresActives: mockOffresEmploi.filter(o => o.statut === 'Publiee').length,
    totalCandidats: mockCandidats.length,
    postulations: mockPostulations.length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion du Recrutement</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Offres, candidats et postulations</p>
        </div>
        <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle offre</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {[
          { label: 'Offres actives', value: stats.offresActives, color: 'from-primary-500 to-purple-600', icon: Briefcase },
          { label: 'Candidats', value: stats.totalCandidats, color: 'from-accent-500 to-emerald-600', icon: User },
          { label: 'Postulations', value: stats.postulations, color: 'from-amber-500 to-orange-600', icon: FileText },
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {[
              { id: 'offres', label: 'Offres d\'emploi', count: stats.offresActives },
              { id: 'candidats', label: 'Candidats', count: stats.totalCandidats },
              { id: 'postulations', label: 'Postulations', count: stats.postulations },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-4 font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-600 dark:text-slate-400 hover:text-primary-600'}`}
              >
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>

          {activeTab === 'offres' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOffres.map(offre => (
                <div key={offre.id_offre} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">{offre.titre}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{offre.description}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{offre.statut}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Salaire: <span className="font-bold text-primary-600">${offre.salaire_base}</span></span>
                    <span className="text-slate-500 dark:text-slate-400">Limite: {offre.date_limite}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'candidats' && (
            <div className="space-y-3">
              {filteredCandidats.map(candidat => (
                <div key={candidat.id_candidat} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{candidat.prenom[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{candidat.prenom} {candidat.nom}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{candidat.email}</p>
                    </div>
                  </div>
                  <button className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg"><Eye className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'postulations' && (
            <div className="space-y-3">
              {mockPostulations.map(post => {
                const candidat = mockCandidats.find(c => c.id_candidat === post.id_candidat)
                const offre = mockOffresEmploi.find(o => o.id_offre === post.id_offre)
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">Postule pour: <span className="font-semibold">{offre?.titre}</span></p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}