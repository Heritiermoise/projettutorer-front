import { useState } from 'react'
import { Users, Search, Filter, Mail, Phone, MapPin, Calendar, Briefcase, Eye, Download, UserPlus, Grid, List } from 'lucide-react'
import { mockEmployes, mockPostes, mockServices } from '../../data/mockData'

export const DirecteurMembresPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMember, setSelectedMember] = useState<any>(null)

  const filteredMembers = mockEmployes.filter(emp => {
    const matchesSearch = emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesService = filterService === 'all' || emp.id_poste === parseInt(filterService)
    return matchesSearch && matchesService
  })

  const getPosteTitle = (idPoste: number) => {
    const poste = mockPostes.find(p => p.id_poste === idPoste)
    return poste?.titre_poste || 'N/A'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Membres de l'entreprise</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{mockEmployes.length} membres actifs</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total', value: mockEmployes.length, color: 'from-primary-500 to-purple-600', icon: Users },
          { label: 'Hommes', value: mockEmployes.filter(e => e.sexe === 'M').length, color: 'from-blue-500 to-blue-600', icon: Users },
          { label: 'Femmes', value: mockEmployes.filter(e => e.sexe === 'F').length, color: 'from-pink-500 to-pink-600', icon: Users },
          { label: 'Actifs', value: mockEmployes.filter(e => e.statut === 'Actif').length, color: 'from-green-500 to-emerald-600', icon: Users },
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

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un membre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
          </div>
          <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm">
            <option value="all">Tous les postes</option>
            {mockPostes.map(p => <option key={p.id_poste} value={p.id_poste}>{p.titre_poste}</option>)}
          </select>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMembers.map(emp => (
            <div key={emp.matricule} onClick={() => setSelectedMember(emp)} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                  <span className="text-white font-bold text-lg">{emp.prenom[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{emp.prenom} {emp.nom}</p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{getPosteTitle(emp.id_poste)}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Mail className="w-4 h-4 flex-shrink-0" /><span className="truncate">{emp.email}</span></div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Phone className="w-4 h-4 flex-shrink-0" /><span>{emp.telephone}</span></div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Calendar className="w-4 h-4 flex-shrink-0" /><span>Depuis {emp.date_embauche}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{emp.statut}</span>
                <Eye className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Membre</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Poste</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Telephone</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(emp => (
                <tr key={emp.matricule} onClick={() => setSelectedMember(emp)} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'}`}>
                        <span className={`font-bold text-sm ${emp.sexe === 'M' ? 'text-blue-600' : 'text-pink-600'}`}>{emp.prenom[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{emp.prenom} {emp.nom}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{getPosteTitle(emp.id_poste)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{getPosteTitle(emp.id_poste)}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{emp.email}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{emp.telephone}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{emp.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detail membre */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Profil du membre</h3>
              <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${selectedMember.sexe === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                  <span className="text-3xl font-bold text-white">{selectedMember.prenom[0]}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedMember.prenom} {selectedMember.nom}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{getPosteTitle(selectedMember.id_poste)}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">{selectedMember.statut}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: selectedMember.email },
                  { icon: Phone, label: 'Telephone', value: selectedMember.telephone },
                  { icon: MapPin, label: 'Adresse', value: selectedMember.adresse },
                  { icon: Calendar, label: 'Date embauche', value: selectedMember.date_embauche },
                  { icon: Briefcase, label: 'Matricule', value: selectedMember.matricule },
                  { icon: Users, label: 'Sexe', value: selectedMember.sexe === 'M' ? 'Masculin' : 'Feminin' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm flex items-center space-x-2"><item.icon className="w-4 h-4" /><span>{item.value}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}