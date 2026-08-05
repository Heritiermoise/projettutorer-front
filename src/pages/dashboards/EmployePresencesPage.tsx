import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, LogIn, LogOut, RefreshCw, XCircle } from 'lucide-react'
import { presenceAPI, type Presence } from '../../services/api'

const isPresent = (status: string) => ['present', 'présent', 'retard'].includes(status.toLowerCase())

export const EmployePresencesPage = () => {
  const [presences, setPresences] = useState<Presence[]>([])
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [pointing, setPointing] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const response = await presenceAPI.getMine()
      setPresences(response.presences ?? [])
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Impossible de charger vos pointages.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const point = async () => {
    setPointing(true)
    setFeedback(null)
    try {
      const response = await presenceAPI.pointerMine()
      setFeedback({ type: 'success', text: response.message })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Impossible d’enregistrer votre pointage.' })
    } finally {
      setPointing(false)
    }
  }

  const stats = useMemo(() => ({
    total: presences.length,
    presents: presences.filter(item => item.statut.toLowerCase() === 'present').length,
    retards: presences.filter(item => item.statut.toLowerCase() === 'retard').length,
    absents: presences.filter(item => item.statut.toLowerCase() === 'absent').length,
  }), [presences])

  const today = new Date().toISOString().slice(0, 10)
  const todayPresence = presences.find(item => item.date_presence.slice(0, 10) === today)
  const hasArrived = Boolean(todayPresence?.heure_arrivee)
  const hasDeparted = Boolean(todayPresence?.heure_depart)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mes présences</h1><p className="text-sm text-slate-600 dark:text-slate-400">Suivi réel de vos arrivées et départs.</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} disabled={loading || pointing} title="Actualiser" className="rounded-lg border border-slate-300 p-2.5 text-slate-700 dark:border-slate-600 dark:text-slate-200"><RefreshCw className="h-5 w-5" /></button>
          <button type="button" onClick={() => void point()} disabled={pointing || hasDeparted} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{hasArrived ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}{hasDeparted ? 'Pointage terminé' : hasArrived ? 'Pointer mon départ' : 'Pointer mon arrivée'}</button>
        </div>
      </div>

      {feedback && <div className={`flex items-start gap-3 rounded-lg border p-4 ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200'}`}>{feedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}<p className="text-sm font-medium">{feedback.text}</p></div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[
        { label: 'Jours pointés', value: stats.total, icon: Clock, tone: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
        { label: 'Présences', value: stats.presents, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
        { label: 'Retards', value: stats.retards, icon: AlertCircle, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
        { label: 'Absences', value: stats.absents, icon: XCircle, tone: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
      ].map(stat => <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.tone}`}><stat.icon className="h-5 w-5" /></div><p className="text-sm text-slate-500">{stat.label}</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p></div>)}</div>

      <section className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"><div className="border-b border-slate-200 p-5 dark:border-slate-700"><h2 className="font-bold text-slate-800 dark:text-white">Historique des pointages</h2></div>{loading ? <p className="p-5 text-sm text-slate-500">Chargement…</p> : presences.length === 0 ? <p className="p-5 text-sm text-slate-500">Aucun pointage enregistré.</p> : <div className="divide-y divide-slate-200 dark:divide-slate-700">{presences.map(presence => <div key={presence.id ?? `${presence.matricule}-${presence.date_presence}`} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-800 dark:text-white">{new Date(`${presence.date_presence.slice(0, 10)}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><p className="text-sm text-slate-500">Arrivée: {presence.heure_arrivee?.slice(0, 5) ?? '—'} · Départ: {presence.heure_depart?.slice(0, 5) ?? '—'}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${isPresent(presence.statut) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : presence.statut.toLowerCase() === 'retard' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{presence.statut}</span></div>)}</div>}</section>
    </div>
  )
}
