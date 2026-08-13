import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser, faBell, faShield, faPalette, faSave,
  faCheckCircle, faLock, faEnvelope, faPhone,
  faMapMarkerAlt, faUserCircle, faCamera,
  faMoon, faSun, faDesktop, faEye, faEyeSlash,
  faSpinner, faKey, faShieldAlt, faMobileAlt, faGlobe
} from '@fortawesome/free-solid-svg-icons'
import { loadDashboardContext } from '../../services/dashboardData'
import { apiRequest } from '../../services/api'

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

export const EmployeParametresPage = () => {
  const [activeTab, setActiveTab] = useState<'profil' | 'notifications' | 'security' | 'appearance'>('profil')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await loadDashboardContext()
      setDashboardData(data)
      const user = data?.user || {}
      setFormData(prev => ({
        ...prev,
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
      }))
    } catch (error) {
      setError('Impossible de charger vos données.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const user = dashboardData?.user || { 
    prenom: 'Utilisateur', 
    nom: 'Employé', 
    email: 'employe@demo.com', 
    telephone: '+243 944 567 890', 
    adresse: 'Kinshasa' 
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      setError('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSaved(true)
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      setError('Erreur lors du changement de mot de passe.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profil', label: 'Mon Profil', icon: faUser, color: '#3B82F6' },
    { id: 'notifications', label: 'Notifications', icon: faBell, color: '#10B981' },
    { id: 'security', label: 'Sécurité', icon: faShield, color: '#8B5CF6' },
    { id: 'appearance', label: 'Apparence', icon: faPalette, color: '#F59E0B' },
  ]

  const notificationsSettings = [
    { title: 'Nouvelles fiches de paie', desc: 'Notification quand une nouvelle paie est disponible', default: true },
    { title: 'Statut de mes congés', desc: 'Mise à jour sur mes demandes de congé', default: true },
    { title: 'Rappels de congés', desc: 'Rappel avant expiration de mes congés', default: true },
    { title: 'Messages du service RH', desc: 'Nouveaux messages reçus', default: true },
    { title: 'Rapports mensuels', desc: 'Résumé mensuel de mon activité', default: false },
  ]

  const themeOptions = [
    { id: 'light', label: 'Clair', icon: faSun, color: 'bg-slate-100 dark:bg-slate-700' },
    { id: 'dark', label: 'Sombre', icon: faMoon, color: 'bg-slate-800' },
    { id: 'auto', label: 'Auto', icon: faDesktop, color: 'bg-gradient-to-br from-slate-100 to-slate-800' },
  ]

  const colorOptions = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899']

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-[#10B981] animate-spin mb-3" />
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Chargement...</p>
      </div>
    )
  }

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
              <FontAwesomeIcon icon={faUserCircle} className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] dark:text-white">Mes Paramètres</h1>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                Personnalisation de votre espace
              </p>
            </div>
          </div>
          <AnimatePresence>
            {saved && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-700 dark:text-emerald-300 text-sm">Sauvegarde réussie</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {error && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800">
            <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 text-rose-600 mt-0.5" />
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div 
        variants={slideUp}
        initial="initial"
        animate="animate"
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-[#E2E8F0] dark:border-[#334155] overflow-hidden"
      >
        <div className="border-b border-[#E2E8F0] dark:border-[#334155] overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as typeof activeTab)} 
                className={`flex items-center gap-2 px-5 py-4 font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'text-[#10B981] border-b-2 border-[#10B981] bg-[#10B981]/5' 
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#10B981] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" style={{ color: activeTab === tab.id ? tab.color : undefined }} />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {/* Profil */}
          {activeTab === 'profil' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center shadow-lg shadow-[#10B981]/25">
                    <span className="text-3xl font-bold text-white">{user.prenom?.[0] || 'U'}</span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center shadow-lg shadow-[#10B981]/25 transition-all">
                    <FontAwesomeIcon icon={faCamera} className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">
                    {user.prenom} {user.nom}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{user.email}</p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
                    Matricule: {user.matricule || 'N/A'}
                  </p>
                  <button className="mt-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium shadow-lg shadow-[#10B981]/25 transition-all">
                    Changer la photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Prénom', value: formData.prenom, icon: faUser, field: 'prenom' },
                  { label: 'Nom', value: formData.nom, icon: faUser, field: 'nom' },
                  { label: 'Email', value: formData.email, icon: faEnvelope, field: 'email' },
                  { label: 'Téléphone', value: formData.telephone, icon: faPhone, field: 'telephone' },
                ].map((item, index) => (
                  <div key={index} className="md:col-span-1">
                    <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={item.icon} className="w-3 h-3" />
                      {item.label}
                    </label>
                    <input 
                      type="text" 
                      value={item.value} 
                      onChange={(e) => setFormData(prev => ({ ...prev, [item.field]: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                    Adresse
                  </label>
                  <input 
                    type="text" 
                    value={formData.adresse} 
                    onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {notificationsSettings.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] hover:border-[#10B981] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#0F172A] dark:text-white text-sm">{item.title}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{item.desc}</p>
                  </div>
                  <div className="relative flex-shrink-0 ml-4">
                    <input 
                      type="checkbox" 
                      defaultChecked={item.default} 
                      className="w-5 h-5 rounded border-[#E2E8F0] dark:border-[#334155] text-[#10B981] focus:ring-2 focus:ring-[#10B981] focus:ring-offset-0 transition-all cursor-pointer" 
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Sécurité */}
          {activeTab === 'security' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="p-5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faKey} className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <h4 className="font-semibold text-[#0F172A] dark:text-white">Changer le mot de passe</h4>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Mot de passe actuel" 
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-4 h-4" />
                    </button>
                  </div>
                  <input 
                    type="password" 
                    placeholder="Nouveau mot de passe" 
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
                  />
                  <input 
                    type="password" 
                    placeholder="Confirmer le nouveau mot de passe" 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white"
                  />
                  <button 
                    onClick={handlePasswordChange}
                    disabled={saving}
                    className="px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg text-sm font-medium shadow-lg shadow-[#8B5CF6]/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                    ) : (
                      <FontAwesomeIcon icon={faLock} className="w-4 h-4" />
                    )}
                    Changer le mot de passe
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 dark:bg-[#10B981]/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0F172A] dark:text-white text-sm">Authentification 2FA</p>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Sécurité additionnelle</p>
                  </div>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded border-[#E2E8F0] dark:border-[#334155] text-[#10B981] focus:ring-2 focus:ring-[#10B981] focus:ring-offset-0 transition-all cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 flex items-center justify-center">
                    <FontAwesomeIcon icon={faMobileAlt} className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0F172A] dark:text-white text-sm">Sessions actives</p>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">2 appareils connectés</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-medium hover:bg-rose-200 dark:hover:bg-rose-950/50 transition-colors">
                  Déconnecter tout
                </button>
              </div>
            </motion.div>
          )}

          {/* Apparence */}
          {activeTab === 'appearance' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-3">
                  Thème
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((theme) => (
                    <button 
                      key={theme.id} 
                      className={`p-4 ${theme.color} rounded-xl border-2 ${theme.id === 'light' ? 'border-[#10B981]' : 'border-slate-600 dark:border-slate-600'} text-center transition-all hover:scale-105`}
                    >
                      <FontAwesomeIcon icon={theme.icon} className={`w-6 h-6 mx-auto mb-2 ${theme.id === 'light' ? 'text-[#0F172A]' : theme.id === 'dark' ? 'text-white' : 'text-[#64748B]'}`} />
                      <p className={`text-sm font-medium ${theme.id === 'light' ? 'text-[#0F172A]' : theme.id === 'dark' ? 'text-white' : 'text-[#64748B]'}`}>
                        {theme.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-3">
                  Couleur principale
                </label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map(color => (
                    <button 
                      key={color} 
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-[#334155] shadow-lg hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-3">
                  Taille de police
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Petite', 'Normale', 'Grande'].map((size, i) => (
                    <button 
                      key={size} 
                      className={`py-3 rounded-xl border-2 ${
                        i === 1 
                          ? 'border-[#10B981] bg-[#10B981]/5 dark:bg-[#10B981]/10' 
                          : 'border-[#E2E8F0] dark:border-[#334155] hover:border-[#10B981]'
                      } text-sm font-medium transition-all`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] dark:text-[#94A3B8] mb-3">
                  Langue
                </label>
                <select className="w-full px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm text-[#0F172A] dark:text-white">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-5 border-t border-[#E2E8F0] dark:border-[#334155] flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-medium shadow-lg shadow-[#10B981]/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            {saving ? (
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
            )}
            Sauvegarder
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}