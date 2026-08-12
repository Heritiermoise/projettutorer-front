import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileLines, faDownload, faUpload, faEye, faSearch,
  faCheckCircle, faClock, faXmark, faFilePdf,
  faFileImage, faFileWord, faFileExcel, faFileAlt,
  faSpinner, faCircle,
  faFileArchive, faFileAudio, faFileVideo, faFileCode,
  faFolderOpen, faTimesCircle
} from '@fortawesome/free-solid-svg-icons'
import { loadDashboardContext } from '../../services/dashboardData'

// Animations
const slideUp = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.96 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08
    }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
}

const getFileIcon = (type: string) => {
  const t = type.toLowerCase()
  if (t.includes('pdf')) return faFilePdf
  if (t.includes('image') || t.includes('jpg') || t.includes('png') || t.includes('jpeg')) return faFileImage
  if (t.includes('word') || t.includes('doc')) return faFileWord
  if (t.includes('excel') || t.includes('xls')) return faFileExcel
  if (t.includes('archive') || t.includes('zip')) return faFileArchive
  if (t.includes('audio') || t.includes('mp3')) return faFileAudio
  if (t.includes('video') || t.includes('mp4')) return faFileVideo
  if (t.includes('code') || t.includes('js') || t.includes('html')) return faFileCode
  return faFileAlt
}

const getFileColor = (type: string) => {
  const t = type.toLowerCase()
  if (t.includes('pdf')) return '#EF4444'
  if (t.includes('image') || t.includes('jpg') || t.includes('png') || t.includes('jpeg')) return '#8B5CF6'
  if (t.includes('word') || t.includes('doc')) return '#3B82F6'
  if (t.includes('excel') || t.includes('xls')) return '#10B981'
  return '#64748B'
}

