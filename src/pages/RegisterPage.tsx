import { PublicNavbar } from '../components/PublicNavbar'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Lock, Eye, EyeOff, UserPlus, User, Phone, MapPin, Crown, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { authService } from '../services/authService'

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nom: '', post_nom: '', prenom: '', email: '', telephone: '', adresse: '',
    password: '', password_confirmation: '', role: 'utilisateur',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }

    try {
      const result = await authService.register({
        nom: formData.nom,
        post_nom: formData.post_nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
        statut: 'actif',
      })

      if (!result.success) {
        setError(result.message || 'Erreur lors de l\'inscription')
        return
      }

      if (formData.role === 'directeur') {
        localStorage.setItem('temp_user', JSON.stringify(result.user))
        navigate('/create-entreprise')
        return
      }

      setSuccess('Inscription reussie ! Vous pouvez maintenant vous connecter.')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-accent-50 dark:from-slate-900 dark:via-primary-900/10 dark:to-accent-900/10">
      <PublicNavbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-2xl mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-2">Creer un compte</h1>
            <p className="text-slate-600 dark:text-slate-300">Rejoignez RH Pro en quelques etapes</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
            {/* Info importante */}
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl flex items-start space-x-3">
              <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary-800 dark:text-primary-200">
                <strong>Choisissez votre type de compte :</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Utilisateur</strong> : Pour postuler aux offres et faire des demandes (validation par admin requise)</li>
                  <li><strong>Directeur</strong> : Pour creer et gerer votre entreprise</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-warm-50 dark:bg-warm-900/30 border border-warm-200 dark:border-warm-800 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-warm-600 dark:text-warm-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-warm-700 dark:text-warm-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-800 rounded-xl flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-accent-700 dark:text-accent-300">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selection du role */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Type de compte *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'utilisateur' 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-slate-200 dark:border-slate-600 hover:border-primary-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="utilisateur"
                      checked={formData.role === 'utilisateur'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        formData.role === 'utilisateur' ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        <User className={`w-6 h-6 ${formData.role === 'utilisateur' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">Utilisateur</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Postuler et faire des demandes</p>
                      </div>
                    </div>
                  </label>

                  <label className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'directeur' 
                      ? 'border-warm-500 bg-warm-50 dark:bg-warm-900/20' 
                      : 'border-slate-200 dark:border-slate-600 hover:border-warm-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="directeur"
                      checked={formData.role === 'directeur'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        formData.role === 'directeur' ? 'bg-warm-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        <Crown className={`w-6 h-6 ${formData.role === 'directeur' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">Directeur</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Creer et gerer une entreprise</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Votre nom" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Post-nom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" name="post_nom" value={formData.post_nom} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Post-nom" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Prenom *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Votre prenom" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="votre@email.com" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telephone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="+243 ..." required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Adresse *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Votre adresse" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mot de passe *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full pl-11 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Min. 6 caracteres" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirmer *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="w-full pl-11 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Confirmez" required minLength={6} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>{formData.role === 'directeur' ? 'Continuer vers la creation d\'entreprise' : 'Creer mon compte'}</span>
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Deja un compte ?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold">Se connecter</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}