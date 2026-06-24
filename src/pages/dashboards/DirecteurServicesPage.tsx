import { useState } from 'react'
import { Briefcase, Users, Plus, Edit, Trash2, Search, Grid, List } from 'lucide-react'
import { mockServices, mockPostes, mockEmployes } from '../../data/mockData'

export const DirecteurServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredServices = mockServices.filter(s => s.nom.toLowerCase().includes(searchTerm.toLowerCase()))

  const getServiceStats = (serviceId: number) => {
    const postes = mockPostes.filter(p => p.id_service === serviceId)
    const employes = mockEmployes.filter(e => postes.some(p => p.id_poste === e.id_poste))
    return { postes: postes.length, employes: employes.length }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Services de l'entreprise</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{mockServices.length} services actifs</p>
        </div>
        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-4 h-4" />
          <span>Ajouter un service</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total services', value: mockServices.length, color: 'from-amber-500 to-orange-600' },
          { label: 'Total postes', value: mockPostes.length, color: 'from-primary-500 to-purple-600' },
          { label: 'Postes occupes', value: mockPostes.filter(p => p.statut === 'Occupe').length, color: 'from-green-500 to-emerald-600' },
          { label: 'Postes vacants', value: mockPostes.filter(p => p.statut === 'Vacant').length, color: 'from-red-500 to-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un service..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
          </div>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServices.map(service => {
            const stats = getServiceStats(service.id_service)
            return (
              <div key={service.id_service} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{service.statut}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{service.nom}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{service.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Postes</p>
                    <p className="font-bold text-slate-800 dark:text-white">{stats.postes}</p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Employes</p>
                    <p className="font-bold text-slate-800 dark:text-white">{stats.employes}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm hover:bg-amber-200 dark:hover:bg-amber-900/50 flex items-center justify-center space-x-1"><Edit className="w-4 h-4" /><span>Modifier</span></button>
                  <button className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Service</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Description</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Postes</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Employes</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => {
                const stats = getServiceStats(service.id_service)
                return (
                  <tr key={service.id_service} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center"><Briefcase className="w-4 h-4 text-white" /></div>
                        <span className="font-semibold text-slate-800 dark:text-white text-sm">{service.nom}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{service.description}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white">{stats.postes}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white">{stats.employes}</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{service.statut}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}