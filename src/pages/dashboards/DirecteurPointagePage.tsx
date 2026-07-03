import { useState } from 'react'
import { Clock, MapPin, CheckCircle2, AlertCircle, XCircle, Calendar, Search, Filter, Download, User } from 'lucide-react'
import { mockPointages } from '../../data/phase6Data'
import type { Pointage } from '../../data/phase6Data'

export const DirecteurPointagePage = () => {
  const [pointages] = useState<Pointage[]>(mockPointages)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterDate, setFilterDate] = useState('')

  const filteredPointages = pointages.filter(p => {
    const matchesSearch = p.employe_nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || p.statut === filterStatut
    const matchesDate = !filterDate || p.date === filterDate
    return matchesSearch && matchesStatut && matchesDate
  })

  const stats = {
    total: pointages.length,
    presents: pointages.filter(p => p.statut === 'Present').length,
    retards: pointages.filter(p => p.statut === 'Retard').length,
    absents: pointages.filter(p => p.statut === 'Absent').length,
    conges: pointages.filter(p => p.statut === 'Conge').length,
    moyenneHeures: (pointages.reduce((sum, p) => sum + p.heures_travaillees, 0) / pointages.filter(p => p.heures_travaillees > 0).length).toFixed(1)
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Present': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Retard': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Absent': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Conge': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    }
    return colors[statut] || colors['Present']
  }

  const getStatutIcon = (statut: string) => {
    if (statut === 'Present') return <CheckCircle2 className="w-5 h-5 text-green-600" />
    if (statut === 'Retard') return <AlertCircle className="w-5 h-5 text-amber-600" />
    if (statut === 'Absent') return <XCircle className="w-5 h-5 text-red-600" />
    return <Calendar className="w-5 h-5 text-blue-600" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Pointage des Employes</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Suivi des arrivees et departs</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Download className="w-5 h-5" />
          <span>Exporter</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Clock, color: 'from-amber-500 to-orange-600' },
          { label: 'Presents', value: stats.presents, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
          { label: 'Retards', value: stats.retards, icon: AlertCircle, color: 'from-amber-500 to-yellow-600' },
          { label: 'Absents', value: stats.absents, icon: XCircle, color: 'from-red-500 to-rose-600' },
          { label: 'En conge', value: stats.conges, icon: Calendar, color: 'from-blue-500 to-cyan-600' },
          { label: 'Moy. heures', value: stats.moyenneHeures + 'h', icon: Clock, color: 'from-purple-500 to-pink-600' }
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un employe..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous statuts</option>
            <option value="Present">Present</option>
            <option value="Retard">Retard</option>
            <option value="Absent">Absent</option>
            <option value="Conge">Conge</option>
          </select>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Employe</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden md:table-cell">Arrivee</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden md:table-cell">Depart</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden lg:table-cell">Heures</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredPointages.map(pointage => (
                <tr key={pointage.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{pointage.employe_nom[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{pointage.employe_nom}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{pointage.employe_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{pointage.date}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-slate-800 dark:text-white hidden md:table-cell">{pointage.heure_arrivee || '-'}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-slate-800 dark:text-white hidden md:table-cell">{pointage.heure_depart || '-'}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{pointage.heures_travaillees}h</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getStatutIcon(pointage.statut)}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(pointage.statut)}`}>
                        {pointage.statut}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}