import { AlertTriangle, Loader2, X } from 'lucide-react'

type DeleteConfirmationModalProps = {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  isSubmitting?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const DeleteConfirmationModal = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Supprimer définitivement',
  isSubmitting = false,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-confirmation-title">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-red-200 bg-white shadow-2xl dark:border-red-900/60 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="delete-confirmation-title" className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Fermer la confirmation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col-reverse gap-3 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end dark:bg-slate-800/70">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
            Annuler
          </button>
          <button type="button" onClick={onConfirm} disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Suppression...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}