import { useState } from 'react'
import { Clock, Search, CheckCircle2, XCircle, AlertCircle, Calendar, TrendingUp } from 'lucide-react'
import { mockPresences, mockEmployes } from '../../data/mockData'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export const EmployePresencesPage = () => {
  const [filterMois, setFilterMois] = useState('all')

  const user = mockEmployes.find(e => e.email === 'employe@demo.com') || mockEmployes[3]
  const userMatricule = user?.matricule || 'EMP-J1K2L3'
  
  // Filtrer les presences de l'employe
  const userPresences = mockPresences.filter(p => p.matricule === userMatricule)
  
  // Si pas de donnees, generer des donnees de demonstration
  const presencesAffichees = userPresences.length > 0 ? userPresences : [
    { id_presence: 100, matricule: userMatricule, date_presence: '2026-06-10', heure_arrivee: '08:00', heure_depart: '17:00', statut: 'Present', justification: null, id_entreprise: 1 },
    { id_presence: 101, matricule: userMatricule, date_presence: '2026-06-11', heure_arrivee: '08:15', heure_depart: '17:00', statut: 'Retard', justification: 'Embouteillage', id_entreprise: 1 },
    { id_presence: 102, matricule: userMatricule, date_presence: '2026-06-12', heure_arrivee: '07:55', heure_depart: '17:30', statut: 'Present', justification: null, id_entreprise: 1 },
    { id_presence: 103, matricule: userMatricule, date_presence: '2026-06-13', heure_arrivee: '08:00', heure_depart: '17:00', statut: 'Present', justification: null, id_entreprise: 1 },
    { id_presence: 104, matricule: userMatricule, date_presence: '2026-06-14', heure_arrivee: '08:05', heure_depart: '17:00', statut: 'Present', justification: null, id_entreprise: 1 },
  ]

  const stats = {
    total: presencesAffichees.length,
    presents: presencesAffichees.filter(p => p.statut === 'Present').length,
    retards: presencesAffichees.filter(p => p.statut === 'Retard').length,
    absents: presencesAffichees.filter(p => p.statut === 'Absent').length,
  }

  const presenceData = [
    { name: 'Presents', value: stats.presents, color: '#10b981' },
    { name: 'Retards', value: stats.retards, color: '#f59e0b' },
    { name: 'Absences', value: stats.absents, color: '#ef4444' },
  ]

  const joursData = presencesAffichees.map((p, i) => ({
    jour: p.date_presence?.substring(8) || (i + 1).toString(),
    statut: p.statut,
    heure: p.heure_arrivee || '08:00',
  }))

  const tauxPresence = stats.total > 0 ? ((stats.presents / stats.total) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Mes Presences</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Suivi de mes pointages</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span className="font-bold text-green-700 dark:text-green-300">Taux: {tauxPresence}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Jours travailles', value: stats.total, color: 'from-primary-500 to-purple-600', icon: Clock },
          { label: 'Presents', value: stats.presents, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Retards', value: stats.retards, color: 'from-amber-500 to-orange-600', icon: AlertCircle },
          { label: 'Absences', value: stats.absents, color: 'from-red-500 to-rose-600', icon: XCircle },
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
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Historique des pointages</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {presencesAffichees.map((presence, i) => (
              <div key={presence.id_presence || i} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                    presence.statut === 'Present' ? 'bg-green-100 dark:bg-green-900/30' :
                    presence.statut === 'Retard' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {presence.statut === 'Present' ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" /> :
                     presence.statut === 'Retard' ? <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" /> :
                     <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">
                      {presence.date_presence || `Jour ${i + 1}`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {presence.heure_arrivee || '08:00'} - {presence.heure_depart || '17:00'}
                    </p>
                    {presence.justification && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 italic mt-1">
                        "{presence.justification}"
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${
                  presence.statut === 'Present' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                  presence.statut === 'Retard' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>{presence.statut}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition</h3>
            {stats.total === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucune donnee</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={presenceData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" label={({ name, percent }) => name + ' ' + (percent * 100).toFixed(0) + '%'}>
                    {presenceData.map((entry, index) => (<Cell key={'cell-' + index} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-gradient-to-br from-secondary-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-sm text-white/80 mb-1">Taux de presence</p>
            <p className="text-4xl font-bold">{tauxPresence}%</p>
            <div className="mt-3 w-full bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: tauxPresence + '%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}