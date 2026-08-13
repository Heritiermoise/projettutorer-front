import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGift, faSearch, faPlus, faEdit, faTrash, faDollarSign,
  faCalendar, faX, faSync, faSpinner, faUsers, faCheckCircle,
  faTimesCircle, faClock, faFilter, faSortDown, faHeart, faUtensils,
  faBus, faGraduationCap, faFire, faCircleCheck, faCircleExclamation,
  faEye, faWallet
} from '@fortawesome/free-solid-svg-icons'
import { loadDashboardRHContext } from '../../services/dashboardRHData'
import { avantageAPI } from '../../services/api'

// Animations artistiques
const fadeInUp = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.95 }
}

const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const slideInFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
}

const rotateIn = {
  initial: { opacity: 0, rotate: -180, scale: 0.5 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 180, scale: 0.5 }
}

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
}

export const RHAvantagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [avantagesData, setAvantagesData] = useState<any[]>([])
  const [statsData, setStatsData] = useState<any>({ total: 0, actifs: 0, valeurTotale: 0 })
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<string>('date_creation')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedAvantage, setSelectedAvantage] = useState<any>(null)

  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [editingAvantage, setEditingAvantage] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [formData, setFormData] = useState({
    matricule: '',
    libelle: '',
    description: '',
    type_avantage: 'Sante',
    valeur: '',
    date_expiration: '',
    statut: 'Actif'
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Chargement du contexte RH avec les données de l'entreprise connectée
      const dashRes = await loadDashboardRHContext()
      setDashboardData(dashRes)

      // Récupérer les avantages via l'API
      const avRes = await avantageAPI.getAll().catch(() => null)
      
      if (avRes) {
        const list = avRes.data || avRes.avantages || (Array.isArray(avRes) ? avRes : [])
        setAvantagesData(list)
        if (avRes.stats) {
          setStatsData(avRes.stats)
        }
      }
    } catch (err) {
      console.error("Erreur de chargement des données :", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Récupérer l'entreprise connectée depuis le dashboard
  const entrepriseActuelle = useMemo(() => dashboardData?.entreprise || null, [dashboardData])
  const entrepriseId = useMemo(() => entrepriseActuelle?.id_entreprise || null, [entrepriseActuelle])

  // Filtrer les employés de l'entreprise connectée
  const employes = useMemo(() => {
    if (!dashboardData?.employes) return []
    if (!entrepriseId) return dashboardData.employes
    
    // Filtrer les employés qui appartiennent à l'entreprise
    return dashboardData.employes.filter((emp: any) => {
      // Si l'employé a un champ id_entreprise ou company_id
      if (emp.id_entreprise) return Number(emp.id_entreprise) === Number(entrepriseId)
      if (emp.company_id) return Number(emp.company_id) === Number(entrepriseId)
      
      // Sinon, vérifier via le poste -> service -> entreprise
      if (emp.id_poste) {
        const poste = dashboardData.postes?.find((p: any) => Number(p.id_poste) === Number(emp.id_poste))
        if (poste?.id_service) {
          const service = dashboardData.services?.find((s: any) => Number(s.id_service) === Number(poste.id_service))
          if (service?.id_entreprise) {
            return Number(service.id_entreprise) === Number(entrepriseId)
          }
        }
      }
      return false
    })
  }, [dashboardData, entrepriseId])

  const getEmployeName = useCallback((matricule: string) => {
    const emp = employes.find((e: any) => String(e.matricule) === String(matricule))
    return emp ? `${emp.prenom} ${emp.nom}` : 'Employé inconnu'
  }, [employes])

  const getEmployeDetails = useCallback((matricule: string) => {
    return employes.find((e: any) => String(e.matricule) === String(matricule))
  }, [employes])

  // Filtrer les avantages par entreprise ET par matricule des employés de l'entreprise
  const filteredAndSortedAvantages = useMemo(() => {
    // Récupérer tous les matricules des employés de l'entreprise
    const employeMatricules = new Set(employes.map((e: any) => String(e.matricule)))
    
    let filtered = avantagesData.filter((a: any) => {
      // Vérifier si l'avantage appartient à un employé de l'entreprise
      if (!employeMatricules.has(String(a.matricule))) {
        return false
      }

      const empName = getEmployeName(a.matricule).toLowerCase()
      const libelle = (a.libelle || '').toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      const matchesSearch = empName.includes(searchLower) || libelle.includes(searchLower)
      const matchesType = filterType === 'all' || a.type_avantage === filterType
      const matchesStatut = filterStatut === 'all' || a.statut === filterStatut
      return matchesSearch && matchesType && matchesStatut
    })

    filtered.sort((a: any, b: any) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''
      
      if (sortField === 'valeur') {
        valA = parseFloat(valA) || 0
        valB = parseFloat(valB) || 0
      }
      
      if (sortField === 'date_expiration' || sortField === 'date_creation') {
        valA = new Date(valA).getTime() || 0
        valB = new Date(valB).getTime() || 0
      }
      
      if (typeof valA === 'string') {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [avantagesData, employes, searchTerm, filterType, filterStatut, getEmployeName, sortField, sortDirection])

  // Statistiques filtrées par entreprise
  const stats = useMemo(() => {
    if (statsData && statsData.total > 0) {
      // Si les stats viennent de l'API, on les utilise
      return statsData
    }
    
    // Sinon on calcule à partir des données filtrées
    const actifs = filteredAndSortedAvantages.filter((a: any) => a.statut?.toLowerCase() === 'actif').length
    const expires = filteredAndSortedAvantages.filter((a: any) => a.statut?.toLowerCase() === 'expiré').length
    const valeurTotale = filteredAndSortedAvantages.reduce((sum: number, a: any) => sum + parseFloat(a.valeur || '0'), 0)
    return {
      total: filteredAndSortedAvantages.length,
      actifs,
      expires,
      valeurTotale
    }
  }, [filteredAndSortedAvantages, statsData])

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'Sante': faHeart,
      'Alimentation': faUtensils,
      'Transport': faBus,
      'Formation': faGraduationCap,
    }
    return icons[type] || faGift
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Sante': 'from-rose-500 to-pink-500',
      'Alimentation': 'from-emerald-500 to-teal-500',
      'Transport': 'from-blue-500 to-cyan-500',
      'Formation': 'from-purple-500 to-violet-500',
    }
    return colors[type] || 'from-primary-500 to-primary-600'
  }

  const getTypeBg = (type: string) => {
    const colors: { [key: string]: string } = {
      'Sante': 'bg-rose-100 dark:bg-rose-950/30',
      'Alimentation': 'bg-emerald-100 dark:bg-emerald-950/30',
      'Transport': 'bg-blue-100 dark:bg-blue-950/30',
      'Formation': 'bg-purple-100 dark:bg-purple-950/30',
    }
    return colors[type] || 'bg-primary-100 dark:bg-primary-950/30'
  }

  const getStatutColor = (statut: string) => {
    const colors = {
      'Actif': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      'Inactif': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      'Expiré': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    }
    return colors[statut as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
  }

  const getStatutIcon = (statut: string) => {
    const icons = {
      'Actif': faCheckCircle,
      'Inactif': faTimesCircle,
      'Expiré': faClock,
    }
    return icons[statut as keyof typeof icons] || faCircleExclamation
  }

  const handleOpenAdd = useCallback(() => {
    setEditingAvantage(null)
    setFormData({
      matricule: '',
      libelle: '',
      description: '',
      type_avantage: 'Sante',
      valeur: '',
      date_expiration: '',
      statut: 'Actif'
    })
    setErrorMsg('')
    setShowModal(true)
  }, [])

  const handleOpenEdit = useCallback((avantage: any) => {
    setEditingAvantage(avantage)
    setFormData({
      matricule: avantage.matricule || '',
      libelle: avantage.libelle || '',
      description: avantage.description || '',
      type_avantage: avantage.type_avantage || 'Sante',
      valeur: avantage.valeur || '',
      date_expiration: avantage.date_expiration ? avantage.date_expiration.split('T')[0] : '',
      statut: avantage.statut || 'Actif'
    })
    setErrorMsg('')
    setShowModal(true)
  }, [])

  const handleOpenDetail = useCallback((avantage: any) => {
    setSelectedAvantage(avantage)
    setShowDetailModal(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const avantageId = editingAvantage?.id_avantage || editingAvantage?.id
      if (avantageId) {
        await avantageAPI.update(avantageId, formData)
        setSuccessMsg('Avantage mis à jour avec succès !')
      } else {
        await avantageAPI.create(formData)
        setSuccessMsg('Avantage créé avec succès !')
      }
      
      setShowModal(false)
      setShowSuccessModal(true)
      await loadData()
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue lors de l'enregistrement.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avantage ?")) return

    try {
      await avantageAPI.delete(Number(id))
      setSuccessMsg('Avantage supprimé avec succès !')
      setShowSuccessModal(true)
      await loadData()
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression.")
    }
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
    setSuccessMsg('')
    setSelectedAvantage(null)
  }

  // Composant carte de statistique
  const StatCard = ({ label, value, icon, color, bg, delay = 0 }: any) => (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { type: "spring", stiffness: 300 }
      }}
      className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-slate-200/80 dark:border-slate-700/85 group relative overflow-hidden"
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{
          x: ['-100%', '100%'],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }
        }}
      />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <motion.p 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.1, type: "spring", stiffness: 200 }}
            className="text-2xl font-bold text-slate-900 dark:text-white mt-1"
          >
            {value}
          </motion.p>
          <motion.div 
            className="mt-2 h-1 w-12 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
          >
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: delay + 0.2, duration: 1, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${color} rounded-full`}
            />
          </motion.div>
        </div>
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all`}
        >
          <FontAwesomeIcon icon={icon} className={`w-6 h-6 bg-gradient-to-r ${color} bg-clip-text text-transparent`} />
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen pb-12"
    >
      {/* Modal de succès */}
      <AnimatePresence>
        {showSuccessModal && successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed right-5 top-5 z-[70] max-w-sm rounded-2xl border border-white/40 bg-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-950 shadow-xl shadow-emerald-950/20 backdrop-blur-xl dark:border-emerald-300/20 dark:bg-emerald-400/15 dark:text-emerald-100"
            onClick={closeSuccessModal}
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5 shrink-0" />
              {successMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/80 dark:bg-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            variants={floatAnimation}
            animate="animate"
            className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-2xl shadow-amber-500/30"
          >
            <FontAwesomeIcon icon={faGift} className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-amber-600 to-slate-800 dark:from-white dark:via-amber-400 dark:to-white bg-clip-text text-transparent bg-300 animate-gradient">
              Gestion des Avantages
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-300">
                <FontAwesomeIcon icon={faGift} className="text-xs" />
                {stats.total} avantages
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-300">
                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                {stats.actifs} actifs
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-300">
                <FontAwesomeIcon icon={faDollarSign} className="text-xs" />
                ${Number(stats.valeurTotale || 0).toLocaleString()} valeur totale
              </span>
              {entrepriseActuelle && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-slate-600 dark:text-slate-400">
                    <FontAwesomeIcon icon={faUsers} className="text-xs" />
                    {entrepriseActuelle.nom}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            title="Rafraîchir"
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faSync} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30 transition-all"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvel avantage</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Statistiques */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard 
          label="Total Avantages" 
          value={stats.total} 
          icon={faGift}
          color="from-primary-500 to-purple-600"
          bg="bg-primary-50 dark:bg-primary-950/50"
          delay={0.05}
        />
        <StatCard 
          label="Avantages Actifs" 
          value={stats.actifs} 
          icon={faCheckCircle}
          color="from-emerald-500 to-teal-600"
          bg="bg-emerald-50 dark:bg-emerald-950/50"
          delay={0.1}
        />
        <StatCard 
          label="Expirés / Inactifs" 
          value={stats.expires || 0} 
          icon={faClock}
          color="from-rose-500 to-red-600"
          bg="bg-rose-50 dark:bg-rose-950/50"
          delay={0.15}
        />
        <StatCard 
          label="Valeur Totale" 
          value={`$${Number(stats.valeurTotale || 0).toLocaleString()}`} 
          icon={faWallet}
          color="from-amber-500 to-orange-600"
          bg="bg-amber-50 dark:bg-amber-950/50"
          delay={0.2}
        />
      </motion.div>

      {/* Filtres et recherche */}
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <motion.div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
            </motion.div>
            <input 
              type="text" 
              placeholder="Rechercher par employé ou avantage..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm dark:text-white placeholder:text-slate-400" 
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)} 
                className="pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm dark:text-white appearance-none"
              >
                <option value="all">Tous les types</option>
                <option value="Sante">Santé</option>
                <option value="Alimentation">Alimentation</option>
                <option value="Transport">Transport</option>
                <option value="Formation">Formation</option>
              </select>
              <FontAwesomeIcon icon={faSortDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
            </div>
            <div className="relative">
              <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                value={filterStatut} 
                onChange={(e) => setFilterStatut(e.target.value)} 
                className="pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm dark:text-white appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="Expiré">Expiré</option>
              </select>
              <FontAwesomeIcon icon={faSortDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des avantages */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="rounded-full h-16 w-16 border-4 border-primary-200 dark:border-primary-900/30 border-t-primary-600 dark:border-t-primary-400"></div>
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-300 dark:border-t-primary-200"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
      ) : filteredAndSortedAvantages.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-12 text-center border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm"
        >
          <FontAwesomeIcon icon={faGift} className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Aucun avantage trouvé pour votre entreprise</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30 transition-all"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            Créer un avantage
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedAvantages.map((avantage: any) => {
              const isActif = avantage.statut?.toLowerCase() === 'actif'
              const avantageId = avantage.id_avantage || avantage.id
              const TypeIcon = getTypeIcon(avantage.type_avantage)
              const typeColor = getTypeColor(avantage.type_avantage)
              const typeBg = getTypeBg(avantage.type_avantage)
              const StatutIcon = getStatutIcon(avantage.statut)
              const statutColor = getStatutColor(avantage.statut)
              const emp = getEmployeDetails(avantage.matricule)
              const initial = emp?.prenom?.[0] || '?'

              return (
                <motion.div
                  key={avantageId}
                  variants={fadeInUp}
                  layout
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 group relative overflow-hidden"
                >
                  {/* Effet de brillance */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0"
                    animate={{
                      x: ['-100%', '100%'],
                      transition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }
                    }}
                  />

                  {/* Badge nouveau */}
                  {new Date(avantage.date_creation).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg z-10"
                    >
                      <FontAwesomeIcon icon={faFire} className="mr-1" />
                      NOUVEAU
                    </motion.div>
                  )}

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${typeColor} shadow-lg`}
                      >
                        <FontAwesomeIcon icon={TypeIcon} className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{avantage.libelle}</p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${typeBg}`}>
                            {avantage.type_avantage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                          {getEmployeName(avantage.matricule)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 ${statutColor}`}>
                      <FontAwesomeIcon icon={StatutIcon} className="w-3 h-3" />
                      {avantage.statut || 'Inconnu'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Valeur</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">${avantage.valeur}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Expiration</span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {avantage.date_expiration ? new Date(avantage.date_expiration).toLocaleDateString() : 'Indéterminée'}
                      </span>
                    </div>
                    {avantage.description && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 line-clamp-2"
                      >
                        {avantage.description}
                      </motion.p>
                    )}
                  </div>

                  {/* Indicateur de valeur */}
                  <motion.div 
                    className="mt-2 h-0.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((parseFloat(avantage.valeur) / 1000) * 100, 100)}%` }}
                      transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                    />
                  </motion.div>

                  <div className="flex space-x-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/50 relative z-10">
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenDetail(avantage)}
                      className="flex-1 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-sm hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                      <span>Voir</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenEdit(avantage)}
                      className="flex-1 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                      <span>Modifier</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(avantageId)}
                      className="px-3 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* MODAL DE DÉTAILS */}
      <AnimatePresence>
        {showDetailModal && selectedAvantage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30"
                  >
                    <FontAwesomeIcon icon={faGift} className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      Détails de l'avantage
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedAvantage.libelle}</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetailModal(false)} 
                  className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <FontAwesomeIcon icon={faX} className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring" }}
                    className={`w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${getTypeColor(selectedAvantage.type_avantage)} shadow-lg`}
                  >
                    <FontAwesomeIcon icon={getTypeIcon(selectedAvantage.type_avantage)} className="text-white text-2xl" />
                  </motion.div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Libellé</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{selectedAvantage.libelle}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBg(selectedAvantage.type_avantage)}`}>
                      {selectedAvantage.type_avantage}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                      Bénéficiaire
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-white">{getEmployeName(selectedAvantage.matricule)}</p>
                    <p className="text-xs text-slate-400 font-mono">{selectedAvantage.matricule}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3" />
                      Valeur
                    </p>
                    <p className="font-bold text-amber-600 dark:text-amber-400 text-lg">${selectedAvantage.valeur}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                      Date d'expiration
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {selectedAvantage.date_expiration ? new Date(selectedAvantage.date_expiration).toLocaleDateString() : 'Indéterminée'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                      Statut
                    </p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatutColor(selectedAvantage.statut)}`}>
                      <FontAwesomeIcon icon={getStatutIcon(selectedAvantage.statut)} className="w-3 h-3" />
                      {selectedAvantage.statut || 'Inconnu'}
                    </span>
                  </div>
                </div>

                {selectedAvantage.description && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={faGift} className="w-3 h-3" />
                      Description
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedAvantage.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL AJOUT / MODIFICATION */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4"
            onClick={() => {
              if (!submitting) setShowModal(false)
            }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-primary-500/10 to-amber-500/10">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30"
                  >
                    <FontAwesomeIcon icon={faGift} className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      {editingAvantage ? "Modifier l'avantage" : "Attribuer un avantage"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {editingAvantage ? "Mettez à jour les informations" : "Remplissez les informations de l'avantage"}
                    </p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!submitting) setShowModal(false)
                  }} 
                  className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <FontAwesomeIcon icon={faX} className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-xl text-sm border border-rose-200 dark:border-rose-900 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCircleExclamation} className="w-4 h-4" />
                    {errorMsg}
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                    Employé bénéficiaire *
                  </label>
                  <select 
                    required 
                    value={formData.matricule} 
                    onChange={(e) => setFormData({...formData, matricule: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  >
                    <option value="">Sélectionner un employé...</option>
                    {employes.map((emp: any) => (
                      <option key={emp.matricule} value={emp.matricule}>
                        {emp.prenom} {emp.nom} ({emp.matricule})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faGift} className="w-3 h-3" />
                    Libellé *
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.libelle} 
                    onChange={(e) => setFormData({...formData, libelle: e.target.value})} 
                    placeholder="Ex: Mutuelle santé, Chèques-repas..." 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faGift} className="w-3 h-3" />
                      Type *
                    </label>
                    <select 
                      value={formData.type_avantage} 
                      onChange={(e) => setFormData({...formData, type_avantage: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    >
                      <option value="Sante">Santé</option>
                      <option value="Alimentation">Alimentation</option>
                      <option value="Transport">Transport</option>
                      <option value="Formation">Formation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3" />
                      Valeur ($) *
                    </label>
                    <input 
                      type="number" 
                      required 
                      value={formData.valeur} 
                      onChange={(e) => setFormData({...formData, valeur: e.target.value})} 
                      placeholder="150" 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                      Date d'expiration
                    </label>
                    <input 
                      type="date" 
                      value={formData.date_expiration} 
                      onChange={(e) => setFormData({...formData, date_expiration: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                      Statut
                    </label>
                    <select 
                      value={formData.statut} 
                      onChange={(e) => setFormData({...formData, statut: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    >
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                      <option value="Expiré">Expiré</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faGift} className="w-3 h-3" />
                    Description
                  </label>
                  <textarea 
                    rows={2} 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="Détails de l'avantage..." 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button" 
                    onClick={() => {
                      if (!submitting) setShowModal(false)
                    }} 
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={submitting} 
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={editingAvantage ? faEdit : faPlus} className="w-4 h-4" />
                        {editingAvantage ? "Mettre à jour" : "Créer l'avantage"}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles CSS */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bg-300 { background-size: 300% 300%; }
        .animate-gradient { animation: gradient 6s ease infinite; }
      `}</style>
    </motion.div>
  )
}