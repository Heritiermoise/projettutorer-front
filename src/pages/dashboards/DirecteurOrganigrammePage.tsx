import { useState } from 'react'
import { Users, Building2, Mail, Phone, Calendar, MapPin, Plus, Edit, X, ChevronDown, ChevronRight, Search, Filter } from 'lucide-react'
import { mockOrganigramme } from '../../data/advancedData'
import type { NoeudOrganigramme } from '../../data/advancedData'

export const DirecteurOrganigrammePage = () => {
  const [organigramme, setOrganigramme] = useState<NoeudOrganigramme>(mockOrganigramme)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', 'rh', 'tech']))
  const [selectedNode, setSelectedNode] = useState<NoeudOrganigramme | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartement, setFilterDepartement] = useState('all')
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree')

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedNodes(newExpanded)
  }

  const getAllNodes = (node: NoeudOrganigramme): NoeudOrganigramme[] => {
    let nodes = [node]
    node.enfants.forEach(enfant => {
      nodes = nodes.concat(getAllNodes(enfant))
    })
    return nodes
  }

  const allNodes = getAllNodes(organigramme)
  const departements = [...new Set(allNodes.map(n => n.departement))]

  const filteredNodes = allNodes.filter(node => {
    const matchesSearch = node.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.poste.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = filterDepartement === 'all' || node.departement === filterDepartement
    return matchesSearch && matchesDept
  })

  const stats = {
    total: allNodes.length,
    departements: departements.length,
    actifs: allNodes.filter(n => n.statut === 'Actif').length,
    enConge: allNodes.filter(n => n.statut === 'En_conge').length
  }

  const renderNode = (node: NoeudOrganigramme, level: number = 0) => {
    const hasChildren = node.enfants.length > 0
    const isExpanded = expandedNodes.has(node.id)

    return (
      <div key={node.id} className="relative">
        <div
          className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
            selectedNode?.id === node.id
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
          style={{ marginLeft: `${level * 40}px` }}
          onClick={() => { setSelectedNode(node); setShowDetailModal(true) }}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            node.niveau === 0 ? 'bg-gradient-to-br from-red-500 to-pink-600' :
            node.niveau === 1 ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
            'bg-gradient-to-br from-primary-500 to-purple-600'
          }`}>
            <span className="text-white font-bold text-lg">{node.prenom[0]}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 dark:text-white truncate">{node.prenom} {node.nom}</h3>
              {node.niveau === 0 && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">DG</span>}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{node.poste}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{node.departement}</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              node.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
              node.statut === 'En_conge' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
              'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {node.statut.replace('_', ' ')}
            </span>
            {hasChildren && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleNode(node.id) }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {node.enfants.map(enfant => renderNode(enfant, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Organigramme</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Structure hierarchique de l'entreprise</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setViewMode('tree')} className={`px-4 py-2 rounded-xl ${viewMode === 'tree' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
            Arborescence
          </button>
          <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-xl ${viewMode === 'grid' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
            Grille
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total employes', value: stats.total, icon: Users, color: 'from-amber-500 to-orange-600' },
          { label: 'Departements', value: stats.departements, icon: Building2, color: 'from-primary-500 to-purple-600' },
          { label: 'Actifs', value: stats.actifs, icon: Users, color: 'from-green-500 to-emerald-600' },
          { label: 'En conge', value: stats.enConge, icon: Calendar, color: 'from-amber-500 to-yellow-600' }
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un employe..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
          </div>
          <select value={filterDepartement} onChange={(e) => setFilterDepartement(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous les departements</option>
            {departements.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {viewMode === 'tree' ? (
          <div className="space-y-2">
            {renderNode(organigramme)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNodes.map(node => (
              <div
                key={node.id}
                onClick={() => { setSelectedNode(node); setShowDetailModal(true) }}
                className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                    node.niveau === 0 ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                    node.niveau === 1 ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                    'bg-gradient-to-br from-primary-500 to-purple-600'
                  }`}>
                    <span className="text-white font-bold text-2xl">{node.prenom[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{node.prenom} {node.nom}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{node.poste}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{node.departement}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{node.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{node.telephone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Depuis {node.date_embauche}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    node.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    node.statut === 'En_conge' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {node.statut.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetailModal && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Profil employe</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedNode.niveau === 0 ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                  selectedNode.niveau === 1 ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                  'bg-gradient-to-br from-primary-500 to-purple-600'
                }`}>
                  <span className="text-white font-bold text-3xl">{selectedNode.prenom[0]}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedNode.prenom} {selectedNode.nom}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{selectedNode.poste}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedNode.departement}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm break-all">{selectedNode.email}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Telephone</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedNode.telephone}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date d'embauche</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedNode.date_embauche}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Statut</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedNode.statut === 'Actif' ? 'bg-green-100 text-green-700' :
                    selectedNode.statut === 'En_conge' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedNode.statut.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {selectedNode.enfants.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-3">Subordonnes directs ({selectedNode.enfants.length})</h4>
                  <div className="space-y-2">
                    {selectedNode.enfants.map(enfant => (
                      <div key={enfant.id} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{enfant.prenom[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm">{enfant.prenom} {enfant.nom}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{enfant.poste}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}