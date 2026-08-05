import { useEffect, useState } from 'react'
import { Bell, CheckCheck, LoaderCircle, Trash2 } from 'lucide-react'
import { notificationAPI } from '../../services/api'

type NotificationItem = {
  id: number
  titre: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | string
  lu: boolean
  created_at: string
}

type NotificationsCenterProps = {
  title: string
  description: string
  accentClassName: string
}

const typeStyles: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200',
  info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
}

export const NotificationsCenter = ({ title, description, accentClassName }: NotificationsCenterProps) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getAll()
      setNotifications(response.notifications || [])
    } catch (error) {
      console.error('Erreur lors du chargement des notifications :', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadNotifications()
    const intervalId = window.setInterval(() => void loadNotifications(), 10000)
    return () => window.clearInterval(intervalId)
  }, [])

  const markAsRead = async (id: number) => {
    if (notifications.find((notification) => notification.id === id)?.lu) return

    setActionId(id)
    try {
      await notificationAPI.markRead(id)
      await loadNotifications()
    } finally {
      setActionId(null)
    }
  }

  const markAllAsRead = async () => {
    setActionId(-1)
    try {
      await notificationAPI.markAllRead()
      await loadNotifications()
    } finally {
      setActionId(null)
    }
  }

  const deleteNotification = async (id: number) => {
    setActionId(id)
    try {
      await notificationAPI.delete(id)
      setNotifications((current) => current.filter((notification) => notification.id !== id))
    } finally {
      setActionId(null)
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.lu).length

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">{title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-base">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => void markAllAsRead()}
          disabled={unreadCount === 0 || actionId !== null}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${accentClassName}`}
        >
          {actionId === -1 ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
          Tout marquer lu
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Chargement des notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
            <Bell className="mb-3 h-12 w-12 opacity-35" />
            <p className="font-medium">Aucune notification</p>
            <p className="mt-1 text-sm">Les nouveaux événements de votre espace apparaîtront ici.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                onClick={() => void markAsRead(notification.id)}
                className={`flex cursor-pointer items-start gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${notification.lu ? '' : 'bg-slate-50/80 dark:bg-slate-700/20'}`}
              >
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.lu ? 'bg-slate-300 dark:bg-slate-600' : 'bg-primary-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <h2 className={`text-sm ${notification.lu ? 'font-semibold text-slate-700 dark:text-slate-200' : 'font-bold text-slate-900 dark:text-white'}`}>{notification.titre}</h2>
                    <time className="text-xs text-slate-500 dark:text-slate-400">{new Date(notification.created_at).toLocaleString('fr-FR')}</time>
                  </div>
                  <p className={`mt-2 rounded-md border px-3 py-2 text-sm ${typeStyles[notification.type] || typeStyles.info}`}>{notification.message}</p>
                </div>
                <button
                  type="button"
                  aria-label="Supprimer la notification"
                  title="Supprimer la notification"
                  onClick={(event) => {
                    event.stopPropagation()
                    void deleteNotification(notification.id)
                  }}
                  disabled={actionId === notification.id}
                  className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
                >
                  {actionId === notification.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}