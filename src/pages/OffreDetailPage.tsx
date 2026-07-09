import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Briefcase, MapPin, DollarSign, Calendar, Building2, ArrowLeft, CheckCircle2, Clock, Users, FileText, X } from 'lucide-react'
import { useEffect } from 'react'
import { offreAPI, entrepriseAPI } from '../services/api'

export const OffreDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showPostulationModal, setShowPostulationModal] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    post_nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cv: null as File | null,
    lettre_motivation: '',
  })

  const [offre, setOffre] = useState<any>(null)
  const [entreprise, setEntreprise] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const offreResponse = await offreAPI.getById(parseInt(id || '0'))
        const currentOffre = offreResponse.offre || offreResponse
        setOffre(currentOffre)

        const entrepriseResponse = await entrepriseAPI.getById(currentOffre.id_entreprise)
        setEntreprise(entrepriseResponse.entreprise || entrepriseResponse)
      } catch {
        setOffre(null)
        setEntreprise(null)
      }
    }

    load()
  }, [id])

  if (!offre || !entreprise) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Offre non trouvée</h1>
          <Link to="/offres" className="text-primary-600 hover:text-primary-700">Retour aux offres</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const candidatureData = new FormData()
      candidatureData.append('nom', formData.nom)
      candidatureData.append('post_nom', formData.post_nom)
      candidatureData.append('prenom', formData.prenom)
      candidatureData.append('email', formData.email)
      candidatureData.append('telephone', formData.telephone)
      candidatureData.append('lettre_motivation', formData.lettre_motivation)

      if (formData.cv) {
        candidatureData.append('cv', formData.cv)
      }

      await offreAPI.postuler(Number(id), candidatureData)
      alert('Votre postulation a été envoyée avec succès ! Vous serez contacté pour un entretien.')
      setShowPostulationModal(false)
      navigate('/offres')
    } catch {
      alert('Impossible de soumettre la candidature pour le moment.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/offres" className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary-600">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour aux offres</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/login" className="px-4 py-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg font-semibold">
                Connexion
              </Link>
              <Link to="/register" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{offre.titre}</h1>
              <p className="text-white/90 text-lg mb-4">{entreprise.nom}</p>
              <div className="flex flex-wrap gap-4 text-white/80">
                <span className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>{entreprise.adresse}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold">${offre.salaire_base}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Date limite: {offre.date_limite}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Description du poste</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{offre.description}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Profil recherché</h2>
              <ul className="space-y-3">
                {[
                  'Expérience significative dans le domaine',
                  'Maîtrise des outils et technologies requis',
                  'Capacité à travailler en équipe',
                  'Bonnes compétences en communication',
                  'Autonomie et sens des responsabilités',
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Avantages</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: DollarSign, text: 'Salaire compétitif' },
                  { icon: Calendar, text: 'Congés payés' },
                  { icon: Users, text: 'Travail en équipe' },
                  { icon: FileText, text: 'Formation continue' },
                ].map((avantage, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <avantage.icon className="w-5 h-5 text-primary-600" />
                    <span className="text-slate-700 dark:text-slate-300">{avantage.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 sticky top-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">À propos de l'entreprise</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{entreprise.nom}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{entreprise.nom_commercial}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{entreprise.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{entreprise.adresse}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Créée le {entreprise.created_at}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPostulationModal(true)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Postuler maintenant
              </button>
            </div>

            <div className="bg-warm-50 dark:bg-warm-900/20 border border-warm-200 dark:border-warm-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-warm-800 dark:text-warm-200 mb-2">Processus de recrutement</h3>
              <ol className="space-y-3 text-sm text-warm-700 dark:text-warm-300">
                <li className="flex items-start space-x-2">
                  <span className="font-bold">1.</span>
                  <span>Soumission de votre candidature</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold">2.</span>
                  <span>Examen de votre profil par notre équipe RH</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold">3.</span>
                  <span>Entretien téléphonique ou visio</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold">4.</span>
                  <span>Entretien technique avec le manager</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold">5.</span>
                  <span>Décision finale et offre d'emploi</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de postulation */}
      {showPostulationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Postuler à cette offre</h3>
              <button onClick={() => setShowPostulationModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <p className="font-semibold text-primary-800 dark:text-primary-200">{offre.titre}</p>
                <p className="text-sm text-primary-600 dark:text-primary-300">{entreprise.nom}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom *</label>
                  <input type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Post-nom</label>
                  <input type="text" value={formData.post_nom} onChange={(e) => setFormData({...formData, post_nom: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Prénom *</label>
                  <input type="text" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Téléphone *</label>
                  <input type="tel" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">CV (PDF) *</label>
                  <input type="file" accept=".pdf" onChange={(e) => setFormData({...formData, cv: e.target.files?.[0] || null})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lettre de motivation *</label>
                  <textarea value={formData.lettre_motivation} onChange={(e) => setFormData({...formData, lettre_motivation: e.target.value})} rows={6} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Expliquez pourquoi vous êtes le candidat idéal..." required />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowPostulationModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Envoyer ma candidature</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}