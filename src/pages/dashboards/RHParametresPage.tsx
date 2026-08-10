import { useEffect, useState } from 'react'
import { Bell, CheckCircle2, Clock3, LoaderCircle, Save, Settings2, ShieldCheck, SlidersHorizontal, WalletCards } from 'lucide-react'
import { entrepriseParametresAPI } from '../../services/api'

type SettingsForm = {
  fuseau_horaire: string
  langue: 'fr' | 'en'
  jours_conge_annuel: number
  heure_arrivee: string
  heure_depart: string
  tolerance_retard_minutes: number
  heures_travail_jour: number
  approbation_auto_conges: boolean
  seuil_conge_auto_jours: number
  generation_auto_paie: boolean
  jour_generation_paie: number
  deduction_absence_active: boolean
  deduction_absence_jour: number
  notification_conges: boolean
  notification_contrats: boolean
  notification_retards: boolean
  notification_candidatures: boolean
  notification_rapports: boolean
}

const defaults: SettingsForm = {
  fuseau_horaire: 'Africa/Lubumbashi', langue: 'fr', jours_conge_annuel: 30,
  heure_arrivee: '08:00', heure_depart: '17:00', tolerance_retard_minutes: 15,
  heures_travail_jour: 8, approbation_auto_conges: false, seuil_conge_auto_jours: 3,
  generation_auto_paie: true, jour_generation_paie: 1, deduction_absence_active: false,
  deduction_absence_jour: 0, notification_conges: true, notification_contrats: true,
  notification_retards: true, notification_candidatures: true, notification_rapports: false,
}

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) => (
  <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-7 w-12 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
)

