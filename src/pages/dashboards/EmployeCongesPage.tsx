import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar, faPlus, faXmark, faCheckCircle,
  faTimesCircle, faFileText, faCalendarAlt, faUmbrella,
  faHeartbeat, faStar, faBaby, faCircle,
  faSpinner, faCheck, faHourglassHalf, faCalendarDay,
  faSun, faCloudSun, faClock as faClockIcon
} from '@fortawesome/free-solid-svg-icons'
import { employeCongesAPI } from '../../services/api'

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

export const EmployeCongesPage = () => {
  const [showDemandeModal, setShowDemandeModal] = useState(false)
  const [conges, setConges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    type_conge: 'Annuel',
    date_debut: '',
    date_fin: '',
    motif: '',
  })

  const loadConges = useCallback(async () => {
    setLoading(true)
    try {
      const response = await employeCongesAPI.getMine()
      setConges(response.conges ?? [])
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Impossible de charger vos congés.' 
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConges()
  }, [loadConges])

  const stats = useMemo(() => ({
    total: conges.length,
    approuves: conges.filter((c: any) => c.statut === 'Approuve').length,
    enAttente: conges.filter((c: any) => c.statut === 'En attente').length,
    refuses: conges.filter((c: any) => c.statut === 'Refuse').length,
  }), [conges])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const response = await employeCongesAPI.create({
        type_conge: formData.type_conge,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        motif: formData.motif
      })
      setFeedback({ type: 'success', text: response.message || 'Demande de congé envoyée avec succès !' })
      setShowDemandeModal(false)
      setFormData({ type_conge: 'Annuel', date_debut: '', date_fin: '', motif: '' })
      await loadConges()
    } catch (error: any) {
      setFeedback({ type: 'error', text: error.message || 'Erreur lors de l\'envoi de la demande.' })
    } finally {
      setSubmitting(false)
    }
  }

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'Annuel': faSun,
      'Maladie': faHeartbeat,
      'Exceptionnel': faStar,
      'Maternite': faBaby,
      'Paternite': faBaby,
      'Mariage': faCalendar,
      'Deuil': faCloudSun,
    }
    return icons[type] || faCalendarAlt
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Annuel': '#3B82F6',
      'Maladie': '#EF4444',
      'Exceptionnel': '#8B5CF6',
      'Maternite': '#EC4899',
      'Paternite': '#06B6D4',
      'Mariage': '#F59E0B',
      'Deuil': '#6B7280',
    }
    return colors[type] || '#3B82F6'
  }

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Approuve': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
      'En attente': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
      'Refuse': 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
    }
    return colors[statut] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }

  const getStatusIcon = (statut: string) => {
    const icons: Record<string, any> = {
      'Approuve': faCheckCircle,
      'En attente': faHourglassHalf,
      'Refuse': faTimesCircle,
    }
    return icons[statut] || faCircle
  }

  const statsCards = [
    { 
      label: 'Total demandes', 
      value: stats.total, 
      icon: faCalendarAlt, 
      color: '#3B82F6',
      bg: 'bg-blue-50 dark:bg-blue-950/20'
    },
    { 
      label: 'Approuvés', 
      value: stats.approuves, 
      icon: faCheckCircle, 
      color: '#10B981',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    { 
      label: 'En attente', 
      value: stats.enAttente, 
      icon: faClockIcon, 
      color: '#F59E0B',
      bg: 'bg-amber-50 dark:bg-amber-950/20'
    },
    { 
      label: 'Refusés', 
      value: stats.refuses, 
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
              <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] dark:text-white">Mes Congés</h1>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                Gérez vos demandes de congé
              </p>
            </div>
          </div>
          <motion.button 
            {...scaleOnHover}
            onClick={() => setShowDemandeModal(true)} 
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <span>Nouvelle demande</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              feedback.type === 'success' 
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30' 
                : 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30'
            }`}
          >
            <FontAwesomeIcon 
              icon={feedback.type === 'success' ? faCheckCircle : faTimesCircle} 
              className={`mt-0.5 w-5 h-5 ${feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} 
            />
            <p className="text-sm font-medium text-[#0F172A] dark:text-white">{feedback.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Solde de congés */}
      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="bg-white dark:bg-[#1E293B] rounded-xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faUmbrella} className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <h3 className="font-semibold text-[#0F172A] dark:text-white">Solde de congés</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Solde restant', value: '20 jours', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800' },
            { label: 'Pris cette année', value: '10 jours', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800' },
            { label: 'Total annuel', value: '30 jours', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800' },
          ].map((item, index) => (
            <div key={index} className={`${item.bg} ${item.border} rounded-lg p-4 border text-center`}>
              <p className={`text-xs font-medium ${item.color} opacity-80`}>{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Historique des demandes */}
      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-[#E2E8F0] dark:border-[#334155] overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faFileText} className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <h3 className="font-semibold text-[#0F172A] dark:text-white">Historique des demandes</h3>
          </div>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#334155] px-2.5 py-1 rounded-full">
            {conges.length} demandes
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#10B981] animate-spin mb-3" />
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Chargement...</p>
          </div>
        ) : conges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon icon={faCalendarAlt} className="w-10 h-10 text-[#94A3B8] dark:text-[#475569] mb-3" />
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Aucune demande de congé</p>
            <button onClick={() => setShowDemandeModal(true)} className="mt-4 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all">
              Faire une demande
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {conges.map((conge: any, index: number) => {
              const TypeIcon = getTypeIcon(conge.type_conge)
              const typeColor = getTypeColor(conge.type_conge)
              const StatusIcon = getStatusIcon(conge.statut)
              const statusColor = getStatusColor(conge.statut)
              return (
                <motion.div 
                  key={conge.id_conge}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: typeColor + '15' }}
                      >
                        <FontAwesomeIcon icon={TypeIcon} className="w-5 h-5" style={{ color: typeColor }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0F172A] dark:text-white text-sm">
                          {conge.type_conge}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarDay} className="w-3 h-3" />
                            {conge.date_debut} → {conge.date_fin}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#475569]" />
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faClockIcon} className="w-3 h-3" />
                            {conge.nombre_jours} jours
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusColor}`}>
                        <FontAwesomeIcon icon={StatusIcon} className="w-3 h-3" />
                        {conge.statut}
                      </span>
                    </div>
                  </div>
                  {conge.motif && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg border border-[#E2E8F0] dark:border-[#334155]"
                    >
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-wider mb-0.5">
                        Motif
                      </p>
                      <p className="text-sm text-[#0F172A] dark:text-white">{conge.motif}</p>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Modal Nouvelle Demande */}
      <AnimatePresence>
        {showDemandeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDemandeModal(false)}
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
                    <FontAwesomeIcon icon={faPlus} className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <h3 className="font-semibold text-[#0F172A] dark:text-white">Nouvelle demande de congé</h3>
                </div>
                <button onClick={() => setShowDemandeModal(false)} className="p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors">
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {feedback && feedback.type === 'error' && (
                  <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 p-4">
                    <FontAwesomeIcon icon={faTimesCircle} className="mt-0.5 w-5 h-5 text-rose-600" />
                    <p className="text-sm font-medium text-[#0F172A] dark:text-white">{feedback.text}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                    Type de congé
                  </label>
                  <select 
                    value={formData.type_conge} 
                    onChange={(e) => setFormData({...formData, type_conge: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
                  >
                    <option value="Annuel">Congé annuel</option>
                    <option value="Maladie">Congé de maladie</option>
                    <option value="Exceptionnel">Congé exceptionnel</option>
                    <option value="Maternite">Congé de maternité</option>
                    <option value="Paternite">Congé de paternité</option>
                    <option value="Mariage">Congé de mariage</option>
                    <option value="Deuil">Congé de deuil</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                      Date de début
                    </label>
                    <input 
                      type="date" 
                      value={formData.date_debut} 
                      onChange={(e) => setFormData({...formData, date_debut: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                      Date de fin
                    </label>
                    <input 
                      type="date" 
                      value={formData.date_fin} 
                      onChange={(e) => setFormData({...formData, date_fin: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
                      required 
                    />
                  </div>
                </div>

                {formData.date_debut && formData.date_fin && (
                  <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Nombre de jours</p>
                    <p className="text-lg font-bold text-[#10B981]">
                      {calculateDays(formData.date_debut, formData.date_fin)} jours
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                    Motif
                  </label>
                  <textarea 
                    value={formData.motif} 
                    onChange={(e) => setFormData({...formData, motif: e.target.value})} 
                    rows={4} 
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white resize-none"
                    placeholder="Expliquez la raison de votre demande..."
                    required 
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
                  <button 
                    type="button" 
                    onClick={() => setShowDemandeModal(false)} 
                    className="flex-1 px-4 py-2.5 bg-[#F1F5F9] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] rounded-lg hover:bg-[#E2E8F0] dark:hover:bg-[#475569] transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                  <motion.button 
                    {...scaleOnHover}
                    type="submit" 
                    disabled={submitting} 
                    className="flex-1 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                    ) : (
                      <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                    )}
                    Envoyer la demande
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}