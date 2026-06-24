import { useState } from 'react'
import { Target, TrendingUp, Users, Award, Calendar, CheckCircle2, AlertCircle, Clock, Star, Plus, Eye, Edit, X, BarChart3 } from 'lucide-react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { mockEvaluations } from '../../data/advancedData'
import type { Evaluation, Objectif, CompetenceEval } from '../../data/advancedData'

export const DirecteurEvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations)
  const [activeTab, setActiveTab] = useState<'all' | 'planifiee' | 'en_cours' | 'terminee'>('all')
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [formData, setFormData] = useState({
    employe_id: '', employe_nom: '', type: 'Annuelle', periode: '',
    date_evaluation: '', objectifs: '', competences: ''
  })

  const filteredEvals = evaluations.filter(e => {
    if (activeTab === 'all') return true
    return e.statut.toLowerCase() === activeTab
  })

  const stats = {
    total: evaluations.length,
    planifiees: evaluations.filter(e => e.statut === 'Planifiee').length,
    enCours: evaluations.filter(e => e.statut === 'En_cours').length,
    terminees: evaluations.filter(e => e.statut === 'Terminee').length,
    moyenneGenerale: evaluations.filter(e => e.note_globale > 0).reduce((sum, e) => sum + e.note_globale, 0) / evaluations.filter(e => e.note_globale > 0).length || 0
  }

  const radarData = [
    { competence: 'Leadership', actuel: 4, cible: 5 },
    { competence: 'Communication', actuel: 5, cible: 5 },
    { competence: 'Gestion projet', actuel: 4, cible: 5 },
    { competence: 'Innovation', actuel: 4, cible: 4 },
    { competence: 'Travail equipe', actuel: 5, cible: 5 },
    { competence: 'Resolution probleme', actuel: 4, cible: 5 }
  ]

  const performanceData = [
    { mois: 'Jan', score: 3.8 },
    { mois: 'Fev', score: 4.0 },
    { mois: 'Mar', score: 4.2 },
    { mois: 'Avr', score: 4.1 },
    { mois: 'Mai', score: 4.5 },
    { mois: 'Jun', score: 4.7 }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newEval: Evaluation = {
      id: Date.now(),
      employe_id: formData.employe_id,
      employe_nom: formData.employe_nom,
      evaluateur_id: 'EVAL-001',
      evaluateur_nom: 'Pierre Kabongo',
      type: formData.type as any,
      periode: formData.periode,
      date_evaluation: formData.date_evaluation,
      statut: 'Planifiee',
      note_globale: 0,
      objectifs: [],
      competences: [],
      commentaires: '',
      plan_developpement: '',
      forces: [],
      axes_amelioration: []
    }
    setEvaluations([...evaluations, newEval])
    setShowCreateModal(false)
    setFormData({ employe_id: '', employe_nom: '', type: 'Annuelle', periode: '', date_evaluation: '', objectifs: '', competences: '' })
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'Planifiee': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'En_cours': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Terminee': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    }
    return colors[statut] || colors['Planifiee']
  }

  const getNoteColor = (note: number) => {
    if (note >= 4.5) return 'text-green-600'
    if (note >= 3.5) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Evaluations & Performance</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gerez les evaluations des employes</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouvelle evaluation</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Target, color: 'from-amber-500 to-orange-600' },
          { label: 'Planifiees', value: stats.planifiees, icon: Calendar, color: 'from-blue-500 to-cyan-600' },
          { label: 'En cours', value: stats.enCours, icon: Clock, color: 'from-amber-500 to-yellow-600' },
          { label: 'Terminees', value: stats.terminees, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
          { label: 'Moyenne', value: stats.moyenneGenerale.toFixed(1), icon: Star, color: 'from-purple-500 to-pink-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Profil de competences</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="competence" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Actuel" dataKey="actuel" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Radar name="Cible" dataKey="cible" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Evolution de la performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="mois" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 5]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="score" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {[
              { id: 'all', label: 'Toutes', count: stats.total },
              { id: 'planifiee', label: 'Planifiees', count: stats.planifiees },
              { id: 'en_cours', label: 'En cours', count: stats.enCours },
              { id: 'terminee', label: 'Terminees', count: stats.terminees }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap ${activeTab === tab.id ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvals.map(eval_ => (
              <div key={eval_.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all cursor-pointer" onClick={() => { setSelectedEval(eval_); setShowDetailModal(true) }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg">{eval_.employe_nom}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{eval_.type} • {eval_.periode}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(eval_.statut)}`}>
                    {eval_.statut.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Note globale</p>
                    <p className={`text-2xl font-bold ${eval_.note_globale > 0 ? getNoteColor(eval_.note_globale) : 'text-slate-400'}`}>
                      {eval_.note_globale > 0 ? eval_.note_globale.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Objectifs</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{eval_.objectifs.length}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{eval_.date_evaluation}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{eval_.evaluateur_nom}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nouvelle evaluation</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ID Employe</label>
                  <input type="text" value={formData.employe_id} onChange={(e) => setFormData({...formData, employe_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom Employe</label>
                  <input type="text" value={formData.employe_nom} onChange={(e) => setFormData({...formData, employe_nom: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <option value="Annuelle">Annuelle</option>
                    <option value="Trimestrielle">Trimestrielle</option>
                    <option value="Probation">Probation</option>
                    <option value="360">360°</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Periode</label>
                  <input type="text" value={formData.periode} onChange={(e) => setFormData({...formData, periode: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" placeholder="Ex: 2025-2026" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date d'evaluation</label>
                <input type="date" value={formData.date_evaluation} onChange={(e) => setFormData({...formData, date_evaluation: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-800 pb-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Creer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Evaluation de {selectedEval.employe_nom}</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatutColor(selectedEval.statut)}`}>
                  {selectedEval.statut.replace('_', ' ')}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{selectedEval.type} • {selectedEval.periode}</span>
              </div>

              {selectedEval.note_globale > 0 && (
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Note globale</p>
                      <p className={`text-5xl font-bold ${getNoteColor(selectedEval.note_globale)}`}>
                        {selectedEval.note_globale.toFixed(1)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">sur 5.0</p>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-8 h-8 ${star <= Math.round(selectedEval.note_globale) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  <span>Objectifs ({selectedEval.objectifs.length})</span>
                </h4>
                <div className="space-y-3">
                  {selectedEval.objectifs.map(obj => (
                    <div key={obj.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-800 dark:text-white">{obj.description}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          obj.statut === 'Atteint' ? 'bg-green-100 text-green-700' :
                          obj.statut === 'En_cours' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{obj.statut.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <span>Cible: {obj.cible}</span>
                        <span>Realise: {obj.realise}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${obj.pourcentage}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{obj.pourcentage}% complete</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  <span>Competences</span>
                </h4>
                <div className="space-y-3">
                  {selectedEval.competences.map((comp, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-800 dark:text-white">{comp.nom}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Actuel: {comp.niveau_actuel}/5</span>
                          <span className="text-sm text-amber-600">Cible: {comp.niveau_cible}/5</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <div key={level} className={`flex-1 h-2 rounded-full ${level <= comp.niveau_actuel ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-600'}`}></div>
                        ))}
                      </div>
                      {comp.commentaires && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{comp.commentaires}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {selectedEval.forces.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-3">Forces</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEval.forces.map((force, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                        {force}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEval.axes_amelioration.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-3">Axes d'amelioration</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEval.axes_amelioration.map((axe, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm">
                        {axe}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEval.commentaires && (
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">Commentaires</h4>
                  <p className="text-slate-600 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">{selectedEval.commentaires}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}