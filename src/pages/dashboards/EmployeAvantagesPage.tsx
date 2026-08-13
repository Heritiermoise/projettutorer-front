import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAward, faSearch, faDollarSign, faCheckCircle,
  faGift, faHeart, faUtensils, faBus, faGraduationCap,
  faShoppingBag, faPlane, faHotel, faPhone,
  faWifi, faTv, faGamepad, faBook, faMusic, faFilm,
  faCoffee, faCircle, faClock, faTimesCircle, faSpinner,
  faArrowRight, faCalendarAlt, faCoins, faXmark
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

const getTypeIcon = (type: string) => {
  const t = type.toLowerCase()
  if (t.includes('sante') || t.includes('santé')) return faHeart
  if (t.includes('alimentation')) return faUtensils
  if (t.includes('transport')) return faBus
  if (t.includes('formation')) return faGraduationCap
  if (t.includes('shopping')) return faShoppingBag
  if (t.includes('voyage')) return faPlane
  if (t.includes('hotel')) return faHotel
  if (t.includes('telephone')) return faPhone
  if (t.includes('internet') || t.includes('wifi')) return faWifi
  if (t.includes('tv')) return faTv
  if (t.includes('jeu') || t.includes('game')) return faGamepad
  if (t.includes('livre') || t.includes('book')) return faBook
  if (t.includes('musique')) return faMusic
  if (t.includes('film')) return faFilm
  if (t.includes('cafe') || t.includes('café')) return faCoffee
  return faGift
}

const getTypeColor = (type: string) => {
  const t = type.toLowerCase()
  if (t.includes('sante') || t.includes('santé')) return '#10B981'
  if (t.includes('alimentation')) return '#F59E0B'
  if (t.includes('transport')) return '#3B82F6'
  if (t.includes('formation')) return '#8B5CF6'
  if (t.includes('shopping')) return '#EC4899'
  if (t.includes('voyage')) return '#06B6D4'
  return '#64748B'
}

const getTypeBg = (type: string) => {
  const t = type.toLowerCase()
  if (t.includes('sante') || t.includes('santé')) return 'bg-emerald-50 dark:bg-emerald-950/20'
  if (t.includes('alimentation')) return 'bg-amber-50 dark:bg-amber-950/20'
  if (t.includes('transport')) return 'bg-blue-50 dark:bg-blue-950/20'
  if (t.includes('formation')) return 'bg-purple-50 dark:bg-purple-950/20'
  if (t.includes('shopping')) return 'bg-pink-50 dark:bg-pink-950/20'
  if (t.includes('voyage')) return 'bg-cyan-50 dark:bg-cyan-950/20'
  return 'bg-slate-50 dark:bg-slate-800/50'
}

