import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, CheckCircle2, CreditCard, DollarSign, FileText, LockKeyhole, Save, Send } from 'lucide-react'
import { avancesPaieAPI, employeePaymentMethodAPI, fichesPaieAPI, type EmployeePaymentMethod, type FichePaie } from '../../services/api'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const EmployePaiePage = () => {
  const [fiches, setFiches] = useState<FichePaie[]>([])
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<EmployeePaymentMethod | null>(null)
  const [paymentForm, setPaymentForm] = useState({ type: 'M-Pesa' as EmployeePaymentMethod['type'], account_identifier: '', account_holder: '', bank_name: '', currency: 'USD' as EmployeePaymentMethod['currency'] })

  const load = async () => {
    setLoading(true)
    try {
      const [payrollResponse, methodResponse] = await Promise.all([fichesPaieAPI.getMine(), employeePaymentMethodAPI.getMine()])
      setFiches(payrollResponse.fiches_paies ?? [])
      setPaymentMethod(methodResponse.payment_method ?? null)
      if (methodResponse.payment_method) setPaymentForm(methodResponse.payment_method)
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Impossible de charger vos fiches de paie.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadTimer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(loadTimer)
  }, [])

  const savePaymentMethod = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const response = await employeePaymentMethodAPI.save(paymentForm)
      setPaymentMethod(response.payment_method)
      setPaymentForm(response.payment_method)
      setFeedback({ type: 'success', text: response.message })
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Le moyen de paiement n’a pas pu être enregistré.' })
    } finally {
      setSubmitting(false)
    }
  }

  const requestAdvance = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const response = await avancesPaieAPI.request(Number(amount), reason)
      setFeedback({ type: 'success', text: response.message })
      setAmount('')
      setReason('')
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Votre demande n’a pas pu être enregistrée.' })
    } finally {
      setSubmitting(false)
    }
  }

  const total = fiches.reduce((sum, fiche) => sum + Number(fiche.montant || 0), 0)
  const latest = fiches[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mes fiches de paie</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Consultez les fiches validées et envoyez une demande d'avance si nécessaire.</p>
      </div>

      {feedback && <div className={`flex items-start gap-3 rounded-lg border p-4 ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200'}`}>{feedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}<p className="text-sm font-medium">{feedback.text}</p></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Fiches disponibles', value: fiches.length, icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Dernier net', value: latest ? money.format(Number(latest.montant)) : '$0.00', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Cumul affiché', value: money.format(total), icon: Calendar, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
        ].map(stat => <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"><div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}><stat.icon className="h-5 w-5" /></div><p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p></div>)}
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3 border-b border-slate-200 p-5 dark:border-slate-700"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300"><CreditCard className="h-5 w-5" /></div><div><h2 className="font-bold text-slate-800 dark:text-white">Mon moyen de paiement privé</h2><p className="text-sm text-slate-500">Chiffré et visible intégralement uniquement dans votre espace.</p></div></div>
        <form onSubmit={event => void savePaymentMethod(event)} className="grid gap-4 p-5 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Canal<select value={paymentForm.type} onChange={event => setPaymentForm(current => ({ ...current, type: event.target.value as EmployeePaymentMethod['type'] }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-600 dark:bg-slate-900"><option>Compte bancaire</option><option>Airtel Money</option><option>M-Pesa</option><option>Orange Money</option></select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Devise<select value={paymentForm.currency} onChange={event => setPaymentForm(current => ({ ...current, currency: event.target.value as EmployeePaymentMethod['currency'] }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-600 dark:bg-slate-900"><option>USD</option><option>CDF</option></select></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Numéro de compte ou téléphone<input required minLength={6} value={paymentForm.account_identifier} onChange={event => setPaymentForm(current => ({ ...current, account_identifier: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-mono dark:border-slate-600 dark:bg-slate-900" /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Titulaire<input required minLength={3} value={paymentForm.account_holder} onChange={event => setPaymentForm(current => ({ ...current, account_holder: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
          {paymentForm.type === 'Compte bancaire' && <label className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2">Banque<input required value={paymentForm.bank_name || ''} onChange={event => setPaymentForm(current => ({ ...current, bank_name: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>}
          <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 md:col-span-2 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900/50"><div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><LockKeyhole className="h-4 w-4 text-teal-600" />{paymentMethod ? `${paymentMethod.type} · ${paymentMethod.masked_identifier}` : 'Aucun moyen configuré : une paie ne pourra pas être validée.'}</div><button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" /> Enregistrer en sécurité</button></div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4"><h2 className="font-bold text-slate-800 dark:text-white">Demander une avance exceptionnelle</h2><p className="mt-1 text-sm text-slate-500">Toute demande est examinée par le RH. Une avance approuvée est déduite de la fiche du mois.</p></div>
        <form onSubmit={event => void requestAdvance(event)} className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Montant (USD)<input type="number" min="1" step="0.01" required value={amount} onChange={event => setAmount(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motif<textarea required minLength={10} maxLength={2000} rows={2} value={reason} onChange={event => setReason(event.target.value)} className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
          <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Send className="h-4 w-4" /> Envoyer</button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 p-5 dark:border-slate-700"><h2 className="font-bold text-slate-800 dark:text-white">Historique</h2></div>
        {loading ? <p className="p-5 text-sm text-slate-500">Chargement des fiches…</p> : fiches.length === 0 ? <p className="p-5 text-sm text-slate-500">Aucune fiche de paie n'est encore disponible.</p> : <div className="divide-y divide-slate-200 dark:divide-slate-700">{fiches.map(fiche => <article key={fiche.id_paie} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-800 dark:text-white">Période {fiche.mois_paiement}/{fiche.annee_paiement}</p><p className="text-sm text-slate-500">Salaire de base: {money.format(Number(fiche.salaire_base ?? 0))} · Avance déduite: {money.format(Number(fiche.avance_deduite ?? 0))}</p></div><div className="flex items-center gap-3"><strong className="text-lg text-emerald-600">{money.format(Number(fiche.montant))}</strong><span className={`rounded-full px-3 py-1 text-xs font-semibold ${fiche.statut === 'Validée' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'}`}>{fiche.statut}</span></div></article>)}</div>}
      </section>
    </div>
  )
}
