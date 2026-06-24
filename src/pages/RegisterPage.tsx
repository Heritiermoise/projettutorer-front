import { PublicNavbar } from '../components/PublicNavbar'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Lock, Eye, EyeOff, UserPlus, User, Phone, MapPin } from 'lucide-react'

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nom: '', post_nom: '', prenom: '', email: '', telephone: '', adresse: '',
    password: '', password_confirmation: '', role: 'utilisateur',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }
    localStorage.setItem('user', JSON.stringify({
      role: formData.role,
      name: formData.prenom + ' ' + formData.nom,
      email: formData.email
    }))
    navigate('/dashboard/' + formData.role)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <PublicNavbar />
      <div className="pt-24 pb-12 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Creer un compte</h1>
            <p className="text-slate-600">Rejoignez RH Pro</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Post-nom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" name="post_nom" value={formData.post_nom} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Prenom *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Telephone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Role *</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="utilisateur">Utilisateur</option>
                <option value="rh">Ressources Humaines</option>
                <option value="manager">Manager</option>
                <option value="directeur">Directeur (Proprietaire d'entreprise)</option>
              </select>
              {formData.role === 'directeur' && (
                <p className="text-xs text-amber-600 mt-1">Vous serez redirige vers la creation d'entreprise apres l'inscription</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmer *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type={showConfirmPassword ? 'text' : 'password'} name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500" required minLength={6} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
              Creer mon compte
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Deja un compte ?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  )
}