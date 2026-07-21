import { useEffect, useMemo, useState } from 'react'
import { Users, Search, Mail, Phone, MapPin, Calendar, Briefcase, Eye, Download, UserPlus, Grid, List, Loader2 } from 'lucide-react'
import { loadDashboardContext } from '../../services/dashboardData'
import { membreAPI, posteAPI } from '../../services/api'
import { Toast } from '../../components/ui/Toast'

// Définition statique et figée des rôles applicatifs
const ROLES_OPTIONS = [
  { slug: 'employe', nom: 'Employé' },
  { slug: 'rh', nom: 'Ressources Humaines (RH)' },
] as const

export const DirecteurMembresPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  
  // État pour stocker temporairement les identifiants et le mot de passe renvoyé par l'API
  const [createdCredentials, setCreatedCredentials] = useState<any>(null)
  
  // Formulaire d'ajout direct de l'employé
  const [createForm, setCreateForm] = useState({
    prenom: '',
    nom: '',
    sexe: '', // 'M' ou 'F'
    email: '',
    telephone: '',
    poste_id: '',
    role_name: 'employe',
  })
  
  const [availablePostes, setAvailablePostes] = useState<any[]>([])

  // Charger les données initiales
  const loadData = async () => {
    try {
      const context = await loadDashboardContext()
      setDashboardData(context)
    } catch (error) {
      console.error('❌ Erreur chargement dashboard :', error)
    }

    try {
      const postesRes = await posteAPI.getAll()
      // Extraction sécurisée selon la structure de l'API (tableau direct ou objet contenant une clé postes/data)
      const postesList = Array.isArray(postesRes) ? postesRes : (postesRes?.postes || postesRes?.data || [])
      setAvailablePostes(postesList)
    } catch (error) {
      console.error('❌ Erreur chargement postes :', error)
      setAvailablePostes([])
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Récupération sécurisée de l'ID de l'entreprise connectée
  const companyId = useMemo(() => {
    if (!dashboardData) return null
    return (
      dashboardData.entreprise?.id_entreprise ||
      dashboardData.user?.id_entreprise ||
      dashboardData.user?.entreprise?.id_entreprise ||
      dashboardData.entreprises?.find((entreprise: any) => entreprise.user_id === dashboardData?.user?.id)?.id_entreprise ||
      dashboardData.entreprises?.find((entreprise: any) => entreprise.email === dashboardData?.user?.email)?.id_entreprise ||
      null
    )
  }, [dashboardData])

  // 1. Récupérer les services appartenant à cette entreprise
  const entrepriseServicesIds = useMemo(() => {
    const services = dashboardData?.services || []
    return services
      .filter((s: any) => !companyId || String(s.id_entreprise) === String(companyId))
      .map((s: any) => Number(s.id_service))
  }, [dashboardData, companyId])

  // 2. Filtrer les postes liés aux services de l'entreprise ou appartenant directement à l'entreprise
  const postes = useMemo(() => {
    const list = availablePostes.length > 0 ? availablePostes : (dashboardData?.postes || [])
    if (!list || list.length === 0) return []

    return list.filter((p: any) => {
      // Si le poste possède un id_service et qu'on a des services filtrés pour cette entreprise
      if (p.id_service && entrepriseServicesIds.length > 0) {
        return entrepriseServicesIds.includes(Number(p.id_service))
      }
      // Sinon filtrage direct par id_entreprise si présent sur le poste
      if (p.id_entreprise && companyId) {
        return String(p.id_entreprise) === String(companyId)
      }
      // Par défaut, si aucun filtre strict n'échoue, on autorise pour éviter une liste vide
      return true
    })
  }, [availablePostes, dashboardData, entrepriseServicesIds, companyId])

  const posteIdsSet = useMemo(() => new Set(postes.map((p: any) => Number(p.id_poste))), [postes])

  // 3. Liste brute des employés et filtrage strict via la chaîne Employe -> Poste -> Service -> Entreprise
  const rawEmployes = dashboardData?.employes || []

  const employes = useMemo(() => {
    if (!rawEmployes || rawEmployes.length === 0) return []
    return rawEmployes.filter((emp: any) => {
      if (!emp.id_poste) return false
      return posteIdsSet.has(Number(emp.id_poste))
    })
  }, [rawEmployes, posteIdsSet])

  const filteredMembers = useMemo(() => {
    return employes.filter((emp: any) => {
      const prenom = emp.prenom || ''
      const nom = emp.nom || ''
      const email = emp.email || ''
      
      const matchesSearch = prenom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesService = filterService === 'all' || String(emp.id_poste) === filterService
      return matchesSearch && matchesService
    })
  }, [employes, searchTerm, filterService])

  const getPosteTitle = (idPoste: number) => {
    const poste = postes.find((p: any) => Number(p.id_poste) === Number(idPoste))
    return poste?.titre_poste || 'N/A'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      prenom: createForm.prenom,
      nom: createForm.nom,
      email: createForm.email,
      telephone: createForm.telephone,
      sexe: createForm.sexe,
      poste_id: createForm.poste_id,
      role_name: createForm.role_name,
      company_id: companyId,
    }

    setIsSubmitting(true)
    try {
      const response = await membreAPI.create(payload)
      
      setShowCreateModal(false)
      
      // Reconstruction ou récupération sécurisée du mot de passe basé sur la logique backend (Nom + @ + Année)
      const anneeCourante = new Date().getFullYear()
      const fallbackPassword = createForm.nom ? (createForm.nom.charAt(0).toUpperCase() + createForm.nom.slice(1).toLowerCase() + '@' + anneeCourante) : 'N/A'
      
      const generatedPassword = response?.password || response?.temp_password || fallbackPassword
      const matricule = response?.matricule || response?.employe?.matricule || 'EMP-' + anneeCourante + '-XXXXX'

      // Stocke les identifiants pour affichage bloquant dans la modale
      setCreatedCredentials({
        prenom: createForm.prenom,
        nom: createForm.nom,
        email: createForm.email,
        password: generatedPassword,
        matricule: matricule,
      })

      setCreateForm({
        prenom: '',
        nom: '',
        sexe: '',
        email: '',
        telephone: '',
        poste_id: '',
        role_name: 'employe',
      })
      
      loadData() // Recharger les données pour mettre à jour la liste
    } catch (err: any) {
      console.error(err)
      setToast({ type: 'error', message: err?.response?.data?.message || 'Erreur lors de la création de l\'employé.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Membres de l'entreprise</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{employes.length} membres actifs</p>
        </div>
        <div className="flex items-center space-x-2">
          <button type="button" className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button type="button" onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter un employé</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total', value: employes.length, color: 'from-amber-500 to-orange-600', icon: Users },
          { label: 'Hommes', value: employes.filter((e: any) => e.sexe === 'M').length, color: 'from-blue-500 to-blue-600', icon: Users },
          { label: 'Femmes', value: employes.filter((e: any) => e.sexe === 'F').length, color: 'from-pink-500 to-pink-600', icon: Users },
          { label: 'Actifs', value: employes.filter((e: any) => (e.statut || 'Actif') === 'Actif').length, color: 'from-green-500 to-emerald-600', icon: Users },
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

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un membre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm dark:text-white" />
          </div>
          <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm dark:text-white">
            <option value="all">Tous les postes</option>
            {postes.map((p: any) => <option key={p.id_poste} value={String(p.id_poste)}>{p.titre_poste}</option>)}
          </select>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-400'}`}><Grid className="w-4 h-4" /></button>
            <button type="button" onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMembers.map((emp: any) => (
            <div key={emp.matricule || emp.id} onClick={() => setSelectedMember(emp)} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                  <span className="text-white font-bold text-lg">{emp.prenom ? emp.prenom[0] : 'U'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{emp.prenom} {emp.nom}</p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{getPosteTitle(emp.id_poste)}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Mail className="w-4 h-4 flex-shrink-0" /><span className="truncate">{emp.email}</span></div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Phone className="w-4 h-4 flex-shrink-0" /><span>{emp.telephone || 'N/A'}</span></div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Calendar className="w-4 h-4 flex-shrink-0" /><span>Depuis {emp.date_embauche?.split('T')[0] || 'N/A'}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{emp.statut || 'Actif'}</span>
                <Eye className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold">Membre</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold hidden md:table-cell">Poste</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold hidden lg:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold hidden lg:table-cell">Téléphone</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((emp: any) => (
                <tr key={emp.matricule || emp.id} onClick={() => setSelectedMember(emp)} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'}`}>
                        <span className={`font-bold text-sm ${emp.sexe === 'M' ? 'text-blue-600' : 'text-pink-600'}`}>{emp.prenom ? emp.prenom[0] : 'U'}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{emp.prenom} {emp.nom}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{getPosteTitle(emp.id_poste)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{getPosteTitle(emp.id_poste)}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{emp.email}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{emp.telephone || 'N/A'}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">{emp.statut || 'Actif'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detail membre */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Profil du membre</h3>
              <button type="button" onClick={() => setSelectedMember(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${selectedMember.sexe === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                  <span className="text-3xl font-bold text-white">{selectedMember.prenom ? selectedMember.prenom[0] : 'U'}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedMember.prenom} {selectedMember.nom}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{getPosteTitle(selectedMember.id_poste)}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">{selectedMember.statut || 'Actif'}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: selectedMember.email },
                  { icon: Phone, label: 'Téléphone', value: selectedMember.telephone || 'N/A' },
                  { icon: MapPin, label: 'Adresse', value: selectedMember.adresse || 'Non renseignée' },
                  { icon: Calendar, label: 'Date embauche', value: selectedMember.date_embauche?.split('T')[0] || 'N/A' },
                  { icon: Briefcase, label: 'Matricule', value: selectedMember.matricule || 'N/A' },
                  { icon: Users, label: 'Sexe', value: selectedMember.sexe === 'M' ? 'Masculin' : 'Féminin' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm flex items-center space-x-2"><item.icon className="w-4 h-4 text-amber-500" /><span>{item.value}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'alerte des identifiants (Bloquant : affiche le mot de passe réel) */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 border-2 border-amber-500">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 font-bold text-2xl">
                🔑
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Identifiants de connexion</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Compte créé avec succès</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-3 text-sm border border-slate-200 dark:border-slate-600">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Nom complet :</span>
                <span className="font-bold text-slate-800 dark:text-white">{createdCredentials.prenom} {createdCredentials.nom}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Matricule :</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{createdCredentials.matricule}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Email (Identifiant) :</span>
                <span className="font-semibold text-slate-800 dark:text-white select-all">{createdCredentials.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Mot de passe temporaire :</span>
                <div className="bg-amber-50 dark:bg-slate-900 p-3 rounded-xl border border-amber-300 dark:border-amber-900/50 text-center">
                  <span className="font-mono text-lg font-bold text-amber-700 dark:text-amber-300 tracking-wider select-all">
                    {createdCredentials.password}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 rounded-xl">
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                ⚠️ Veuillez copier et transmettre ce mot de passe à l'employé. Cette fenêtre restera ouverte jusqu'à ce que vous confirmiez avoir pris note.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreatedCredentials(null)}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-lg shadow-amber-600/30 transition-all text-sm"
            >
              J'ai bien noté le mot de passe (Fermer)
            </button>
          </div>
        </div>
      )}

      {/* Modal d'ajout de l'employé */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Créer un profil employé</h3>
                <p className="text-xs text-slate-500">L'employé complétera le reste de ses informations depuis son espace.</p>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">✕</button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Prénom *</label>
                  <input value={createForm.prenom} onChange={(e) => setCreateForm({ ...createForm, prenom: e.target.value })} type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom *</label>
                  <input value={createForm.nom} onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })} type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sexe *</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="sexe" value="M" checked={createForm.sexe === 'M'} onChange={(e) => setCreateForm({ ...createForm, sexe: e.target.value })} className="text-amber-600 focus:ring-amber-500" required />
                    <span className="text-slate-700 dark:text-slate-300 text-sm">Masculin</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="sexe" value="F" checked={createForm.sexe === 'F'} onChange={(e) => setCreateForm({ ...createForm, sexe: e.target.value })} className="text-amber-600 focus:ring-amber-500" />
                    <span className="text-slate-700 dark:text-slate-300 text-sm">Féminin</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                  <input value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} type="email" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Téléphone *</label>
                  <input value={createForm.telephone} onChange={(e) => setCreateForm({ ...createForm, telephone: e.target.value })} type="tel" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Poste *</label>
                  <select value={createForm.poste_id} onChange={(e) => setCreateForm({ ...createForm, poste_id: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm">
                    <option value="">Sélectionner un poste</option>
                    {postes.map((poste: any) => (
                      <option key={poste.id_poste} value={poste.id_poste}>{poste.titre_poste}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rôle d'accès</label>
                  <select value={createForm.role_name} onChange={(e) => setCreateForm({ ...createForm, role_name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold dark:text-white text-sm">
                    {ROLES_OPTIONS.map((role) => (
                      <option key={role.slug} value={role.slug}>{role.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm font-semibold">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Création du profil...' : 'Enregistrer et notifier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}