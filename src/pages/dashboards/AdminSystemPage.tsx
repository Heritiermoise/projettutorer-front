import { useState } from 'react'
import { 
  Server, Activity, Search, Database, Cpu, HardDrive,
  CheckCircle2, AlertCircle, Clock, RefreshCw, Zap, 
  Wifi, Globe, Settings, Terminal, Play, Pause, RotateCcw
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell
} from 'recharts'

export const AdminSystemPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'cache' | 'jobs' | 'backups'>('overview')
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const cpuData = [
    { time: '10:00', usage: 45 }, { time: '10:05', usage: 62 }, { time: '10:10', usage: 38 },
    { time: '10:15', usage: 71 }, { time: '10:20', usage: 55 }, { time: '10:25', usage: 48 },
  ]
  const memoryData = [
    { time: '10:00', usage: 68 }, { time: '10:05', usage: 72 }, { time: '10:10', usage: 65 },
    { time: '10:15', usage: 78 }, { time: '10:20', usage: 71 }, { time: '10:25', usage: 69 },
  ]
  const networkData = [
    { time: '10:00', in: 120, out: 85 }, { time: '10:05', in: 145, out: 110 },
    { time: '10:10', in: 98, out: 65 }, { time: '10:15', in: 167, out: 132 },
    { time: '10:20', in: 134, out: 98 }, { time: '10:25', in: 156, out: 121 },
  ]
  const dbSizeData = [
    { table: 'users', size: 45 }, { table: 'employes', size: 32 }, { table: 'contrats', size: 28 },
    { table: 'paies', size: 56 }, { table: 'conges', size: 18 }, { table: 'logs', size: 89 },
  ]
  const cacheData = [
    { name: 'Config', value: 15, color: '#8b5cf6' }, { name: 'Routes', value: 25, color: '#10b981' },
    { name: 'Views', value: 35, color: '#f59e0b' }, { name: 'Data', value: 25, color: '#ef4444' },
  ]

  const tabs = [
    { id: 'overview' as const, label: 'Ressources', icon: Activity },
    { id: 'database' as const, label: 'Base de donnees', icon: Database },
    { id: 'cache' as const, label: 'Cache', icon: Zap },
    { id: 'jobs' as const, label: 'Taches', icon: Clock },
    { id: 'backups' as const, label: 'Sauvegardes', icon: RotateCcw },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Infrastructure Systeme</h1>
          <p className="text-slate-600 dark:text-slate-400">Monitoring et administration serveur</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${maintenanceMode ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
            <Settings className={`w-5 h-5 ${maintenanceMode ? 'text-amber-600' : 'text-green-600'}`} />
            <span className={`font-bold ${maintenanceMode ? 'text-amber-700 dark:text-amber-300' : 'text-green-700 dark:text-green-300'}`}>{maintenanceMode ? 'Maintenance ON' : 'Systeme OK'}</span>
          </div>
          <button onClick={() => setMaintenanceMode(!maintenanceMode)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600">
            {maintenanceMode ? 'Desactiver' : 'Activer'} Maintenance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Cpu className="w-8 h-8 text-primary-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">52%</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Utilisation CPU</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2"><div className="bg-primary-500 h-2 rounded-full" style={{ width: '52%' }}></div></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-8 h-8 text-accent-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">68%</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Memoire RAM</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2"><div className="bg-accent-500 h-2 rounded-full" style={{ width: '68%' }}></div></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 text-amber-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">2.4 TB</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Stockage utilise</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Wifi className="w-8 h-8 text-pink-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">99.9%</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Uptime (30 jours)</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2"><div className="bg-pink-500 h-2 rounded-full" style={{ width: '99.9%' }}></div></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-600 dark:text-slate-400 hover:text-primary-600'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">CPU & Memoire</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cpuData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="usage" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Reseau (Mbps)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={networkData}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Area type="monotone" dataKey="in" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" />
                    <Area type="monotone" dataKey="out" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOut)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">Taille des tables (MB)</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dbSizeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis dataKey="table" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="size" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-slate-800 dark:text-white">Optimisation</h4>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg"><span className="text-sm text-slate-600 dark:text-slate-400">Index manquants</span><span className="font-bold text-red-600">3</span></div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg"><span className="text-sm text-slate-600 dark:text-slate-400">Requetes lentes</span><span className="font-bold text-amber-600">12</span></div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg"><span className="text-sm text-slate-600 dark:text-slate-400">Connexions actives</span><span className="font-bold text-green-600">24/100</span></div>
                  <button className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center justify-center space-x-2"><Terminal className="w-4 h-4" /><span>Executer VACUUM</span></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cache' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Repartition du cache</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={cacheData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => name + ' ' + ((percent ?? 0) * 100).toFixed(0) + '%'}>
                      {cacheData.map((entry, index) => (<Cell key={'cell-' + index} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Gestion du cache</h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between"><div><p className="font-semibold text-slate-800 dark:text-white">Cache Configuration</p><p className="text-sm text-slate-600 dark:text-slate-400">15 MB utilise</p></div><button className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200">Vider</button></div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between"><div><p className="font-semibold text-slate-800 dark:text-white">Cache Routes</p><p className="text-sm text-slate-600 dark:text-slate-400">25 MB utilise</p></div><button className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200">Vider</button></div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between"><div><p className="font-semibold text-slate-800 dark:text-white">Cache Vues</p><p className="text-sm text-slate-600 dark:text-slate-400">35 MB utilise</p></div><button className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200">Vider</button></div>
                <button className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center space-x-2"><RotateCcw className="w-4 h-4" /><span>Vider tout le cache</span></button>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">File de taches</h3>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center space-x-2"><Play className="w-4 h-4" /><span>Demarrer Worker</span></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"><p className="text-sm text-green-600 dark:text-green-400">Traitees</p><p className="text-2xl font-bold text-green-700 dark:text-green-300">1,245</p></div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"><p className="text-sm text-amber-600 dark:text-amber-400">En attente</p><p className="text-2xl font-bold text-amber-700 dark:text-amber-300">12</p></div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"><p className="text-sm text-red-600 dark:text-red-400">Echouees</p><p className="text-2xl font-bold text-red-700 dark:text-red-300">3</p></div>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sauvegardes automatiques</h3>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Creer manuellement</button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center space-x-3"><Database className="w-6 h-6 text-primary-600" /><div><p className="font-semibold text-slate-800 dark:text-white">backup_2026-06-14_03-00.sql</p><p className="text-sm text-slate-600 dark:text-slate-400">14 Juin 2026 • 03:00 • 245 MB</p></div></div>
                  <div className="flex items-center space-x-2"><button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50">Telecharger</button><button className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200">Restaurer</button></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center space-x-3"><Database className="w-6 h-6 text-primary-600" /><div><p className="font-semibold text-slate-800 dark:text-white">backup_2026-06-13_03-00.sql</p><p className="text-sm text-slate-600 dark:text-slate-400">13 Juin 2026 • 03:00 • 242 MB</p></div></div>
                  <div className="flex items-center space-x-2"><button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50">Telecharger</button><button className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200">Restaurer</button></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}