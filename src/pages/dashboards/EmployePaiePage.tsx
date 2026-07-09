import { useEffect, useState } from 'react'
import { DollarSign, Search, Download, Eye, Calendar, FileText, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { loadDashboardContext } from '../../services/dashboardData'

export const EmployePaiePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAnnee, setFilterAnnee] = useState('all')
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    loadDashboardContext().then(setDashboardData).catch(() => setDashboardData(null))
  }, [])

  const user = dashboardData?.user || { matricule: 'EMP-J1K2L3' }
  const userPaies = (dashboardData?.fichesPaie || []).filter((p: any) => p.matricule === user.matricule)

  const filteredPaies = userPaies.filter(p => {
    const matchesSearch = p.mois_paiement.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAnnee = filterAnnee === 'all' || p.annee_paiement === filterAnnee
    return matchesSearch && matchesAnnee
  })

  const stats = {
    total: userPaies.length,
    payees: userPaies.filter(p => p.statut === 'Payee').length,
    dernierMontant: userPaies[userPaies.length - 1]?.montant || 0,
    cumulAnnuel: userPaies.reduce((sum, p) => sum + p.montant, 0),
  }

  const moisData = ['Janvier', 'Fevrier', 'Mars'].map(mois => ({
    mois: mois.substring(0, 3),
    montant: userPaies.filter(p => p.mois_paiement === mois).reduce((sum, p) => sum + p.montant, 0) || 1200
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Mes Paies</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Historique de vos fiches de paie</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total fiches', value: stats.total, color: 'from-primary-500 to-purple-600', icon: FileText },
          { label: 'Paies recues', value: stats.payees, color: 'from-green-500 to-emerald-600', icon: DollarSign },
          { label: 'Dernier montant', value: '$' + stats.dernierMontant, color: 'from-amber-500 to-orange-600', icon: TrendingUp },
          { label: 'Cumul annuel', value: '$' + stats.cumulAnnuel, color: 'from-pink-500 to-rose-600', icon: Calendar },
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
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Evolution de mes paies</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={moisData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey="mois" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Bar dataKey="montant" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher par mois..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm" />
          </div>
          <select value={filterAnnee} onChange={(e) => setFilterAnnee(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm">
            <option value="all">Toutes les annees</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {filteredPaies.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400">Aucune fiche de paie disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPaies.map(paie => (
            <div key={paie.id_paie} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paie.statut === 'Payee' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}`}>
                  {paie.statut}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{paie.mois_paiement} {paie.annee_paiement}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Ref: #{paie.id_paie}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">Montant net</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">${paie.montant}</span>
              </div>
              <button className="w-full px-3 py-2 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-lg text-sm hover:bg-secondary-200 dark:hover:bg-secondary-900/50 flex items-center justify-center space-x-1">
                <Download className="w-4 h-4" /><span>Telecharger la fiche</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}