import { useState } from 'react'
import { Calendar, Plus, Search, Filter, X, Globe, Building2, Flag } from 'lucide-react'
import { mockJoursFeries } from '../../data/phase4Data'
import type { JourFerie } from '../../data/phase4Data'

export const DirecteurJoursFeriesPage = () => {
  const [joursFeries, setJoursFeries] = useState<JourFerie[]>(mockJoursFeries)
  const [filterType, setFilterType] = useState('all')
  const [filterPays, setFilterPays] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ nom: '', date: '', pays: 'RDC', type: 'Entreprise', recurrent: true })

  const filteredJours = joursFeries.filter(j => {
    const matchesType = filterType === 'all' || j.type === filterType
    const matchesPays = filterPays === 'all' || j.pays === filterPays
    return matchesType && matchesPays
  })

  const stats = {
    total: joursFeries.length,
    nationaux: joursFeries.filter(j => j.type === 'National').length,
    entreprise: joursFeries.filter(j => j.type === 'Entreprise').length,
    aVenir: joursFeries.filter(j => new Date(j.date) > new Date()).length
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newJour: JourFerie = {
      id: Date.now(),
      ...formData
    }
    setJoursFeries([...joursFeries, newJour])
    setShowCreateModal(false)
    setFormData({ nom: '', date: '', pays: 'RDC', type: 'Entreprise', recurrent: true })
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'National': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Regional': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Entreprise': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    }
    return colors[type] || colors['National']
  }

  const getTypeIcon = (type: string) => {
    if (type === 'National') return <Flag className="w-4 h-4" />
    if (type === 'Entreprise') return <Building2 className="w-4 h-4" />
    return <Globe className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Jours Feries & Calendrier</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gestion des jours non travailles</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Ajouter un jour ferie</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Calendar, color: 'from-amber-500 to-orange-600' },
          { label: 'Nationaux', value: stats.nationaux, icon: Flag, color: 'from-blue-500 to-cyan-600' },
          { label: 'Entreprise', value: stats.entreprise, icon: Building2, color: 'from-green-500 to-emerald-600' },
          { label: 'A venir', value: stats.aVenir, icon: Calendar, color: 'from-purple-500 to-pink-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous types</option>
            <option value="National">National</option>
            <option value="Regional">Regional</option>
            <option value="Entreprise">Entreprise</option>
          </select>
          <select value={filterPays} onChange={(e) => setFilterPays(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous pays</option>
            <option value="RDC">RDC</option>
            <option value="Entreprise">Entreprise</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredJours.map(jour => (
            <div key={jour.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    jour.type === 'National' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    jour.type === 'Entreprise' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <Calendar className={`w-6 h-6 ${
                      jour.type === 'National' ? 'text-blue-600' :
                      jour.type === 'Entreprise' ? 'text-amber-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{jour.nom}</h3>
                    <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{jour.date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{jour.pays}</span>
                      </span>
                      {jour.recurrent && <span className="text-xs text-green-600 dark:text-green-400">Recurrent</span>}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getTypeColor(jour.type)}`}>
                  {getTypeIcon(jour.type)}
                  <span>{jour.type}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ajouter un jour ferie</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom *</label>
                <input type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date *</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pays</label>
                  <input type="text" value={formData.pays} onChange={(e) => setFormData({...formData, pays: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="National">National</option>
                    <option value="Regional">Regional</option>
                    <option value="Entreprise">Entreprise</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.recurrent} onChange={(e) => setFormData({...formData, recurrent: e.target.checked})} className="w-5 h-5 text-amber-600 rounded" />
                <label className="text-sm text-slate-700 dark:text-slate-300">Jour recurrent (chaque annee)</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}