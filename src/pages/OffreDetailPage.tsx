import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Briefcase, MapPin, DollarSign, Calendar, Building2, ArrowLeft, FileText, X, Copy, LogIn, LoaderCircle, Mail, RefreshCw } from 'lucide-react'
import { offreAPI } from '../services/api'
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

type PublicCompany = {
  nom: string
  nom_commercial?: string | null
  description?: string | null
  created_at?: string | null
}

type PublicJobOffer = {
  titre: string
  description: string
  localisation: string
  salaire_base?: number | string | null
  date_limite?: string | null
  type_contrat?: string | null
  experience_requise?: string | null
  competences_requises?: string | null
  avantages?: string | null
  entreprise?: PublicCompany | null
}

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

  const [offre, setOffre] = useState<PublicJobOffer | null>(null)
  const [entreprise, setEntreprise] = useState<PublicCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submissionStartedAt, setSubmissionStartedAt] = useState<number | null>(null)
  const [applicationFeedback, setApplicationFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [candidateAccount, setCandidateAccount] = useState<{ email: string; temporary_password: string | null; is_new: boolean; mail_send_url?: string | null } | null>(null)
  const [mailStatus, setMailStatus] = useState<'idle' | 'pending' | 'sent' | 'failed'>('idle')
  const welcomeEmailsInProgress = useRef(new Set<string>())

  useEffect(() => {
    const load = async () => {
      try {
        const offreResponse = await offreAPI.getById(parseInt(id || '0'))
        const currentOffre = (offreResponse.offre || offreResponse) as PublicJobOffer
        setOffre(currentOffre)
        setEntreprise(currentOffre.entreprise || null)
      } catch {
        setOffre(null)
        setEntreprise(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const sendWelcomeEmail = async (account = candidateAccount, retry = false) => {
    if (!account?.mail_send_url || !account.temporary_password) return
    const key = account.mail_send_url
    if (!retry && welcomeEmailsInProgress.current.has(key)) return

    welcomeEmailsInProgress.current.add(key)
    setMailStatus('pending')
    try {
      await offreAPI.sendCandidateWelcomeEmail(key, account.temporary_password)
      setMailStatus('sent')
    } catch {
      welcomeEmailsInProgress.current.delete(key)
      setMailStatus('failed')
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 grid place-items-center text-slate-600 dark:text-slate-300">Chargement de l'offre...</div>
  }

  if (!offre) {
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
    if (submitting) return

    setSubmitting(true)
    setSubmissionStartedAt(Date.now())
    setApplicationFeedback(null)
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

      const response = await offreAPI.postuler(Number(id), candidatureData)
      setApplicationFeedback({ type: 'success', message: response.message || 'Votre candidature a été enregistrée. L’entreprise examinera votre dossier.' })
      setShowPostulationModal(false)
      setCandidateAccount(response.account || null)
      setMailStatus(response.account?.is_new ? 'pending' : 'idle')
      if (response.account?.is_new && response.account?.mail_send_url) {
        setTimeout(() => void sendWelcomeEmail(response.account), 0)
      }
      if (response.account?.token && response.account?.user) {
        localStorage.setItem('auth_token', response.account.token)
        localStorage.setItem('token', response.account.token)
        localStorage.setItem('user', JSON.stringify(response.account.user))
        window.dispatchEvent(new Event('rh-auth-changed'))
      }
      setFormData({ nom: '', post_nom: '', prenom: '', email: '', telephone: '', cv: null, lettre_motivation: '' })
    } catch (error) {
      setApplicationFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'La candidature n’a pas pu être envoyée. Vérifiez les informations saisies et réessayez.',
      })
    } finally {
      setSubmitting(false)
      setSubmissionStartedAt(null)
    }
  }

  const copyCredential = async (value: string) => {
    await navigator.clipboard.writeText(value)
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
      <section className="bg-gradient-to-r from-primary-600 to-primary-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{offre.titre}</h1>
              <p className="text-white/90 text-lg mb-4">{entreprise?.nom || 'Entreprise partenaire'}</p>
              <div className="flex flex-wrap gap-4 text-white/80">
                <span className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>{offre.localisation}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                    <span className="font-bold text-emerald-200">{money.format(Number(offre.salaire_base))}</span>
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
        {applicationFeedback && <div className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border border-white/40 p-4 shadow-xl backdrop-blur-2xl ${applicationFeedback.type === 'success' ? 'bg-emerald-500/15 text-emerald-950 shadow-emerald-950/10 dark:border-emerald-300/20 dark:bg-emerald-400/15 dark:text-emerald-100' : 'bg-red-500/15 text-red-950 shadow-red-950/10 dark:border-red-300/20 dark:bg-red-400/15 dark:text-red-100'}`} role="status">
          <div><p className="font-semibold">{applicationFeedback.type === 'success' ? 'Candidature enregistrée' : 'Envoi impossible'}</p><p className="mt-1 text-sm">{applicationFeedback.message}</p></div>
          <button type="button" onClick={() => setApplicationFeedback(null)} className="shrink-0 rounded-lg p-1 hover:bg-black/5" aria-label="Fermer le message"><X className="w-5 h-5" /></button>
        </div>}
        {candidateAccount && <div className="mb-6 border border-teal-200 bg-white dark:border-teal-800 dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-teal-700 px-5 py-4 text-white">
            <h2 className="text-lg font-bold">Votre espace candidat est prêt</h2>
            <p className="mt-1 text-sm text-teal-50">Conservez vos identifiants avant de consulter le suivi.</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-700">
              <div className="min-w-0"><p className="text-xs text-slate-500">E-mail</p><p className="truncate font-mono text-sm text-slate-900 dark:text-white">{candidateAccount.email}</p></div>
              <button type="button" onClick={() => copyCredential(candidateAccount.email)} className="p-2 text-slate-600 hover:text-teal-700" title="Copier l’e-mail"><Copy className="h-5 w-5" /></button>
            </div>
            {candidateAccount.temporary_password && <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-700">
              <div className="min-w-0"><p className="text-xs text-slate-500">Mot de passe temporaire</p><p className="break-all font-mono text-sm text-slate-900 dark:text-white">{candidateAccount.temporary_password}</p></div>
              <button type="button" onClick={() => copyCredential(candidateAccount.temporary_password || '')} className="p-2 text-slate-600 hover:text-teal-700" title="Copier le mot de passe"><Copy className="h-5 w-5" /></button>
            </div>}
            {candidateAccount.is_new && <div className={`flex items-center justify-between gap-3 rounded-md border p-3 text-sm ${mailStatus === 'failed' ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100' : mailStatus === 'sent' ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100' : 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100'}`}>
              <div className="flex items-center gap-2">
                {mailStatus === 'pending' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                <span>{mailStatus === 'sent' ? 'Identifiants envoyés par e-mail.' : mailStatus === 'failed' ? 'Échec de l’e-mail. Vos accès restent valides et copiables.' : 'Préparation de l’e-mail de bienvenue...'}</span>
              </div>
              {mailStatus === 'failed' && <button type="button" onClick={() => void sendWelcomeEmail(candidateAccount, true)} className="shrink-0 rounded-md p-2 hover:bg-amber-100 dark:hover:bg-amber-900/40" title="Renvoyer l’e-mail"><RefreshCw className="h-4 w-4" /></button>}
            </div>}
            <button type="button" onClick={() => navigate(candidateAccount.is_new ? '/dashboard/utilisateur' : '/login')} className="flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800">
              <LogIn className="h-5 w-5" /> {candidateAccount.is_new ? 'Consulter le suivi' : 'Se connecter à mon espace'}
            </button>
          </div>
        </div>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Description du poste</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{offre.description}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Profil recherché</h2>
              <div className="space-y-5">
                <div><h3 className="font-semibold text-slate-800 dark:text-white mb-2">Expérience requise</h3><p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{offre.experience_requise || 'Non précisée'}</p></div>
                <div><h3 className="font-semibold text-slate-800 dark:text-white mb-2">Compétences attendues</h3><p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{offre.competences_requises || 'Non précisées'}</p></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Avantages</h2>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{offre.avantages || 'Aucun avantage précisé.'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 sticky top-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">À propos de l'entreprise</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-500 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{entreprise?.nom || 'Entreprise partenaire'}</p>
                    {entreprise?.nom_commercial && <p className="text-sm text-slate-600 dark:text-slate-400">{entreprise.nom_commercial}</p>}
                  </div>
                </div>
                {entreprise?.description && <p className="text-sm text-slate-600 dark:text-slate-300">{entreprise.description}</p>}
                <div className="space-y-2 text-sm">
                  {offre.type_contrat && <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400"><FileText className="w-4 h-4" /><span>{offre.type_contrat}</span></div>}
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{offre.localisation}</span>
                  </div>
                  {entreprise?.created_at && <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Créée le {entreprise.created_at}</span>
                  </div>}
                </div>
              </div>
              <button
                onClick={() => setShowPostulationModal(true)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-primary-600 to-primary-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Postuler maintenant
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Informations essentielles</h3>
              <dl className="space-y-4 text-sm">
                <div><dt className="text-slate-500 dark:text-slate-400">Type de contrat</dt><dd className="mt-1 font-semibold text-slate-800 dark:text-white">{offre.type_contrat || 'Non précisé'}</dd></div>
                <div><dt className="text-slate-500 dark:text-slate-400">Lieu de travail</dt><dd className="mt-1 font-semibold text-slate-800 dark:text-white">{offre.localisation || 'Non précisé'}</dd></div>
                <div><dt className="text-slate-500 dark:text-slate-400">Rémunération</dt><dd className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">{offre.salaire_base !== null && offre.salaire_base !== undefined ? `$${Number(offre.salaire_base).toLocaleString('en-US')}` : 'À négocier'}</dd></div>
                  <div><dt className="text-slate-500 dark:text-slate-400">Rémunération</dt><dd className="mt-1 font-semibold text-primary-700 dark:text-primary-300">{offre.salaire_base !== null && offre.salaire_base !== undefined ? money.format(Number(offre.salaire_base)) : 'À négocier'}</dd></div>
                <div><dt className="text-slate-500 dark:text-slate-400">Date limite de candidature</dt><dd className="mt-1 font-semibold text-slate-800 dark:text-white">{offre.date_limite || 'Non précisée'}</dd></div>
              </dl>
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
                <p className="text-sm text-primary-600 dark:text-primary-300">{entreprise?.nom || 'Entreprise partenaire'}</p>
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
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? `Envoi en cours${submissionStartedAt ? '...' : ''}` : 'Envoyer ma candidature'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}