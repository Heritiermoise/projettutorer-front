import { PublicNavbar } from '../components/PublicNavbar'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Mail, Lock, Eye, EyeOff, Users, LogIn, Loader2 } from 'lucide-react'
import { authService } from '../services/authService'
import { Toast } from '../components/ui/Toast'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const navigate = useNavigate()

  const testAccounts = useMemo(() => [
    { email: 'admin@demo.com', password: 'password', role: 'admin', name: 'Administrateur' },
    { email: 'directeur@demo.com', password: 'password', role: 'directeur', name: 'Directeur' },
    { email: 'rh@demo.com', password: 'password', role: 'rh', name: 'RH Manager' },
    { email: 'employe@demo.com', password: 'password', role: 'employe', name: 'Employé' },
  ], [])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('registered') === '1') {
      setToast({ type: 'success', message: 'Compte créé avec succès. Vous pouvez vous connecter.' })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setToast({ type: 'info', message: 'Connexion en cours...' })

    const result = await authService.login(email, password)
    if (result.success && result.user) {
      setToast({ type: 'success', message: 'Connexion réussie. Redirection en cours...' })
      const dashboardRole = result.user.role
      setTimeout(() => navigate(`/dashboard/${dashboardRole}`), 700)
    } else {
      setToast({ type: 'error', message: result.message || 'Email ou mot de passe incorrect' })
    }

    setLoading(false)
  }

  const fillCredentials = (acc: typeof testAccounts[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-slate-50 to-accent-50">
      <PublicNavbar />
      <div className="pt-24 pb-12 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Connexion RH Pro</h1>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-3 font-semibold">Comptes de test :</p>
              <div className="space-y-2">
                {testAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => fillCredentials(acc)}
                    className="w-full text-left p-3 bg-slate-50 rounded-lg hover:bg-primary-50 transition-colors text-sm border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{acc.name}</span>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">{acc.role}</span>
                    </div>
                    <div className="text-slate-600 mt-1 text-xs">{acc.email} / {acc.password}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Bienvenue sur RH Pro</h2>
              <p className="text-slate-600 mb-6">Système de Gestion des Ressources Humaines</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-primary-600">8</div>
                  <div className="text-sm text-slate-600">Utilisateurs</div>
                </div>
                <div className="bg-accent-50 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-accent-600">3</div>
                  <div className="text-sm text-slate-600">Entreprises</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}