import { useEffect, useState } from 'react'
import { Award, Search, DollarSign, Calendar, CheckCircle2 } from 'lucide-react'
import { loadDashboardContext } from '../../services/dashboardData'

export const EmployeAvantagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    loadDashboardContext().then(setDashboardData).catch(() => setDashboardData(null))
  }, [])

  const user = dashboardData?.user || { matricule: 'EMP-J1K2L3' }
  const userAvantages = (dashboardData?.avantages || []).filter((a: any) => a.matricule === user.matricule)

  const filteredAvantages = userAvantages.filter(a => 
    a.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type_avantage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: userAvantages.length,
    actifs: userAvantages.filter((a: any) => a.statut === 'Actif').length,
    valeurTotale: userAvantages.reduce((sum: number, a: any) => sum + parseInt(a.valeur || '0', 10), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Mes Avantages</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Avantages dont vous beneficie</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        {[
          { label: 'Total avantages', value: stats.total, color: 'from-primary-500 to-purple-600', icon: Award },
          { label: 'Avantages actifs', value: stats.actifs, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Valeur totale', value: '$' + stats.valeurTotale, color: 'from-amber-500 to-orange-600', icon: DollarSign },
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
          <input type="text" placeholder="Rechercher un avantage..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm" />
        </div>
      </div>

      {filteredAvantages.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700">
          <Award className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400">Aucun avantage disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAvantages.map(avantage => (
            <div key={avantage.id_avantage} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{avantage.statut}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{avantage.libelle}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{avantage.description}</p>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-bold text-amber-600">${avantage.valeur}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Expire: {avantage.date_expiration}</span>
                </div>
              </div>
              <div className="p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
                <p className="text-xs text-secondary-700 dark:text-secondary-300">Type: <span className="font-semibold">{avantage.type_avantage}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}