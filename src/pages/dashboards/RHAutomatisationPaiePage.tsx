import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, CheckCircle2, Clock, DollarSign, FileText, Play, RefreshCw, Users } from 'lucide-react'
import { avancesPaieAPI, type DemandeAvancePaie, fichesPaieAPI, type FichePaie } from '../../services/api'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const RHAutomatisationPaiePage = () => {
  const [fiches, setFiches] = useState<FichePaie[]>([])
  const [avances, setAvances] = useState<DemandeAvancePaie[]>([])
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setBusy(true)
    try {
      const [paieResponse, avanceResponse] = await Promise.all([fichesPaieAPI.getAll(), avancesPaieAPI.getAll()])
      setFiches(paieResponse.fiches_paies ?? [])
      setAvances(avanceResponse.demandes ?? [])
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Impossible de charger les données de paie.' })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => { void load() }, [])

  const generate = async () => {
    setBusy(true)
    setFeedback(null)
    try {
      const response = await fichesPaieAPI.generate(Number(month), Number(year))
      setFeedback({ type: 'success', text: response.message })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'La génération a échoué.' })
      setBusy(false)
    }
  }

  const validate = async (id: number) => {
    setBusy(true)
    try {
      const response = await fichesPaieAPI.validate(id)
      setFeedback({ type: 'success', text: response.message })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'La validation a échoué.' })
      setBusy(false)
    }
  }

  const processAdvance = async (id: number, statut: 'Approuvée' | 'Refusée') => {
    setBusy(true)
    try {
      const response = await avancesPaieAPI.process(id, statut)
      setFeedback({ type: 'success', text: response.message })
      await load()
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Le traitement de la demande a échoué.' })
      setBusy(false)
    }
  }

  const pendingSheets = fiches.filter(fiche => fiche.statut === 'À valider')
  const total = fiches.reduce((sum, fiche) => sum + Number(fiche.montant || 0), 0)
  const pendingAdvances = avances.filter(avance => avance.statut === 'En attente')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Paie mensuelle</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Les fiches sont générées en brouillon puis validées par le RH.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={busy} title="Actualiser" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200">
          <RefreshCw className="h-4 w-4" /> Actualiser
        </button>
      </div>

      {feedback && (
        <div className={`flex items-start gap-3 rounded-lg border p-4 ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200'}`}>
          {feedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
          <p className="text-sm font-medium">{feedback.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Fiches générées', value: fiches.length, icon: FileText, tone: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
          { label: 'À valider', value: pendingSheets.length, icon: Clock, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Masse nette', value: money.format(total), icon: DollarSign, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
        ].map(stat => <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.tone}`}><stat.icon className="h-5 w-5" /></div><p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p></div>)}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600" /><h2 className="font-bold text-slate-800 dark:text-white">Générer les brouillons mensuels</h2></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">Mois<select value={month} onChange={event => setMonth(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-600 dark:bg-slate-900">{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
          <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">Année<input type="number" value={year} min="2020" max="2100" onChange={event => setYear(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
          <button type="button" onClick={() => void generate()} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Play className="h-4 w-4" /> Générer</button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 p-5 dark:border-slate-700"><h2 className="font-bold text-slate-800 dark:text-white">Fiches à valider</h2></div>
        {pendingSheets.length === 0 ? <p className="p-5 text-sm text-slate-500">Aucune fiche en attente de validation.</p> : <div className="divide-y divide-slate-200 dark:divide-slate-700">{pendingSheets.map(fiche => <div key={fiche.id_paie} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-800 dark:text-white">{fiche.employe?.prenom ?? 'Employé'} {fiche.employe?.nom ?? fiche.matricule}</p><p className="text-sm text-slate-500">Période {fiche.mois_paiement}/{fiche.annee_paiement} · Avance déduite: {money.format(Number(fiche.avance_deduite ?? 0))}</p></div><div className="flex items-center gap-3"><strong className="text-emerald-600">{money.format(Number(fiche.montant))}</strong><button type="button" onClick={() => void validate(fiche.id_paie)} disabled={busy} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">Valider</button></div></div>)}</div>}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 border-b border-slate-200 p-5 dark:border-slate-700"><Users className="h-5 w-5 text-amber-600" /><h2 className="font-bold text-slate-800 dark:text-white">Demandes d'avance ({pendingAdvances.length})</h2></div>
        {pendingAdvances.length === 0 ? <p className="p-5 text-sm text-slate-500">Aucune demande d'avance en attente.</p> : <div className="divide-y divide-slate-200 dark:divide-slate-700">{pendingAdvances.map(avance => <div key={avance.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-800 dark:text-white">{avance.employe?.prenom ?? avance.matricule} · {money.format(Number(avance.montant))}</p><p className="text-sm text-slate-500">{avance.motif}</p></div><div className="flex gap-2"><button type="button" onClick={() => void processAdvance(avance.id, 'Refusée')} disabled={busy} className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60">Refuser</button><button type="button" onClick={() => void processAdvance(avance.id, 'Approuvée')} disabled={busy} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Approuver</button></div></div>)}</div>}
      </section>
    </div>
  )
}
