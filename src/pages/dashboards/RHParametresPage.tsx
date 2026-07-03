import { useState } from 'react'
import { Settings, Save, Bell, Shield, Palette, Mail, CheckCircle2, Users, Briefcase, Calendar } from 'lucide-react'

export const RHParametresPage = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'appearance' | 'rh'>('general')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'rh', label: 'Configuration RH', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Securite', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Parametres RH</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Configuration du module RH</p>
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex items-center space-x-2 px-4 sm:px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-600 dark:text-slate-400 hover:text-primary-600'}`}>
                <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom du service RH</label>
                  <input type="text" defaultValue="Service Ressources Humaines" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email du service</label>
                  <input type="email" defaultValue="rh@entreprise.com" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Fuseau horaire</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
                    <option>Africa/Lubumbashi (UTC+2)</option>
                    <option>Africa/Kinshasa (UTC+1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Langue</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
                    <option>Francais</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rh' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jours de conge annuel par defaut</label>
                  <input type="number" defaultValue="30" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Heures de travail par jour</label>
                  <input type="number" defaultValue="8" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Heure d'arrivee</label>
                  <input type="time" defaultValue="08:00" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Heure de depart</label>
                  <input type="time" defaultValue="17:00" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">Approbation automatique des conges</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Pour les conges de moins de 3 jours</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-primary-600 rounded" />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">Generation automatique des paies</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Le dernier jour du mois</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded" />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[
                { title: 'Nouvelles demandes de conge', desc: 'Notification immediate', default: true },
                { title: 'Contrats expirant', desc: '30 jours avant expiration', default: true },
                { title: 'Retards signales', desc: 'Rapport quotidien', default: true },
                { title: 'Nouveaux candidats', desc: 'Chaque postulation', default: true },
                { title: 'Rapports hebdomadaires', desc: 'Resume chaque lundi', default: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{item.title}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={item.default} className="w-5 h-5 text-primary-600 rounded" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Complexite du mot de passe</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
                    <option>Elevee (12+ caracteres)</option>
                    <option>Moyenne (8+ caracteres)</option>
                    <option>Minimale (6 caracteres)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Duree de session (minutes)</label>
                  <input type="number" defaultValue="120" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">Authentification 2FA</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Pour le compte RH</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded" />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Theme</label>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <button className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl border-2 border-primary-500 text-center">
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
                  {['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'].map(color => (
                    <button key={color} className="w-10 h-10 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform" style={{ backgroundColor: color }}></button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={handleSave} className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold flex items-center space-x-2 text-sm sm:text-base">
            <Save className="w-5 h-5" /><span>Sauvegarder</span>
          </button>
        </div>
      </div>
    </div>
  )
}