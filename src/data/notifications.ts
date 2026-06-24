export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  date: string
  read: boolean
}

export const adminNotifications: Notification[] = [
  { id: 1, title: 'Nouvelle entreprise inscrite', message: 'Tech Solutions SARL vient de creer son compte', type: 'success', date: 'Il y a 5 minutes', read: false },
  { id: 2, title: 'Tentative de connexion suspecte', message: 'IP 192.168.1.100 a echoue 5 fois', type: 'error', date: 'Il y a 15 minutes', read: false },
  { id: 3, title: 'Sauvegarde automatique', message: 'Backup effectue avec succes', type: 'info', date: 'Il y a 1 heure', read: true },
  { id: 4, title: 'Mise a jour systeme', message: 'Nouvelle version disponible v2.1.0', type: 'warning', date: 'Il y a 2 heures', read: true },
  { id: 5, title: 'Utilisateur suspendu', message: 'Le compte user@fake.com a ete suspendu', type: 'info', date: 'Il y a 3 heures', read: true },
]

export const directeurNotifications: Notification[] = [
  { id: 1, title: 'Rapport mensuel genere', message: 'Le rapport de Juin 2026 est pret', type: 'success', date: 'Il y a 10 minutes', read: false },
  { id: 2, title: 'Contrat expirant', message: 'Le contrat de Paul Kasongo expire dans 30 jours', type: 'warning', date: 'Il y a 30 minutes', read: false },
  { id: 3, title: 'Nouveau candidat', message: 'Alain Ngoy a postule pour Developpeur Senior', type: 'info', date: 'Il y a 1 heure', read: false },
  { id: 4, title: 'Objectif atteint', message: 'Recrutement: 12/10 employes ce mois', type: 'success', date: 'Il y a 2 heures', read: true },
  { id: 5, title: 'Budget depasse', message: 'Masse salariale depasse le budget prevu de 5%', type: 'error', date: 'Il y a 3 heures', read: true },
]

export const rhNotifications: Notification[] = [
  { id: 1, title: 'Demande de conge', message: 'Marie Tshimanga demande 15 jours de conge', type: 'warning', date: 'Il y a 5 minutes', read: false },
  { id: 2, title: 'Document en attente', message: 'Jean Ilunga doit soumettre son diplome', type: 'info', date: 'Il y a 20 minutes', read: false },
  { id: 3, title: 'Entretien planifie', message: 'Entretien avec Beatrice Lunda demain a 10h', type: 'info', date: 'Il y a 1 heure', read: false },
  { id: 4, title: 'Paie generee', message: 'Fiches de paie de Juin generees avec succes', type: 'success', date: 'Il y a 2 heures', read: true },
  { id: 5, title: 'Contrat signe', message: 'Alice Mukendi a signe son contrat CDI', type: 'success', date: 'Il y a 3 heures', read: true },
  { id: 6, title: 'Retard signale', message: '3 employes en retard aujourd\'hui', type: 'warning', date: 'Il y a 4 heures', read: true },
]

export const employeNotifications: Notification[] = [
  { id: 1, title: 'Fiche de paie disponible', message: 'Votre fiche de paie de Juin est disponible', type: 'success', date: 'Il y a 1 heure', read: false },
  { id: 2, title: 'Conge approuve', message: 'Votre demande de conge du 01/07 au 15/07 est approuvee', type: 'success', date: 'Il y a 2 heures', read: false },
  { id: 3, title: 'Rappel: Evaluation', message: 'Votre evaluation annuelle est prevue le 20/06', type: 'warning', date: 'Il y a 3 heures', read: false },
  { id: 4, title: 'Nouvel avantage', message: 'Vous etes eligible au programme de formation', type: 'info', date: 'Il y a 1 jour', read: true },
  { id: 5, title: 'Document valide', message: 'Votre CV a ete valide par le service RH', type: 'success', date: 'Il y a 2 jours', read: true },
]