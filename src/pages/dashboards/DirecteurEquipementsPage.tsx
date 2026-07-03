import { useState } from 'react'
import { Monitor, Smartphone, Headphones, Plus, Search, Filter, Eye, Edit, CheckCircle2, XCircle, Wrench } from 'lucide-react'
import { mockEquipements } from '../../data/phase6Data'
import type { Equipement } from '../../data/phase6Data'

export const DirecteurEquipementsPage = () => {
  const [equipements] = useState<Equipement[]>(mockEquipements)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const filteredEquipements = equipements.filter(e => {
    const matchesSearch = e.nom.toLowerCase().includes(searchTerm.toLowerCase()) || e.numero_serie.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || e.statut === filterStatut
    const matchesType = filterType === 'all' || e.type === filterType
    return matchesSearch && matchesStatut && matchesType
  })

  const stats = {
    total: equipements.length,
    disponibles: equipements.filter(e => e.statut === 'Disponible').length,
    attribues: equipements.filter(e => e.statut === 'Attribue').length,
    enReparation: equipements.filter(e => e.statut === 'En_reparation').length,
    valeurTotale: equipements.reduce((sum, e) => sum + e.valeur, 0)
  }

  const getTypeIcon = (type: string) => {
    if (type === 'Ordinateur') return <Monitor className="w-5 h-5" />
    if (type === 'Telephone') return <Smartphone className="w-5 h-5" />
    if (type === 'Mobilier') return <Monitor className="w-5 h-5" />
    if (type === 'Accessoire') return <Headphones className="w-5 h-5" />
    return <Monitor className="w-5 h-5" />
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Disponible': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Attribue': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'En_reparation': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Retire': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }
    return colors[statut] || colors['Disponible']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Equipements</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Inventaire et attribution</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouvel equipement</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Monitor, color: 'from-amber-500 to-orange-600' },
          { label: 'Disponibles', value: stats.disponibles, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
          { label: 'Attribues', value: stats.attribues, icon: Monitor, color: 'from-blue-500 to-cyan-600' },
          { label: 'En reparation', value: stats.enReparation, icon: Wrench, color: 'from-amber-500 to-yellow-600' },
          { label: 'Valeur totale', value: '$' + stats.valeurTotale, icon: Monitor, color: 'from-purple-500 to-pink-600' }
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous statuts</option>
            <option value="Disponible">Disponible</option>
            <option value="Attribue">Attribue</option>
            <option value="En_reparation">En reparation</option>
            <option value="Retire">Retire</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous types</option>
            <option value="Ordinateur">Ordinateur</option>
            <option value="Ecran">Ecran</option>
            <option value="Telephone">Telephone</option>
            <option value="Mobilier">Mobilier</option>
            <option value="Accessoire">Accessoire</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredEquipements.map(equipement => (
          <div key={equipement.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                equipement.type === 'Ordinateur' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                equipement.type === 'Telephone' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                equipement.type === 'Mobilier' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
              }`}>
                {getTypeIcon(equipement.type)}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(equipement.statut)}`}>
                {equipement.statut.replace('_', ' ')}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{equipement.nom}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{equipement.marque} - {equipement.modele}</p>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">N° Serie</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-white">{equipement.numero_serie}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Valeur</span>
                <span className="font-bold text-amber-600">${equipement.valeur}</span>
              </div>
              {equipement.assigne_a && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Assigne a</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{equipement.assigne_a}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 flex items-center justify-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>Voir</span>
              </button>
              <button className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}