import { useState } from 'react'
import { Users, Search, CheckCircle2, XCircle, Clock, Mail, Phone, MapPin, Key, Shield, UserCheck, Briefcase, Calendar, Eye, X } from 'lucide-react'

type Candidat = {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  poste_postule: string
  statut: 'en_attente' | 'entretien_planifie' | 'valide' | 'refuse'
  date_candidature: string
  entretien: { date: string; heure: string; type: string; resultat?: string } | null
  role_attribue?: string
  poste_attribue?: string
  mot_de_passe?: string
}

export const DirecteurCandidatsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(null)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [showEntretienModal, setShowEntretienModal] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('employe')
  const [selectedPoste, setSelectedPoste] = useState('')

  const postesDisponibles = [
    { id: 1, titre: 'Developpeur Full Stack', disponibles: 1 },
    { id: 2, titre: 'Responsable RH', disponibles: 0 },
    { id: 3, titre: 'Comptable', disponibles: 1 },
    { id: 4, titre: 'Designer UX/UI', disponibles: 0 },
  ]

  const [candidats, setCandidats] = useState<Candidat[]>([
    { id: 1, nom: 'Ngoy', prenom: 'Alain', email: 'alain@mail.com', telephone: '+243 900 111 222', adresse: 'Lubumbashi', poste_postule: 'Developpeur Full Stack', statut: 'en_attente', date_candidature: '2026-06-20', entretien: null },
    { id: 2, nom: 'Lunda', prenom: 'Beatrice', email: 'beatrice@mail.com', telephone: '+243 900 333 444', adresse: 'Kinshasa', poste_postule: 'Designer UX/UI', statut: 'entretien_planifie', date_candidature: '2026-06-21', entretien: { date: '2026-06-26', heure: '14:00', type: 'Visio' } },
    { id: 3, nom: 'Tshibasu', prenom: 'Christian', email: 'chris@mail.com', telephone: '+243 900 555 666', adresse: 'Lubumbashi', poste_postule: 'Comptable', statut: 'valide', date_candidature: '2026-06-15', role_attribue: 'employe', poste_attribue: 'Comptable', entretien: { date: '2026-06-20', heure: '09:00', type: 'Presentiel', resultat: 'Reussi' } },
    { id: 4, nom: 'Mukendi', prenom: 'Diane', email: 'diane@mail.com', telephone: '+243 900 777 888', adresse: 'Kinshasa', poste_postule: 'Developpeur Full Stack', statut: 'refuse', date_candidature: '2026-06-18', entretien: { date: '2026-06-18', heure: '11:00', type: 'Visio', resultat: 'Echoue' } },
  ])

  const [entretienData, setEntretienData] = useState({ date: '', heure: '', type: 'Visio' })

  const filteredCandidats = candidats.filter(c => {
    const matchesSearch = c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || c.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  const stats = {
    total: candidats.length,
    enAttente: candidats.filter(c => c.statut === 'en_attente').length,
    entretien: candidats.filter(c => c.statut === 'entretien_planifie').length,
    valides: candidats.filter(c => c.statut === 'valide').length,
    refuses: candidats.filter(c => c.statut === 'refuse').length,
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
    let password = ''
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(password)
  }

  const handlePlanifierEntretien = (candidat: any) => {
    setSelectedCandidat(candidat)
    setShowEntretienModal(true)
  }

  const handleConfirmEntretien = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCandidat) return
    setCandidats(candidats.map(c => 
      c.id === selectedCandidat.id 
        ? { ...c, statut: 'entretien_planifie', entretien: entretienData }
        : c
    ))
    setShowEntretienModal(false)
    setSelectedCandidat(null)
    setEntretienData({ date: '', heure: '', type: 'Visio' })
    alert('Entretien planifie avec succes ! Le candidat recevra une notification.')
  }

  const handleValider = (candidat: any) => {
    generatePassword()
    setSelectedCandidat(candidat)
    setShowValidationModal(true)
    setSelectedRole('employe')
    setSelectedPoste('')
  }

  const handleConfirmValidation = () => {
    if (!selectedCandidat) return
    if (!selectedPoste) {
      alert('Veuillez selectionner un poste disponible')
      return
    }
    setCandidats(candidats.map(c => 
      c.id === selectedCandidat.id 
        ? { ...c, statut: 'valide', role_attribue: selectedRole, poste_attribue: selectedPoste, mot_de_passe: generatedPassword }
        : c
    ))
    setShowValidationModal(false)
    setSelectedCandidat(null)
    setGeneratedPassword('')
    alert(`Candidat valide avec succes !\nRole: ${selectedRole}\nPoste: ${selectedPoste}\nMot de passe: ${generatedPassword}\n\nUn email a ete envoye au candidat avec ses identifiants.`)
  }

  const handleRefuser = (candidat: any) => {
    if (window.confirm('Etes-vous sur de vouloir refuser ce candidat ?')) {
      setCandidats(candidats.map(c => 
        c.id === candidat.id ? { ...c, statut: 'refuse' } : c
      ))
    }
  }

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'entretien_planifie': 'Entretien planifie',
      'valide': 'Valide',
      'refuse': 'Refuse',
    }
    return labels[statut] || statut
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'en_attente': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'entretien_planifie': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'valide': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'refuse': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    }
    return colors[statut] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Candidats</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gerez les candidatures et planifiez les entretiens</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Processus de recrutement</h3>
            <ol className="text-sm text-white/90 space-y-1 list-decimal list-inside">
              <li>Le candidat postule a une offre d'emploi</li>
              <li>Vous examinez le profil et planifiez un entretien</li>
              <li>Apres entretien reussi, vous validez le candidat</li>
              <li>Vous attribuez un role (Employe/RH/Manager) et un poste</li>
              <li>Un mot de passe est genere et envoye par email</li>
              <li>Le candidat devient employe de votre entreprise</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'from-amber-500 to-orange-600', icon: Users },
          { label: 'En attente', value: stats.enAttente, color: 'from-primary-500 to-purple-600', icon: Clock },
          { label: 'Entretien', value: stats.entretien, color: 'from-blue-500 to-cyan-600', icon: Calendar },
          { label: 'Validés', value: stats.valides, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Refusés', value: stats.refuses, color: 'from-red-500 to-rose-600', icon: XCircle },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un candidat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="entretien_planifie">Entretien planifie</option>
            <option value="valide">Validés</option>
            <option value="refuse">Refusés</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCandidats.map(candidat => (
          <div key={candidat.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{candidat.prenom[0]}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{candidat.prenom} {candidat.nom}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{candidat.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(candidat.statut)}`}>
                {getStatutLabel(candidat.statut)}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Briefcase className="w-4 h-4" />
                <span>Postule pour: <span className="font-semibold text-amber-600">{candidat.poste_postule}</span></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4" />
                <span>{candidat.telephone}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{candidat.adresse}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Candidature le {candidat.date_candidature}</span>
              </div>
              {candidat.entretien && (
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">Entretien: {candidat.entretien.date} a {candidat.entretien.heure} ({candidat.entretien.type})</p>
                  {candidat.entretien.resultat && <p className="text-xs font-semibold mt-1">Resultat: {candidat.entretien.resultat}</p>}
                </div>
              )}
              {candidat.role_attribue && (
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Shield className="w-4 h-4" />
                  <span>Role: <span className="font-semibold text-primary-600">{candidat.role_attribue}</span></span>
                </div>
              )}
              {candidat.poste_attribue && (
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Briefcase className="w-4 h-4" />
                  <span>Poste: <span className="font-semibold text-accent-600">{candidat.poste_attribue}</span></span>
                </div>
              )}
            </div>

            {candidat.statut === 'en_attente' && (
              <div className="flex space-x-2">
                <button onClick={() => handlePlanifierEntretien(candidat)} className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center space-x-1">
                  <Calendar className="w-4 h-4" /><span>Entretien</span>
                </button>
                <button onClick={() => handleRefuser(candidat)} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {candidat.statut === 'entretien_planifie' && (
              <button onClick={() => handleValider(candidat)} className="w-full px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-4 h-4" /><span>Valider apres entretien</span>
              </button>
            )}

            {candidat.statut === 'valide' && candidat.mot_de_passe && (
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Mot de passe genere :</p>
                  <p className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">{candidat.mot_de_passe}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showEntretienModal && selectedCandidat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Planifier un entretien</h3>
              <button onClick={() => setShowEntretienModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleConfirmEntretien} className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <p className="font-semibold text-slate-800 dark:text-white">{selectedCandidat.prenom} {selectedCandidat.nom}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Postule pour: {selectedCandidat.poste_postule}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date *</label>
                  <input type="date" value={entretienData.date} onChange={(e) => setEntretienData({...entretienData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Heure *</label>
                  <input type="time" value={entretienData.heure} onChange={(e) => setEntretienData({...entretienData, heure: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type d'entretien *</label>
                <select value={entretienData.type} onChange={(e) => setEntretienData({...entretienData, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="Visio">Visioconference</option>
                  <option value="Presentiel">Presentiel</option>
                  <option value="Telephonique">Telephonique</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowEntretienModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Planifier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showValidationModal && selectedCandidat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Valider le candidat</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedCandidat.prenom} {selectedCandidat.nom} - {selectedCandidat.poste_postule}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <p className="font-semibold text-slate-800 dark:text-white">{selectedCandidat.prenom} {selectedCandidat.nom}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCandidat.email}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCandidat.telephone}</p>
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
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Attribuer un role *</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="employe">Employe</option>
                  <option value="rh">Ressources Humaines</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Selectionner un poste disponible *</label>
                <select value={selectedPoste} onChange={(e) => setSelectedPoste(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="">-- Choisir un poste --</option>
                  {postesDisponibles.filter(p => p.disponibles > 0).map(poste => (
                    <option key={poste.id} value={poste.titre}>
                      {poste.titre} ({poste.disponibles} disponible(s))
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Seuls les postes avec des places disponibles sont affiches.
                </p>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <UserCheck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">Le candidat recevra un email avec ses identifiants</span>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex space-x-3">
              <button onClick={() => setShowValidationModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
              <button onClick={handleConfirmValidation} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">Confirmer la validation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}