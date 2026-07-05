import { PublicNavbar } from '../components/PublicNavbar'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Lock, Eye, EyeOff, Phone, MapPin, Crown, Upload, X, CheckCircle2 } from 'lucide-react'
import { entrepriseAPI } from '../services/api'

export const CreateEntreprisePage = () => {
  const [formData, setFormData] = useState({
    nom: '', nom_commercial: '', email: '', telephone: '', adresse: '', description: '',
    password: '', password_confirmation: '',
  })
  const [photos, setPhotos] = useState({
    profil: null as File | null, couverture: null as File | null,
    previewProfil: '', previewCouverture: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoChange = (type: 'profil' | 'couverture', file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotos({
          ...photos,
          [type]: file,
          ['preview' + (type === 'profil' ? 'Profil' : 'Couverture')]: reader.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = (type: 'profil' | 'couverture') => {
    setPhotos({ ...photos, [type]: null, ['preview' + (type === 'profil' ? 'Profil' : 'Couverture')]: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true)

    const tempUser = JSON.parse(localStorage.getItem('temp_user') || '{}')

    try {
      const response = await entrepriseAPI.create({
        nom: formData.nom,
        nom_commercial: formData.nom_commercial || formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        description: formData.description,
      })

      const user = tempUser && Object.keys(tempUser).length > 0 ? tempUser : JSON.parse(localStorage.getItem('user') || '{}')
      const linkedUser = { ...user, id_entreprise: response.entreprise?.id_entreprise ?? response.id_entreprise }
      localStorage.setItem('user', JSON.stringify(linkedUser))
      localStorage.removeItem('temp_user')

      setLoading(false)
      navigate('/dashboard/directeur')
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Erreur lors de la creation de l\'entreprise')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-amber-900/20 dark:to-red-900/20">
      <PublicNavbar />
      
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-5 py-2.5 rounded-full shadow-lg border border-amber-200 dark:border-amber-800 mb-6">
            <Crown className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Devenez Directeur General</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-white mb-6">
            Creez votre entreprise
            <br />
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">en quelques clics</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Lancez votre entreprise et beneficiez de tous les outils RH pour gerer votre equipe efficacement.
          </p>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Photos de l'entreprise (optionnel)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    {photos.previewProfil ? (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-primary-300">
                        <img src={photos.previewProfil} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePhoto('profil')} className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-primary-500 transition-colors bg-slate-50 dark:bg-slate-700/50">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Logo</span>
                        <span className="text-xs text-slate-500 mt-1">Max 2MB</span>
                        <input type="file" accept="image/*" onChange={(e) => handlePhotoChange('profil', e.target.files?.[0] || null)} className="hidden" />
                      </label>
                    )}
                  </div>
                  <div>
                    {photos.previewCouverture ? (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-accent-300">
                        <img src={photos.previewCouverture} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePhoto('couverture')} className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-accent-500 transition-colors bg-slate-50 dark:bg-slate-700/50">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Couverture</span>
                        <span className="text-xs text-slate-500 mt-1">Max 5MB</span>
                        <input type="file" accept="image/*" onChange={(e) => handlePhotoChange('couverture', e.target.files?.[0] || null)} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom de l'entreprise *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Ex: VitaService SARL" required maxLength={50} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom commercial</label>
                <input type="text" name="nom_commercial" value={formData.nom_commercial} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Nom commercial" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email professionnel *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="contact@entreprise.com" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telephone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="+243 ..." required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Adresse</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Adresse de l'entreprise" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white resize-none" placeholder="Decrivez brievement votre entreprise..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mot de passe *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full pl-11 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Min. 6 caracteres" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirmer *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="w-full pl-11 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Confirmez" required minLength={6} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creation en cours...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>Creer mon entreprise et devenir Directeur</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Deja un compte ?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold">Se connecter</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}