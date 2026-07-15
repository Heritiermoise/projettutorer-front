import { useState, useEffect } from 'react'
import { PublicNavbar } from '../components/PublicNavbar'
import { Link } from 'react-router-dom'
import { Building2, Users, Briefcase, ArrowRight, CheckCircle2, Sparkles, Crown, Star, Zap, Shield, Calendar, MapPin } from 'lucide-react'

export const HomePage = () => {
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Nouvel état pour stocker vos vraies statistiques de la BDD
  const [stats, setStats] = useState({
    utilisateurs: 0,
    entreprises: 0,
    offres_actives: 0
  })

  // Récupération de toutes les données au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. Récupération des offres d'emploi
        const responseOffres = await fetch('http://localhost:8000/api/offres-accueil')
        const resultOffres = await responseOffres.json()
        if (resultOffres.success) {
          setOffres(resultOffres.data)
        }

        // 2. Récupération des statistiques réelles (Route : /stats-accueil)
        const responseStats = await fetch('http://localhost:8000/api/stats-accueil')
        const resultStats = await responseStats.json()
        if (resultStats.success) {
          setStats(resultStats.data)
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données de l'accueil :", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-accent-900/10">
      <PublicNavbar />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-accent-200/30 dark:bg-accent-900/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg border border-primary-200 dark:border-primary-800 mb-6">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-bold text-primary-700 dark:text-primary-300">Nouvelle génération de gestion RH</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="text-slate-800 dark:text-white">Gerez votre</span>
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-accent-600 bg-clip-text text-transparent">entreprise</span>
                <br />
                <span className="text-slate-800 dark:text-white">intelligemment</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
                La plateforme tout-en-un qui révolutionne la gestion des ressources humaines. Recrutement, contrats, paie, congés.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 via-purple-600 to-accent-600 hover:from-primary-700 hover:via-purple-700 hover:to-accent-700 text-white font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
                  <span>Démarrer maintenant</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/offres" className="inline-flex items-center justify-center px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-full shadow-xl hover:shadow-2xl border-2 border-slate-200 dark:border-slate-700 transition-all">
                  <Briefcase className="mr-2 w-5 h-5" />
                  <span>Voir les offres</span>
                </Link>
              </div>

              {/* --- STATISTIQUES CONNECTÉES À LA BDD --- */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <Users className="w-6 h-6 text-primary-500 mx-auto lg:mx-0 mb-2" />
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">
                    {loading ? "..." : stats.utilisateurs}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Utilisateurs</div>
                </div>
                <div className="text-center lg:text-left">
                  <Building2 className="w-6 h-6 text-primary-500 mx-auto lg:mx-0 mb-2" />
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">
                    {loading ? "..." : stats.entreprises}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Entreprises</div>
                </div>
                <div className="text-center lg:text-left">
                  <Briefcase className="w-6 h-6 text-primary-500 mx-auto lg:mx-0 mb-2" />
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">
                    {loading ? "..." : stats.offres_actives}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Offres Actives</div>
                </div>
              </div>
            </div>

            {/* --- DASHBOARD PREVIEW --- */}
            <div className="relative hidden lg:block">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-auto">Dashboard RH Pro</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Effectifs ce mois</div>
                    <div className="text-2xl font-bold text-primary-600">+24</div>
                  </div>
                  <div className="flex items-end space-x-2 h-32">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                      <div key={i} style={{ height: height + '%' }} className="flex-1 bg-gradient-to-t from-primary-500 to-accent-400 rounded-t-lg opacity-80"></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gradient-to-br from-primary-50 to-purple-100/50 dark:from-primary-900/30 dark:to-purple-900/30 p-4 rounded-2xl border border-primary-200 dark:border-primary-800">
                      <div className="text-xs font-semibold text-primary-600 dark:text-primary-300">Contrats actifs</div>
                      <div className="text-2xl font-bold text-primary-700 dark:text-primary-200">142</div>
                    </div>
                    <div className="bg-gradient-to-br from-accent-50 to-emerald-100/50 dark:from-accent-900/30 dark:to-emerald-900/30 p-4 rounded-2xl border border-accent-200 dark:border-accent-800">
                      <div className="text-xs font-semibold text-accent-600 dark:text-accent-300">Nouveaux</div>
                      <div className="text-2xl font-bold text-accent-700 dark:text-accent-200">12</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION DES DERNIÈRES OFFRES D'EMPLOI --- */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
              Dernières opportunités publiées
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Rejoignez l'une des entreprises partenaires de la plateforme RH Pro. Vos compétences méritent le meilleur cadre.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : offres.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400">Aucune offre d'emploi n'est disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offres.map((offre) => (
                <div 
                  key={offre.id || offre.id_offre} 
                  className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full">
                        {offre.type_contrat || "CDI / CDD"}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {new Date(offre.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1 mb-2">
                      {offre.titre || offre.poste}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4">
                      {offre.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4 flex items-center justify-between">
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                      <span>{offre.lieu || "France / Télétravail"}</span>
                    </div>
                    
                    <Link 
                      to={`/offres/${offre.id || offre.id_offre}`} 
                      className="inline-flex items-center text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      <span>Voir l'offre</span>
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/offres" className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-full transition-all">
              <span>Parcourir toutes les offres</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- SECTION CREATION D'ENTREPRISE --- */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-5 py-2.5 rounded-full shadow-lg border border-amber-200 dark:border-amber-800 mb-6">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Devenez propriétaire d'entreprise</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
              Créez votre entreprise en
              <br />
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">quelques minutes</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Lancez votre entreprise et devenez automatiquement Directeur. Gérez votre équipe, publiez des offres d'emploi et développez votre activité.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Zap, title: "Création rapide", desc: "Formulaire simple et intuitif", color: "from-amber-500 to-orange-500" },
              { icon: Shield, title: "Sécurisé", desc: "Données protégées et chiffrées", color: "from-orange-500 to-red-500" },
              { icon: Star, title: "Support dédié", desc: "Accompagnement personnalisé", color: "from-red-500 to-pink-500" },
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-xl mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/entreprise/inscription" className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-amber-500 via-orange-50 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1">
              <Crown className="mr-3 w-6 h-6" />
              <span>Créer mon entreprise maintenant</span>
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Gratuit • Sans engagement • Configuration immédiate
            </p>
          </div>
        </div>
      </section>

      {/* --- AUTRES FONCTIONNALITES --- */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
              Toutes les fonctionnalités
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-accent-600 bg-clip-text text-transparent">dont vous avez besoin</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Briefcase, title: "Recrutement", desc: "Publiez des offres, recevez les candidatures, planifiez des entretiens.", color: "from-primary-500 to-purple-600" },
              { icon: CheckCircle2, title: "Contrats", desc: "Créez, signez et archivez tous vos contrats avec renouvellement automatique.", color: "from-accent-500 to-emerald-600" },
              { icon: Users, title: "Employés", desc: "Gestion complète des employés, services et postes de votre entreprise.", color: "from-secondary-500 to-orange-600" },
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-xl mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">RH Pro</span>
                <p className="text-xs text-slate-400">Enterprise Suite</p>
              </div>
            </div>
            <div className="text-sm text-slate-400">© 2026 RH Pro. Tous droits réservés. Projet L3.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}