import { useState } from 'react'
import { Users, Search, CheckCircle2, XCircle, Clock, Mail, Phone, MapPin, Eye, Key, Shield, UserCheck } from 'lucide-react'

type PendingUser = {
  id: number
  nom: string
  post_nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  role: string
  statut: 'en_attente' | 'valide' | 'refuse'
  date_inscription: string
  role_attribue?: string
  mot_de_passe?: string
}

export const AdminValidationUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')

  // Simulation des utilisateurs en attente
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([
    { id: 1, nom: 'Ngoy', post_nom: 'Kabuya', prenom: 'Alain', email: 'alain@mail.com', telephone: '+243 900 111 222', adresse: 'Lubumbashi', role: 'utilisateur', statut: 'en_attente', date_inscription: '2026-06-20' },
    { id: 2, nom: 'Lunda', post_nom: 'Mfumu', prenom: 'Beatrice', email: 'beatrice@mail.com', telephone: '+243 900 333 444', adresse: 'Kinshasa', role: 'utilisateur', statut: 'en_attente', date_inscription: '2026-06-21' },
    { id: 3, nom: 'Tshibasu', post_nom: 'Kalonji', prenom: 'Christian', email: 'chris@mail.com', telephone: '+243 900 555 666', adresse: 'Lubumbashi', role: 'utilisateur', statut: 'valide', date_inscription: '2026-06-15', role_attribue: 'employe' },
  ])

  const filteredUsers = pendingUsers.filter(u => {
    const matchesSearch = u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || u.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  const stats = {
    total: pendingUsers.length,
    enAttente: pendingUsers.filter(u => u.statut === 'en_attente').length,
    valides: pendingUsers.filter(u => u.statut === 'valide').length,
    refuses: pendingUsers.filter(u => u.statut === 'refuse').length,
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
    let password = ''
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(password)
  }

  const handleValidate = (userId: number) => {
    generatePassword()
    setShowPasswordModal(true)
    setSelectedUser(pendingUsers.find(u => u.id === userId))
  }

  const confirmValidation = (role: string) => {
    if (!selectedUser) return
    setPendingUsers(pendingUsers.map(u => 
      u.id === selectedUser.id 
        ? { ...u, statut: 'valide', role_attribue: role, mot_de_passe: generatedPassword }
        : u
    ))
    setShowPasswordModal(false)
    setSelectedUser(null)
    setGeneratedPassword('')
    alert(`Utilisateur valide avec succes ! Role: ${role}, Mot de passe: ${generatedPassword}`)
  }

  const handleRefuse = (userId: number) => {
    if (window.confirm('Etes-vous sur de vouloir refuser cet utilisateur ?')) {
      setPendingUsers(pendingUsers.map(u => 
        u.id === userId ? { ...u, statut: 'refuse' } : u
      ))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Validation des Utilisateurs</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gestion des inscriptions en attente</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total inscriptions', value: stats.total, color: 'from-primary-500 to-purple-600', icon: Users },
          { label: 'En attente', value: stats.enAttente, color: 'from-amber-500 to-orange-600', icon: Clock },
          { label: 'Validés', value: stats.valides, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Refusés', value: stats.refuses, color: 'from-red-500 to-rose-600', icon: XCircle },
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un utilisateur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="valide">Valides</option>
            <option value="refuse">Refuses</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{user.prenom[0]}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                user.statut === 'en_attente' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                user.statut === 'valide' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {user.statut === 'en_attente' ? 'En attente' : user.statut === 'valide' ? 'Valide' : 'Refuse'}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4" />
                <span>{user.telephone}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{user.adresse}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span>Inscrit le {user.date_inscription}</span>
              </div>
              {user.role_attribue && (
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Shield className="w-4 h-4" />
                  <span>Role: <span className="font-semibold text-primary-600">{user.role_attribue}</span></span>
                </div>
              )}
            </div>

            {user.statut === 'en_attente' && (
              <div className="flex space-x-2">
                <button onClick={() => handleValidate(user.id)} className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" /><span>Valider</span>
                </button>
                <button onClick={() => handleRefuse(user.id)} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {user.statut === 'valide' && user.mot_de_passe && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Mot de passe genere :</p>
                <p className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">{user.mot_de_passe}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Valider l'utilisateur</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <p className="font-semibold text-slate-800 dark:text-white">{selectedUser.prenom} {selectedUser.nom}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mot de passe genere</label>
                <div className="flex items-center space-x-2">
                  <input type="text" value={generatedPassword} readOnly className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-mono" />
                  <button onClick={generatePassword} className="px-4 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200">
                    <Key className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Attribuer un role</label>
                <select id="role-select" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="employe">Employe</option>
                  <option value="rh">Ressources Humaines</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <UserCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">L'utilisateur recevra un email avec ses identifiants</span>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex space-x-3">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
              <button onClick={() => confirmValidation((document.getElementById('role-select') as HTMLSelectElement)?.value || 'employe')} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">Confirmer la validation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}