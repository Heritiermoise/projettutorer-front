import { useEffect, useMemo, useState } from 'react'
import { Users, Search, Mail, Phone, MapPin, Calendar, Briefcase, Eye, Download, UserPlus, Grid, List, Loader2 } from 'lucide-react'
import { loadDashboardContext } from '../../services/dashboardData'
import { membreAPI, posteAPI } from '../../services/api' // Suppression de serviceAPI car non nécessaire
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
  
  // Formulaire d'ajout direct de l'employé sans le champ service
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
  const loadData = () => {
    loadDashboardContext().then(setDashboardData)
  }

  useEffect(() => {
    loadData()

    posteAPI.getAll()
      .then((response) => setAvailablePostes(response.postes || []))
      .catch(() => setAvailablePostes([]))
  }, [])

  const employes = dashboardData?.employes || []
  const postes = availablePostes.length > 0 ? availablePostes : (dashboardData?.postes || [])
  
  const companyId = dashboardData?.entreprise?.id_entreprise
    || dashboardData?.user?.id_entreprise
    || dashboardData?.user?.entreprise?.id_entreprise
    || dashboardData?.entreprises?.find((entreprise: any) => entreprise.user_id === dashboardData?.user?.id)?.id_entreprise
    || dashboardData?.entreprises?.find((entreprise: any) => entreprise.email === dashboardData?.user?.email)?.id_entreprise

  const filteredMembers = useMemo(() => employes.filter((emp: any) => {
    const matchesSearch = emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesService = filterService === 'all' || String(emp.id_poste) === filterService
    return matchesSearch && matchesService
  }), [employes, searchTerm, filterService])

  const getPosteTitle = (idPoste: number) => {
    const poste = postes.find((p: any) => p.id_poste === idPoste)
    return poste?.titre_poste || 'N/A'
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
          { label: 'Total', value: employes.length, color: 'from-primary-500 to-purple-600', icon: Users },
          { label: 'Hommes', value: employes.filter((e: any) => e.sexe === 'M').length, color: 'from-blue-500 to-blue-600', icon: Users },
          { label: 'Femmes', value: employes.filter((e: any) => e.sexe === 'F').length, color: 'from-pink-500 to-pink-600', icon: Users },
          { label: 'Actifs', value: employes.filter((e: any) => e.statut === 'Actif').length, color: 'from-green-500 to-emerald-600', icon: Users },
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
            <input type="text" placeholder="Rechercher un membre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
          </div>
          <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm">
            <option value="all">Tous les postes</option>
            {postes.map((p: any) => <option key={p.id_poste} value={String(p.id_poste)}>{p.titre_poste}</option>)}
          </select>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><Grid className="w-4 h-4" /></button>
            <button type="button" onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMembers.map((emp: any) => (
            <div key={emp.matricule} onClick={() => setSelectedMember(emp)} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                  <span className="text-white font-bold text-lg">{emp.prenom[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate">{emp.prenom} {emp.nom}</p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{getPosteTitle(emp.id_poste)}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Mail className="w-4 h-4 flex-shrink-0" /><span className="truncate">{emp.email}</span></div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Phone className="w-4 h-4 flex-shrink-0" /><span>{emp.telephone}</span></div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><Calendar className="w-4 h-4 flex-shrink-0" /><span>Depuis {emp.date_embauche || 'N/A'}</span></div>
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
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Membre</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Poste</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Téléphone</th>
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((emp: any) => (
                <tr key={emp.matricule} onClick={() => setSelectedMember(emp)} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${emp.sexe === 'M' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'}`}>
                        <span className={`font-bold text-sm ${emp.sexe === 'M' ? 'text-blue-600' : 'text-pink-600'}`}>{emp.prenom[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{emp.prenom} {emp.nom}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{getPosteTitle(emp.id_poste)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">{getPosteTitle(emp.id_poste)}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{emp.email}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">{emp.telephone}</td>
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
              <button type="button" onClick={() => setSelectedMember(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">X</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${selectedMember.sexe === 'M' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'}`}>
                  <span className="text-3xl font-bold text-white">{selectedMember.prenom[0]}</span>
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
                  { icon: Phone, label: 'Téléphone', value: selectedMember.telephone },
                  { icon: MapPin, label: 'Adresse', value: selectedMember.adresse || 'Non renseignée (modifiable par l’employé)' },
                  { icon: Calendar, label: 'Date embauche', value: selectedMember.date_embauche || 'Non renseignée' },
                  { icon: Briefcase, label: 'Matricule', value: selectedMember.matricule },
                  { icon: Users, label: 'Sexe', value: selectedMember.sexe === 'M' ? 'Masculin' : 'Féminin' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm flex items-center space-x-2"><item.icon className="w-4 h-4" /><span>{item.value}</span></p>
                  </div>
                ))}
              </div>
            </div>
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
                <p className="text-xs text-slate-500">L'employé complétera le reste de ses informations (comme l'adresse) depuis son espace.</p>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">X</button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault()
              if (!companyId) {
                setToast({ type: 'error', message: 'Aucune entreprise trouvée pour ce compte.' })
                return
              }

              if (!createForm.sexe) {
                setToast({ type: 'error', message: 'Veuillez sélectionner le genre/sexe.' })
                return
              }

              void (async () => {
                setIsSubmitting(true)
                try {
                  // Transmission des données de l'employé sans le department_id car l'ID du poste suffit à en déduire le service
                  await membreAPI.create({
                    prenom: createForm.prenom,
                    nom: createForm.nom,
                    sexe: createForm.sexe,
                    email: createForm.email,
                    telephone: createForm.telephone,
                    company_id: companyId,
                    poste_id: Number(createForm.poste_id),
                    role_name: createForm.role_name,
                  })

                  setShowCreateModal(false)
                  setCreateForm({
                    prenom: '',
                    nom: '',
                    sexe: '',
                    email: '',
                    telephone: '',
                    poste_id: '',
                    role_name: 'employe',
                  })
                  setToast({ type: 'success', message: 'Employé ajouté avec succès ! Un e-mail de notification automatique contenant ses accès lui a été envoyé.' })
                  loadData() // Recharger la liste pour afficher le nouveau membre
                } catch (error) {
                  setToast({ type: 'error', message: error instanceof Error ? error.message : 'Erreur lors de la création de l\'employé' })
                } finally {
                  setIsSubmitting(false)
                }
              })()
            }}>
              {/* Prénom & Nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Prénom *</label>
                  <input value={createForm.prenom} onChange={(e) => setCreateForm({ ...createForm, prenom: e.target.value })} type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom *</label>
                  <input value={createForm.nom} onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })} type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
                </div>
              </div>

              {/* Sexe / Genre */}
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

              {/* Email & Téléphone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                  <input value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} type="email" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Téléphone *</label>
                  <input value={createForm.telephone} onChange={(e) => setCreateForm({ ...createForm, telephone: e.target.value })} type="tel" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
                </div>
              </div>

              {/* Poste & Rôle applicatif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Poste *</label>
                  <select value={createForm.poste_id} onChange={(e) => setCreateForm({ ...createForm, poste_id: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="">Sélectionner un poste</option>
                    {postes.map((poste: any) => (
                      <option key={poste.id_poste} value={poste.id_poste}>{poste.titre_poste}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rôle d'accès</label>
                  <select value={createForm.role_name} onChange={(e) => setCreateForm({ ...createForm, role_name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold">
                    {ROLES_OPTIONS.map((role) => (
                      <option key={role.slug} value={role.slug}>{role.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-60 flex items-center justify-center gap-2">
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