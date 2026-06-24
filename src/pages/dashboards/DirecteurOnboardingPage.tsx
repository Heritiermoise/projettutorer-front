import { useState } from 'react'
import { Users, CheckCircle2, Clock, AlertCircle, Calendar, Target, Plus, X, Eye } from 'lucide-react'
import { mockOnboarding } from '../../data/phase2Data'
import type { EmployeOnboarding } from '../../data/phase2Data'

export const DirecteurOnboardingPage = () => {
  const [onboardings, setOnboardings] = useState<EmployeOnboarding[]>(mockOnboarding)
  const [selectedOnboarding, setSelectedOnboarding] = useState<EmployeOnboarding | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const stats = {
    total: onboardings.length,
    enCours: onboardings.filter(o => o.progression > 0 && o.progression < 100).length,
    termines: onboardings.filter(o => o.progression === 100).length,
    tachesTotal: onboardings.reduce((sum, o) => sum + o.taches.length, 0),
    tachesTerminees: onboardings.reduce((sum, o) => sum + o.taches.filter(t => t.statut === 'Termine').length, 0)
  }

  const getCategorieColor = (categorie: string) => {
    const colors: Record<string, string> = {
      'Administratif': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Technique': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'Formation': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Integration': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    }
    return colors[categorie] || colors['Administratif']
  }

  const getStatutIcon = (statut: string) => {
    if (statut === 'Termine') return <CheckCircle2 className="w-5 h-5 text-green-600" />
    if (statut === 'En_cours') return <Clock className="w-5 h-5 text-amber-600" />
    return <AlertCircle className="w-5 h-5 text-slate-400" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Onboarding</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Integration des nouveaux employes</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouvel employe</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'En integration', value: stats.total, icon: Users, color: 'from-amber-500 to-orange-600' },
          { label: 'En cours', value: stats.enCours, icon: Clock, color: 'from-blue-500 to-cyan-600' },
          { label: 'Terminees', value: stats.terminees, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
          { label: 'Total taches', value: stats.tachesTotal, icon: Target, color: 'from-purple-500 to-pink-600' },
          { label: 'Taches faites', value: `${stats.tachesTerminees}/${stats.tachesTotal}`, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {onboardings.map(onboarding => (
          <div key={onboarding.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{onboarding.prenom[0]}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{onboarding.prenom} {onboarding.nom}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{onboarding.poste}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Depuis le {onboarding.date_debut}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => { setSelectedOnboarding(onboarding); setShowDetailModal(true) }} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200">
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400">Progression globale</span>
                <span className="font-bold text-amber-600">{onboarding.progression}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all" style={{ width: `${onboarding.progression}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Taches recentes</h4>
              {onboarding.taches.slice(0, 3).map(tache => (
                <div key={tache.id} className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  {getStatutIcon(tache.statut)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{tache.titre}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${getCategorieColor(tache.categorie)}`}>
                      {tache.categorie}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showDetailModal && selectedOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Onboarding - {selectedOnboarding.prenom} {selectedOnboarding.nom}</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">{selectedOnboarding.prenom[0]}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedOnboarding.prenom} {selectedOnboarding.nom}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{selectedOnboarding.poste}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Progression</span>
                      <span className="font-bold text-amber-600">{selectedOnboarding.progression}%</span>
                    </div>
                    <div className="w-64 bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full" style={{ width: `${selectedOnboarding.progression}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-4">Liste des taches</h4>
                <div className="space-y-3">
                  {selectedOnboarding.taches.map(tache => (
                    <div key={tache.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getStatutIcon(tache.statut)}
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">{tache.titre}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{tache.description}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategorieColor(tache.categorie)}`}>
                          {tache.categorie}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Responsable: <span className="font-semibold">{tache.responsable}</span></span>
                        <span className="text-slate-600 dark:text-slate-400">Echeance: <span className="font-semibold">{tache.date_limite}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}