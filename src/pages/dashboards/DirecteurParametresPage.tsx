import { useEffect, useState } from 'react'
import { Settings, Save, Building2, Bell, Shield, Palette, Mail, CheckCircle2, Upload } from 'lucide-react'
import { loadDashboardContext } from '../../services/dashboardData'

export const DirecteurParametresPage = () => {
  const [activeTab, setActiveTab] = useState<'entreprise' | 'notifications' | 'security' | 'appearance'>('entreprise')
  const [saved, setSaved] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    loadDashboardContext().then(setDashboardData).catch(() => setDashboardData(null))
  }, [])

  const entreprise = dashboardData?.entreprise || {
    nom: 'Entreprise',
    nom_commercial: 'Entreprise',
    email: 'contact@entreprise.com',
    telephone: '+243 000 000 000',
    adresse: 'Kinshasa',
    description: '',
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'entreprise' as const, label: 'Entreprise', icon: Building2 },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Securite', icon: Shield },
    { id: 'appearance' as const, label: 'Apparence', icon: Palette },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Parametres</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Configuration de votre entreprise</p>
        </div>
        {saved && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-700 dark:text-green-300 text-sm">Sauvegarde reussie</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 sm:px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'}`}>
                <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'entreprise' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom de l'entreprise</label>
                  <input type="text" defaultValue={entreprise.nom} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom commercial</label>
                  <input type="text" defaultValue={entreprise.nom_commercial} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <input type="email" defaultValue={entreprise.email} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telephone</label>
                  <input type="tel" defaultValue={entreprise.telephone} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Adresse</label>
                  <input type="text" defaultValue={entreprise.adresse} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                  <textarea rows={4} defaultValue={entreprise.description} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm resize-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Logo de l'entreprise</label>
                <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Logo actuel</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">PNG, JPG ou SVG. Max 2MB.</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center space-x-2 text-sm">
                    <Upload className="w-4 h-4" /><span>Changer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[
                { title: 'Notifications par email', desc: 'Recevoir les alertes par email', default: true },
                { title: 'Alertes de recrutement', desc: 'Nouvelles candidatures', default: true },
                { title: 'Rapports hebdomadaires', desc: 'Resume automatique chaque lundi', default: false },
                { title: 'Rappels de conges', desc: 'Rappel avant expiration', default: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{item.title}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={item.default} className="w-5 h-5 text-amber-600 rounded" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Complexite du mot de passe</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm">
                    <option>Elevee (12+ caracteres)</option>
                    <option>Moyenne (8+ caracteres)</option>
                    <option>Minimale (6 caracteres)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Duree de session (minutes)</label>
                  <input type="number" defaultValue="120" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm" />
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">Authentification 2FA</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Pour tous les administrateurs</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-amber-600 rounded" />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Theme</label>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <button className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl border-2 border-amber-500 text-center">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Clair</p>
                  </button>
                  <button className="p-4 bg-slate-800 rounded-xl border-2 border-slate-600 text-center">
                    <p className="font-semibold text-white text-sm">Sombre</p>
                  </button>
                  <button className="p-4 bg-gradient-to-br from-slate-100 to-slate-800 rounded-xl border-2 border-slate-400 text-center">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Auto</p>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Couleur principale</label>
                <div className="flex space-x-3">
                  {['#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899'].map(color => (
                    <button key={color} className="w-10 h-10 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform" style={{ backgroundColor: color }}></button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={handleSave} className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold flex items-center space-x-2 text-sm sm:text-base">
            <Save className="w-5 h-5" /><span>Sauvegarder</span>
          </button>
        </div>
      </div>
    </div>
  )
}