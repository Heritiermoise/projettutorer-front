import { PublicNavbar } from '../components/PublicNavbar'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Lock, Eye, EyeOff, UserPlus, User, Phone, MapPin, Crown, AlertCircle, CheckCircle2, Info } from 'lucide-react'

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

  const handleSubmit = (e: React.FormEvent) => {
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

    if (formData.role === 'directeur') {
      // Redirection vers creation entreprise
      localStorage.setItem('temp_user', JSON.stringify({
        nom: formData.nom,
        post_nom: formData.post_nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        password: formData.password,
      }))
      navigate('/create-entreprise')
    } else {
      // Utilisateur : inscription avec statut en_attente
      const newUser = {
        id: Date.now(),
        nom: formData.nom,
        post_nom: formData.post_nom,
        prenom: formData.prenom,
        name: `${formData.prenom} ${formData.nom}`,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        role: 'utilisateur',
        statut: 'en_attente',
        password: formData.password,
        created_at: new Date().toISOString().split('T')[0],
      }
      
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
      users.push(newUser)
      localStorage.setItem('mock_users', JSON.stringify(users))
      
      setSuccess('Inscription reussie ! Votre compte est en attente de validation par l\'administrateur. Vous recevrez un email avec votre mot de passe une fois valide.')
      
      setTimeout(() => {
        navigate('/login')
      }, 4000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-accent-50 dark:from-slate-900 dark:via-primary-900/10 dark:to-accent-900/10">
      <PublicNavbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 via-purple-500 to-accent-500 rounded-2xl shadow-2xl mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-2">Creer un compte</h1>
            <p className="text-slate-600 dark:text-slate-300">Rejoignez RH Pro en quelques etapes</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
            {/* Info importante */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Choisissez votre type de compte :</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Utilisateur</strong> : Pour postuler aux offres et faire des demandes (validation par admin requise)</li>
                  <li><strong>Directeur</strong> : Pour creer et gerer votre entreprise</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
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
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                      : 'border-slate-200 dark:border-slate-600 hover:border-amber-300'
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
                        formData.role === 'directeur' ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
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

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary-600 via-purple-600 to-accent-600 hover:from-primary-700 hover:via-purple-700 hover:to-accent-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2">
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