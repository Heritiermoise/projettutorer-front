import { useState } from 'react'
import { Settings, Save, Bell, Shield, Palette, User, Mail, CheckCircle2, Lock } from 'lucide-react'
import { mockEmployes } from '../../data/mockData'

export const EmployeParametresPage = () => {
  const [activeTab, setActiveTab] = useState<'profil' | 'notifications' | 'security' | 'appearance'>('profil')
  const [saved, setSaved] = useState(false)

  const user = mockEmployes[3] || { prenom: 'Marie', nom: 'Tshimanga', email: 'employe@demo.com', telephone: '+243 944 567 890', adresse: 'Kinshasa' }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'profil', label: 'Mon Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Securite', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">Mes Parametres</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Personnalisation de votre espace</p>
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 sm:px-6 py-4 font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-secondary-600 border-b-2 border-secondary-600' : 'text-slate-600 dark:text-slate-400 hover:text-secondary-600'}`}>
                <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'profil' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="w-24 h-24 bg-gradient-to-br from-secondary-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{user.prenom[0]}</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user.prenom} {user.nom}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                  <button className="mt-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 text-sm">Changer la photo</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Prenom</label>
                  <input type="text" defaultValue={user.prenom} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom</label>
                  <input type="text" defaultValue={user.nom} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <input type="email" defaultValue={user.email} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telephone</label>
                  <input type="tel" defaultValue={user.telephone} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Adresse</label>
                  <input type="text" defaultValue={user.adresse} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[
                { title: 'Nouvelles fiches de paie', desc: 'Notification quand une nouvelle paie est disponible', default: true },
                { title: 'Statut de mes conges', desc: 'Mise a jour sur mes demandes de conge', default: true },
                { title: 'Rappels de conges', desc: 'Rappel avant expiration de mes conges', default: true },
                { title: 'Messages du service RH', desc: 'Nouveaux messages recus', default: true },
                { title: 'Rapports mensuels', desc: 'Resume mensuel de mon activite', default: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{item.title}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={item.default} className="w-5 h-5 text-secondary-600 rounded" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-bold text-slate-800 dark:text-white mb-4">Changer le mot de passe</h4>
                <div className="space-y-3">
                  <input type="password" placeholder="Mot de passe actuel" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm" />
                  <input type="password" placeholder="Nouveau mot de passe" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm" />
                  <input type="password" placeholder="Confirmer le nouveau mot de passe" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-secondary-500 text-sm" />
                  <button className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 text-sm">Changer le mot de passe</button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">Authentification 2FA</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Securite additionnelle</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-secondary-600 rounded" />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">Sessions actives</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">2 appareils connectes</p>
                </div>
                <button className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200">Deconnecter tout</button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Theme</label>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <button className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl border-2 border-secondary-500 text-center">
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
                  {['#f97316', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899'].map(color => (
                    <button key={color} className="w-10 h-10 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform" style={{ backgroundColor: color }}></button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Taille de police</label>
                <div className="flex space-x-3">
                  {['Petite', 'Normale', 'Grande'].map((size, i) => (
                    <button key={size} className={`flex-1 py-3 rounded-xl border-2 ${i === 1 ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20' : 'border-slate-200 dark:border-slate-600'} text-sm font-semibold`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={handleSave} className="px-6 py-3 bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 font-semibold flex items-center space-x-2 text-sm sm:text-base">
            <Save className="w-5 h-5" /><span>Sauvegarder</span>
          </button>
        </div>
      </div>
    </div>
  )
}