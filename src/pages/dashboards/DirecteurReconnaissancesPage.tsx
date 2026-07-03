import { useState } from 'react'
import { Heart, Star, Award, ThumbsUp, Plus, Search, Send } from 'lucide-react'
import { mockReconnaissances, mockBadges } from '../../data/phase6Data'
import type { Reconnaissance, Badge } from '../../data/phase6Data'

export const DirecteurReconnaissancesPage = () => {
  const [activeTab, setActiveTab] = useState<'reconnaissances' | 'badges'>('reconnaissances')
  const [reconnaissances] = useState<Reconnaissance[]>(mockReconnaissances)
  const [badges] = useState<Badge[]>(mockBadges)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Felicitation': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Remerciement': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Encouragement': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Succes': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    }
    return colors[type] || colors['Felicitation']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Reconnaissances & Badges</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Valorisez vos employes</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouvelle reconnaissance</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex">
            <button onClick={() => setActiveTab('reconnaissances')} className={`flex-1 px-6 py-4 font-semibold ${activeTab === 'reconnaissances' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
              Reconnaissances ({reconnaissances.length})
            </button>
            <button onClick={() => setActiveTab('badges')} className={`flex-1 px-6 py-4 font-semibold ${activeTab === 'badges' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
              Badges ({badges.length})
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'reconnaissances' ? (
            <div className="space-y-4">
              {reconnaissances.map(rec => (
                <div key={rec.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{rec.de[0]}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{rec.de}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">a reconnu <span className="font-semibold text-amber-600">{rec.pour}</span></p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{rec.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(rec.type)}`}>
                      {rec.type}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mb-4 italic">"{rec.message}"</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.badges.map((badge, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-600">
                    <button className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="font-semibold">{rec.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                      <ThumbsUp className="w-5 h-5" />
                      <span className="text-sm">J'aime</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 text-center">
                  <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${badge.couleur} rounded-full flex items-center justify-center mb-4 text-4xl`}>
                    {badge.icone}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">{badge.nom}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{badge.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Condition</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{badge.condition}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Attribues</span>
                      <span className="font-bold text-amber-600">{badge.nombre_attribues}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}