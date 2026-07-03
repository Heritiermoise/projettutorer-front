import { useState } from 'react'
import { Clock, Calendar, CheckCircle2, XCircle, AlertCircle, Plus, Eye, Filter, Download } from 'lucide-react'
import { mockTimesheets, Timesheet } from '../../data/phase7Data'

export const DirecteurTimesheetPage = () => {
  const [timesheets] = useState<Timesheet[]>(mockTimesheets)
  const [filterStatut, setFilterStatut] = useState('all')
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null)

  const filteredTimesheets = timesheets.filter(t => filterStatut === 'all' || t.statut === filterStatut)

  const stats = {
    total: timesheets.length,
    brouillons: timesheets.filter(t => t.statut === 'Brouillon').length,
    soumises: timesheets.filter(t => t.statut === 'Soumise').length,
    approuvees: timesheets.filter(t => t.statut === 'Approuvee').length,
    rejetees: timesheets.filter(t => t.statut === 'Rejetee').length,
    totalHeures: timesheets.reduce((sum, t) => sum + t.total_heures, 0)
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Brouillon': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      'Soumise': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Approuvee': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Rejetee': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }
    return colors[statut] || colors['Brouillon']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Timesheets</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Suivi des heures par projet</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600">
            <Download className="w-5 h-5" />
            <span>Exporter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
            <Plus className="w-5 h-5" />
            <span>Nouvelle timesheet</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Clock, color: 'from-amber-500 to-orange-600' },
          { label: 'Brouillons', value: stats.brouillons, icon: Clock, color: 'from-slate-500 to-slate-600' },
          { label: 'Soumises', value: stats.soumises, icon: AlertCircle, color: 'from-amber-500 to-yellow-600' },
          { label: 'Approuvees', value: stats.approuvees, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
          { label: 'Rejetees', value: stats.rejetees, icon: XCircle, color: 'from-red-500 to-rose-600' },
          { label: 'Heures totales', value: stats.totalHeures + 'h', icon: Clock, color: 'from-purple-500 to-pink-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
          <option value="all">Tous statuts</option>
          <option value="Brouillon">Brouillons</option>
          <option value="Soumise">Soumises</option>
          <option value="Approuvee">Approuvees</option>
          <option value="Rejetee">Rejetees</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredTimesheets.map(timesheet => (
          <div key={timesheet.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{timesheet.employe_nom}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Semaine du {timesheet.semaine}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(timesheet.statut)}`}>
                  {timesheet.statut}
                </span>
                <button onClick={() => setSelectedTimesheet(timesheet)} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total heures</p>
                <p className="text-2xl font-bold text-amber-600">{timesheet.total_heures}h</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Projets</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{timesheet.projets.length}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Soumise le</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{timesheet.date_soumission || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Approuvee le</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{timesheet.date_approbation || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-2">
              {timesheet.projets.map(projet => (
                <div key={projet.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">{projet.nom}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Client: {projet.client}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{projet.total_heures}h</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {projet.taches.slice(0, 3).map((tache, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-600 rounded text-xs">
                        {tache.description} ({tache.heures}h)
                      </span>
                    ))}
                    {projet.taches.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-600 rounded text-xs">
                        +{projet.taches.length - 3} autres
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTimesheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Timesheet - {selectedTimesheet.employe_nom}</h3>
              <button onClick={() => setSelectedTimesheet(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">X</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Semaine</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedTimesheet.semaine}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total heures</p>
                  <p className="text-2xl font-bold text-amber-600">{selectedTimesheet.total_heures}h</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-4">Details par projet</h4>
                <div className="space-y-4">
                  {selectedTimesheet.projets.map(projet => (
                    <div key={projet.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{projet.nom}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Client: {projet.client}</p>
                        </div>
                        <span className="text-lg font-bold text-amber-600">{projet.total_heures}h</span>
                      </div>
                      <div className="space-y-2">
                        {projet.taches.map(tache => (
                          <div key={tache.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg">
                            <div>
                              <p className="text-sm text-slate-800 dark:text-white">{tache.description}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{tache.date}</p>
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-white">{tache.heures}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(selectedTimesheet.statut)}`}>
                    {selectedTimesheet.statut}
                  </span>
                  {selectedTimesheet.date_soumission && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">Soumise le {selectedTimesheet.date_soumission}</span>
                  )}
                </div>
                {selectedTimesheet.statut === 'Soumise' && (
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approuver</span>
                    </button>
                    <button className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 flex items-center space-x-1">
                      <XCircle className="w-4 h-4" />
                      <span>Rejeter</span>
                    </button>
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