export const RHParametresPage = () => {
  const [activeTab, setActiveTab] = useState<'work' | 'payroll' | 'notifications' | 'general'>('work')
  const [settings, setSettings] = useState<SettingsForm>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await entrepriseParametresAPI.get()
        setSettings({ ...defaults, ...(response.parametres || {}) })
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'Impossible de charger les paramètres RH.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const update = <Key extends keyof SettingsForm>(key: Key, value: SettingsForm[Key]) => setSettings((current) => ({ ...current, [key]: value }))

  const save = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      const response = await entrepriseParametresAPI.update(settings)
      setSettings({ ...defaults, ...(response.parametres || settings) })
      setFeedback('Paramètres RH enregistrés et appliqués à votre entreprise.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Impossible d’enregistrer les paramètres.')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'work' as const, label: 'Temps de travail', icon: Clock3 },
    { id: 'payroll' as const, label: 'Paie automatique', icon: WalletCards },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'general' as const, label: 'Général', icon: Settings2 },
  ]

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-2 text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des paramètres...</div>

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">Paramètres RH</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">Règles réelles de présence, congé, paie et notifications pour votre entreprise.</p>
      </header>

      {feedback && <div className={`fixed right-5 top-5 z-[70] flex max-w-md items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-xl ${feedback.startsWith('Paramètres') ? 'border-emerald-200/50 bg-emerald-400/20 text-emerald-950 dark:text-emerald-100' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300'}`}><CheckCircle2 className="h-5 w-5 shrink-0" />{feedback}</div>}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <nav className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`inline-flex shrink-0 items-center gap-2 px-5 py-4 text-sm font-semibold ${activeTab === tab.id ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-600 hover:text-primary-600 dark:text-slate-400'}`}><tab.icon className="h-4 w-4" />{tab.label}</button>)}
        </nav>

        <div className="p-5 sm:p-6">
          {activeTab === 'work' && <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Heure d’arrivée<input type="time" value={settings.heure_arrivee} onChange={(event) => update('heure_arrivee', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Heure de fermeture<input type="time" value={settings.heure_depart} onChange={(event) => update('heure_depart', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tolérance de retard<input min="0" max="240" type="number" value={settings.tolerance_retard_minutes} onChange={(event) => update('tolerance_retard_minutes', Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Heures travaillées / jour<input min="1" max="24" type="number" value={settings.heures_travail_jour} onChange={(event) => update('heures_travail_jour', Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">Un pointage après <strong>{settings.heure_arrivee}</strong> + <strong>{settings.tolerance_retard_minutes} minutes</strong> est classé « Retard ». Les absences automatiques sont évaluées après <strong>{settings.heure_depart}</strong>.</div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Droits annuels de congé<input min="1" max="365" type="number" value={settings.jours_conge_annuel} onChange={(event) => update('jours_conge_annuel', Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900" /></label>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50"><div><p className="font-semibold text-slate-800 dark:text-white">Validation automatique des congés</p><p className="mt-1 text-sm text-slate-500">Jusqu’à {settings.seuil_conge_auto_jours} jour(s).</p></div><Toggle label="Validation automatique des congés" checked={settings.approbation_auto_conges} onChange={(value) => update('approbation_auto_conges', value)} /></div>
            </div>
          </div>}

          {activeTab === 'payroll' && <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 p-5 dark:border-slate-700"><div className="flex items-center justify-between gap-4"><div><h2 className="font-bold text-slate-800 dark:text-white">Génération automatique des brouillons de paie</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Les fiches restent à valider: aucun paiement n’est exécuté automatiquement.</p></div><Toggle label="Génération automatique des paies" checked={settings.generation_auto_paie} onChange={(value) => update('generation_auto_paie', value)} /></div><label className="mt-5 block max-w-xs text-sm font-semibold text-slate-700 dark:text-slate-200">Jour mensuel de génération<select value={settings.jour_generation_paie} onChange={(event) => update('jour_generation_paie', Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900">{Array.from({ length: 28 }, (_, index) => <option key={index + 1} value={index + 1}>Le {index + 1} du mois</option>)}</select></label></div>
            <div className="rounded-lg border border-slate-200 p-5 dark:border-slate-700"><div className="flex items-center justify-between gap-4"><div><h2 className="font-bold text-slate-800 dark:text-white">Retenue proportionnelle aux absences</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Calculée sur les présences « Absent » du mois et visible avant validation.</p></div><Toggle label="Activer la retenue d'absence" checked={settings.deduction_absence_active} onChange={(value) => update('deduction_absence_active', value)} /></div><label className="mt-5 block max-w-xs text-sm font-semibold text-slate-700 dark:text-slate-200">Pourcentage du salaire journalier par absence<input min="0" max="100" step="0.01" disabled={!settings.deduction_absence_active} type="number" value={settings.deduction_absence_jour} onChange={(event) => update('deduction_absence_jour', Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900" /></label></div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">Le calcul utilise le contrat actif ou le salaire employé, les avantages actifs chiffrés, les avances approuvées et les retenues activées ci-dessus.</div>
          </div>}

          {activeTab === 'notifications' && <div className="space-y-3">{[
            ['notification_conges', 'Demandes de congé', 'Alerte à chaque nouvelle demande.'], ['notification_contrats', 'Contrats expirants', 'Alerte de suivi des échéances.'], ['notification_retards', 'Retards signalés', 'Suivi des pointages tardifs.'], ['notification_candidatures', 'Nouvelles candidatures', 'Alerte lors d’une postulation.'], ['notification_rapports', 'Rapport hebdomadaire', 'Résumé envoyé chaque semaine.'],
          ].map(([key, title, description]) => <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700"><div><p className="font-semibold text-slate-800 dark:text-white">{title}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p></div><Toggle label={title} checked={settings[key as keyof SettingsForm] as boolean} onChange={(value) => update(key as keyof SettingsForm, value as never)} /></div>)}</div>}

          {activeTab === 'general' && <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fuseau horaire<select value={settings.fuseau_horaire} onChange={(event) => update('fuseau_horaire', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900"><option value="Africa/Lubumbashi">Africa/Lubumbashi (UTC+2)</option><option value="Africa/Kinshasa">Africa/Kinshasa (UTC+1)</option></select></label><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Langue<select value={settings.langue} onChange={(event) => update('langue', event.target.value as 'fr' | 'en')} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900"><option value="fr">Français</option><option value="en">English</option></select></label><div className="md:col-span-2 flex items-center gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50"><ShieldCheck className="h-6 w-6 text-primary-600" /><p className="text-sm text-slate-600 dark:text-slate-300">Seuls les rôles RH, Direction et administrateur peuvent modifier ces règles d’entreprise.</p></div></div>}
        </div>

        <footer className="flex justify-end border-t border-slate-200 p-5 dark:border-slate-700"><button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Enregistrement...' : 'Sauvegarder les paramètres'}</button></footer>
      </section>
    </div>
  )
}