const getStatusColor = (statut: string) => {
  const colors: Record<string, string> = {
    'Actif': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
    'Inactif': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'Expiré': 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
    'Suspendu': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  }
  return colors[statut] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

const getStatusIcon = (statut: string) => {
  const icons: Record<string, any> = {
    'Actif': faCheckCircle,
    'Inactif': faTimesCircle,
    'Expiré': faClock,
    'Suspendu': faClock,
  }
  return icons[statut] || faCircle
}

export const EmployeAvantagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAvantage, setSelectedAvantage] = useState<any>(null)

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
  const userAvantages = useMemo(() => {
    if (!user || !dashboardData?.avantages) return []
    return dashboardData.avantages.filter((a: any) => a.matricule === user.matricule)
  }, [user, dashboardData])

  const filteredAvantages = useMemo(() => {
    return userAvantages.filter(a => {
      const matchesSearch = a.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            a.type_avantage.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || a.type_avantage === filterType
      return matchesSearch && matchesType
    })
  }, [userAvantages, searchTerm, filterType])

  const stats = useMemo(() => ({
    total: userAvantages.length,
    actifs: userAvantages.filter((a: any) => a.statut === 'Actif').length,
    valeurTotale: userAvantages.reduce((sum: number, a: any) => sum + parseFloat(a.valeur || '0'), 0),
  }), [userAvantages])

  const statsCards = [
    { 
      label: 'Total avantages', 
      value: stats.total, 
      icon: faAward, 
      color: '#3B82F6',
      bg: 'bg-blue-50 dark:bg-blue-950/20'
    },
    { 
      label: 'Avantages actifs', 
      value: stats.actifs, 
      icon: faCheckCircle, 
      color: '#10B981',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    { 
      label: 'Valeur totale', 
      value: '$' + stats.valeurTotale.toLocaleString(), 
      icon: faCoins, 
      color: '#F59E0B',
      bg: 'bg-amber-50 dark:bg-amber-950/20'
    },
  ]

  const types = ['Sante', 'Alimentation', 'Transport', 'Formation', 'Shopping', 'Voyage', 'Autre']

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
              <FontAwesomeIcon icon={faGift} className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] dark:text-white">Mes Avantages</h1>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                Avantages dont vous bénéficiez
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
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

      {/* Filtres et recherche */}
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
              placeholder="Rechercher un avantage..." 
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
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Liste des avantages */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#10B981] animate-spin mb-3" />
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Chargement...</p>
        </div>
      ) : filteredAvantages.length === 0 ? (
        <motion.div 
          variants={slideUp}
          initial="initial"
          animate="animate"
          className="bg-white dark:bg-[#1E293B] rounded-xl p-12 text-center shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
        >
          <FontAwesomeIcon icon={faGift} className="w-16 h-16 mx-auto mb-4 text-[#94A3B8] dark:text-[#475569]" />
          <p className="text-[#64748B] dark:text-[#94A3B8] mb-4">Aucun avantage disponible</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredAvantages.map((avantage: any, index: number) => {
            const TypeIcon = getTypeIcon(avantage.type_avantage)
            const typeColor = getTypeColor(avantage.type_avantage)
            const typeBg = getTypeBg(avantage.type_avantage)
            const StatusIcon = getStatusIcon(avantage.statut)
            const statusColor = getStatusColor(avantage.statut)
            const isActive = avantage.statut === 'Actif'

            return (
              <motion.div 
                key={avantage.id_avantage}
                variants={slideUp}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedAvantage(avantage)}
                className={`${typeBg} rounded-xl p-5 shadow-sm border border-[#E2E8F0] dark:border-[#334155] hover:shadow-xl transition-all cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: typeColor + '15' }}
                  >
                    <FontAwesomeIcon icon={TypeIcon} className="w-6 h-6" style={{ color: typeColor }} />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusColor}`}>
                    <FontAwesomeIcon icon={StatusIcon} className="w-3 h-3" />
                    {avantage.statut}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0F172A] dark:text-white text-sm mb-1">
                  {avantage.libelle}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mb-3">
                  {avantage.description || 'Aucune description'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[#64748B] dark:text-[#94A3B8]">
                    <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4 text-[#10B981]" />
                    <span className="font-bold text-[#10B981]">${avantage.valeur}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                    <span>{avantage.date_expiration ? new Date(avantage.date_expiration).toLocaleDateString('fr-FR') : 'Indéfinie'}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] bg-white/50 dark:bg-[#1E293B]/50 px-2.5 py-1 rounded-full">
                    {avantage.type_avantage}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Modal Détails */}
      <AnimatePresence>
        {selectedAvantage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedAvantage(null)}
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
                    <FontAwesomeIcon icon={faGift} className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                  <h3 className="font-semibold text-[#0F172A] dark:text-white">Détails de l'avantage</h3>
                </div>
                <button onClick={() => setSelectedAvantage(null)} className="p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] transition-colors">
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="text-center p-6 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl">
                  <div 
                    className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center"
                    style={{ backgroundColor: getTypeColor(selectedAvantage.type_avantage) + '15' }}
                  >
                    <FontAwesomeIcon 
                      icon={getTypeIcon(selectedAvantage.type_avantage)} 
                      className="w-8 h-8" 
                      style={{ color: getTypeColor(selectedAvantage.type_avantage) }} 
                    />
                  </div>
                  <h4 className="font-semibold text-[#0F172A] dark:text-white mt-3">{selectedAvantage.libelle}</h4>
                  <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 ${getStatusColor(selectedAvantage.statut)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(selectedAvantage.statut)} className="w-3 h-3" />
                    {selectedAvantage.statut}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Type', value: selectedAvantage.type_avantage },
                    { label: 'Valeur', value: '$' + selectedAvantage.valeur },
                    { label: 'Expiration', value: selectedAvantage.date_expiration ? new Date(selectedAvantage.date_expiration).toLocaleDateString('fr-FR') : 'Indéfinie' },
                    { label: 'Statut', value: selectedAvantage.statut },
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg">
                      <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-medium text-[#0F172A] dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                {selectedAvantage.description && (
                  <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg">
                    <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Description</p>
                    <p className="text-sm text-[#0F172A] dark:text-white">{selectedAvantage.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}