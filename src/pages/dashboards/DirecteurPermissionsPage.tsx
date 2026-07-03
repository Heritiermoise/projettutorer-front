import { useState } from 'react'
import { Shield, Check, X, Save, Search } from 'lucide-react'
import { mockPermissions } from '../../data/phase5Data'
import type { Permission } from '../../data/phase5Data'

export const DirecteurPermissionsPage = () => {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions)
  const [searchTerm, setSearchTerm] = useState('')
  const [saved, setSaved] = useState(false)

  const filteredPermissions = permissions.filter(p => 
    p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.module.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggle = (id: number, field: 'lecture' | 'ecriture' | 'suppression' | 'administration') => {
    setPermissions(permissions.map(p => 
      p.id === id ? { ...p, [field]: !p[field] } : p
    ))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const roles = [...new Set(permissions.map(p => p.role))]
  const modules = [...new Set(permissions.map(p => p.module))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des Permissions</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Controlez les acces par role</p>
        </div>
        <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Save className="w-5 h-5" />
          <span>Sauvegarder</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300">
          Permissions sauvegardees avec succes
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Role</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Module</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Lecture</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Ecriture</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Suppression</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredPermissions.map(perm => (
                <tr key={perm.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
                      {perm.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">{perm.module}</td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => handleToggle(perm.id, 'lecture')} className={`p-2 rounded-lg transition-colors ${perm.lecture ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                      {perm.lecture ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => handleToggle(perm.id, 'ecriture')} className={`p-2 rounded-lg transition-colors ${perm.ecriture ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                      {perm.ecriture ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => handleToggle(perm.id, 'suppression')} className={`p-2 rounded-lg transition-colors ${perm.suppression ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                      {perm.suppression ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => handleToggle(perm.id, 'administration')} className={`p-2 rounded-lg transition-colors ${perm.administration ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                      {perm.administration ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2">Guide des permissions</h3>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
              <li><strong>Lecture</strong> : Consulter les informations</li>
              <li><strong>Ecriture</strong> : Creer et modifier</li>
              <li><strong>Suppression</strong> : Supprimer des elements</li>
              <li><strong>Administration</strong> : Gerer les permissions d'autres utilisateurs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}