const getStatusColor = (statut: string) => {
  const colors: Record<string, string> = {
    'Valide': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
    'Soumis': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
    'En attente': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
    'Rejeté': 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
  }
  return colors[statut] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

const getStatusIcon = (statut: string) => {
  const icons: Record<string, any> = {
    'Valide': faCheckCircle,
    'Soumis': faClock,
    'En attente': faClock,
    'Rejeté': faTimesCircle,
  }
  return icons[statut] || faCircle
}

export const EmployeDocumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await loadDashboardContext()
      setDashboardData(data)
    } catch (error) {
      console.error('Erreur de chargement:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const user = dashboardData?.user
  const userDocuments = useMemo(() => {
    if (!user || !dashboardData?.documents) return []
    return dashboardData.documents.filter((d: any) => d.matricule === user.matricule)
  }, [user, dashboardData])

  const filteredDocuments = useMemo(() => {
    return userDocuments.filter(d => {
      const matchesSearch = d.type_document.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatut = filterStatut === 'all' || d.statut === filterStatut
      return matchesSearch && matchesStatut
    })
  }, [userDocuments, searchTerm, filterStatut])

  const stats = useMemo(() => ({
    total: userDocuments.length,
    valides: userDocuments.filter(d => d.statut === 'Valide').length,
    enAttente: userDocuments.filter(d => d.statut === 'En attente' || d.statut === 'Soumis').length,
    rejetes: userDocuments.filter(d => d.statut === 'Rejeté').length,
  }), [userDocuments])

  const statsCards = [
    { 
      label: 'Total documents', 
      value: stats.total, 
      icon: faFileLines, 
      color: '#3B82F6',
      bg: 'bg-blue-50 dark:bg-blue-950/20'
    },
    { 
      label: 'Documents valides', 
      value: stats.valides, 
      icon: faCheckCircle, 
      color: '#10B981',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    { 
      label: 'En attente', 
      value: stats.enAttente, 
      icon: faClock, 
      color: '#F59E0B',
      bg: 'bg-amber-50 dark:bg-amber-950/20'
    },
    { 
      label: 'Rejetés', 
      value: stats.rejetes, 
      icon: faTimesCircle, 
      color: '#EF4444',
      bg: 'bg-rose-50 dark:bg-rose-950/20'
    },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 pb-24"
    >
      {/* Header */}
      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="bg-white dark:bg-[#1E293B] rounded-xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faFileLines} className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] dark:text-white">Mes Documents</h1>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                Gestion de vos documents personnels
              </p>
            </div>
          </div>
          <motion.button 
            {...scaleOnHover}
            onClick={() => setShowUploadModal(true)} 
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all"
          >
            <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
            <span>Uploader un document</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {statsCards.map((stat, index) => (
          <motion.div 
            key={index}
            variants={slideUp}
            whileHover={{ y: -2 }}
            className={`${stat.bg} rounded-xl p-4 shadow-sm border border-[#E2E8F0] dark:border-[#334155] transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                {stat.label}
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
                <FontAwesomeIcon icon={stat.icon} className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-xl font-bold text-[#0F172A] dark:text-white">{stat.value}</p>
            <div className="w-full h-0.5 bg-[#E2E8F0] dark:bg-[#334155] rounded-full mt-2 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: stat.color }} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filtres */}
      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Rechercher un document..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
            />
          </div>
          <select 
            value={filterStatut} 
            onChange={(e) => setFilterStatut(e.target.value)} 
            className="px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="Valide">Valide</option>
            <option value="Soumis">Soumis</option>
            <option value="En attente">En attente</option>
            <option value="Rejeté">Rejeté</option>
          </select>
        </div>
      </motion.div>

      {/* Liste des documents */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#10B981] animate-spin mb-3" />
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Chargement...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <motion.div 
          variants={slideUp}
          initial="initial"
          animate="animate"
          className="bg-white dark:bg-[#1E293B] rounded-xl p-12 text-center shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
        >
          <FontAwesomeIcon icon={faFolderOpen} className="w-16 h-16 mx-auto mb-4 text-[#94A3B8] dark:text-[#475569]" />
          <p className="text-[#64748B] dark:text-[#94A3B8] mb-4">Aucun document disponible</p>
          <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all">
            Uploader votre premier document
          </button>
        </motion.div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredDocuments.map((doc: any, index: number) => {
            const FileIcon = getFileIcon(doc.type_document)
            const fileColor = getFileColor(doc.type_document)
            const StatusIcon = getStatusIcon(doc.statut)
            const statusColor = getStatusColor(doc.statut)
            return (
              <motion.div 
                key={doc.id_document}
                variants={slideUp}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedDoc(doc)}
                className="bg-white dark:bg-[#1E293B] rounded-xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155] hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: fileColor + '15' }}
                  >
                    <FontAwesomeIcon icon={FileIcon} className="w-6 h-6" style={{ color: fileColor }} />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusColor}`}>
                    <FontAwesomeIcon icon={StatusIcon} className="w-3 h-3" />
                    {doc.statut}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0F172A] dark:text-white text-sm mb-1">
                  {doc.type_document}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Ajouté le {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                </p>
                <div className="mt-4 pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center gap-2">
                  <button className="flex-1 px-3 py-2 bg-[#F1F5F9] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] rounded-lg text-xs font-medium hover:bg-[#E2E8F0] dark:hover:bg-[#475569] transition-colors flex items-center justify-center gap-1.5 group-hover:bg-[#E2E8F0] dark:group-hover:bg-[#475569]">
                    <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                    <span>Voir</span>
                  </button>
                  <button className="flex-1 px-3 py-2 bg-[#10B981]/10 dark:bg-[#10B981]/20 text-[#10B981] rounded-lg text-xs font-medium hover:bg-[#10B981]/20 dark:hover:bg-[#10B981]/30 transition-colors flex items-center justify-center gap-1.5">
                    <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Modal Upload */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 dark:bg-[#10B981]/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUpload} className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <h3 className="font-semibold text-[#0F172A] dark:text-white">Uploader un document</h3>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors">
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] rounded-xl p-8 text-center hover:border-[#10B981] transition-colors">
                  <FontAwesomeIcon icon={faUpload} className="w-12 h-12 mx-auto mb-4 text-[#94A3B8] dark:text-[#475569]" />
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-2">
                    Glissez-déposez votre fichier ici
                  </p>
                  <p className="text-xs text-[#94A3B8] dark:text-[#64748B]">
                    PDF, JPG, PNG, DOC, XLS (max 5MB)
                  </p>
                  <button className="mt-4 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all">
                    Sélectionner un fichier
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                    Type de document
                  </label>
                  <select className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white">
                    <option>CV</option>
                    <option>Diplôme</option>
                    <option>Certificat médical</option>
                    <option>Carte d'identité</option>
                    <option>Attestation de travail</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
                  <button 
                    onClick={() => setShowUploadModal(false)} 
                    className="flex-1 px-4 py-2.5 bg-[#F1F5F9] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] rounded-lg hover:bg-[#E2E8F0] dark:hover:bg-[#475569] transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => {
                      alert('Document uploadé avec succès !')
                      setShowUploadModal(false)
                    }} 
                    className="flex-1 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                    Uploader
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Détails */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faFileLines} className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                  <h3 className="font-semibold text-[#0F172A] dark:text-white">Détails du document</h3>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors">
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="text-center p-6 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl">
                  <div className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center" style={{ backgroundColor: getFileColor(selectedDoc.type_document) + '15' }}>
                    <FontAwesomeIcon icon={getFileIcon(selectedDoc.type_document)} className="w-8 h-8" style={{ color: getFileColor(selectedDoc.type_document) }} />
                  </div>
                  <h4 className="font-semibold text-[#0F172A] dark:text-white mt-3">{selectedDoc.type_document}</h4>
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Ajouté le {new Date(selectedDoc.created_at).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Fichier', value: selectedDoc.fichier || 'document.pdf' },
                    { label: 'Statut', value: selectedDoc.statut },
                    { label: 'Taille', value: '2.4 MB' },
                    { label: 'Type', value: 'PDF' },
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg">
                      <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-medium text-[#0F172A] dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
                  <button className="flex-1 px-4 py-2.5 bg-[#F1F5F9] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] rounded-lg hover:bg-[#E2E8F0] dark:hover:bg-[#475569] transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                    Voir
                  </button>
                  <button className="flex-1 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}