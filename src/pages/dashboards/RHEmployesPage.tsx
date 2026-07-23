import { useEffect, useState, useMemo, useCallback } from 'react'
import { Users, Search, Mail, Phone, MapPin, Calendar, Briefcase, Eye, Download, UserPlus, Grid, List, Edit, Trash2, X, Copy, Check, CheckCircle2, AlertTriangle, Link as LinkIcon } from 'lucide-react'
import { loadDashboardRHContext } from '../../services/dashboardRHData'
import { apiRequest } from '../../services/api'

type CredentialsModalState = {
  status: 'success' | 'warning'
  email: string
  password: string
  matricule: string
  nomComplet: string
  message?: string
}

export const RHEmployesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // État pour afficher les identifiants générés après création
  const [newCredentials, setNewCredentials] = useState<CredentialsModalState | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Formulaire d'ajout
  const [formData, setFormData] = useState({
    nom: '',
    post_nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sexe: 'M',
    salaire_base: '',
    id_poste: '',
    company_id: '',
    adresse: '',
    date_naissance: '',
    lieu_naissance: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = useCallback(() => {
    setLoading(true)
    loadDashboardRHContext()
      .then((data) => {
        setDashboardData(data)
        if (data?.entreprise?.id_entreprise) {
          setFormData(prev => ({ ...prev, company_id: data.entreprise.id_entreprise }))
        }
      })
      .catch(() => setDashboardData(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const rawEmployes = useMemo(() => dashboardData?.employes || [], [dashboardData])
  const postes = useMemo(() => dashboardData?.postes || [], [dashboardData])
  const services = useMemo(() => dashboardData?.services || [], [dashboardData])
  const contrats = useMemo(() => dashboardData?.contrats || [], [dashboardData])

  const employes = useMemo(() => {
    if (!rawEmployes.length) return []
    return rawEmployes.filter((emp: any) => {
      const roleName = emp.role_name || emp.role?.name || emp.user?.role_name || emp.user?.role?.name || 'employe'
      return roleName.toLowerCase() === 'employe'
    })
  }, [rawEmployes])

  const filteredMembers = useMemo(() => {
    return employes.filter((emp: any) => {
      const matchesSearch = 
        (emp.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (emp.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (emp.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (emp.matricule?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      const matchesStatut = filterStatut === 'all' || emp.statut === filterStatut
      return matchesSearch && matchesStatut
    })
  }, [employes, searchTerm, filterStatut])

  const getPosteTitle = useCallback((idPoste: number) => {
    const poste = postes.find((p: any) => Number(p.id_poste) === Number(idPoste))
    return poste?.titre_poste || 'N/A'
  }, [postes])

  const getServiceName = useCallback((idPoste: number) => {
    const poste = postes.find((p: any) => Number(p.id_poste) === Number(idPoste))
    if (!poste) return 'N/A'
    const service = services.find((s: any) => Number(s.id_service) === Number(poste.id_service))
    return service?.nom || 'N/A'
  }, [postes, services])

  const getContratInfo = useCallback((matricule: string) => {
    return contrats.find((c: any) => c.matricule === matricule)
  }, [contrats])

  const getResponseValue = (source: any, keys: string[]) => {
    for (const key of keys) {
      if (source && source[key]) return source[key]
      if (source?.data && source.data[key]) return source.data[key]
      if (source?.employe && source.employe[key]) return source.employe[key]
      if (source?.membre && source.membre[key]) return source.membre[key]
    }
    return undefined
  }

  const inferEmailSent = (source: any): boolean | undefined => {
    const explicit = getResponseValue(source, ['email_sent', 'mail_sent', 'emailSent', 'mailSent'])
    if (typeof explicit === 'boolean') return explicit

    const emailStatus = String(getResponseValue(source, ['email_status', 'mail_status', 'status_email']) || '').toLowerCase()
    if (emailStatus) {
      if (['sent', 'envoye', 'envoyé', 'ok', 'success', 'succeeded'].some((flag) => emailStatus.includes(flag))) return true
      if (['failed', 'error', 'erreur', 'echec', 'échec', 'not_sent', 'non_envoye', 'non envoyé'].some((flag) => emailStatus.includes(flag))) return false
    }

    const message = String(source?.message || source?.data?.message || '').toLowerCase()
    if (/email|mail/.test(message) && /non envoye|non envoyé|echec|échec|failed|impossible|n'a pas pu/.test(message)) return false
    if (/email|mail/.test(message) && /envoye|envoyé|sent/.test(message)) return true

    return undefined
  }

  const buildCredentialsFromSource = (source: any, status: 'success' | 'warning'): CredentialsModalState => {
    const currentYear = new Date().getFullYear()
    const fallbackPassword = formData.nom
      ? `${formData.nom.charAt(0).toUpperCase()}${formData.nom.slice(1).toLowerCase()}@${currentYear}`
      : 'Non communiqué'

    return {
      status,
      email: String(getResponseValue(source, ['email']) || formData.email || '-'),
      password: String(getResponseValue(source, ['password', 'temp_password', 'temporary_password']) || fallbackPassword),
      matricule: String(getResponseValue(source, ['matricule']) || `EMP-${currentYear}-XXXXX`),
      nomComplet: `${String(getResponseValue(source, ['prenom']) || formData.prenom || '').trim()} ${String(getResponseValue(source, ['nom']) || formData.nom || '').trim()}`.trim(),
      message: String(source?.message || source?.data?.message || ''),
    }
  }

  const detectPartialCreationError = (error: any) => {
    const payload = error?.payload || error?.response?.data || {}
    const message = String(payload?.message || error?.message || '').toLowerCase()
    const hasCredentials = Boolean(
      getResponseValue(payload, ['email']) ||
      getResponseValue(payload, ['matricule']) ||
      getResponseValue(payload, ['password', 'temp_password', 'temporary_password'])
    )
    const emailFailure = /email|mail/.test(message) && /non envoye|non envoyé|echec|échec|failed|impossible|n'a pas pu/.test(message)
    const likelyCreated = hasCredentials || Boolean(payload?.employe || payload?.membre || getResponseValue(payload, ['matricule']))
    return emailFailure && likelyCreated ? payload : null
  }

  const handleAddEmploye = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    try {
      const response: any = await apiRequest('rh/employes', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      
      setShowAddModal(false)
      const emailSent = inferEmailSent(response)
      const status: 'success' | 'warning' = emailSent === false ? 'warning' : 'success'
      setNewCredentials(buildCredentialsFromSource(response, status))

      setFormData({
        nom: '',
        post_nom: '',
        prenom: '',
        email: '',
        telephone: '',
        sexe: 'M',
        salaire_base: '',
        id_poste: '',
        company_id: dashboardData?.entreprise?.id_entreprise || '',
        adresse: '',
        date_naissance: '',
        lieu_naissance: ''
      })
      loadData()
      setErrorMsg(emailSent === false
        ? 'Employé créé, mais l\'email n\'a pas pu être envoyé. Copiez les identifiants manuellement.'
        : `Employé créé. Les identifiants ont été envoyés à ${formData.email}.`)
    } catch (err: any) {
      const partialPayload = detectPartialCreationError(err)
      if (partialPayload) {
        setShowAddModal(false)
        setNewCredentials(buildCredentialsFromSource(partialPayload, 'warning'))
        setErrorMsg('Employé créé, mais l\'email n\'a pas pu être envoyé. Copiez les identifiants manuellement.')
        loadData()
      } else {
        setErrorMsg(err?.payload?.message || err?.response?.data?.message || err?.message || "Erreur lors de l'enregistrement de l'employé.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = async (text: string, fieldKey: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldKey)
      setTimeout(() => setCopiedField(null), 1800)
    } catch {
      setErrorMsg('Impossible de copier dans le presse-papiers.')
    }
  }

  const buildCredentialsSummary = (credentials: CredentialsModalState) => {
    return [
      `Nom: ${credentials.nomComplet}`,
      `Email: ${credentials.email}`,
      `Matricule: ${credentials.matricule}`,
      `Mot de passe temporaire: ${credentials.password}`,
    ].join('\n')
  }

  const statsCards = useMemo(() => [
    { label: 'Total Employés', value: employes.length, color: 'from-primary-500 to-purple-600', icon: Users },
    { label: 'Hommes', value: employes.filter((e: any) => e.sexe === 'M').length, color: 'from-blue-500 to-blue-600', icon: Users },
    { label: 'Femmes', value: employes.filter((e: any) => e.sexe === 'F').length, color: 'from-pink-500 to-pink-600', icon: Users },
    { label: 'Actifs', value: employes.filter((e: any) => e.statut === 'Actif').length, color: 'from-green-500 to-emerald-600', icon: Users },
  ], [employes])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Employés</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{employes.length} employés enregistrés (rôle employé)</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter un employé</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statsCards.map((stat, i) => (
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
            <input type="text" placeholder="Rechercher par nom, email ou matricule..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm text-slate-800 dark:text-white" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm text-slate-800 dark:text-white">
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="En conge">En congé</option>
          </select>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><Grid className="w-4 h-4 text-slate-700 dark:text-slate-200" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><List className="w-4 h-4 text-slate-700 dark:text-slate-200" /></button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMembers.map(emp => {
            const contrat = getContratInfo(emp.matricule)
            return (
              <div key={emp.matricule} onClick={() => setSelectedMember(emp)} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                    <span className="text-white font-bold text-lg">{emp.prenom?.[0] || 'E'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white truncate">{emp.prenom} {emp.nom}</p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{getPosteTitle(emp.id_poste)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{getServiceName(emp.id_poste)}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Mail className="w-4 h-4 flex-shrink-0" /><span className="truncate">{emp.email}</span></div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Phone className="w-4 h-4 flex-shrink-0" /><span>{emp.telephone || 'N/A'}</span></div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Briefcase className="w-4 h-4 flex-shrink-0" /><span>{contrat?.type || 'N/A'} - ${contrat?.salaire_base || emp.salaire_base || 0}</span></div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{emp.statut || 'Actif'}</span>
                  <div className="flex space-x-1">
                    <button className="p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Employé</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Matricule</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Poste</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Service</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden xl:table-cell">Salaire</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(emp => {
                const contrat = getContratInfo(emp.matricule)
                return (
                  <tr key={emp.matricule} onClick={() => setSelectedMember(emp)} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'}`}>
                          <span className={`font-bold text-sm ${emp.sexe === 'M' ? 'text-blue-600' : 'text-pink-600'}`}>{emp.prenom?.[0] || 'E'}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm">{emp.prenom} {emp.nom}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{getPosteTitle(emp.id_poste)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell font-mono">{emp.matricule}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{getPosteTitle(emp.id_poste)}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{getServiceName(emp.id_poste)}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-white hidden xl:table-cell">${contrat?.salaire_base || emp.salaire_base || 0}</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{emp.statut || 'Actif'}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-1">
                        <button className="p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL IDENTIFIANTS + STATUT EMAIL */}
      {newCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 backdrop-blur-md p-4">
          <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 space-y-5 border ${newCredentials.status === 'warning' ? 'border-amber-300 dark:border-amber-700/50' : 'border-emerald-200 dark:border-emerald-800/50'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${newCredentials.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'}`}>
                {newCredentials.status === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Identifiants du nouvel employé</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {newCredentials.status === 'warning'
                    ? 'Le compte est créé, mais l\'envoi de l\'email a échoué. Partagez les accès manuellement.'
                    : `Compte créé avec succès. Les identifiants ont été envoyés à ${newCredentials.email}.`}
                </p>
              </div>
              <button onClick={() => setNewCredentials(null)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">Fermer</button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-3 text-sm border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 block">Employé</span>
                <span className="font-semibold text-slate-900 dark:text-white">{newCredentials.nomComplet} ({newCredentials.matricule})</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 block">Email (identifiant)</span>
                  <span className="font-mono text-sm text-slate-900 dark:text-slate-100 break-all">{newCredentials.email}</span>
                </div>
                <button onClick={() => copyToClipboard(newCredentials.email, 'email')} className="p-2 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 text-xs flex items-center space-x-1">
                  {copiedField === 'email' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-700 dark:text-slate-200" />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 block">Mot de passe temporaire</span>
                  <span className="font-mono text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 break-all">{newCredentials.password}</span>
                </div>
                <button onClick={() => copyToClipboard(newCredentials.password, 'password')} className="p-2 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 text-xs flex items-center space-x-1">
                  {copiedField === 'password' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-700 dark:text-slate-200" />}
                </button>
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${newCredentials.status === 'warning' ? 'bg-amber-50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/40' : 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/40'}`}>
              <p className={`text-xs leading-relaxed ${newCredentials.status === 'warning' ? 'text-amber-800 dark:text-amber-200' : 'text-emerald-800 dark:text-emerald-200'}`}>
                {newCredentials.status === 'warning'
                  ? 'Alerte email: l\'utilisateur ne recevra pas automatiquement son lien de connexion. Transmettez les identifiants de manière sécurisée.'
                  : 'L\'utilisateur recevra son lien de connexion par email. Gardez cette copie en secours uniquement.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(buildCredentialsSummary(newCredentials), 'all')}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
              >
                {copiedField === 'all' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>Copier tous les identifiants</span>
              </button>
              <button
                type="button"
                onClick={() => setNewCredentials(null)}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 ${newCredentials.status === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Terminer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROFIL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Profil de l'employé</h3>
              <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${selectedMember.sexe === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                  <span className="text-3xl font-bold text-white">{selectedMember.prenom?.[0] || 'E'}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedMember.prenom} {selectedMember.nom}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{getPosteTitle(selectedMember.id_poste)}</p>
                  <p className="text-sm text-slate-500">{getServiceName(selectedMember.id_poste)}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">{selectedMember.statut || 'Actif'}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: selectedMember.email },
                  { icon: Phone, label: 'Téléphone', value: selectedMember.telephone },
                  { icon: MapPin, label: 'Adresse', value: selectedMember.adresse },
                  { icon: Calendar, label: "Date d'embauche", value: selectedMember.date_embauche },
                  { icon: Briefcase, label: 'Matricule', value: selectedMember.matricule },
                  { icon: Users, label: 'Sexe', value: selectedMember.sexe === 'M' ? 'Masculin' : 'Féminin' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm flex items-center space-x-2"><item.icon className="w-4 h-4 flex-shrink-0 text-slate-400" /><span className="truncate">{item.value || 'N/A'}</span></p>
                  </div>
                ))}
              </div>
              {getContratInfo(selectedMember.matricule) && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                  <h5 className="font-bold text-primary-800 dark:text-primary-200 mb-2">Informations du contrat</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-600 dark:text-slate-400">Type :</span> <span className="font-semibold text-slate-800 dark:text-white">{getContratInfo(selectedMember.matricule)?.type}</span></div>
                    <div><span className="text-slate-600 dark:text-slate-400">Salaire :</span> <span className="font-semibold text-slate-800 dark:text-white">${getContratInfo(selectedMember.matricule)?.salaire_base}</span></div>
                    <div><span className="text-slate-600 dark:text-slate-400">Début :</span> <span className="font-semibold text-slate-800 dark:text-white">{getContratInfo(selectedMember.matricule)?.date_debut}</span></div>
                    <div><span className="text-slate-600 dark:text-slate-400">Fin :</span> <span className="font-semibold text-slate-800 dark:text-white">{getContratInfo(selectedMember.matricule)?.date_fin || 'Indéterminée'}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ajouter un employé</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6 text-slate-500" /></button>
            </div>
            <form onSubmit={handleAddEmploye} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm">{errorMsg}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Prénom</label>
                  <input type="text" required value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} placeholder="Jean" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nom</label>
                  <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} placeholder="Dupont" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="jean.dupont@mail.com" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Téléphone</label>
                  <input type="text" required value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} placeholder="+243..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sexe</label>
                  <select value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white">
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Salaire de base</label>
                  <input type="number" required value={formData.salaire_base} onChange={(e) => setFormData({...formData, salaire_base: e.target.value})} placeholder="1000" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Poste de travail</label>
                  <select 
                    required 
                    value={formData.id_poste} 
                    onChange={(e) => setFormData(prev => ({ ...prev, id_poste: e.target.value }))} 
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white"
                  >
                    <option value="">Sélectionner un poste</option>
                    {postes.map((p: any) => {
                      const posteId = p.id_poste ?? p.id;
                      const posteTitre = p.titre_poste || p.nom || 'Poste sans nom';
                      return (
                        <option key={posteId} value={String(posteId)}>
                          {posteTitre}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold">Annuler</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}