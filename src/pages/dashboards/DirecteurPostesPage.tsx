import { useState } from 'react'
import { Briefcase, Plus, Search, Edit, Trash2, Users, CheckCircle2, XCircle, X, Building2, DollarSign } from 'lucide-react'

export const DirecteurPostesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPoste, setSelectedPoste] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const [postes, setPostes] = useState([
    { id: 1, titre: 'Developpeur Full Stack', type: 'CDI', niveau: 'Senior', departement: 'Informatique', nombre_postes: 2, postes_occupes: 1, salaire_min: 1500, salaire_max: 2500, description: 'Developpement d\'applications web', competences: 'React, Node.js, PostgreSQL', statut: 'Actif', date_creation: '2026-01-15' },
    { id: 2, titre: 'Responsable RH', type: 'CDI', niveau: 'Manager', departement: 'Ressources Humaines', nombre_postes: 1, postes_occupes: 1, salaire_min: 2000, salaire_max: 3000, description: 'Gestion du personnel', competences: 'Management, Droit du travail', statut: 'Actif', date_creation: '2026-01-20' },
    { id: 3, titre: 'Comptable', type: 'CDI', niveau: 'Junior', departement: 'Finance', nombre_postes: 1, postes_occupes: 0, salaire_min: 1000, salaire_max: 1500, description: 'Gestion comptable', competences: 'Excel, Sage', statut: 'Actif', date_creation: '2026-02-01' },
    { id: 4, titre: 'Designer UX/UI', type: 'CDD', niveau: 'Mid', departement: 'Informatique', nombre_postes: 1, postes_occupes: 1, salaire_min: 1200, salaire_max: 1800, description: 'Conception d\'interfaces', competences: 'Figma, Adobe XD', statut: 'Actif', date_creation: '2026-02-10' },
  ])

  const [formData, setFormData] = useState({
    titre: '', type: 'CDI', niveau: 'Junior', departement: '', nombre_postes: 1,
    description: '', competences: '', salaire_min: '', salaire_max: '',
  })

  const filteredPostes = postes.filter(p => {
    const matchesSearch = p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.departement.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'all' || p.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  const stats = {
    total: postes.length,
    actifs: postes.filter(p => p.statut === 'Actif').length,
    inactifs: postes.filter(p => p.statut === 'Inactif').length,
    disponibles: postes.reduce((sum, p) => sum + (p.nombre_postes - p.postes_occupes), 0),
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPoste = {
      id: Date.now(),
      ...formData,
      nombre_postes: parseInt(formData.nombre_postes),
      salaire_min: parseInt(formData.salaire_min),
      salaire_max: parseInt(formData.salaire_max),
      postes_occupes: 0,
      statut: 'Actif',
      date_creation: new Date().toISOString().split('T')[0],
    }
    setPostes([...postes, newPoste])
    setShowCreateModal(false)
    setFormData({ titre: '', type: 'CDI', niveau: 'Junior', departement: '', nombre_postes: 1, description: '', competences: '', salaire_min: '', salaire_max: '' })
    alert('Poste cree avec succes !')
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Etes-vous sur de vouloir supprimer ce poste ?')) {
      setPostes(postes.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Postes</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Creer et gerer les postes de votre entreprise</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Creer un poste</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total postes', value: stats.total, color: 'from-amber-500 to-orange-600', icon: Briefcase },
          { label: 'Postes actifs', value: stats.actifs, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'Postes inactifs', value: stats.inactifs, color: 'from-red-500 to-rose-600', icon: XCircle },
          { label: 'Postes disponibles', value: stats.disponibles, color: 'from-primary-500 to-purple-600', icon: Users },
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
            <input type="text" placeholder="Rechercher un poste..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
          </div>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm">
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredPostes.map(poste => (
          <div key={poste.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                poste.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>{poste.statut}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{poste.titre}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{poste.departement}</p>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Type:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{poste.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Niveau:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{poste.niveau}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Salaire:</span>
                <span className="font-bold text-amber-600">${poste.salaire_min} - ${poste.salaire_max}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Disponibles:</span>
                <span className="font-bold text-primary-600">{poste.nombre_postes - poste.postes_occupes}/{poste.nombre_postes}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => { setSelectedPoste(poste); setShowEditModal(true) }} className="flex-1 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm hover:bg-amber-200 dark:hover:bg-amber-900/50 flex items-center justify-center space-x-1">
                <Edit className="w-4 h-4" /><span>Modifier</span>
              </button>
              <button onClick={() => handleDelete(poste.id)} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Creer un nouveau poste</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre du poste *</label>
                <input type="text" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type de contrat *</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Niveau *</label>
                  <select value={formData.niveau} onChange={(e) => setFormData({...formData, niveau: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Departement *</label>
                  <input type="text" value={formData.departement} onChange={(e) => setFormData({...formData, departement: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre de postes *</label>
                  <input type="number" value={formData.nombre_postes} onChange={(e) => setFormData({...formData, nombre_postes: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" min="1" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Salaire minimum ($)</label>
                  <input type="number" value={formData.salaire_min} onChange={(e) => setFormData({...formData, salaire_min: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Salaire maximum ($)</label>
                  <input type="number" value={formData.salaire_max} onChange={(e) => setFormData({...formData, salaire_max: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Competences requises</label>
                <input type="text" value={formData.competences} onChange={(e) => setFormData({...formData, competences: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" placeholder="Separez par des virgules" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Creer le poste</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedPoste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Modifier le poste</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setPostes(postes.map(p => p.id === selectedPoste.id ? selectedPoste : p)); setShowEditModal(false); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre du poste</label>
                <input type="text" value={selectedPoste.titre} onChange={(e) => setSelectedPoste({...selectedPoste, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                  <select value={selectedPoste.type} onChange={(e) => setSelectedPoste({...selectedPoste, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Niveau</label>
                  <select value={selectedPoste.niveau} onChange={(e) => setSelectedPoste({...selectedPoste, niveau: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Statut</label>
                <select value={selectedPoste.statut} onChange={(e) => setSelectedPoste({...selectedPoste, statut: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}