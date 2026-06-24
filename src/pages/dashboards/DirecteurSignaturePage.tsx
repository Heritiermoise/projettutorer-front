import { useState } from 'react'
import { FileSignature, Send, CheckCircle2, XCircle, Clock, AlertCircle, Eye, Download, Plus, X, Shield, Hash, Calendar, Mail, MapPin } from 'lucide-react'
import { mockDocumentsSignature } from '../../data/phase3Data'
import type { DocumentSignature } from '../../data/phase3Data'

export const DirecteurSignaturePage = () => {
  const [documents, setDocuments] = useState<DocumentSignature[]>(mockDocumentsSignature)
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState<DocumentSignature | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [formData, setFormData] = useState({ titre: '', type: 'Contrat', signataire: '', signataire_email: '' })

  const filteredDocs = documents.filter(d => {
    const matchesStatut = filterStatut === 'all' || d.statut === filterStatut
    const matchesType = filterType === 'all' || d.type === filterType
    return matchesStatut && matchesType
  })

  const stats = {
    total: documents.length,
    enAttente: documents.filter(d => d.statut === 'En_attente').length,
    signes: documents.filter(d => d.statut === 'Signe').length,
    refuses: documents.filter(d => d.statut === 'Refuse').length,
    expires: documents.filter(d => d.statut === 'Expiré').length
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newDoc: DocumentSignature = {
      id: Date.now(),
      ...formData,
      date_creation: new Date().toISOString().split('T')[0],
      statut: 'En_attente',
      document_url: '/docs/new_doc.pdf',
      hash: 'sha256:' + Math.random().toString(36).substring(2, 15),
      historique: [
        { date: new Date().toLocaleString('fr-FR'), action: 'Creation', utilisateur: 'Moise Vita (DG)', details: 'Document cree et envoye pour signature' }
      ]
    }
    setDocuments([newDoc, ...documents])
    setShowSendModal(false)
    setFormData({ titre: '', type: 'Contrat', signataire: '', signataire_email: '' })
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'En_attente': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Signe': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Refuse': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Expiré': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    }
    return colors[statut] || colors['En_attente']
  }

  const getStatutIcon = (statut: string) => {
    if (statut === 'Signe') return <CheckCircle2 className="w-5 h-5 text-green-600" />
    if (statut === 'Refuse') return <XCircle className="w-5 h-5 text-red-600" />
    if (statut === 'En_attente') return <Clock className="w-5 h-5 text-amber-600" />
    return <AlertCircle className="w-5 h-5 text-slate-400" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Signature Electronique</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gestion securisee des signatures de documents</p>
        </div>
        <button onClick={() => setShowSendModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Send className="w-5 h-5" />
          <span>Envoyer pour signature</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Signature electronique certifiee</h3>
            <p className="text-sm text-white/90 mb-3">Tous les documents signes beneficiaient d'une signature electronique avancee conforme eIDAS avec horodatage et hash cryptographique.</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Conforme eIDAS</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Horodatage certifie</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Hash SHA-256</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">✓ Piste d'audit complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileSignature, color: 'from-amber-500 to-orange-600' },
          { label: 'En attente', value: stats.enAttente, icon: Clock, color: 'from-amber-500 to-yellow-600' },
          { label: 'Signes', value: stats.signes, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
          { label: 'Refuses', value: stats.refuses, icon: XCircle, color: 'from-red-500 to-rose-600' },
          { label: 'Expires', value: stats.expires, icon: AlertCircle, color: 'from-slate-500 to-slate-600' }
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
              <option value="all">Tous les statuts</option>
              <option value="En_attente">En attente</option>
              <option value="Signe">Signes</option>
              <option value="Refuse">Refuses</option>
              <option value="Expiré">Expires</option>
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
              <option value="all">Tous les types</option>
              <option value="Contrat">Contrats</option>
              <option value="Avenant">Avenants</option>
              <option value="Attestation">Attestations</option>
              <option value="Evaluation">Evaluations</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => { setSelectedDoc(doc); setShowDetailModal(true) }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    doc.statut === 'Signe' ? 'bg-green-100 dark:bg-green-900/30' :
                    doc.statut === 'Refuse' ? 'bg-red-100 dark:bg-red-900/30' :
                    'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    {getStatutIcon(doc.statut)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-slate-800 dark:text-white truncate">{doc.titre}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatutColor(doc.statut)}`}>
                        {doc.statut}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{doc.signataire}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{doc.date_creation}</span>
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">{doc.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDetailModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Details du document</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Statut</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatutIcon(selectedDoc.statut)}
                    <span className={`font-bold ${selectedDoc.statut === 'Signe' ? 'text-green-600' : selectedDoc.statut === 'Refuse' ? 'text-red-600' : 'text-amber-600'}`}>
                      {selectedDoc.statut}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Type</p>
                  <p className="font-bold text-slate-800 dark:text-white">{selectedDoc.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Signataire</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{selectedDoc.signataire}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedDoc.signataire_email}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date de creation</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{selectedDoc.date_creation}</p>
                  {selectedDoc.date_signature && (
                    <>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-1">Date de signature</p>
                      <p className="font-semibold text-green-600">{selectedDoc.date_signature}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Hash className="w-5 h-5 text-blue-600" />
                  <p className="font-bold text-blue-800 dark:text-blue-200">Empreinte cryptographique</p>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-mono break-all">{selectedDoc.hash}</p>
                {selectedDoc.ip_signature && (
                  <div className="flex items-center space-x-2 mt-3 text-sm text-blue-700 dark:text-blue-300">
                    <MapPin className="w-4 h-4" />
                    <span>IP de signature: {selectedDoc.ip_signature}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>Piste d'audit</span>
                </h4>
                <div className="space-y-3">
                  {selectedDoc.historique.map((event, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-slate-800 dark:text-white">{event.action}</p>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{event.date}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{event.details}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Par: {event.utilisateur}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Envoyer pour signature</h3>
              <button onClick={() => setShowSendModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre du document *</label>
                <input type="text" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="Contrat">Contrat</option>
                  <option value="Avenant">Avenant</option>
                  <option value="Attestation">Attestation</option>
                  <option value="Evaluation">Evaluation</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom du signataire *</label>
                <input type="text" value={formData.signataire} onChange={(e) => setFormData({...formData, signataire: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email du signataire *</label>
                <input type="email" value={formData.signataire_email} onChange={(e) => setFormData({...formData, signataire_email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">Le document sera protege par signature electronique avancee avec horodatage certifie et hash SHA-256.</p>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowSendModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}