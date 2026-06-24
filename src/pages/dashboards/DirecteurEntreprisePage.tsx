import { useState } from 'react'
import { Building2, Mail, Phone, MapPin, Calendar, Users, Briefcase, Edit, Save, Upload, Globe, Award, TrendingUp, Shield, CheckCircle2, FileText } from 'lucide-react'
import { mockEntreprises, mockEmployes, mockServices, mockPostes, mockContrats } from '../../data/mockData'

export const DirecteurEntreprisePage = () => {
  const [isEditing, setIsEditing] = useState(false)
  
  const entreprise = mockEntreprises[0] || {
    nom: 'Mon Entreprise',
    nom_commercial: 'Commercial',
    email: 'contact@entreprise.com',
    telephone: '+243 000 000 000',
    adresse: 'Adresse non definie',
    description: 'Description non disponible',
    code_entreprise: 'ENT-001',
    created_at: '2026-01-01',
    statut: 'Actif',
  }

  const stats = {
    totalEmployes: mockEmployes.length,
    totalServices: mockServices.length,
    totalPostes: mockPostes.length,
    contratsActifs: mockContrats.filter(c => c.id_entreprise === 1).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Mon Entreprise</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Informations completes de votre entreprise</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          <span>{isEditing ? 'Sauvegarder' : 'Modifier'}</span>
        </button>
      </div>

      {/* Banniere entreprise */}
      <div className="relative h-40 sm:h-56 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex items-end space-x-4 sm:space-x-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-800 flex-shrink-0">
              <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{entreprise.nom}</h2>
              <p className="text-white/80 text-sm sm:text-base">{entreprise.nom_commercial}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-white/90">
                <span className="flex items-center space-x-1"><MapPin className="w-4 h-4" /><span>{entreprise.adresse}</span></span>
                <span className="flex items-center space-x-1"><Mail className="w-4 h-4" /><span>{entreprise.email}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { icon: Users, label: 'Employes', value: stats.totalEmployes, color: 'from-primary-500 to-purple-600' },
          { icon: Briefcase, label: 'Services', value: stats.totalServices, color: 'from-accent-500 to-emerald-600' },
          { icon: Award, label: 'Postes', value: stats.totalPostes, color: 'from-amber-500 to-orange-600' },
          { icon: FileText, label: 'Contrats', value: stats.contratsActifs, color: 'from-pink-500 to-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Informations detaillees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Informations generales</h3>
          <div className="space-y-4">
            {[
              { icon: Building2, label: 'Nom officiel', value: entreprise.nom },
              { icon: Briefcase, label: 'Nom commercial', value: entreprise.nom_commercial },
              { icon: Globe, label: 'Code entreprise', value: entreprise.code_entreprise },
              { icon: Calendar, label: 'Date de creation', value: entreprise.created_at },
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <item.icon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                  {isEditing ? (
                    <input type="text" defaultValue={item.value} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm" />
                  ) : (
                    <p className="font-semibold text-slate-800 dark:text-white truncate">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Contact</h3>
          <div className="space-y-4">
            {[
              { icon: Mail, label: 'Email', value: entreprise.email },
              { icon: Phone, label: 'Telephone', value: entreprise.telephone },
              { icon: MapPin, label: 'Adresse', value: entreprise.adresse },
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <item.icon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                  {isEditing ? (
                    <input type="text" defaultValue={item.value} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm" />
                  ) : (
                    <p className="font-semibold text-slate-800 dark:text-white truncate">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Description</p>
              {isEditing ? (
                <textarea defaultValue={entreprise.description} rows={3} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm" />
              ) : (
                <p className="text-slate-800 dark:text-white">{entreprise.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statut et conformite */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Statut et conformite</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Shield, label: 'Statut', value: entreprise.statut, color: 'green' },
            { icon: CheckCircle2, label: 'Conformite RGPD', value: 'Conforme', color: 'green' },
            { icon: TrendingUp, label: 'Score de performance', value: '92/100', color: 'amber' },
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                <item.icon className={`w-5 h-5 ${item.color === 'green' ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="font-semibold text-slate-800 dark:text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo upload */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Logo de l'entreprise</h3>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <Building2 className="w-10 h-10 text-amber-600" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold text-slate-800 dark:text-white">Logo actuel</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">PNG, JPG ou SVG. Max 2MB.</p>
          </div>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center space-x-2">
            <Upload className="w-4 h-4" /><span>Changer le logo</span>
          </button>
        </div>
      </div>
    </div>
  )
}