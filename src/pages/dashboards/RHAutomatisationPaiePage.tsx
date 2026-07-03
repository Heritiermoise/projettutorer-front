import { useState } from 'react'
import { DollarSign, Calendar, Clock, CheckCircle2, AlertCircle, Settings, TrendingUp, FileText, Bell, Shield, Play, Pause, Users, CreditCard, Smartphone, Download } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { mockEmployes, mockContrats } from '../../data/mockData'

export const RHAutomatisationPaiePage = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config' | 'historique' | 'calendrier'>('dashboard')
  const [autoPayEnabled, setAutoPayEnabled] = useState(true)
  const [payDay, setPayDay] = useState('25')
  const [advanceNotice, setAdvanceNotice] = useState('3')
  const [requireValidation, setRequireValidation] = useState(false)

  const stats = {
    totalEmployes: mockEmployes.length,
    masseSalariale: mockContrats.reduce((sum, c) => sum + c.salaire_base, 0),
    prochainPaiement: '2026-06-25',
    paiementsAutomatises: 156,
    economieTemps: '48h/mois',
    tauxReussite: 99.2,
  }

  const evolutionData = [
    { mois: 'Jan', montant: 180000, employes: 120 },
    { mois: 'Fev', montant: 185000, employes: 128 },
    { mois: 'Mar', montant: 192000, employes: 135 },
    { mois: 'Avr', montant: 198000, employes: 142 },
    { mois: 'Mai', montant: 210000, employes: 156 },
    { mois: 'Jun', montant: 225000, employes: 168 },
  ]

  const methodeData = [
    { name: 'Virement', value: 65, color: '#8b5cf6' },
    { name: 'Mobile Money', value: 25, color: '#10b981' },
    { name: 'Cheque', value: 10, color: '#f59e0b' },
  ]

  const historiquePaiements = [
    { date: '2026-05-25', montant: 210000, employes: 156, statut: 'Reussi', methode: 'Virement automatique' },
    { date: '2026-04-25', montant: 198000, employes: 142, statut: 'Reussi', methode: 'Virement automatique' },
    { date: '2026-03-25', montant: 192000, employes: 135, statut: 'Reussi', methode: 'Virement automatique' },
    { date: '2026-02-25', montant: 185000, employes: 128, statut: 'Partiel', methode: 'Virement automatique' },
    { date: '2026-01-25', montant: 180000, employes: 120, statut: 'Reussi', methode: 'Virement automatique' },
  ]

  const upcomingPayments = [
    { date: '2026-06-25', employes: 168, montant: 225000, jours: 5 },
    { date: '2026-07-25', employes: 170, montant: 230000, jours: 35 },
    { date: '2026-08-25', employes: 172, montant: 235000, jours: 66 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Automatisation des Paiements</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Gestion intelligente et automatique des paies</p>
        </div>
        <button
          onClick={() => setAutoPayEnabled(!autoPayEnabled)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            autoPayEnabled
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {autoPayEnabled ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{autoPayEnabled ? 'Automatisation active' : 'Automatisation desactivee'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
              { id: 'config', label: 'Configuration', icon: Settings },
              { id: 'historique', label: 'Historique', icon: FileText },
              { id: 'calendrier', label: 'Calendrier', icon: Calendar },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Prochain paiement', value: stats.prochainPaiement, icon: Calendar, color: 'from-primary-500 to-purple-600', sub: `${upcomingPayments[0].employes} employes` },
                  { label: 'Masse salariale', value: '$' + (stats.masseSalariale / 1000).toFixed(0) + 'K', icon: DollarSign, color: 'from-green-500 to-emerald-600', sub: 'Ce mois-ci' },
                  { label: 'Paiements automatises', value: stats.paiementsAutomatises, icon: CheckCircle2, color: 'from-amber-500 to-orange-600', sub: 'Total historique' },
                  { label: 'Economie de temps', value: stats.economieTemps, icon: Clock, color: 'from-pink-500 to-rose-600', sub: 'Par mois' },
                ].map((stat, i) => (
                  <div key={i} className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-700/50 dark:to-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-primary-500 via-purple-500 to-accent-500 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Bell className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Prochain paiement automatique</h3>
                      <p className="text-white/90">{upcomingPayments[0].date} • {upcomingPayments[0].employes} employes • ${upcomingPayments[0].montant.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-sm text-white/80">Dans</p>
                    <p className="text-3xl font-bold">{upcomingPayments[0].jours} jours</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Evolution de la masse salariale</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={evolutionData}>
                      <defs>
                        <linearGradient id="colorMasse" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis dataKey="mois" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Area type="monotone" dataKey="montant" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMasse)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition par methode</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={methodeData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent = 0 }) => name + ' ' + (percent * 100).toFixed(0) + '%'}>
                        {methodeData.map((entry, index) => (<Cell key={'cell-' + index} fill={entry.color} />))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Parametres de paiement automatique</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Configurez l'automatisation selon vos besoins</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">Activer les paiements automatiques</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Les paies seront traitees automatiquement chaque mois</p>
                    </div>
                    <button
                      onClick={() => setAutoPayEnabled(!autoPayEnabled)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${autoPayEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${autoPayEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jour de paiement</label>
                      <select value={payDay} onChange={(e) => setPayDay(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
                        {[15, 20, 25, 28, 30].map(day => (
                          <option key={day} value={day}>{day} de chaque mois</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Notification avant (jours)</label>
                      <select value={advanceNotice} onChange={(e) => setAdvanceNotice(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500">
                        {[1, 3, 5, 7].map(days => (
                          <option key={days} value={days}>{days} jours avant</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">Validation manuelle requise</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Necessite une approbation avant execution</p>
                    </div>
                    <button
                      onClick={() => setRequireValidation(!requireValidation)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${requireValidation ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${requireValidation ? 'translate-x-7' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Methodes de paiement</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Virement bancaire', icon: CreditCard, active: true, desc: 'Transfert direct sur compte bancaire' },
                    { name: 'Mobile Money', icon: Smartphone, active: true, desc: 'Paiement via Mobile Money' },
                    { name: 'Cheque', icon: FileText, active: false, desc: 'Generation de cheques' },
                  ].map((method, i) => (
                    <div key={i} className={`p-4 rounded-xl border-2 transition-all ${method.active ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method.active ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                          <method.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 dark:text-white">{method.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{method.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${method.active ? 'text-green-600' : 'text-slate-500'}`}>
                          {method.active ? 'Active' : 'Inactive'}
                        </span>
                        <button className={`px-3 py-1 rounded-lg text-xs font-semibold ${method.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {method.active ? 'Desactiver' : 'Activer'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historique' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Historique des paiements</h3>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Exporter</span>
                </button>
              </div>
              <div className="space-y-3">
                {historiquePaiements.map((paiement, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          paiement.statut === 'Reussi' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                        }`}>
                          {paiement.statut === 'Reussi' ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-amber-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">{paiement.date}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{paiement.methode}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 sm:space-x-6">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Employes</p>
                          <p className="font-bold text-slate-800 dark:text-white">{paiement.employes}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Montant</p>
                          <p className="font-bold text-green-600">${paiement.montant.toLocaleString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          paiement.statut === 'Reussi' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        }`}>
                          {paiement.statut}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendrier' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Calendrier des paiements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingPayments.map((payment, i) => (
                  <div key={i} className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <Calendar className="w-8 h-8 text-primary-600" />
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-semibold">
                        Dans {payment.jours} jours
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Date de paiement</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{payment.date}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Employes</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{payment.employes}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Montant total</span>
                        <span className="font-bold text-primary-600">${payment.montant.toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold">
                      Voir les details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}