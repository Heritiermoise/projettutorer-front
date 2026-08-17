import { useEffect, useState } from 'react'
import { Briefcase, Calendar, CheckCircle2, Clock, Eye, FileText, Mail, MapPin, Phone, Search, Users, X, XCircle } from 'lucide-react'
import { entretienAPI, posteAPI, postulationAPI } from '../../services/api'

type Interview = { id_entretien: number; scheduled_at: string; mode: string; lieu: string; statut: string; note?: string | null }
type Application = {
  id_postulation: number
  statut: 'Soumise' | 'Entretien' | 'Acceptée' | 'Refusée'
  cv: string
  lettre: string
  created_at: string
  candidat: { id_candidat: number; nom: string; post_nom?: string; prenom?: string; email: string; telephone?: string }
  offre: { id_offre: number; titre: string; type_contrat?: string; localisation?: string; salaire_base?: number }
  entretiens: Interview[]
}
type Job = { id_poste: number; titre_poste: string; statut: string }

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: value.includes('T') ? 'short' : undefined }).format(new Date(value)) : 'Non renseignée'
const statusLabel: Record<Application['statut'], string> = { Soumise: 'À examiner', Entretien: 'Entretien', Acceptée: 'Recrutée', Refusée: 'Refusée' }
const statusColor: Record<Application['statut'], string> = {
  Soumise: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  Entretien: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Acceptée: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  Refusée: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
}

