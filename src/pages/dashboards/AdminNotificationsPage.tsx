import { NotificationsCenter } from '../../components/notifications/NotificationsCenter'

export const AdminNotificationsPage = () => (
  <NotificationsCenter
    title="Notifications administrateur"
    description="Consultez uniquement les événements système qui vous sont personnellement adressés."
    accentClassName="bg-red-600 hover:bg-red-700"
  />
)
