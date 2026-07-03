import { useState } from 'react'
import { Clock, Search, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react'
import { mockPresences, mockEmployes } from '../../data/mockData'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

export const EmployePresencesPage = () => {
  const [filterMois, setFilterMois] = useState('all')

  const user = mockEmployes[3] || { matricule: 'EMP-J1K2L3' }
  const userPresences = mockPresences.filter(p => p.matricule === user.matricule)

  const stats = {
    total: userPresences.length || 22,
    presents: userPresences.filter(p => p.statut === 'Present').length || 20,
    retards: userPresences.filter(p => p.statut === 'Retard').length || 2,
    absents: userPresences.filter(p => p.statut === 'Absent').length || 0,
  }

  const presenceData = [
    { name: 'Presents', value: stats.presents, color: '#10b981' },
    { name: 'Retards', value: stats.retards, color: '#f59e0b' },
    { name: 'Absences', value: stats.absents, color: '#ef4444' },
  ]

  const joursData = Array.from({ length: 15 }, (_, i) => ({
    jour: (i + 1).toString(),
    statut: i % 7 === 0 ? 'Retard' : i % 5 === 0 ? 'Absent' : 'Present',
    heure: i % 7 === 0 ? '08:30' : '08:00',
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Mes Presences</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Suivi de mes pointages</p>
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Historique des pointages</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {joursData.map((jour, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    jour.statut === 'Present' ? 'bg-green-100 dark:bg-green-900/30' :
                    jour.statut === 'Retard' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {jour.statut === 'Present' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                     jour.statut === 'Retard' ? <AlertCircle className="w-5 h-5 text-amber-600" /> :
                     <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Jour {jour.jour}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{jour.heure}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  jour.statut === 'Present' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                  jour.statut === 'Retard' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>{jour.statut}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={presenceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent = 0 }) => name + ' ' + (percent * 100).toFixed(0) + '%'}>
                {presenceData.map((entry, index) => (<Cell key={'cell-' + index} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
            <p className="text-sm text-secondary-700 dark:text-secondary-300 font-semibold">Taux de presence</p>
            <p className="text-3xl font-bold text-secondary-600 dark:text-secondary-400">{((stats.presents / stats.total) * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}