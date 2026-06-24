import { useState } from 'react'
import { FileText, Download, Upload, Eye, Search, Filter, CheckCircle2, Clock, X } from 'lucide-react'
import { mockDocuments, mockEmployes } from '../../data/mockData'

export const EmployeDocumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)

  const user = mockEmployes[3] || { matricule: 'EMP-J1K2L3' }
  const userDocuments = mockDocuments.filter(d => d.matricule === user.matricule)

  const filteredDocuments = userDocuments.filter(d => {
    const matchesSearch = d.type_document.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || d.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  const stats = {
    total: userDocuments.length,
    valides: userDocuments.filter(d => d.statut === 'Valide').length,
    enAttente: userDocuments.filter(d => d.statut === 'En attente').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Mes Documents</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gestion de vos documents personnels</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Uploader un document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        {[
          { label: 'Total documents', value: stats.total, color: 'from-primary-500 to-purple-600', icon: FileText },
          { label: 'Documents valides', value: stats.valides, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'En attente', value: stats.enAttente, color: 'from-amber-500 to-orange-600', icon: Clock },
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
            <input type="text" placeholder="Rechercher un document..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="Valide">Valide</option>
            <option value="En attente">En attente</option>
          </select>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">Aucun document disponible</p>
          <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
            Uploader votre premier document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDocuments.map(doc => (
            <div key={doc.id_document} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  doc.statut === 'Valide' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                }`}>{doc.statut}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{doc.type_document}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Ajoute le {doc.created_at}</p>
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 flex items-center justify-center space-x-1">
                  <Eye className="w-4 h-4" /><span>Voir</span>
                </button>
                <button className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center justify-center space-x-1">
                  <Download className="w-4 h-4" /><span>Telecharger</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Uploader un document</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-2">Glissez-deposez votre fichier ici</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">PDF, JPG, PNG (max 5MB)</p>
                <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Selectionner un fichier</button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type de document</label>
                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
                  <option>CV</option>
                  <option>Diplome</option>
                  <option>Certificat medical</option>
                  <option>Carte d'identite</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600">Annuler</button>
                <button onClick={() => { alert('Document uploade avec succes !'); setShowUploadModal(false) }} className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Uploader</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}