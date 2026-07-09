import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2, Mail, Lock, User, Phone, MapPin, ShieldCheck, Building2, Briefcase } from 'lucide-react'
import { PublicNavbar } from '../components/PublicNavbar'
import { Toast } from '../components/ui/Toast'
import { invitationAPI } from '../services/api'
import type { ChangeEvent, FormEvent } from 'react'

export const InvitationAcceptPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [invitation, setInvitation] = useState<any>(null)
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    adresse: '',
    password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    if (!token) {
      setError('Lien d\'invitation invalide.')
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const response = await invitationAPI.getByToken(token)
        setInvitation(response.invitation || response)
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Impossible de charger cette invitation.'
        setError(message)
        setToast({ type: 'error', message })
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!token || submitting) {
      return
    }

    if (formData.password !== formData.password_confirmation) {
      const message = 'Les mots de passe ne correspondent pas.'
      setToast({ type: 'error', message })
      setError(message)
      return
    }

    setSubmitting(true)
    setError('')
    setToast({ type: 'info', message: 'Activation du compte en cours...' })

    try {
      await invitationAPI.accept(token, formData)
      setToast({ type: 'success', message: 'Compte activé avec succès. Vous pouvez maintenant vous connecter.' })
      setTimeout(() => navigate('/login?invitation=accepted'), 2200)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Impossible de finaliser l\'invitation.'
      setError(message)
      setToast({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  const companyName = invitation?.company_name || 'votre entreprise'
  const roleName = invitation?.role_name || 'Employé'
  const serviceName = invitation?.department_name || 'Administration'
  const posteName = invitation?.poste_name || 'Poste'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/40 to-accent-50/30 dark:from-slate-950 dark:via-primary-950/10 dark:to-accent-950/10">
      <PublicNavbar />

      <div className="relative overflow-hidden px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute left-0 top-32 h-64 w-64 rounded-full bg-warm-400/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-200">
              <ShieldCheck className="h-4 w-4" />
              Invitation sécurisée
            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Rejoindre {companyName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              Ce lien vous permet d'activer votre compte et de rejoindre l'entreprise avec les accès configurés par votre responsable RH.
            </p>

            {loading && (
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                Chargement de l'invitation...
              </div>
            )}

            {error && !loading && (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Invitation indisponible</p>
                    <p className="mt-1 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && invitation && (
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Mail className="h-4 w-4 text-primary-600" />
                      Email invité
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{invitation.email}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Building2 className="h-4 w-4 text-primary-600" />
                      Entreprise
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{companyName}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Briefcase className="h-4 w-4 text-primary-600" />
                      Service / poste
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{serviceName} · {posteName}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <ShieldCheck className="h-4 w-4 text-primary-600" />
                      Rôle
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{roleName}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Prénom *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Nom *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Adresse</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Mot de passe *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmation *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-3 font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Activer mon compte
                </button>
              </form>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ce que ce lien permet</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p>• Vérifier que l'invitation correspond bien à votre adresse email.</p>
              <p>• Créer un mot de passe sécurisé pour votre compte.</p>
              <p>• Finaliser l'activation sans passer par un formulaire interne non sécurisé.</p>
              <p>• Recevoir un accès validé uniquement si l'invitation est encore active.</p>
            </div>

            <div className="mt-8 rounded-2xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-900 dark:border-primary-900 dark:bg-primary-900/20 dark:text-primary-100">
              <p className="font-semibold">Expiration</p>
              <p className="mt-1">Le lien reste actif pendant 72 heures après son émission.</p>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
