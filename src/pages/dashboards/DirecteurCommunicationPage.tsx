import { useState } from 'react'
import { MessageSquare, Heart, MessageCircle, Share2, Plus, Search, Filter, Star, X, Users, Calendar, Bell } from 'lucide-react'
import { mockAnnonces } from '../../data/phase2Data'
import type { Annonce } from '../../data/phase2Data'

export const DirecteurCommunicationPage = () => {
  const [annonces, setAnnonces] = useState<Annonce[]>(mockAnnonces)
  const [filterCategorie, setFilterCategorie] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ titre: '', contenu: '', categorie: 'General' })

  const filteredAnnonces = annonces.filter(a => 
    filterCategorie === 'all' || a.categorie === filterCategorie
  )

  const stats = {
    total: annonces.length,
    importants: annonces.filter(a => a.important).length,
    totalLikes: annonces.reduce((sum, a) => sum + a.likes, 0),
    totalCommentaires: annonces.reduce((sum, a) => sum + a.commentaires, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAnnonce: Annonce = {
      id: Date.now(),
      ...formData,
      auteur: 'Moise Vita (DG)',
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      commentaires: 0,
      important: false
    }
    setAnnonces([newAnnonce, ...annonces])
    setShowCreateModal(false)
    setFormData({ titre: '', contenu: '', categorie: 'General' })
  }

  const handleLike = (id: number) => {
    setAnnonces(annonces.map(a => a.id === id ? { ...a, likes: a.likes + 1 } : a))
  }

  const getCategorieColor = (categorie: string) => {
    const colors: Record<string, string> = {
      'General': 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      'RH': 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
      'Technique': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Evenement': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
    }
    return colors[categorie] || colors['General']
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Communication Interne</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Annonces et actualites de l'entreprise</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouvelle annonce</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Annonces', value: stats.total, icon: MessageSquare, color: 'from-amber-500 to-orange-600' },
          { label: 'Importantes', value: stats.importants, icon: Star, color: 'from-red-500 to-pink-600' },
          { label: 'Reactions', value: stats.totalLikes, icon: Heart, color: 'from-pink-500 to-rose-600' },
          { label: 'Commentaires', value: stats.totalCommentaires, icon: MessageCircle, color: 'from-blue-500 to-cyan-600' }
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
          <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
            <option value="all">Toutes les categories</option>
            <option value="General">General</option>
            <option value="RH">RH</option>
            <option value="Technique">Technique</option>
            <option value="Evenement">Evenement</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredAnnonces.map(annonce => (
          <div key={annonce.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border-2 transition-all ${annonce.important ? 'border-amber-300 dark:border-amber-700' : 'border-slate-200 dark:border-slate-700'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{annonce.auteur[0]}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{annonce.auteur}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{annonce.date}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategorieColor(annonce.categorie)}`}>
                  {annonce.categorie}
                </span>
                {annonce.important && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{annonce.titre}</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{annonce.contenu}</p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-4">
                <button onClick={() => handleLike(annonce.id)} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="font-semibold">{annonce.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">{annonce.commentaires}</span>
                </button>
                <button className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="font-semibold">Partager</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Nouvelle annonce</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titre</label>
                <input type="text" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Categorie</label>
                <select value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="General">General</option>
                  <option value="RH">RH</option>
                  <option value="Technique">Technique</option>
                  <option value="Evenement">Evenement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contenu</label>
                <textarea value={formData.contenu} onChange={(e) => setFormData({...formData, contenu: e.target.value})} rows={6} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" required />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700">Publier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}