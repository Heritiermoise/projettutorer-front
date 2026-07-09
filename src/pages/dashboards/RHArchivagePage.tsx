import { useEffect, useState } from 'react'
import { Archive, Search, Download, Eye, Trash2, Lock, Shield, FileText, Folder, Calendar, CheckCircle2, AlertCircle, Clock, Upload, Filter, X } from 'lucide-react'
import { loadDashboardContext } from '../../services/dashboardData'

export const RHArchivagePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategorie, setFilterCategorie] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    loadDashboardContext().then(setDashboardData).catch(() => setDashboardData(null))
  }, [])

  const documents = dashboardData?.documents || []
  const employes = dashboardData?.employes || []

  const documentsArchives = documents.map((document: any) => ({
    ...document,
    date_archivage: document.date_archivage || document.updated_at || document.created_at || 'N/A',
    retention: document.retention || '5 ans',
  }))

  const getEmployeName = (matricule: string) => {
    const emp = employes.find((e: any) => e.matricule === matricule)
    return emp ? `${emp.prenom} ${emp.nom}` : 'N/A'
  }

  const filteredDocuments = documentsArchives.filter(doc => {
    const empName = getEmployeName(doc.matricule)
    const matchesSearch = doc.type_document.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategorie = filterCategorie === 'all' || doc.type_document.toLowerCase().includes(filterCategorie.toLowerCase())
    const matchesStatut = filterStatut === 'all' || doc.statut === filterStatut
    return matchesSearch && matchesCategorie && matchesStatut
  })

  const stats = {
    total: documentsArchives.length,
    archives: documentsArchives.filter(d => d.statut === 'Archive').length,
    actifs: documentsArchives.filter(d => d.statut === 'Valide').length,
    espaceUtilise: '2.4 GB',
    tauxChiffrement: 100,
  }

  const categories = [
    { name: 'Contrats', count: 45, icon: FileText, color: 'from-primary-500 to-purple-600' },
    { name: 'Evaluations', count: 28, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
    { name: 'Documents RH', count: 67, icon: Folder, color: 'from-amber-500 to-orange-600' },
    { name: 'Paies', count: 156, icon: Archive, color: 'from-pink-500 to-rose-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Archivage Securise</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gestion et conservation des documents</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Archiver un document</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total documents', value: stats.total, icon: FileText, color: 'from-primary-500 to-purple-600' },
          { label: 'Archives', value: stats.archives, icon: Archive, color: 'from-green-500 to-emerald-600' },
          { label: 'Actifs', value: stats.actifs, icon: CheckCircle2, color: 'from-blue-500 to-cyan-600' },
          { label: 'Espace utilise', value: stats.espaceUtilise, icon: Folder, color: 'from-amber-500 to-orange-600' },
          { label: 'Chiffrement', value: stats.tauxChiffrement + '%', icon: Lock, color: 'from-pink-500 to-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer group">
            <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
              <cat.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">{cat.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{cat.count} documents</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un document..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Toutes les categories</option>
            <option value="Contrat">Contrats</option>
            <option value="Evaluation">Evaluations</option>
            <option value="Attestation">Attestations</option>
          </select>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="Archive">Archive</option>
            <option value="Valide">Actif</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Documents archives</h3>
          <span className="text-sm text-slate-600 dark:text-slate-400">{filteredDocuments.length} document(s)</span>
        </div>
        {filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <Archive className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">Aucun document trouve</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredDocuments.map(doc => (
              <div key={doc.id_document} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{doc.type_document}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{getEmployeName(doc.matricule)}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Archive le {doc.date_archivage}</span>
                        </span>
                        {doc.retention && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Retention: {doc.retention}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      doc.statut === 'Archive' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      doc.statut === 'Valide' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>{doc.statut}</span>
                    <div className="flex space-x-1">
                      <button onClick={() => setSelectedDoc(doc)} className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Details du document</h3>
              <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Type</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{selectedDoc.type_document}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Employe</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{getEmployeName(selectedDoc.matricule)}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Statut</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedDoc.statut}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Date archivage</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedDoc.date_archivage}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Retention</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedDoc.retention}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <Lock className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300 font-semibold">Document chiffre et securise</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Archiver un document</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-2">Glissez-deposez votre fichier ici</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">PDF, JPG, PNG (max 10MB)</p>
                <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Selectionner un fichier</button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type de document</label>
                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option>Contrat</option>
                  <option>Evaluation</option>
                  <option>Attestation</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Duree de retention</label>
                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option>3 ans</option>
                  <option>5 ans</option>
                  <option>10 ans</option>
                  <option>Permanent</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">Le document sera chiffre automatiquement</span>
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button onClick={() => { alert('Document archive avec succes !'); setShowUploadModal(false) }} className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl">Archiver</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}