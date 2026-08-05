import { useEffect, useState } from 'react'
import { Briefcase, Search, Plus, Eye, User, FileText, Check, X, Send, Pause, Calendar, LoaderCircle, Phone, Video } from 'lucide-react'
import { candidatAPI, entretienAPI, postulationAPI, offreAPI, posteAPI } from '../../services/api'

export const RHRecrutementPage = () => {
  const [activeTab, setActiveTab] = useState<'offres' | 'candidats' | 'postulations'>('offres')
  const [searchTerm, setSearchTerm] = useState('')
  const [offres, setOffres] = useState<any[]>([])
  const [candidats, setCandidats] = useState<any[]>([])
  const [postulations, setPostulations] = useState<any[]>([])
  const [postes, setPostes] = useState<any[]>([])
  const [selectedPostes, setSelectedPostes] = useState<Record<number, string>>({})
  const [feedback, setFeedback] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [interviewPostulation, setInterviewPostulation] = useState<any | null>(null)
  const [interviewForm, setInterviewForm] = useState({
    scheduled_at: '',
    mode: 'Visioconférence' as 'Visioconférence' | 'Présentiel' | 'Téléphonique',
    lieu: '',
    note: '',
  })
  const [isOfferFormOpen, setIsOfferFormOpen] = useState(false)
  const [isSavingOffer, setIsSavingOffer] = useState(false)
  const [offerForm, setOfferForm] = useState({
    titre: '',
    description: '',
    type_contrat: 'CDI',
    localisation: '',
    experience_requise: '',
    competences_requises: '',
    avantages: '',
    salaire_base: '',
    date_limite: '',
  })

  const loadRecruitment = async () => {
    try {
      const [offresResponse, candidatsResponse, postulationsResponse, postesResponse] = await Promise.all([
        offreAPI.getForCompany(),
        candidatAPI.getAll(),
        postulationAPI.getAll(),
        posteAPI.getForRH(),
      ])
      setOffres(offresResponse.offres || [])
      setCandidats(candidatsResponse.candidats || [])
      setPostulations(postulationsResponse.postulations || [])
      setPostes((postesResponse.postes || []).filter((poste: any) => poste.statut === 'Vacant'))
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de charger le recrutement.')
      setOffres([])
      setCandidats([])
      setPostulations([])
      setPostes([])
    }
  }

  useEffect(() => {
    void loadRecruitment()
  }, [])

  const handleRecruit = async (postulationId: number) => {
    const posteId = Number(selectedPostes[postulationId])
    if (!posteId) {
      setFeedback('Sélectionnez un poste vacant avant de recruter le candidat.')
      return
    }

    setPendingAction(`recruit-${postulationId}`)
    try {
      const response = await postulationAPI.recruit(postulationId, posteId)
      setSuccessMsg(`Candidat recruté. Matricule attribué : ${response.matricule}`)
      await loadRecruitment()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de recruter ce candidat.')
    } finally {
      setPendingAction(null)
    }
  }

  const handleReject = async (postulationId: number) => {
    setPendingAction(`reject-${postulationId}`)
    try {
      await postulationAPI.reject(postulationId)
      setSuccessMsg('Candidature refusée et décision enregistrée.')
      await loadRecruitment()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de refuser cette candidature.')
    } finally {
      setPendingAction(null)
    }
  }

  const scheduleInterview = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!interviewPostulation) return

    setPendingAction(`interview-${interviewPostulation.id_postulation}`)
    try {
      await entretienAPI.create({ ...interviewForm, id_postulation: interviewPostulation.id_postulation })
      setSuccessMsg('Entretien planifié et candidature mise à jour.')
      setInterviewPostulation(null)
      setInterviewForm({ scheduled_at: '', mode: 'Visioconférence', lieu: '', note: '' })
      await loadRecruitment()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de planifier cet entretien.')
    } finally {
      setPendingAction(null)
    }
  }

  const handleOfferStatus = async (offreId: number, statut: 'Publiée' | 'Archivée') => {
    try {
      await offreAPI.updateCompanyStatus(offreId, statut)
      setFeedback(statut === 'Publiée'
        ? 'Offre publiée. Elle est désormais visible dans l’espace public.'
        : 'Offre archivée. Elle n’est plus visible dans l’espace public.')
      await loadRecruitment()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de modifier le statut de cette offre.')
    }
  }

  const handleCreateOffer = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSavingOffer(true)

    try {
      await offreAPI.createForCompany({
        ...offerForm,
        salaire_base: Number(offerForm.salaire_base),
        statut: 'Brouillon',
      })
      setFeedback('Offre enregistrée en brouillon. Vous pourrez la publier après vérification.')
      setIsOfferFormOpen(false)
      setOfferForm({
        titre: '', description: '', type_contrat: 'CDI', localisation: '', experience_requise: '',
        competences_requises: '', avantages: '', salaire_base: '', date_limite: '',
      })
      await loadRecruitment()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de créer cette offre.')
    } finally {
      setIsSavingOffer(false)
    }
  }

  const filteredOffres = offres.filter(o => o.titre.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredCandidats = candidats.filter(c => c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || c.prenom.toLowerCase().includes(searchTerm.toLowerCase()))

  const stats = {
    offresActives: offres.filter(o => o.statut === 'Publiée').length,
    totalCandidats: candidats.length,
    postulations: postulations.length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Gestion du Recrutement</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Offres, candidats et postulations</p>
        </div>
        <button onClick={() => setIsOfferFormOpen(true)} className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle offre</span>
        </button>
      </div>

      {feedback && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{feedback}</p>}
      {successMsg && <div className="fixed right-5 top-5 z-[70] max-w-sm rounded-2xl border border-white/40 bg-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-950 shadow-xl shadow-emerald-950/20 backdrop-blur-xl dark:border-emerald-300/20 dark:bg-emerald-400/15 dark:text-emerald-100"><div className="flex items-center gap-2"><Check className="h-5 w-5 shrink-0" />{successMsg}</div></div>}

      {isOfferFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={handleCreateOffer} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl dark:bg-slate-800">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nouvelle offre d'emploi</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tous les éléments utiles au candidat sont requis avant publication.</p>
              </div>
              <button type="button" onClick={() => setIsOfferFormOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Intitulé<input required value={offerForm.titre} onChange={(event) => setOfferForm({ ...offerForm, titre: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Type de contrat<select value={offerForm.type_contrat} onChange={(event) => setOfferForm({ ...offerForm, type_contrat: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"><option>CDI</option><option>CDD</option><option>Stage</option><option>Freelance</option></select></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Localisation<input required value={offerForm.localisation} onChange={(event) => setOfferForm({ ...offerForm, localisation: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Salaire mensuel (USD)<input required min="0" type="number" value={offerForm.salaire_base} onChange={(event) => setOfferForm({ ...offerForm, salaire_base: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Date limite<input required type="date" value={offerForm.date_limite} onChange={(event) => setOfferForm({ ...offerForm, date_limite: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Expérience requise<input required value={offerForm.experience_requise} onChange={(event) => setOfferForm({ ...offerForm, experience_requise: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" /></label>
            </div>
            <div className="mt-4 grid gap-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Description<textarea required rows={3} value={offerForm.description} onChange={(event) => setOfferForm({ ...offerForm, description: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Compétences requises<textarea required rows={2} value={offerForm.competences_requises} onChange={(event) => setOfferForm({ ...offerForm, competences_requises: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Avantages<textarea required rows={2} value={offerForm.avantages} onChange={(event) => setOfferForm({ ...offerForm, avantages: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsOfferFormOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200">Annuler</button>
              <button disabled={isSavingOffer} type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">{isSavingOffer ? 'Enregistrement...' : 'Enregistrer le brouillon'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {[
          { label: 'Offres actives', value: stats.offresActives, color: 'from-primary-500 to-purple-600', icon: Briefcase },
          { label: 'Candidats', value: stats.totalCandidats, color: 'from-accent-500 to-emerald-600', icon: User },
          { label: 'Postulations', value: stats.postulations, color: 'from-amber-500 to-orange-600', icon: FileText },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {[
              { id: 'offres', label: 'Offres d\'emploi', count: stats.offresActives },
              { id: 'candidats', label: 'Candidats', count: stats.totalCandidats },
              { id: 'postulations', label: 'Postulations', count: stats.postulations },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-4 font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-600 dark:text-slate-400 hover:text-primary-600'}`}
              >
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>

          {activeTab === 'offres' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOffres.map(offre => (
                <div key={offre.id_offre} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">{offre.titre}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{offre.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${offre.statut === 'Publiée' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>{offre.statut}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Salaire: <span className="font-bold text-primary-600">${offre.salaire_base}</span></span>
                    <span className="text-slate-500 dark:text-slate-400">Limite: {offre.date_limite}</span>
                  </div>
                  <div className="mt-3 flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-600">
                    {offre.statut === 'Brouillon' && (
                      <button onClick={() => void handleOfferStatus(offre.id_offre, 'Publiée')} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700">
                        <Send className="h-3.5 w-3.5" /> Publier
                      </button>
                    )}
                    {offre.statut === 'Publiée' && (
                      <button onClick={() => void handleOfferStatus(offre.id_offre, 'Archivée')} className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700">
                        <Pause className="h-3.5 w-3.5" /> Archiver
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'candidats' && (
            <div className="space-y-3">
              {filteredCandidats.map(candidat => (
                <div key={candidat.id_candidat} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{candidat.prenom[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{candidat.prenom} {candidat.nom}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{candidat.email}</p>
                    </div>
                  </div>
                  <button className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg"><Eye className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'postulations' && (
            <div className="space-y-3">
              {postulations.map(post => {
                const candidat = candidats.find(c => c.id_candidat === post.id_candidat)
                const offre = offres.find(o => o.id_offre === post.id_offre)
                return (
                  <div key={post.id_postulation} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-800 dark:text-white">{post.candidat?.prenom ?? candidat?.prenom} {post.candidat?.nom ?? candidat?.nom}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        post.statut === 'Soumise' ? 'bg-blue-100 text-blue-700' :
                        post.statut === 'En cours' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>{post.statut}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Postule pour: <span className="font-semibold">{post.offre?.titre ?? offre?.titre}</span></p>
                    {post.statut === 'Soumise' && (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <select
                          value={selectedPostes[post.id_postulation] || ''}
                          onChange={(event) => setSelectedPostes({ ...selectedPostes, [post.id_postulation]: event.target.value })}
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                        >
                          <option value="">Choisir un poste vacant</option>
                          {postes.map((poste) => <option key={poste.id_poste} value={poste.id_poste}>{poste.titre_poste}</option>)}
                        </select>
                        <button onClick={() => { setInterviewPostulation(post); setInterviewForm({ scheduled_at: '', mode: 'Visioconférence', lieu: '', note: '' }) }} disabled={pendingAction !== null} className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                          <Calendar className="h-4 w-4" /> Entretien
                        </button>
                        <button onClick={() => void handleRecruit(post.id_postulation)} disabled={pendingAction !== null} className="inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                          {pendingAction === `recruit-${post.id_postulation}` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Recruter
                        </button>
                        <button onClick={() => void handleReject(post.id_postulation)} disabled={pendingAction !== null} className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                          {pendingAction === `reject-${post.id_postulation}` ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Refuser
                        </button>
                      </div>
                    )}
                    {post.statut === 'Entretien' && post.entretiens?.[0] && <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200"><span className="font-semibold">Entretien planifié:</span> {new Date(post.entretiens[0].scheduled_at).toLocaleString('fr-FR')} · {post.entretiens[0].mode} · {post.entretiens[0].lieu}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {interviewPostulation && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form onSubmit={scheduleInterview} className="w-full max-w-lg rounded-2xl border border-white/30 bg-white/95 shadow-2xl backdrop-blur-xl dark:bg-slate-800/95">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Planifier un entretien</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{interviewPostulation.candidat?.prenom} {interviewPostulation.candidat?.nom} · {interviewPostulation.offre?.titre}</p>
              </div>
              <button type="button" onClick={() => setInterviewPostulation(null)} disabled={pendingAction !== null} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-700" aria-label="Fermer"><X className="h-5 w-5" /></button>
            </header>
            <div className="space-y-4 p-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Date et heure<input required type="datetime-local" value={interviewForm.scheduled_at} onChange={(event) => setInterviewForm({ ...interviewForm, scheduled_at: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Mode<select value={interviewForm.mode} onChange={(event) => setInterviewForm({ ...interviewForm, mode: event.target.value as typeof interviewForm.mode, lieu: '' })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900"><option>Visioconférence</option><option>Téléphonique</option><option>Présentiel</option></select></label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{interviewForm.mode === 'Visioconférence' ? 'Lien de visioconférence' : interviewForm.mode === 'Téléphonique' ? 'Numéro à appeler' : 'Lieu de rendez-vous'}<div className="relative mt-1.5"><span className="pointer-events-none absolute left-3 top-3 text-slate-400">{interviewForm.mode === 'Visioconférence' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}</span><input required type={interviewForm.mode === 'Visioconférence' ? 'url' : 'text'} placeholder={interviewForm.mode === 'Visioconférence' ? 'https://meet.example.com/...' : interviewForm.mode === 'Téléphonique' ? '+243 ...' : 'Adresse ou salle'} value={interviewForm.lieu} onChange={(event) => setInterviewForm({ ...interviewForm, lieu: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 dark:border-slate-600 dark:bg-slate-900" /></div></label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Note pour le candidat<textarea rows={3} value={interviewForm.note} onChange={(event) => setInterviewForm({ ...interviewForm, note: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
            </div>
            <footer className="flex justify-end gap-3 border-t border-slate-200 p-5 dark:border-slate-700"><button type="button" onClick={() => setInterviewPostulation(null)} disabled={pendingAction !== null} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200">Annuler</button><button type="submit" disabled={pendingAction !== null} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{pendingAction ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />} Planifier</button></footer>
          </form>
        </div>
      )}
    </div>
  )
}