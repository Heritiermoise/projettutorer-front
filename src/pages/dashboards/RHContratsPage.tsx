import { useState } from 'react'
import { FileText, Search, Plus, Eye, Edit, Trash2, Download, Filter, Calendar, DollarSign, User, X } from 'lucide-react'
import { mockContrats, mockEmployes, mockPostes } from '../../data/mockData'

export const RHContratsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [selectedContrat, setSelectedContrat] = useState<any>(null)

  const filteredContrats = mockContrats.filter(c => {
    const emp = mockEmployes.find(e => e.matricule === c.matricule)
    const matchesSearch = c.contrat.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp?.prenom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || c.type === filterType
    const matchesStatut = filterStatut === 'all' || c.statut === filterStatut
    return matchesSearch && matchesType && matchesStatut
  })

  const getEmployeName = (matricule: string) => {
    const emp = mockEmployes.find(e => e.matricule === matricule)
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }

  const getPosteTitle = (matricule: string) => {
    const emp = mockEmployes.find(e => e.matricule === matricule)
    if (!emp) return 'N/A'
    const poste = mockPostes.find(p => p.id_poste === emp.id_poste)
    return poste?.titre_poste || 'N/A'
  }

  const stats = {
    total: mockContrats.length,
    actifs: mockContrats.filter(c => c.statut === 'Actif').length,
    cd: mockContrats.filter(c => c.type === 'CDI').length,
    cdd: mockContrats.filter(c => c.type === 'CDD').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Contrats</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{stats.total} contrats enregistres</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau contrat</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total contrats', value: stats.total, color: 'from-primary-500 to-purple-600', icon: FileText },
          { label: 'Contrats actifs', value: stats.actifs, color: 'from-green-500 to-emerald-600', icon: FileText },
          { label: 'CDI', value: stats.cdi, color: 'from-blue-500 to-blue-600', icon: FileText },
          { label: 'CDD', value: stats.cdd, color: 'from-amber-500 to-orange-600', icon: FileText },
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
            <input type="text" placeholder="Rechercher par reference ou employe..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les types</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
          </select>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Expire">Expire</option>
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
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Poste</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Type</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Salaire</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Debut</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Fin</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
              <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContrats.map(contrat => (
              <tr key={contrat.id_contrat} onClick={() => setSelectedContrat(contrat)} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-primary-600" />
                    <span className="font-mono text-sm font-semibold text-slate-800 dark:text-white">{contrat.contrat}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{getEmployeName(contrat.matricule)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{getPosteTitle(contrat.matricule)}</p>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{getPosteTitle(contrat.matricule)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    contrat.type === 'CDI' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                    contrat.type === 'CDD' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  }`}>{contrat.type}</span>
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white hidden lg:table-cell">${contrat.salaire_base}</td>
                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{contrat.date_debut}</td>
                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{contrat.date_fin || 'Indeterminee'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    contrat.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    contrat.statut === 'Expire' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}>{contrat.statut}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-1">
                    <button className="p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedContrat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Details du contrat</h3>
              <button onClick={() => setSelectedContrat(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Reference</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white font-mono">{selectedContrat.contrat}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${selectedContrat.statut === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedContrat.statut}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: User, label: 'Employe', value: getEmployeName(selectedContrat.matricule) },
                  { icon: FileText, label: 'Poste', value: getPosteTitle(selectedContrat.matricule) },
                  { icon: FileText, label: 'Type de contrat', value: selectedContrat.type },
                  { icon: DollarSign, label: 'Salaire de base', value: '$' + selectedContrat.salaire_base },
                  { icon: Calendar, label: 'Date de debut', value: selectedContrat.date_debut },
                  { icon: Calendar, label: 'Date de fin', value: selectedContrat.date_fin || 'Indeterminee' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm flex items-center space-x-2"><item.icon className="w-4 h-4" /><span>{item.value}</span></p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Details</p>
                <p className="text-slate-800 dark:text-white">{selectedContrat.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}