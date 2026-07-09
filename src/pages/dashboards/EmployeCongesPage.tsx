import { useEffect, useState } from 'react'
import { Calendar, Plus, X, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react'
import { loadDashboardContext } from '../../services/dashboardData'

export const EmployeCongesPage = () => {
  const [showDemandeModal, setShowDemandeModal] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [formData, setFormData] = useState({
    type_conge: 'Annuel',
    date_debut: '',
    date_fin: '',
    motif: '',
  })

  useEffect(() => {
    loadDashboardContext().then(setDashboardData).catch(() => setDashboardData(null))
  }, [])

  const user = dashboardData?.user || { matricule: 'EMP-J1K2L3' }
  const userConges = (dashboardData?.conges || []).filter((c: any) => c.matricule === user.matricule)

  const stats = {
    total: userConges.length,
    approuves: userConges.filter(c => c.statut === 'Approuve').length,
    enAttente: userConges.filter(c => c.statut === 'En attente').length,
    refuses: userConges.filter(c => c.statut === 'Refuse').length,
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Demande de conge envoyee avec succes !')
    setShowDemandeModal(false)
    setFormData({ type_conge: 'Annuel', date_debut: '', date_fin: '', motif: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Mes Conges</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gestion de vos demandes de conge</p>
        </div>
        <button onClick={() => setShowDemandeModal(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle demande</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total demandes', value: stats.total, color: 'from-primary-500 to-purple-600', icon: Calendar },
          { label: 'Approuves', value: stats.approuves, color: 'from-green-500 to-emerald-600', icon: CheckCircle2 },
          { label: 'En attente', value: stats.enAttente, color: 'from-amber-500 to-orange-600', icon: Clock },
          { label: 'Refuses', value: stats.refuses, color: 'from-red-500 to-rose-600', icon: XCircle },
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Solde de conges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">Solde restant</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">20 jours</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400">Pris cette annee</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">10 jours</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-600 dark:text-purple-400">Total annuel</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">30 jours</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Historique des demandes</h3>
        </div>
        {userConges.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">Aucune demande de conge</p>
            <button onClick={() => setShowDemandeModal(true)} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
              Faire une demande
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {userConges.map(conge => (
              <div key={conge.id_conge} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{conge.type_conge}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{conge.date_debut} → {conge.date_fin}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{conge.nombre_jours} jours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      conge.statut === 'Approuve' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      conge.statut === 'En attente' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>{conge.statut}</span>
                  </div>
                </div>
                {conge.motif && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Motif :</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{conge.motif}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showDemandeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nouvelle demande de conge</h3>
              <button onClick={() => setShowDemandeModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type de conge</label>
                <select value={formData.type_conge} onChange={(e) => setFormData({...formData, type_conge: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
                  <option value="Annuel">Conge annuel</option>
                  <option value="Maladie">Conge de maladie</option>
                  <option value="Exceptionnel">Conge exceptionnel</option>
                  <option value="Maternite">Conge de maternite</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date de debut</label>
                  <input type="date" value={formData.date_debut} onChange={(e) => setFormData({...formData, date_debut: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date de fin</label>
                  <input type="date" value={formData.date_fin} onChange={(e) => setFormData({...formData, date_fin: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Motif</label>
                <textarea value={formData.motif} onChange={(e) => setFormData({...formData, motif: e.target.value})} rows={4} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Expliquez la raison de votre demande..." required />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowDemandeModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Envoyer la demande</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}