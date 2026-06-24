import { useState } from 'react'
import { DollarSign, Search, Plus, Eye, Download, Filter, User, Calendar, TrendingUp, X, FileText } from 'lucide-react'
import { mockFichesPaie, mockEmployes } from '../../data/mockData'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export const RHPaiePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMois, setFilterMois] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [selectedPaie, setSelectedPaie] = useState<any>(null)

  const getEmployeName = (matricule: string) => {
    const emp = mockEmployes.find(e => e.matricule === matricule)
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }

  const filteredPaies = mockFichesPaie.filter(p => {
    const emp = getEmployeName(p.matricule)
    const matchesSearch = emp.toLowerCase().includes(searchTerm.toLowerCase()) || p.mois_paiement.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMois = filterMois === 'all' || p.mois_paiement === filterMois
    const matchesStatut = filterStatut === 'all' || p.statut === filterStatut
    return matchesSearch && matchesMois && matchesStatut
  })

  const stats = {
    total: mockFichesPaie.length,
    payees: mockFichesPaie.filter(p => p.statut === 'Payee').length,
    enAttente: mockFichesPaie.filter(p => p.statut === 'En attente').length,
    totalMontant: mockFichesPaie.reduce((sum, p) => sum + p.montant, 0),
  }

  const moisData = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Jun'].map(mois => ({
    mois: mois.substring(0, 3),
    montant: mockFichesPaie.filter(p => p.mois_paiement === mois).reduce((sum, p) => sum + p.montant, 0)
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Paies</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{stats.total} fiches de paie</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Generer paie</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total fiches', value: stats.total, color: 'from-primary-500 to-purple-600', icon: FileText },
          { label: 'Payees', value: stats.payees, color: 'from-green-500 to-emerald-600', icon: DollarSign },
          { label: 'En attente', value: stats.enAttente, color: 'from-amber-500 to-orange-600', icon: Calendar },
          { label: 'Total montant', value: '$' + (stats.totalMontant / 1000).toFixed(1) + 'K', color: 'from-pink-500 to-rose-600', icon: TrendingUp },
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
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Evolution mensuelle des paies</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={moisData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey="mois" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Bar dataKey="montant" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher par employe ou mois..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={filterMois} onChange={(e) => setFilterMois(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les mois</option>
            <option value="Janvier">Janvier</option>
            <option value="Fevrier">Fevrier</option>
            <option value="Mars">Mars</option>
          </select>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="Payee">Payee</option>
            <option value="En attente">En attente</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Reference</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Employe</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Mois</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Montant</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Annee</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPaies.map(paie => (
              <tr key={paie.id_paie} onClick={() => setSelectedPaie(paie)} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-primary-600" />
                    <span className="font-mono text-sm font-semibold text-slate-800 dark:text-white">#{paie.id_paie}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{getEmployeName(paie.matricule)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{paie.mois_paiement} {paie.annee_paiement}</p>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{paie.mois_paiement}</td>
                <td className="py-3 px-4 text-sm font-bold text-slate-800 dark:text-white">${paie.montant}</td>
                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{paie.annee_paiement}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paie.statut === 'Payee' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}`}>{paie.statut}</span>
                </td>
                <td className="py-3 px-4">
                  <button className="p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPaie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Details de la paie</h3>
              <button onClick={() => setSelectedPaie(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Montant</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">${selectedPaie.montant}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${selectedPaie.statut === 'Payee' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{selectedPaie.statut}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Employe</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{getEmployeName(selectedPaie.matricule)}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mois</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedPaie.mois_paiement} {selectedPaie.annee_paiement}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}