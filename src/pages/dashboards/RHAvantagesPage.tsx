import { useState } from 'react'
import { Award, Search, Plus, Edit, Trash2, User, DollarSign, Calendar, X } from 'lucide-react'
import { mockAvantages, mockEmployes } from '../../data/mockData'

export const RHAvantagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const getEmployeName = (matricule: string) => {
    const emp = mockEmployes.find(e => e.matricule === matricule)
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }

  const filteredAvantages = mockAvantages.filter(a => {
    const emp = getEmployeName(a.matricule)
    const matchesSearch = emp.toLowerCase().includes(searchTerm.toLowerCase()) || a.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || a.type_avantage === filterType
    return matchesSearch && matchesType
  })

  const stats = {
    total: mockAvantages.length,
    actifs: mockAvantages.filter(a => a.statut === 'Actif').length,
    valeurTotale: mockAvantages.reduce((sum, a) => sum + parseInt(a.valeur), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Avantages</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{stats.total} avantages attribues</p>
        </div>
        <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvel avantage</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {[
          { label: 'Total avantages', value: stats.total, color: 'from-primary-500 to-purple-600', icon: Award },
          { label: 'Avantages actifs', value: stats.actifs, color: 'from-green-500 to-emerald-600', icon: Award },
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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher par employe ou avantage..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les types</option>
            <option value="Sante">Sante</option>
            <option value="Alimentation">Alimentation</option>
            <option value="Transport">Transport</option>
            <option value="Formation">Formation</option>
          </select>
        </div>
      </div>

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
                <User className="w-4 h-4" />
                <span>{getEmployeName(avantage.matricule)}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold text-amber-600">${avantage.valeur}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Expire: {avantage.date_expiration}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 flex items-center justify-center space-x-1">
                <Edit className="w-4 h-4" /><span>Modifier</span>
              </button>
              <button className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}