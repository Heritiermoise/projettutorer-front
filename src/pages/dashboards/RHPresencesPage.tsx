import { useState } from 'react'
import { Clock, Search, CheckCircle2, XCircle, AlertCircle, User, Calendar, Filter, Download } from 'lucide-react'
import { mockPresences, mockEmployes } from '../../data/mockData'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export const RHPresencesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterDate, setFilterDate] = useState('all')

  const getEmployeName = (matricule: string) => {
    const emp = mockEmployes.find(e => e.matricule === matricule)
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }

  const getEmployeInitial = (matricule: string) => {
    const emp = mockEmployes.find(e => e.matricule === matricule)
    return emp ? emp.prenom[0] : '?'
  }

  const getEmployeSexe = (matricule: string) => {
    const emp = mockEmployes.find(e => e.matricule === matricule)
    return emp ? emp.sexe : 'M'
  }

  const filteredPresences = mockPresences.filter(p => {
    const emp = getEmployeName(p.matricule)
    const matchesSearch = emp.toLowerCase().includes(searchTerm.toLowerCase()) || p.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || p.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  const stats = {
    total: mockPresences.length,
    presents: mockPresences.filter(p => p.statut === 'Present').length,
    retards: mockPresences.filter(p => p.statut === 'Retard').length,
    absents: mockPresences.filter(p => p.statut === 'Absent').length,
  }

  const presenceData = [
    { name: 'Presents', value: stats.presents, color: '#10b981' },
    { name: 'Retards', value: stats.retards, color: '#f59e0b' },
    { name: 'Absents', value: stats.absents, color: '#ef4444' },
  ]

  const parJourData = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map(jour => ({
    jour,
    presents: Math.floor(Math.random() * 5) + 3,
    retards: Math.floor(Math.random() * 2),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Presences</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Suivi des pointages quotidiens</p>
        </div>
        <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exporter</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total pointages', value: stats.total, color: 'from-primary-500 to-purple-600', icon: Clock },
          { label: 'Presents', value: stats.presents, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Retards', value: stats.retards, color: 'from-amber-500 to-orange-600', icon: AlertCircle },
          { label: 'Absents', value: stats.absents, color: 'from-red-500 to-rose-600', icon: XCircle },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Presences par jour</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={parJourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="jour" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="presents" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retards" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={presenceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => name + ' ' + ((percent ?? 0) * 100).toFixed(0) + '%'}>
                {presenceData.map((entry, index) => (<Cell key={'cell-' + index} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Liste des presences</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un employe..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="Present">Present</option>
            <option value="Retard">Retard</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {filteredPresences.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">Aucune presence trouvee</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPresences.map(presence => (
              <div key={presence.id_presence} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                    getEmployeSexe(presence.matricule) === 'M' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'
                  }`}>
                    <span className={`font-bold ${getEmployeSexe(presence.matricule) === 'M' ? 'text-blue-600' : 'text-pink-600'}`}>
                      {getEmployeInitial(presence.matricule)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">{getEmployeName(presence.matricule)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{presence.date_presence}</p>
                    {presence.justification && <p className="text-xs text-amber-600 dark:text-amber-400 italic mt-1">"{presence.justification}"</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    presence.statut === 'Present' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    presence.statut === 'Retard' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>{presence.statut}</span>
                  {presence.heure_arrivee && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {presence.heure_arrivee} - {presence.heure_depart}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}