export const DirecteurCandidatsPage = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [vacantJobs, setVacantJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | Application['statut']>('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [interviewApplication, setInterviewApplication] = useState<Application | null>(null)
  const [recruitmentApplication, setRecruitmentApplication] = useState<Application | null>(null)
  const [selectedJobId, setSelectedJobId] = useState('')
  const [salaryBase, setSalaryBase] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [interviewData, setInterviewData] = useState<{ scheduled_at: string; mode: 'Visioconférence' | 'Présentiel' | 'Téléphonique'; lieu: string; note: string }>({ scheduled_at: '', mode: 'Visioconférence', lieu: '', note: '' })

  const loadData = async () => {
    try {
      const [applicationsResponse, jobsResponse] = await Promise.all([postulationAPI.getAll(), posteAPI.getAll()])
      setApplications(applicationsResponse.postulations || [])
      setVacantJobs((jobsResponse.postes || []).filter((job: Job) => job.statut === 'Vacant'))
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de charger les candidatures réelles.')
      setApplications([])
      setVacantJobs([])
    }
  }

  useEffect(() => { void loadData() }, [])

  const scheduleInterview = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!interviewApplication) return
    try {
      await entretienAPI.create({ ...interviewData, id_postulation: interviewApplication.id_postulation })
      setFeedback('Entretien enregistré et candidature mise à jour.')
      setInterviewApplication(null)
      setInterviewData({ scheduled_at: '', mode: 'Visioconférence', lieu: '', note: '' })
      await loadData()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de planifier cet entretien.')
    }
  }

  const recruit = async () => {
    if (!recruitmentApplication || !selectedJobId || Number(salaryBase) <= 0) {
      setFeedback('Sélectionnez un poste vacant et renseignez un salaire mensuel positif avant de recruter.')
      return
    }
    try {
      const response = await postulationAPI.recruit(recruitmentApplication.id_postulation, Number(selectedJobId), Number(salaryBase))
      setFeedback(`Candidat recruté. Matricule attribué: ${response.matricule}`)
      setRecruitmentApplication(null)
      setSelectedJobId('')
      setSalaryBase('')
      await loadData()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de recruter ce candidat.')
    }
  }

  const reject = async (application: Application) => {
    if (!window.confirm(`Refuser la candidature de ${application.candidat.prenom || ''} ${application.candidat.nom} ?`)) return
    try {
      await postulationAPI.reject(application.id_postulation)
      setFeedback('Candidature refusée et décision enregistrée.')
      await loadData()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible de refuser cette candidature.')
    }
  }

  const filteredApplications = applications.filter((application) => {
    const searchable = `${application.candidat.prenom || ''} ${application.candidat.nom} ${application.candidat.email} ${application.offre.titre}`.toLowerCase()
    return searchable.includes(searchTerm.toLowerCase()) && (filterStatus === 'all' || application.statut === filterStatus)
  })

  const stats = {
    total: applications.length,
    pending: applications.filter((application) => application.statut === 'Soumise').length,
    interviews: applications.filter((application) => application.statut === 'Entretien').length,
    accepted: applications.filter((application) => application.statut === 'Acceptée').length,
    rejected: applications.filter((application) => application.statut === 'Refusée').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Dossiers de candidature</h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Chaque dossier est relié à l’offre, au candidat, au CV et à l’historique de recrutement.</p>
      </div>

      {feedback && <p className="text-sm text-slate-600 dark:text-slate-300">{feedback}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'from-primary-500 to-primary-600' },
          { label: 'À examiner', value: stats.pending, icon: Clock, color: 'from-violet-500 to-primary-600' },
          { label: 'Entretiens', value: stats.interviews, icon: Calendar, color: 'from-primary-500 to-cyan-600' },
          { label: 'Recrutées', value: stats.accepted, icon: CheckCircle2, color: 'from-primary-500 to-primary-600' },
          { label: 'Refusées', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-primary-600' },
        ].map((stat) => <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg grid place-items-center mb-3`}><stat.icon className="w-5 h-5 text-white" /></div>
          <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
        </div>)}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Rechercher par candidat ou offre" className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" /></div>
        <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value as typeof filterStatus)} className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
          <option value="all">Tous les statuts</option><option value="Soumise">À examiner</option><option value="Entretien">Entretien</option><option value="Acceptée">Recrutées</option><option value="Refusée">Refusées</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredApplications.map((application) => <article key={application.id_postulation} className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between gap-4 mb-4"><div><h2 className="font-bold text-slate-800 dark:text-white">{application.candidat.prenom} {application.candidat.nom}</h2><p className="text-sm text-slate-600 dark:text-slate-400">{application.candidat.email}</p></div><span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[application.statut]}`}>{statusLabel[application.statut]}</span></div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300"><p className="flex gap-2"><Briefcase className="w-4 h-4 shrink-0" /><span>Offre: <strong className="text-amber-600 dark:text-amber-300">{application.offre.titre}</strong></span></p><p className="flex gap-2"><MapPin className="w-4 h-4 shrink-0" /><span>{application.offre.localisation || 'Localisation non indiquée'} · {application.offre.type_contrat || 'Contrat non indiqué'}</span></p><p className="flex gap-2"><Phone className="w-4 h-4 shrink-0" /><span>{application.candidat.telephone || 'Téléphone non indiqué'}</span></p><p className="flex gap-2"><Calendar className="w-4 h-4 shrink-0" /><span>Reçue le {formatDate(application.created_at)}</span></p></div>
          {application.entretiens?.[0] && <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-sm text-blue-800 dark:text-blue-200"><strong>Dernier entretien:</strong> {formatDate(application.entretiens[0].scheduled_at)} · {application.entretiens[0].mode} · {application.entretiens[0].lieu}</div>}
          <div className="mt-5 flex flex-wrap gap-2"><button onClick={() => setSelectedApplication(application)} className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"><Eye className="w-4 h-4" />Dossier</button>{application.statut !== 'Acceptée' && application.statut !== 'Refusée' && <><button onClick={() => setInterviewApplication(application)} className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Calendar className="w-4 h-4" />Entretien</button><button onClick={() => { setRecruitmentApplication(application); setSelectedJobId(''); setSalaryBase('') }} className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4" />Recruter</button><button onClick={() => void reject(application)} className="p-2 text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200"><XCircle className="w-4 h-4" /></button></>}</div>
        </article>)}
        {filteredApplications.length === 0 && <p className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">Aucune candidature réelle ne correspond à cette recherche.</p>}
      </div>

      {selectedApplication && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-2xl"><header className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700"><div><h3 className="font-bold text-slate-800 dark:text-white">Dossier #{selectedApplication.id_postulation}</h3><p className="text-sm text-slate-500">{selectedApplication.offre.titre}</p></div><button onClick={() => setSelectedApplication(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5" /></button></header><div className="p-5 space-y-5"><section><h4 className="font-semibold text-slate-800 dark:text-white mb-2">Candidat</h4><p className="text-slate-600 dark:text-slate-300">{selectedApplication.candidat.prenom} {selectedApplication.candidat.post_nom} {selectedApplication.candidat.nom}</p><p className="flex gap-2 mt-1 text-sm text-slate-600 dark:text-slate-300"><Mail className="w-4 h-4" />{selectedApplication.candidat.email}</p></section><section><h4 className="font-semibold text-slate-800 dark:text-white mb-2">Lettre de motivation</h4><p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">{selectedApplication.lettre}</p></section><section><h4 className="font-semibold text-slate-800 dark:text-white mb-2">CV</h4><p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><FileText className="w-4 h-4" />Document reçu et stocké de façon privée.</p></section><section><h4 className="font-semibold text-slate-800 dark:text-white mb-2">Historique</h4>{selectedApplication.entretiens.length === 0 ? <p className="text-sm text-slate-500">Aucun entretien planifié.</p> : <ul className="space-y-2">{selectedApplication.entretiens.map((interview) => <li key={interview.id_entretien} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700 text-sm">{formatDate(interview.scheduled_at)} · {interview.mode} · {interview.lieu} · {interview.statut}</li>)}</ul>}</section></div></div></div>}

      {interviewApplication && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><form onSubmit={scheduleInterview} className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-lg shadow-2xl"><header className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700"><div><h3 className="font-bold text-slate-800 dark:text-white">Planifier un entretien</h3><p className="text-sm text-slate-500">{interviewApplication.candidat.prenom} {interviewApplication.candidat.nom} · {interviewApplication.offre.titre}</p></div><button type="button" onClick={() => setInterviewApplication(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5" /></button></header><div className="p-5 space-y-4"><div><label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Date et heure *</label><input type="datetime-local" value={interviewData.scheduled_at} onChange={(event) => setInterviewData({ ...interviewData, scheduled_at: event.target.value })} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600" required /></div><div><label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Mode *</label><select value={interviewData.mode} onChange={(event) => setInterviewData({ ...interviewData, mode: event.target.value as typeof interviewData.mode })} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"><option>Visioconférence</option><option>Présentiel</option><option>Téléphonique</option></select></div><div><label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Lieu ou lien de réunion *</label><input value={interviewData.lieu} onChange={(event) => setInterviewData({ ...interviewData, lieu: event.target.value })} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600" required /></div><div><label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Note de préparation</label><textarea value={interviewData.note} onChange={(event) => setInterviewData({ ...interviewData, note: event.target.value })} rows={3} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 resize-none" /></div></div><footer className="p-5 border-t border-slate-200 dark:border-slate-700 flex gap-3"><button type="button" onClick={() => setInterviewApplication(null)} className="flex-1 p-3 rounded-lg bg-slate-100 dark:bg-slate-700">Annuler</button><button type="submit" className="flex-1 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Enregistrer</button></footer></form></div>}

      {recruitmentApplication && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-lg shadow-2xl"><header className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700"><div><h3 className="font-bold text-slate-800 dark:text-white">Confirmer le recrutement</h3><p className="text-sm text-slate-500">{recruitmentApplication.candidat.prenom} {recruitmentApplication.candidat.nom}</p></div><button onClick={() => setRecruitmentApplication(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5" /></button></header><div className="p-5 space-y-4"><p className="text-sm text-slate-600 dark:text-slate-300">Attribuez un poste vacant réel et confirmez le salaire mensuel. Cette action crée le compte employé et marque le poste comme occupé.</p><select value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)} className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"><option value="">Choisir un poste vacant</option>{vacantJobs.map((job) => <option key={job.id_poste} value={job.id_poste}>{job.titre_poste}</option>)}</select><input type="number" min="0.01" step="0.01" value={salaryBase} onChange={(event) => setSalaryBase(event.target.value)} placeholder="Salaire mensuel de base" className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600" required />{vacantJobs.length === 0 && <p className="text-sm text-red-600 dark:text-red-300">Aucun poste vacant n’est disponible.</p>}</div><footer className="p-5 border-t border-slate-200 dark:border-slate-700 flex gap-3"><button onClick={() => setRecruitmentApplication(null)} className="flex-1 p-3 rounded-lg bg-slate-100 dark:bg-slate-700">Annuler</button><button onClick={() => void recruit()} disabled={!selectedJobId || Number(salaryBase) <= 0} className="flex-1 p-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">Recruter</button></footer></div></div>}
    </div>
  )
}
