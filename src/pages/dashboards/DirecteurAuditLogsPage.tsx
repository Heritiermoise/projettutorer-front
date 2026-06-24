import { useState } from 'react'
import { Shield, Search, Filter, AlertCircle, AlertTriangle, Info, XCircle, Calendar, User, MapPin, Eye } from 'lucide-react'
import { mockAuditLogs } from '../../data/phase4Data'
import type { AuditLog } from '../../data/phase4Data'

export const DirecteurAuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterModule, setFilterModule] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.utilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.action.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = filterSeverity === 'all' || l.severity === filterSeverity
    const matchesModule = filterModule === 'all' || l.module === filterModule
    return matchesSearch && matchesSeverity && matchesModule
  })

  const stats = {
    total: logs.length,
    info: logs.filter(l => l.severity === 'Info').length,
    warning: logs.filter(l => l.severity === 'Warning').length,
    error: logs.filter(l => l.severity === 'Error').length,
    critical: logs.filter(l => l.severity === 'Critical').length
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'Info': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Warning': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      'Error': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'Critical': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    }
    return colors[severity] || colors['Info']
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === 'Critical') return <XCircle className="w-5 h-5 text-purple-600" />
    if (severity === 'Error') return <AlertCircle className="w-5 h-5 text-red-600" />
    if (severity === 'Warning') return <AlertTriangle className="w-5 h-5 text-amber-600" />
    return <Info className="w-5 h-5 text-blue-600" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Journal d'Audit</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Traçabilité complète des actions</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Shield className="w-5 h-5" />
          <span>Exporter logs</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Conformite et securite</h3>
            <p className="text-sm text-white/90">Toutes les actions sont enregistrees avec horodatage, adresse IP et details complets pour assurer une traçabilité totale.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Shield, color: 'from-purple-500 to-pink-600' },
          { label: 'Info', value: stats.info, icon: Info, color: 'from-blue-500 to-cyan-600' },
          { label: 'Warning', value: stats.warning, icon: AlertTriangle, color: 'from-amber-500 to-orange-600' },
          { label: 'Error', value: stats.error, icon: AlertCircle, color: 'from-red-500 to-rose-600' },
          { label: 'Critical', value: stats.critical, icon: XCircle, color: 'from-purple-500 to-purple-700' }
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
          </div>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Toutes severites</option>
            <option value="Info">Info</option>
            <option value="Warning">Warning</option>
            <option value="Error">Error</option>
            <option value="Critical">Critical</option>
          </select>
          <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Tous modules</option>
            <option value="Authentification">Authentification</option>
            <option value="Contrats">Contrats</option>
            <option value="Systeme">Systeme</option>
            <option value="Paie">Paie</option>
            <option value="Conges">Conges</option>
            <option value="Employes">Employes</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  log.severity === 'Critical' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  log.severity === 'Error' ? 'bg-red-100 dark:bg-red-900/30' :
                  log.severity === 'Warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {getSeverityIcon(log.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white">{log.action}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold">{log.module}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{log.utilisateur}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{log.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{log.ip}</span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{log.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}