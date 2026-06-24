import { useState } from 'react'
import { Archive, Search, Download, Eye, Trash2, Lock, Calendar, FileText, Filter, X, Shield, HardDrive, Clock } from 'lucide-react'
import { mockArchives } from '../../data/phase4Data'
import type { DocumentArchive } from '../../data/phase4Data'

export const DirecteurArchivagePage = () => {
  const [archives, setArchives] = useState<DocumentArchive[]>(mockArchives)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterCategorie, setFilterCategorie] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState<DocumentArchive | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const filteredArchives = archives.filter(a => {
    const matchesSearch = a.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.employe.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || a.type === filterType
    const matchesStatut = filterStatut === 'all' || a.statut === filterStatut
    const matchesCategorie = filterCategorie === 'all' || a.categorie === filterCategorie
    return matchesSearch && matchesType && matchesStatut && matchesCategorie
  })

  const stats = {
    total: archives.length,
    actifs: archives.filter(a => a.statut === 'Actif').length,
    archives: archives.filter(a => a.statut === 'Archive').length,
    detruits: archives.filter(a => a.statut === 'Detruit').length,
    tailleTotale: '15.2 GB',
    documentsRestreints: archives.filter(a => a.acces_restreint).length
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Actif': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Archive': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Detruit': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }
    return colors[statut] || colors['Actif']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Archivage Securise</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Coffre-fort numerique des documents</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
          <HardDrive className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-amber-700 dark:text-amber-300">{stats.tailleTotale} utilises</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Archivage conforme RGPD</h3>
            <p className="text-sm text-white/90 mb-3">Tous les documents sont stockes de maniere securisee avec chiffrement AES-256, controle d'acces granulaire et piste d'audit complete.</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Chiffrement AES-256</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Controle d'acces</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Piste d'audit</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Retention automatique</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'from-blue-500 to-cyan-600' },
          { label: 'Actifs', value: stats.actifs, icon: Archive, color: 'from-green-500 to-emerald-600' },
          { label: 'Archives', value: stats.archives, icon: Archive, color: 'from-amber-500 to-orange-600' },
          { label: 'Detruits', value: stats.detruits, icon: Trash2, color: 'from-red-500 to-rose-600' },
          { label: 'Taille', value: stats.tailleTotale, icon: HardDrive, color: 'from-purple-500 to-pink-600' },
          { label: 'Restreints', value: stats.documentsRestreints, icon: Lock, color: 'from-slate-500 to-slate-600' }
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
            <input type="text" placeholder="Rechercher un document..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous types</option>
            <option value="Contrat">Contrats</option>
            <option value="Bulletin">Bulletins</option>
            <option value="Evaluation">Evaluations</option>
            <option value="Formation">Formations</option>
            <option value="Juridique">Juridique</option>
          </select>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous statuts</option>
            <option value="Actif">Actif</option>
            <option value="Archive">Archive</option>
            <option value="Detruit">Detruit</option>
          </select>
          <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Toutes categories</option>
            <option value="Ressources Humaines">RH</option>
            <option value="Paie">Paie</option>
            <option value="Performance">Performance</option>
            <option value="Formation">Formation</option>
            <option value="Juridique">Juridique</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Document</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden md:table-cell">Employe</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden lg:table-cell">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden lg:table-cell">Retention</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Statut</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredArchives.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{doc.titre}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{doc.date_archivage} • {doc.taille}</p>
                      </div>
                      {doc.acces_restreint && <Lock className="w-4 h-4 text-amber-600" />}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{doc.employe}</td>
                  <td className="py-4 px-6 hidden lg:table-cell">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold">{doc.type}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{doc.duree_retention}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(doc.statut)}`}>
                      {doc.statut}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button onClick={() => { setSelectedDoc(doc); setShowDetailModal(true) }} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Details du document</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white">{selectedDoc.titre}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{selectedDoc.type} • {selectedDoc.categorie}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Employe</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{selectedDoc.employe}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Statut</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(selectedDoc.statut)}`}>
                    {selectedDoc.statut}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date creation</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{selectedDoc.date_creation}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date archivage</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{selectedDoc.date_archivage}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Duree retention</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{selectedDoc.duree_retention}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Taille</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{selectedDoc.taille}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <p className="font-bold text-blue-800 dark:text-blue-200">Securite</p>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">Empreinte: <span className="font-mono text-xs">{selectedDoc.hash}</span></p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Acces restreint: {selectedDoc.acces_restreint ? 'Oui' : 'Non'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}