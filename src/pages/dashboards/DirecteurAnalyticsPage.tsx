import { useState } from 'react'
import { TrendingDown, TrendingUp, AlertCircle, Clock, Smile, DollarSign, Users, Download, Calendar } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts'
import { mockAnalyticsData } from '../../data/phase2Data'

export const DirecteurAnalyticsPage = () => {
  const [period, setPeriod] = useState('6mois')

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      'TrendingDown': TrendingDown, 'TrendingUp': TrendingUp, 'AlertCircle': AlertCircle,
      'Clock': Clock, 'Smile': Smile, 'DollarSign': DollarSign, 'Users': Users
    }
    return icons[iconName] || TrendingUp
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Analytics & Reporting</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Indicateurs cles de performance RH</p>
        </div>
        <div className="flex items-center space-x-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <option value="3mois">3 derniers mois</option>
            <option value="6mois">6 derniers mois</option>
            <option value="1an">Derniere annee</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
            <Download className="w-5 h-5" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {mockAnalyticsData.kpis.map((kpi, i) => {
          const Icon = getIcon(kpi.icon)
          const isPositive = kpi.trend === 'up'
          const isGood = (kpi.label.includes('turnover') || kpi.label.includes('absenteisme') || kpi.label.includes('Cout')) 
            ? kpi.trend === 'down' 
            : kpi.trend === 'up'
          
          return (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isGood ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  <Icon className={`w-6 h-6 ${isGood ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <span className={`flex items-center space-x-1 text-sm font-semibold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{kpi.change}</span>
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{kpi.label}</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Evolution des effectifs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockAnalyticsData.effectifsHistory}>
              <defs>
                <linearGradient id="colorEffectif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="mois" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Area type="monotone" dataKey="effectif" stroke="#f59e0b" fillOpacity={1} fill="url(#colorEffectif)" />
              <Line type="monotone" dataKey="recrutements" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="depart" stroke="#ef4444" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Raisons de depart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={mockAnalyticsData.turnoverReasons} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {mockAnalyticsData.turnoverReasons.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition des contrats</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockAnalyticsData.repartitionContrats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {mockAnalyticsData.repartitionContrats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Rapports disponibles</h3>
          <div className="space-y-3">
            {[
              { titre: 'Rapport mensuel RH', desc: 'Synthese complete du mois', date: 'Juin 2026' },
              { titre: 'Analyse de la masse salariale', desc: 'Detail des couts salariaux', date: 'T2 2026' },
              { titre: 'Bilan des recrutements', desc: 'Performance du processus', date: 'S1 2026' },
              { titre: 'Rapport de formation', desc: 'Suivi des formations', date: 'S1 2026' },
              { titre: 'Enquete de satisfaction', desc: 'Resultats annuels', date: '2025' }
            ].map((rapport, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{rapport.titre}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{rapport.desc}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{rapport.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}