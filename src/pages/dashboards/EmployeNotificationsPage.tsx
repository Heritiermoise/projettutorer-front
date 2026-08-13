import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBell, faCheckCircle, faExclamationCircle, faInfoCircle,
  faWarning, faCalendar, faClock, faUsers,
  faFileAlt, faGift, faDollarSign, faBriefcase, faUser,
  faCheck, faTimes, faTrash, faCheckDouble, faSpinner,
  faCircle, faSearch, faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons'
import { notificationAPI } from '../../services/api'

// Animations
const slideUp = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.96 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08
    }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
}

// Types de notifications et leurs styles
const getTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    'info': faInfoCircle,
    'success': faCheckCircle,
    'warning': faWarning,
    'error': faExclamationCircle,
    'conges': faCalendar,
    'paie': faDollarSign,
    'presence': faClock,
    'document': faFileAlt,
    'avantage': faGift,
    'recrutement': faUsers,
    'contrat': faBriefcase,
    'profile': faUser,
  }
  return icons[type] || faBell
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'info': '#3B82F6',
    'success': '#10B981',
    'warning': '#F59E0B',
    'error': '#EF4444',
    'conges': '#8B5CF6',
    'paie': '#10B981',
    'presence': '#F59E0B',
    'document': '#3B82F6',
    'avantage': '#EC4899',
    'recrutement': '#06B6D4',
    'contrat': '#8B5CF6',
    'profile': '#64748B',
  }
  return colors[type] || '#64748B'
}

