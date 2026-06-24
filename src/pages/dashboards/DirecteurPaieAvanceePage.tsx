import { useState } from 'react'
import { DollarSign, FileText, Download, Eye, CheckCircle2, Clock, AlertCircle, TrendingUp, Users, Search, X } from 'lucide-react'
import { mockBulletinsPaie } from '../../data/phase2Data'
import type { BulletinPaie } from '../../data/phase2Data'

export const DirecteurPaieAvanceePage = () => {
  const [bulletins, setBulletins] = useState<BulletinPaie[]>(mockBulletinsPaie)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinPaie | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const filteredBulletins = bulletins.filter(b => {
    const matchesSearch = b.employe_nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || b.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  const stats = {
    total: bulletins.length,
    payes: bulletins.filter(b => b.statut === 'Paye').length,
    enAttente: bulletins.filter(b => b.statut === 'Valide').length,
    aGenerer: bulletins.filter(b => b.statut === 'Genere').length,
    masseSalariale: bulletins.reduce((sum, b) => sum + b.salaire_net, 0),
    totalPrimes: bulletins.reduce((sum, b) => sum + b.primes, 0),
    totalHeuresSup: bulletins.reduce((sum, b) => sum + b.heures_sup, 0)
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Paye': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Valide': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Genere': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    }
    return colors[statut] || colors['Genere']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Paie Avancee</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gestion detaillee des bulletins de paie</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Download className="w-5 h-5" />
          <span>Exporter Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'from-amber-500 to-orange-600' },
          { label: 'Payes', value: stats.payes, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
          { label: 'En attente', value: stats.enAttente, icon: Clock, color: 'from-blue-500 to-cyan-600' },
          { label: 'A generer', value: stats.aGenerer, icon: AlertCircle, color: 'from-red-500 to-rose-600' },
          { label: 'Masse sal.', value: '$' + (stats.masseSalariale/1000).toFixed(1) + 'K', icon: DollarSign, color: 'from-purple-500 to-pink-600' },
          { label: 'Primes', value: '$' + stats.totalPrimes, icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
          { label: 'Heures sup', value: '$' + stats.totalHeuresSup, icon: Clock, color: 'from-pink-500 to-rose-600' }
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Rechercher un employe..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
            </div>
            <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
              <option value="all">Tous les statuts</option>
              <option value="Paye">Paye</option>
              <option value="Valide">Valide</option>
              <option value="Genere">Genere</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Employe</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Periode</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden md:table-cell">Base</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden lg:table-cell">Primes</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden lg:table-cell">Deductions</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Net</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Statut</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredBulletins.map(bulletin => (
                <tr key={bulletin.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{bulletin.employe_nom[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{bulletin.employe_nom}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{bulletin.employe_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{bulletin.mois} {bulletin.annee}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-slate-800 dark:text-white hidden md:table-cell">${bulletin.salaire_base}</td>
                  <td className="py-4 px-6 text-sm text-green-600 dark:text-green-400 hidden lg:table-cell">+${bulletin.primes}</td>
                  <td className="py-4 px-6 text-sm text-red-600 dark:text-red-400 hidden lg:table-cell">-${bulletin.deductions + bulletin.impots}</td>
                  <td className="py-4 px-6 text-lg font-bold text-slate-800 dark:text-white">${bulletin.salaire_net}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(bulletin.statut)}`}>
                      {bulletin.statut}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button onClick={() => { setSelectedBulletin(bulletin); setShowDetailModal(true) }} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && selectedBulletin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Bulletin de Paie - {selectedBulletin.employe_nom}</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Periode</p>
                  <p className="font-bold text-slate-800 dark:text-white text-lg">{selectedBulletin.mois} {selectedBulletin.annee}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatutColor(selectedBulletin.statut)}`}>
                  {selectedBulletin.statut}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-3">Elements de remuneration</h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">Salaire de base</span>
                    <span className="font-semibold text-slate-800 dark:text-white">${selectedBulletin.salaire_base}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-green-700 dark:text-green-300">Primes</span>
                    <span className="font-semibold text-green-700 dark:text-green-300">+${selectedBulletin.primes}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-green-700 dark:text-green-300">Heures supplementaires</span>
                    <span className="font-semibold text-green-700 dark:text-green-300">+${selectedBulletin.heures_sup}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-3">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-red-700 dark:text-red-300">Charges sociales</span>
                    <span className="font-semibold text-red-700 dark:text-red-300">-${selectedBulletin.deductions}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-red-700 dark:text-red-300">Impots sur le revenu</span>
                    <span className="font-semibold text-red-700 dark:text-red-300">-${selectedBulletin.impots}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Salaire Net a Payer</p>
                    <p className="text-4xl font-bold text-amber-600">${selectedBulletin.salaire_net}</p>
                  </div>
                  <DollarSign className="w-16 h-16 text-amber-500/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}