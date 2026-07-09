import { useEffect, useState } from 'react'
import { Calendar, Search, Plus, Eye, CheckCircle2, XCircle, Clock, User, Filter, X } from 'lucide-react'
import { loadDashboardContext } from '../../services/dashboardData'

export const RHCongesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [selectedConge, setSelectedConge] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    loadDashboardContext().then(setDashboardData).catch(() => setDashboardData(null))
  }, [])

  const conges = dashboardData?.conges || []
  const employes = dashboardData?.employes || []

  const getEmployeName = (matricule: string) => {
    const emp = employes.find((e: any) => e.matricule === matricule)
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }

  const filteredConges = conges.filter((c: any) => {
    const emp = getEmployeName(c.matricule)
    const matchesSearch = emp.toLowerCase().includes(searchTerm.toLowerCase()) || c.type_conge.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || c.type_conge === filterType
    const matchesStatut = filterStatut === 'all' || c.statut === filterStatut
    return matchesSearch && matchesType && matchesStatut
  })

  const stats = {
    total: conges.length,
    approuves: conges.filter((c: any) => c.statut === 'Approuve').length,
    enAttente: conges.filter((c: any) => c.statut === 'En attente').length,
    refuses: conges.filter((c: any) => c.statut === 'Refuse').length,
  }

  const handleApprouver = (id: number) => {
    alert('Conge approuve avec succes')
  }

  const handleRefuser = (id: number) => {
    alert('Conge refuse')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Conges</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{stats.total} demandes de conge</p>
        </div>
        <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle demande</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total demandes', value: stats.total, color: 'from-primary-500 to-purple-600', icon: Calendar },
          { label: 'Approuves', value: stats.approuves, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'En attente', value: stats.enAttente, color: 'from-amber-500 to-orange-600', icon: Clock },
          { label: 'Refuses', value: stats.refuses, color: 'from-red-500 to-rose-600', icon: XCircle },
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
            <input type="text" placeholder="Rechercher par employe ou type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les types</option>
            <option value="Annuel">Annuel</option>
            <option value="Maladie">Maladie</option>
            <option value="Exceptionnel">Exceptionnel</option>
          </select>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="Approuve">Approuve</option>
            <option value="En attente">En attente</option>
            <option value="Refuse">Refuse</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredConges.map(conge => (
          <div key={conge.id_conge} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{getEmployeName(conge.matricule)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{conge.type_conge}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                conge.statut === 'Approuve' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                conge.statut === 'En attente' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>{conge.statut}</span>
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>{conge.date_debut} → {conge.date_fin}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{conge.nombre_jours} jours</span>
              </div>
            </div>
            {conge.motif && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-4">"{conge.motif}"</p>
            )}
            {conge.statut === 'En attente' && (
              <div className="flex space-x-2">
                <button onClick={() => handleApprouver(conge.id_conge)} className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" /><span>Approuver</span>
                </button>
                <button onClick={() => handleRefuser(conge.id_conge)} className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center space-x-1">
                  <XCircle className="w-4 h-4" /><span>Refuser</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}