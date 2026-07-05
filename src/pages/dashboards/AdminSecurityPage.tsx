import { useState } from 'react'
import { 
  Shield, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, MoreVertical, Mail,
  Eye, Search, Filter, Activity, Lock, Unlock, Ban, 
  Globe, Key, Fingerprint, WifiOff, Server, Clock
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts'

export const AdminSecurityPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'ips' | '2fa' | 'vulnerabilities'>('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const threatData = [
    { heure: '00:00', menaces: 2, bloquees: 2 },
    { heure: '04:00', menaces: 5, bloquees: 5 },
    { heure: '08:00', menaces: 12, bloquees: 11 },
    { heure: '12:00', menaces: 8, bloquees: 8 },
    { heure: '16:00', menaces: 15, bloquees: 14 },
    { heure: '20:00', menaces: 6, bloquees: 6 },
  ]

  const loginAttempts = [
    { jour: 'Lun', reussies: 145, echouees: 12 },
    { jour: 'Mar', reussies: 167, echouees: 23 },
    { jour: 'Mer', reussies: 189, echouees: 45 },
    { jour: 'Jeu', reussies: 156, echouees: 18 },
    { jour: 'Ven', reussies: 178, echouees: 32 },
    { jour: 'Sam', reussies: 89, echouees: 8 },
    { jour: 'Dim', reussies: 45, echouees: 5 },
  ]

  const securityScore = 87
  const vulnerabilities = [
    { id: 1, title: 'Mots de passe faibles', severity: 'high', count: 12, status: 'open' },
    { id: 2, title: 'Sessions expirees actives', severity: 'medium', count: 5, status: 'in_progress' },
    { id: 3, title: 'Permissions excessives', severity: 'low', count: 3, status: 'resolved' },
    { id: 4, title: 'Absence de 2FA', severity: 'high', count: 8, status: 'open' },
  ]

  const recentLogs = [
    { id: 1, action: 'Connexion reussie', user: 'admin@demo.com', ip: '192.168.1.10', time: 'Il y a 5 min', type: 'success' },
    { id: 2, action: 'Tentative echouee', user: 'unknown@fake.com', ip: '10.0.0.45', time: 'Il y a 12 min', type: 'error' },
    { id: 3, action: 'Modification permissions', user: 'rh@demo.com', ip: '192.168.1.15', time: 'Il y a 1h', type: 'warning' },
    { id: 4, action: 'Export donnees', user: 'directeur@demo.com', ip: '192.168.1.12', time: 'Il y a 2h', type: 'info' },
  ]

  const blockedIPs = [
    { ip: '203.0.113.45', reason: 'Brute force', date: '2026-06-10', attempts: 145 },
    { ip: '198.51.100.22', reason: 'Injection SQL', date: '2026-06-09', attempts: 32 },
    { ip: '192.0.2.88', reason: 'Scanning', date: '2026-06-08', attempts: 567 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Centre de Securite</h1>
          <p className="text-slate-600 dark:text-slate-400">Monitoring et protection du systeme</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-700 dark:text-green-300">Score: {securityScore}/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">24</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Menaces bloquees (24h)</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Lock className="w-8 h-8 text-primary-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">94%</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Comptes 2FA actifs</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Ban className="w-8 h-8 text-amber-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">3</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">IPs bloquees</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-pink-600" />
            <span className="text-3xl font-bold text-slate-800 dark:text-white">2</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Vulnerabilites ouvertes</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview' as const, label: 'Vue d\'ensemble', icon: Activity },
              { id: 'logs' as const, label: 'Journaux', icon: Clock },
              { id: 'ips' as const, label: 'IPs & Firewall', icon: WifiOff },
              { id: '2fa' as const, label: '2FA & Access', icon: Key },
              { id: 'vulnerabilities' as const, label: 'Vulnerabilites', icon: ShieldAlert },
            ].map(tab => (
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Menaces en temps reel</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={threatData}>
                      <defs>
                        <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis dataKey="heure" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Area type="monotone" dataKey="menaces" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreat)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Tentatives de connexion</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={loginAttempts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis dataKey="jour" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="reussies" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="echouees" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Activite recente</h3>
                <div className="space-y-3">
                  {recentLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : log.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' : log.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                          {log.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : log.type === 'error' ? <XCircle className="w-5 h-5 text-red-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">{log.action}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{log.user} • {log.ip}</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Rechercher dans les journaux..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" />
                </div>
                <button className="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600"><Filter className="w-5 h-5" /></button>
                <button className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Exporter CSV</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Horodatage</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Utilisateur</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Action</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">IP</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map(log => (
                      <tr key={log.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">{log.time}</td>
                        <td className="py-4 px-4 font-semibold text-slate-800 dark:text-white">{log.user}</td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{log.action}</td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{log.ip}</td>
                        <td className="py-4 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.type === 'success' ? 'bg-green-100 text-green-700' : log.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{log.type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ips' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">IPs Bloquees</h3>
                <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center space-x-2"><Ban className="w-4 h-4" /><span>Bloquer une IP</span></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blockedIPs.map(ip => (
                  <div key={ip.ip} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"><WifiOff className="w-5 h-5 text-red-600" /></div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{ip.ip}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Bloquee le {ip.date}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-400">Motif</span><span className="font-semibold text-slate-800 dark:text-white">{ip.reason}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-400">Tentatives</span><span className="font-semibold text-red-600">{ip.attempts}</span></div>
                    </div>
                    <button className="w-full mt-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Debloquer</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === '2fa' && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-green-800 dark:text-green-200">Authentification a deux facteurs</h3>
                  <p className="text-sm text-green-600 dark:text-green-300">Obligatoire pour les administrateurs et directeurs</p>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="font-semibold text-green-700 dark:text-green-300">Active</span></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">Methodes supportees</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div className="flex items-center space-x-3"><Fingerprint className="w-5 h-5 text-primary-600" /><span className="font-semibold">Application Authenticator</span></div><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div className="flex items-center space-x-3"><Key className="w-5 h-5 text-accent-600" /><span className="font-semibold">Cles de securite</span></div><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"><div className="flex items-center space-x-3"><Mail className="w-5 h-5 text-amber-600" /><span className="font-semibold">SMS</span></div><XCircle className="w-5 h-5 text-red-600" /></div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">Statistiques 2FA</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Utilisateurs avec 2FA</span><span className="font-bold text-slate-800 dark:text-white">94%</span></div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Codes de recuperation generates</span><span className="font-bold text-slate-800 dark:text-white">124</span></div>
                    <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Connexions via 2FA (24h)</span><span className="font-bold text-slate-800 dark:text-white">456</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vulnerabilities' && (
            <div className="space-y-4">
              {vulnerabilities.map(vuln => (
                <div key={vuln.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${vuln.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30' : vuln.severity === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      <ShieldAlert className={`w-6 h-6 ${vuln.severity === 'high' ? 'text-red-600' : vuln.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{vuln.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{vuln.count} instance(s) detectee(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${vuln.severity === 'high' ? 'bg-red-100 text-red-700' : vuln.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{vuln.severity}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${vuln.status === 'open' ? 'bg-red-100 text-red-700' : vuln.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{vuln.status}</span>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Corriger</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}