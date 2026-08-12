import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock, faCheckCircle, faExclamationCircle, faTimesCircle,
  faRefresh, faSignInAlt, faSignOutAlt, faCalendarDay,
  faChartBar, faUserCheck, faUserClock, faUserTimes,
  faCircle, faSpinner, faCheck, faCloudSun
} from '@fortawesome/free-solid-svg-icons'
import { presenceAPI, type Presence } from '../../services/api'

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

const isPresent = (status: string) => {
  const s = status.toLowerCase()
  return ['present', 'présent', 'retard'].includes(s)
}

const getStatusColor = (statut: string) => {
  const s = statut.toLowerCase()
  if (s === 'present' || s === 'présent') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
  }
  if (s === 'retard') {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
  }
  if (s === 'absent') {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

const getStatusIcon = (statut: string) => {
  const s = statut.toLowerCase()
  if (s === 'present' || s === 'présent') return faCheckCircle
  if (s === 'retard') return faExclamationCircle
  if (s === 'absent') return faTimesCircle
  return faCircle
}

export const EmployePresencesPage = () => {
  const [presences, setPresences] = useState<Presence[]>([])
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [pointing, setPointing] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const response = await presenceAPI.getMine()
      setPresences(response.presences ?? [])
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Impossible de charger vos pointages.' 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const point = async () => {
    setPointing(true)
    setFeedback(null)
    try {
      const response = await presenceAPI.pointerMine()
      setFeedback({ type: 'success', text: response.message })
      await load()
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Impossible d\'enregistrer votre pointage.' 
      })
    } finally {
      setPointing(false)
    }
  }

  const stats = useMemo(() => ({
    total: presences.length,
    presents: presences.filter(item => item.statut.toLowerCase() === 'present' || item.statut.toLowerCase() === 'présent').length,
    retards: presences.filter(item => item.statut.toLowerCase() === 'retard').length,
    absents: presences.filter(item => item.statut.toLowerCase() === 'absent').length,
  }), [presences])

  const today = new Date().toISOString().slice(0, 10)
  const todayPresence = presences.find(item => item.date_presence.slice(0, 10) === today)
  const hasArrived = Boolean(todayPresence?.heure_arrivee)
  const hasDeparted = Boolean(todayPresence?.heure_depart)

  const statsCards = [
    { 
      label: 'Jours pointés', 
      value: stats.total, 
      icon: faClock, 
      color: '#3B82F6',
      bg: 'bg-blue-50 dark:bg-blue-950/20'
    },
    { 
      label: 'Présences', 
      value: stats.presents, 
      icon: faUserCheck, 
      color: '#10B981',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    { 
      label: 'Retards', 
      value: stats.retards, 
      icon: faUserClock, 
      color: '#F59E0B',
      bg: 'bg-amber-50 dark:bg-amber-950/20'
    },
    { 
      label: 'Absences', 
      value: stats.absents, 
      icon: faUserTimes, 
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
              <FontAwesomeIcon icon={faCalendarDay} className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] dark:text-white">Mes Présences</h1>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                Suivi de vos arrivées et départs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button 
              {...scaleOnHover}
              onClick={() => void load()} 
              disabled={loading || pointing} 
              className="p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faRefresh} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
            <motion.button 
              {...scaleOnHover}
              onClick={() => void point()} 
              disabled={pointing || hasDeparted} 
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                hasDeparted 
                  ? 'bg-[#6B7280] shadow-[#6B7280]/25' 
                  : hasArrived 
                    ? 'bg-[#F59E0B] hover:bg-[#D97706] shadow-[#F59E0B]/25' 
                    : 'bg-[#10B981] hover:bg-[#059669] shadow-[#10B981]/25'
              }`}
            >
              {pointing ? (
                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
              ) : hasDeparted ? (
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
              ) : hasArrived ? (
                <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
              ) : (
                <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4" />
              )}
              {hasDeparted ? 'Pointage terminé' : hasArrived ? 'Pointer mon départ' : 'Pointer mon arrivée'}
            </motion.button>
          </div>
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
              icon={feedback.type === 'success' ? faCheckCircle : faExclamationCircle} 
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

      {/* Aujourd'hui */}
      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="bg-white dark:bg-[#1E293B] rounded-xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 dark:bg-[#10B981]/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faCloudSun} className="w-4 h-4 text-[#10B981]" />
          </div>
          <h3 className="font-semibold text-[#0F172A] dark:text-white">Aujourd'hui</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-center">
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Date</p>
            <p className="font-semibold text-[#0F172A] dark:text-white">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-center">
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Arrivée</p>
            <p className="font-semibold text-[#0F172A] dark:text-white">
              {todayPresence?.heure_arrivee ? todayPresence.heure_arrivee.slice(0, 5) : '—'}
            </p>
          </div>
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-center">
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Départ</p>
            <p className="font-semibold text-[#0F172A] dark:text-white">
              {todayPresence?.heure_depart ? todayPresence.heure_depart.slice(0, 5) : '—'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Historique */}
      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-[#E2E8F0] dark:border-[#334155] overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faChartBar} className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <h3 className="font-semibold text-[#0F172A] dark:text-white">Historique des pointages</h3>
          </div>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#334155] px-2.5 py-1 rounded-full">
            {presences.length} enreg.
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#10B981] animate-spin mb-3" />
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Chargement...</p>
          </div>
        ) : presences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FontAwesomeIcon icon={faClock} className="w-10 h-10 text-[#94A3B8] dark:text-[#475569] mb-3" />
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Aucun pointage enregistré</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {presences.map((presence, index) => {
              const StatusIcon = getStatusIcon(presence.statut)
              const statusColor = getStatusColor(presence.statut)
              const date = new Date(`${presence.date_presence.slice(0, 10)}T12:00:00`)
              
              return (
                <motion.div 
                  key={presence.id ?? `${presence.matricule}-${presence.date_presence}`}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faCalendarDay} className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0F172A] dark:text-white text-sm">
                          {date.toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faSignInAlt} className="w-3 h-3" />
                            Arrivée: {presence.heure_arrivee?.slice(0, 5) ?? '—'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#475569]" />
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faSignOutAlt} className="w-3 h-3" />
                            Départ: {presence.heure_depart?.slice(0, 5) ?? '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusColor}`}>
                        <FontAwesomeIcon icon={StatusIcon} className="w-3 h-3" />
                        {presence.statut}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}