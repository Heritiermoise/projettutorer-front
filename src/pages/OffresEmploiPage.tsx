import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Search, MapPin, DollarSign, Calendar, Users, Building2, Clock, Eye } from 'lucide-react'
import { offreAPI, entrepriseAPI } from '../services/api'
import { useEffect } from 'react'

export const OffresEmploiPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [offres, setOffres] = useState<any[]>([])
  const [entreprises, setEntreprises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [offresResponse, entreprisesResponse] = await Promise.all([
          offreAPI.getPubliees(),
          entrepriseAPI.getAll(),
        ])
        setOffres(offresResponse.offres || offresResponse || [])
        setEntreprises(entreprisesResponse.entreprises || entreprisesResponse || [])
      } catch {
        setOffres([])
        setEntreprises([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filteredOffres = offres.filter(offre => {
    const matchesSearch = offre.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         offre.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30 dark:from-slate-900 dark:to-primary-900/10">
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">RH Pro</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Offres d'emploi</p>
              </div>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/login" className="px-4 py-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg font-semibold transition-colors text-sm sm:text-base">
                Connexion
              </Link>
              <Link to="/register" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors text-sm sm:text-base">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Trouvez votre emploi de reve
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8">
            {offres.length} offres d'emploi disponibles
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un poste, une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg focus:ring-2 focus:ring-primary-500 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Offres recentes</h2>
          <span className="text-slate-600 dark:text-slate-400">
            {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Chargement des offres réelles...</div>
        ) : filteredOffres.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">Aucune offre ne correspond a votre recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffres.map(offre => {
              const entreprise = entreprises.find(e => e.id_entreprise === offre.id_entreprise)
              return (
                <div key={offre.id_offre} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                      {offre.statut}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                    {offre.titre}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {offre.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <Link to={`/entreprise/${entreprise?.code_entreprise}`} className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 font-semibold">
                      <Building2 className="w-4 h-4" />
                      <span>{entreprise?.nom || 'Entreprise'}</span>
                    </Link>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span>{entreprise?.adresse || 'Localisation'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-primary-600">${offre.salaire_base}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{offre.date_limite}</span>
                    </span>
                    <Link to={`/offres/${offre.id_offre}`} className="text-primary-600 font-semibold text-sm flex items-center space-x-1 hover:text-primary-700">
                      <Eye className="w-4 h-4" />
                      <span>Voir</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2026 RH Pro. Tous droits reserves.</p>
        </div>
      </footer>
    </div>
  )
}