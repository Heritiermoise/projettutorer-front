import { useEffect, useState } from 'react'
import { Building2, Plus, SwitchCamera, CheckCircle2, XCircle, Calendar, Code } from 'lucide-react'
import { entrepriseAPI } from '../../services/api'

export const DirecteurMesEntreprisesPage = () => {
  const [entreprises, setEntreprises] = useState<any[]>([])
  const [entrepriseActive, setEntrepriseActive] = useState<number>(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    entrepriseAPI.getAll()
      .then((response) => {
        const list = Array.isArray(response) ? response : response?.entreprises || []
        setEntreprises(list.map((entreprise: any) => ({
          id: entreprise.id_entreprise,
          nom: entreprise.nom,
          code: entreprise.code || entreprise.id_entreprise,
          role: entreprise.role || 'Directeur',
          statut: entreprise.statut || 'Actif',
          date_rejoins: entreprise.created_at || 'N/A',
        })))
        if (list[0]?.id_entreprise) {
          setEntrepriseActive(list[0].id_entreprise)
        }
      })
      .catch(() => setEntreprises([]))
  }, [])

  const activeEntreprise = entreprises.find(e => e.id === entrepriseActive)

  const handleSwitch = (id: number) => {
    setEntrepriseActive(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Mes Entreprises</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gerez vos multiples entreprises</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouvelle entreprise</span>
        </button>
      </div>

      {activeEntreprise && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/80">Entreprise active</p>
              <h2 className="text-2xl font-bold">{activeEntreprise.nom}</h2>
              <p className="text-sm text-white/80">Code: {activeEntreprise.code} • Role: {activeEntreprise.role}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-white/80" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {entreprises.map(entreprise => (
          <div key={entreprise.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border-2 transition-all ${entrepriseActive === entreprise.id ? 'border-amber-500' : 'border-slate-200 dark:border-slate-700'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                entreprise.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {entreprise.statut}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{entreprise.nom}</h3>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Code className="w-4 h-4" />
                <span>{entreprise.code}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Role: {entreprise.role}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Depuis {entreprise.date_rejoins}</span>
              </div>
            </div>

            {entrepriseActive !== entreprise.id ? (
              <button onClick={() => handleSwitch(entreprise.id)} className="w-full px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 flex items-center justify-center space-x-2">
                <SwitchCamera className="w-4 h-4" />
                <span>Basculer vers cette entreprise</span>
              </button>
            ) : (
              <div className="w-full px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Entreprise active</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Statistiques globales</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{entreprises.length}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Entreprises</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{entreprises.filter(e => e.statut === 'Actif').length}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Actives</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-600">{entreprises.filter(e => e.role === 'Directeur').length}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">En tant que DG</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{entreprises.filter(e => e.role !== 'Employe').length}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Avec acces admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}