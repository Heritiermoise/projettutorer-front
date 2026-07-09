import { useEffect, useMemo, useState } from 'react'
import { Shield, Search, Save, Plus, X, Edit, Trash2, Loader2 } from 'lucide-react'
import { roleAPI } from '../../services/api'
import { Toast } from '../../components/ui/Toast'

export const DirecteurPermissionsPage = () => {
  const [roles, setRoles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [submittingCreate, setSubmittingCreate] = useState(false)
  const [submittingEdit, setSubmittingEdit] = useState(false)
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    nom: '',
    slug: '',
    description: '',
    statut: 'Actif',
    permissions: '',
  })

  const loadRoles = async () => {
    setLoading(true)
    try {
      const response = await roleAPI.getAll()
      setRoles(response.roles || [])
    } catch (error) {
      console.error('Erreur chargement roles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const filteredRoles = useMemo(() => {
    return roles.filter((role: any) =>
      role.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [roles, searchTerm])

  const totalPermissions = roles.reduce((sum, role) => sum + Object.keys(role.permissions || {}).length, 0)

  const normalizePermissions = (value: string) => {
    const entries = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    return entries.reduce((acc: Record<string, boolean>, item) => {
      acc[item] = true
      return acc
    }, {})
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingCreate(true)
    try {
      await roleAPI.create({
        nom: formData.nom,
        slug: formData.slug || undefined,
        description: formData.description,
        statut: formData.statut,
        permissions: normalizePermissions(formData.permissions),
      })
      setShowCreateModal(false)
      setFormData({ nom: '', slug: '', description: '', statut: 'Actif', permissions: '' })
      setFeedback({ type: 'success', text: 'Role créé avec succès.' })
      await loadRoles()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la creation du role' })
    } finally {
      setSubmittingCreate(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      return
    }

    setSubmittingEdit(true)
    try {
      await roleAPI.update(selectedRole.id, {
        nom: selectedRole.nom,
        slug: selectedRole.slug,
        description: selectedRole.description,
        statut: selectedRole.statut,
        permissions: normalizePermissions(selectedRole.permissions_input || ''),
      })
      setShowEditModal(false)
      setSelectedRole(null)
      setFeedback({ type: 'success', text: 'Role mis à jour avec succès.' })
      await loadRoles()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la mise a jour du role' })
    } finally {
      setSubmittingEdit(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce role ?')) {
      return
    }

    setDeletingRoleId(id)
    try {
      await roleAPI.delete(id)
      setFeedback({ type: 'success', text: 'Role supprimé avec succès.' })
      await loadRoles()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la suppression du role' })
    } finally {
      setDeletingRoleId(null)
    }
  }

  const openEdit = (role: any) => {
    setSelectedRole({
      ...role,
      permissions: role.permissions || {},
      permissions_input: Object.keys(role.permissions || {}).join(', '),
    })
    setShowEditModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion des rôles</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Définissez les profils métier et leurs accès de base.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={loadRoles} className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600">
            <Save className="w-5 h-5" />
            <span>Rafraîchir</span>
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
            <Plus className="w-5 h-5" />
            <span>Nouveau rôle</span>
          </button>
        </div>
      </div>

      {feedback && (
        <Toast message={feedback.text} type={feedback.type} onClose={() => setFeedback(null)} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Rôles', value: roles.length, color: 'from-amber-500 to-orange-600' },
          { label: 'Actifs', value: roles.filter((role: any) => role.statut === 'Actif').length, color: 'from-green-500 to-emerald-600' },
          { label: 'Inactifs', value: roles.filter((role: any) => role.statut !== 'Actif').length, color: 'from-red-500 to-rose-600' },
          { label: 'Permissions', value: totalPermissions, color: 'from-primary-500 to-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher un rôle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Chargement des rôles...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Rôle</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Slug</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase hidden md:table-cell">Description</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Permissions</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Statut</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredRoles.map((role: any) => (
                  <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">{role.nom}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">{role.slug}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 hidden md:table-cell">{role.description || 'Aucune description'}</td>
                    <td className="py-4 px-6 text-center text-slate-800 dark:text-white font-semibold">{Object.keys(role.permissions || {}).length}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${role.statut === 'Actif' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                        {role.statut}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openEdit(role)} className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm hover:bg-amber-200 dark:hover:bg-amber-900/50 flex items-center space-x-1">
                          <Edit className="w-4 h-4" />
                          <span>Modifier</span>
                        </button>
                        <button onClick={() => handleDelete(role.id)} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2">Usage des rôles</h3>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
              <li><strong>Slug</strong> : valeur technique utilisée dans les invitations et la logique backend.</li>
              <li><strong>Permissions</strong> : mots-clés séparés par virgules pour documenter l'accès du rôle.</li>
              <li><strong>Statut</strong> : active ou retire un rôle de la sélection métier.</li>
            </ul>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Créer un rôle</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom *</label>
                <input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Slug</label>
                <input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="ex: chef_service" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Permissions (séparées par des virgules)</label>
                <input value={formData.permissions} onChange={(e) => setFormData({ ...formData, permissions: e.target.value })} placeholder="manage_users, manage_team" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Statut</label>
                <select value={formData.statut} onChange={(e) => setFormData({ ...formData, statut: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" disabled={submittingCreate} className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submittingCreate && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submittingCreate ? 'Création en cours...' : 'Créer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Modifier le rôle</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nom *</label>
                <input value={selectedRole.nom} onChange={(e) => setSelectedRole({ ...selectedRole, nom: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Slug *</label>
                <input value={selectedRole.slug} onChange={(e) => setSelectedRole({ ...selectedRole, slug: e.target.value })} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={selectedRole.description || ''} onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Permissions</label>
                <input value={selectedRole.permissions_input || ''} onChange={(e) => setSelectedRole({ ...selectedRole, permissions_input: e.target.value })} placeholder="manage_users, manage_team" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Statut</label>
                <select value={selectedRole.statut || 'Actif'} onChange={(e) => setSelectedRole({ ...selectedRole, statut: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Annuler</button>
                <button type="submit" disabled={submittingEdit} className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submittingEdit ? 'Mise à jour...' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
