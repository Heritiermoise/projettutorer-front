import { useState } from 'react'
import { BookOpen, Search, Plus, Eye, Edit, ThumbsUp, MessageCircle, Calendar, Tag } from 'lucide-react'
import { mockArticlesKB, mockCategoriesKB } from '../../data/phase7Data'
import type { ArticleKnowledgeBase } from '../../data/phase7Data'

export const DirecteurKnowledgeBasePage = () => {
  const [articles] = useState<ArticleKnowledgeBase[]>(mockArticlesKB)
  const categories = mockCategoriesKB
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategorie, setFilterCategorie] = useState('all')
  const [selectedArticle, setSelectedArticle] = useState<ArticleKnowledgeBase | null>(null)

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.titre.toLowerCase().includes(searchTerm.toLowerCase()) || a.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategorie = filterCategorie === 'all' || a.categorie === filterCategorie
    return matchesSearch && matchesCategorie
  })

  const stats = {
    total: articles.length,
    publies: articles.filter(a => a.statut === 'Publie').length,
    totalVues: articles.reduce((sum, a) => sum + a.vues, 0),
    totalLikes: articles.reduce((sum, a) => sum + a.likes, 0),
    categories: categories.length
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Base de Connaissances</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Documentation et savoirs de l'entreprise</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
          <Plus className="w-5 h-5" />
          <span>Nouvel article</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Articles', value: stats.total, icon: BookOpen, color: 'from-blue-500 to-cyan-600' },
          { label: 'Publies', value: stats.publies, icon: BookOpen, color: 'from-green-500 to-emerald-600' },
          { label: 'Vues totales', value: stats.totalVues, icon: Eye, color: 'from-amber-500 to-orange-600' },
          { label: 'Likes', value: stats.totalLikes, icon: ThumbsUp, color: 'from-pink-500 to-rose-600' },
          { label: 'Categories', value: stats.categories, icon: Tag, color: 'from-purple-500 to-pink-600' }
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
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setFilterCategorie(cat.nom)} className={`p-4 rounded-xl border-2 transition-all ${filterCategorie === cat.nom ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}>
              <div className="text-3xl mb-2">{cat.icone}</div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">{cat.nom}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{cat.nombre_articles} articles</p>
            </button>
          ))}
          {filterCategorie !== 'all' && (
            <button onClick={() => setFilterCategorie('all')} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-amber-300">
              <div className="text-3xl mb-2">📚</div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">Toutes</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Voir tout</p>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Rechercher un article ou un tag..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map(article => (
            <div key={article.id} onClick={() => setSelectedArticle(article)} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                      {article.categorie}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{article.date_publication}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{article.titre}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{article.contenu}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-600 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                    <Eye className="w-4 h-4" />
                    <span>{article.vues}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{article.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>{article.commentaires}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Par {article.auteur}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedArticle.titre}</h3>
              <button onClick={() => setSelectedArticle(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">X</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                <span>Par {selectedArticle.auteur}</span>
                <span>•</span>
                <span>{selectedArticle.date_publication}</span>
                <span>•</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                  {selectedArticle.categorie}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {selectedArticle.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedArticle.contenu}</p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-amber-600">
                    <ThumbsUp className="w-5 h-5" />
                    <span className="font-semibold">{selectedArticle.likes} likes</span>
                  </button>
                  <button className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-amber-600">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">{selectedArticle.commentaires} commentaires</span>
                  </button>
                </div>
                <button className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}