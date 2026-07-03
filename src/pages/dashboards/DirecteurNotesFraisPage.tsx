import { useState } from 'react'
import { DollarSign, Plus, Search, Filter, Eye, Download, FileText, Calendar, User } from 'lucide-react'
import { mockNotesFrais } from '../../data/phase6Data'
import type { NoteFrais } from '../../data/phase6Data'

export const DirecteurNotesFraisPage = () => {
  const [notesFrais] = useState<NoteFrais[]>(mockNotesFrais)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterCategorie, setFilterCategorie] = useState('all')

  const filteredNotes = notesFrais.filter(n => {
    const matchesSearch = n.titre.toLowerCase().includes(searchTerm.toLowerCase()) || n.employe_nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || n.statut === filterStatut
    const matchesCategorie = filterCategorie === 'all' || n.categorie === filterCategorie
    return matchesSearch && matchesStatut && matchesCategorie
  })

  const stats = {
    total: notesFrais.length,
    soumises: notesFrais.filter(n => n.statut === 'Soumise').length,
    approuvees: notesFrais.filter(n => n.statut === 'Approuvee').length,
    refusees: notesFrais.filter(n => n.statut === 'Refusee').length,
    payees: notesFrais.filter(n => n.statut === 'Payee').length,
    montantTotal: notesFrais.reduce((sum, n) => sum + n.montant, 0)
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Brouillon': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      'Soumise': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Approuvee': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Refusee': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Payee': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    }
    return colors[statut] || colors['Brouillon']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Notes de Frais</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gestion des remboursements</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouvelle note de frais</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'from-amber-500 to-orange-600' },
          { label: 'Soumises', value: stats.soumises, icon: FileText, color: 'from-amber-500 to-yellow-600' },
          { label: 'Approuvees', value: stats.approuvees, icon: DollarSign, color: 'from-green-500 to-emerald-600' },
          { label: 'Refusees', value: stats.refusees, icon: DollarSign, color: 'from-red-500 to-rose-600' },
          { label: 'Payees', value: stats.payees, icon: DollarSign, color: 'from-blue-500 to-cyan-600' },
          { label: 'Montant total', value: '$' + stats.montantTotal, icon: DollarSign, color: 'from-purple-500 to-pink-600' }
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous statuts</option>
            <option value="Soumise">Soumises</option>
            <option value="Approuvee">Approuvees</option>
            <option value="Refusee">Refusees</option>
            <option value="Payee">Payees</option>
          </select>
          <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Toutes categories</option>
            <option value="Transport">Transport</option>
            <option value="Repas">Repas</option>
            <option value="Fournitures">Fournitures</option>
            <option value="Formation">Formation</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Titre</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden md:table-cell">Employe</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden md:table-cell">Categorie</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden lg:table-cell">Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Montant</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Statut</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredNotes.map(note => (
                <tr key={note.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-800 dark:text-white">{note.titre}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{note.description}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{note.employe_nom}</td>
                  <td className="py-4 px-6 hidden md:table-cell">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold">{note.categorie}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{note.date}</td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-amber-600">${note.montant}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(note.statut)}`}>
                      {note.statut}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}