const getTypeBg = (type: string) => {
  const colors: Record<string, string> = {
    'info': 'bg-blue-50 dark:bg-blue-950/20',
    'success': 'bg-emerald-50 dark:bg-emerald-950/20',
    'warning': 'bg-amber-50 dark:bg-amber-950/20',
    'error': 'bg-rose-50 dark:bg-rose-950/20',
    'conges': 'bg-purple-50 dark:bg-purple-950/20',
    'paie': 'bg-emerald-50 dark:bg-emerald-950/20',
    'presence': 'bg-amber-50 dark:bg-amber-950/20',
    'document': 'bg-blue-50 dark:bg-blue-950/20',
    'avantage': 'bg-pink-50 dark:bg-pink-950/20',
    'recrutement': 'bg-cyan-50 dark:bg-cyan-950/20',
    'contrat': 'bg-purple-50 dark:bg-purple-950/20',
    'profile': 'bg-slate-50 dark:bg-slate-800/50',
  }
  return colors[type] || 'bg-slate-50 dark:bg-slate-800/50'
}

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `${minutes} min`
  if (hours < 24) return `${hours} h`
  if (days < 7) return `${days} j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export const EmployeNotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterRead, setFilterRead] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await notificationAPI.getAll()
      setNotifications((response.notifications || []).map((notification: any) => ({
        ...notification,
        read: Boolean(notification.lu),
      })))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Impossible de charger les notifications.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    const intervalId = window.setInterval(loadNotifications, 10000)
    return () => window.clearInterval(intervalId)
  }, [loadNotifications])

  const handleMarkAsRead = useCallback(async (id: number) => {
    try {
      await notificationAPI.markRead(id)
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
      if (selectedNotification?.id === id) {
        setSelectedNotification({ ...selectedNotification, read: true })
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
    }
  }, [selectedNotification])

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      if (selectedNotification) {
        setSelectedNotification({ ...selectedNotification, read: true })
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error)
    }
  }, [selectedNotification])

  const handleDelete = useCallback(async (id: number) => {
    try {
      await notificationAPI.delete(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (selectedNotification?.id === id) {
        setSelectedNotification(null)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }, [selectedNotification])

  const handleToggleRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: !n.read } : n
    ))
    if (selectedNotification?.id === id) {
      setSelectedNotification({ ...selectedNotification, read: !selectedNotification.read })
    }
  }, [selectedNotification])

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          n.message?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || n.type === filterType
    const matchesRead = filterRead === 'all' || 
                        (filterRead === 'read' && n.read) ||
                        (filterRead === 'unread' && !n.read)
    return matchesSearch && matchesType && matchesRead
  })

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    read: notifications.filter(n => n.read).length,
  }

  const unreadCount = notifications.filter(n => !n.read).length

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
            <div className="relative w-10 h-10 rounded-xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-[#3B82F6]" />
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-[#EF4444]/30"
                >
                  {unreadCount}
                </motion.span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] dark:text-white">Notifications</h1>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Toutes vos notifications sont lues'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <motion.button 
              {...scaleOnHover}
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all"
            >
              <FontAwesomeIcon icon={faCheckDouble} className="w-4 h-4" />
              Tout marquer comme lu
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Total', value: stats.total, color: '#3B82F6' },
          { label: 'Non lues', value: stats.unread, color: '#EF4444' },
          { label: 'Lues', value: stats.read, color: '#10B981' },
        ].map((stat, index) => (
          <motion.div 
            key={index}
            variants={slideUp}
            className="bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-[#E2E8F0] dark:border-[#334155] text-center"
          >
            <p className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
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
              placeholder="Rechercher une notification..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
            />
          </div>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            className="px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
          >
            <option value="all">Tous les types</option>
            <option value="info">Information</option>
            <option value="success">Succès</option>
            <option value="warning">Avertissement</option>
            <option value="error">Erreur</option>
            <option value="conges">Congés</option>
            <option value="paie">Paie</option>
            <option value="presence">Présence</option>
            <option value="document">Document</option>
            <option value="avantage">Avantage</option>
          </select>
          <select 
            value={filterRead} 
            onChange={(e) => setFilterRead(e.target.value)} 
            className="px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
        </div>
      </motion.div>

      {/* Liste des notifications */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#10B981] animate-spin mb-3" />
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Chargement...</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-[#1E293B] rounded-xl p-8 text-center shadow-sm border border-[#E2E8F0] dark:border-[#334155]">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-12 h-12 mx-auto mb-3 text-[#EF4444]" />
          <p className="text-[#EF4444] dark:text-[#F87171]">{error}</p>
          <button onClick={loadNotifications} className="mt-4 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all">
            Réessayer
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div 
          variants={slideUp}
          initial="initial"
          animate="animate"
          className="bg-white dark:bg-[#1E293B] rounded-xl p-12 text-center shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
        >
          <FontAwesomeIcon icon={faBell} className="w-16 h-16 mx-auto mb-4 text-[#94A3B8] dark:text-[#475569] opacity-30" />
          <p className="text-[#64748B] dark:text-[#94A3B8]">
            {searchTerm || filterType !== 'all' ? 'Aucune notification ne correspond à vos filtres' : 'Aucune notification disponible'}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          {filteredNotifications.map((notification, index) => {
            const TypeIcon = getTypeIcon(notification.type)
            const typeColor = getTypeColor(notification.type)
            const typeBg = getTypeBg(notification.type)
            const isRead = notification.read

            return (
              <motion.div 
                key={notification.id}
                variants={slideUp}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedNotification(notification)}
                className={`${typeBg} rounded-xl p-4 border transition-all cursor-pointer group ${
                  isRead 
                    ? 'border-[#E2E8F0] dark:border-[#334155] opacity-70' 
                    : 'border-[#10B981] dark:border-[#10B981] shadow-lg shadow-[#10B981]/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: typeColor + '15' }}
                  >
                    <FontAwesomeIcon icon={TypeIcon} className="w-5 h-5" style={{ color: typeColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${isRead ? 'text-[#64748B] dark:text-[#94A3B8]' : 'text-[#0F172A] dark:text-white'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                        )}
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] bg-white/50 dark:bg-[#1E293B]/50 px-2 py-0.5 rounded-full">
                        {notification.type}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleRead(notification.id); }}
                          className="p-1 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors"
                          title={isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                        >
                          <FontAwesomeIcon 
                            icon={isRead ? faEye : faEyeSlash} 
                            className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" 
                          />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                          className="p-1 rounded hover:bg-[#FEE2E2] dark:hover:bg-[#450A0A] transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5 text-[#EF4444]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Modal Détails */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedNotification(null)}
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
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: getTypeColor(selectedNotification.type) + '15' }}
                  >
                    <FontAwesomeIcon 
                      icon={getTypeIcon(selectedNotification.type)} 
                      className="w-4 h-4" 
                      style={{ color: getTypeColor(selectedNotification.type) }} 
                    />
                  </div>
                  <h3 className="font-semibold text-[#0F172A] dark:text-white">Détails</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleToggleRead(selectedNotification.id)}
                    className="p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors"
                  >
                    <FontAwesomeIcon 
                      icon={selectedNotification.read ? faEye : faEyeSlash} 
                      className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" 
                    />
                  </button>
                  <button 
                    onClick={() => { handleDelete(selectedNotification.id); setSelectedNotification(null); }}
                    className="p-2 rounded-lg hover:bg-[#FEE2E2] dark:hover:bg-[#450A0A] transition-colors"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4 text-[#EF4444]" />
                  </button>
                  <button 
                    onClick={() => setSelectedNotification(null)} 
                    className="p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${selectedNotification.read ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'}`}>
                      <FontAwesomeIcon icon={selectedNotification.read ? faEye : faCircle} className="w-3 h-3" />
                      {selectedNotification.read ? 'Lu' : 'Non lu'}
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#334155] px-2.5 py-1 rounded-full">
                      {selectedNotification.type}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-[#0F172A] dark:text-white">
                    {selectedNotification.title}
                  </h4>
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-2">
                    {selectedNotification.message}
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-3">
                    Reçu le {new Date(selectedNotification.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>

                {!selectedNotification.read && (
                  <button 
                    onClick={() => handleMarkAsRead(selectedNotification.id)}
                    className="w-full px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                    Marquer comme lu
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}