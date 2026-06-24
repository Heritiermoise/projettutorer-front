// Service de gestion des notifications email (simulation frontend)
// En production, ce service communiquera avec le backend Laravel

export interface EmailNotification {
  id: number
  type: 'entretien' | 'validation' | 'candidature' | 'poste' | 'paie' | 'conge' | 'document' | 'systeme'
  titre: string
  message: string
  destinataire: string
  expediteur: string
  date: string
  lu: boolean
  important: boolean
  actionRequise: boolean
  metadata?: any
}

export interface EmailTemplate {
  id: number
  nom: string
  sujet: string
  contenu: string
  categorie: string
  variables: string[]
}

const STORAGE_KEY = 'email_notifications'
const TEMPLATES_KEY = 'email_templates'

// Templates par defaut
const defaultTemplates: EmailTemplate[] = [
  {
    id: 1,
    nom: 'Invitation entretien',
    sujet: 'Invitation a un entretien - {poste}',
    contenu: 'Bonjour {candidat},\n\nNous avons le plaisir de vous inviter a un entretien pour le poste de {poste}.\n\nDate: {date}\nHeure: {heure}\nType: {type}\n\nCordialement,\n{entreprise}',
    categorie: 'entretien',
    variables: ['candidat', 'poste', 'date', 'heure', 'type', 'entreprise']
  },
  {
    id: 2,
    nom: 'Validation candidature',
    sujet: 'Votre candidature a ete validee - Bienvenue chez {entreprise}',
    contenu: 'Bonjour {candidat},\n\nFelicitations ! Votre candidature pour le poste de {poste} a ete validee.\n\nVos identifiants de connexion :\nEmail: {email}\nMot de passe: {mot_de_passe}\n\nCordialement,\n{entreprise}',
    categorie: 'validation',
    variables: ['candidat', 'poste', 'email', 'mot_de_passe', 'entreprise']
  },
  {
    id: 3,
    nom: 'Rejet candidature',
    sujet: 'Suite a votre candidature pour {poste}',
    contenu: 'Bonjour {candidat},\n\nNous vous remercions pour votre candidature au poste de {poste}.\n\nApres etude de votre dossier, nous ne pouvons malheureusement pas donner une suite favorable.\n\nCordialement,\n{entreprise}',
    categorie: 'candidature',
    variables: ['candidat', 'poste', 'entreprise']
  },
  {
    id: 4,
    nom: 'Nouvelle offre publiee',
    sujet: 'Nouvelle offre d\'emploi : {poste}',
    contenu: 'Bonjour,\n\nUne nouvelle offre d\'emploi a ete publiee : {poste}\n\nConsultez les details sur notre plateforme.\n\nCordialement,\n{entreprise}',
    categorie: 'poste',
    variables: ['poste', 'entreprise']
  },
  {
    id: 5,
    nom: 'Fiche de paie disponible',
    sujet: 'Votre fiche de paie de {mois} est disponible',
    contenu: 'Bonjour {employe},\n\nVotre fiche de paie pour le mois de {mois} est desormais disponible dans votre espace personnel.\n\nMontant net: {montant}\n\nCordialement,\nService RH',
    categorie: 'paie',
    variables: ['employe', 'mois', 'montant']
  },
  {
    id: 6,
    nom: 'Conge approuve',
    sujet: 'Votre demande de conge a ete approuvee',
    contenu: 'Bonjour {employe},\n\nVotre demande de conge du {date_debut} au {date_fin} a ete approuvee.\n\nNombre de jours: {jours}\n\nCordialement,\nService RH',
    categorie: 'conge',
    variables: ['employe', 'date_debut', 'date_fin', 'jours']
  }
]

export const emailService = {
  // Recuperer toutes les notifications
  getAllNotifications: (): EmailNotification[] => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    return []
  },

  // Ajouter une notification
  addNotification: (notification: Omit<EmailNotification, 'id' | 'date' | 'lu'>): EmailNotification => {
    const notifications = emailService.getAllNotifications()
    const newNotification: EmailNotification = {
      ...notification,
      id: Date.now(),
      date: new Date().toISOString(),
      lu: false,
    }
    notifications.unshift(newNotification)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    return newNotification
  },

  // Marquer comme lu
  markAsRead: (id: number): void => {
    const notifications = emailService.getAllNotifications()
    const updated = notifications.map(n => n.id === id ? { ...n, lu: true } : n)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  },

  // Marquer tout comme lu
  markAllAsRead: (): void => {
    const notifications = emailService.getAllNotifications()
    const updated = notifications.map(n => ({ ...n, lu: true }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  },

  // Supprimer
  deleteNotification: (id: number): void => {
    const notifications = emailService.getAllNotifications()
    const filtered = notifications.filter(n => n.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  },

  // Vider tout
  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEY)
  },

  // Statistiques
  getStats: () => {
    const notifications = emailService.getAllNotifications()
    return {
      total: notifications.length,
      nonLus: notifications.filter(n => !n.lu).length,
      importants: notifications.filter(n => n.important).length,
      actionRequise: notifications.filter(n => n.actionRequise).length,
      parType: {
        entretien: notifications.filter(n => n.type === 'entretien').length,
        validation: notifications.filter(n => n.type === 'validation').length,
        candidature: notifications.filter(n => n.type === 'candidature').length,
        poste: notifications.filter(n => n.type === 'poste').length,
        paie: notifications.filter(n => n.type === 'paie').length,
        conge: notifications.filter(n => n.type === 'conge').length,
      }
    }
  },

  // Templates
  getTemplates: (): EmailTemplate[] => {
    const stored = localStorage.getItem(TEMPLATES_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultTemplates))
    return defaultTemplates
  },

  saveTemplate: (template: EmailTemplate): void => {
    const templates = emailService.getTemplates()
    const existing = templates.findIndex(t => t.id === template.id)
    if (existing >= 0) {
      templates[existing] = template
    } else {
      templates.push({ ...template, id: Date.now() })
    }
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  },

  // Simuler l'envoi d'un email (en production : appel API backend)
  sendEmail: (to: string, sujet: string, contenu: string): boolean => {
    console.log(`[EMAIL SIMULATION] To: ${to} | Sujet: ${sujet}`)
    console.log(`[EMAIL SIMULATION] Contenu: ${contenu.substring(0, 100)}...`)
    return true
  },

  // Notifications automatiques
  notifyEntretien: (candidat: string, email: string, poste: string, date: string, heure: string, type: string, entreprise: string) => {
    const template = emailService.getTemplates().find(t => t.categorie === 'entretien')
    if (!template) return
    
    const contenu = template.contenu
      .replace('{candidat}', candidat)
      .replace('{poste}', poste)
      .replace('{date}', date)
      .replace('{heure}', heure)
      .replace('{type}', type)
      .replace('{entreprise}', entreprise)
    
    const sujet = template.sujet.replace('{poste}', poste)
    
    emailService.sendEmail(email, sujet, contenu)
    
    emailService.addNotification({
      type: 'entretien',
      titre: 'Entretien planifie',
      message: `Entretien avec ${candidat} pour le poste de ${poste} le ${date} a ${heure}`,
      destinataire: email,
      expediteur: entreprise,
      important: true,
      actionRequise: true,
      metadata: { candidat, poste, date, heure, type }
    })
  },

  notifyValidation: (candidat: string, email: string, poste: string, motDePasse: string, entreprise: string) => {
    const template = emailService.getTemplates().find(t => t.categorie === 'validation')
    if (!template) return
    
    const contenu = template.contenu
      .replace('{candidat}', candidat)
      .replace('{poste}', poste)
      .replace('{email}', email)
      .replace('{mot_de_passe}', motDePasse)
      .replace('{entreprise}', entreprise)
    
    const sujet = template.sujet.replace('{entreprise}', entreprise)
    
    emailService.sendEmail(email, sujet, contenu)
    
    emailService.addNotification({
      type: 'validation',
      titre: 'Candidat valide',
      message: `${candidat} a ete valide pour le poste de ${poste}. Email envoye avec les identifiants.`,
      destinataire: email,
      expediteur: entreprise,
      important: true,
      actionRequise: false,
      metadata: { candidat, poste, motDePasse }
    })
  },

  notifyRejet: (candidat: string, email: string, poste: string, entreprise: string) => {
    const template = emailService.getTemplates().find(t => t.categorie === 'candidature')
    if (!template) return
    
    const contenu = template.contenu
      .replace('{candidat}', candidat)
      .replace('{poste}', poste)
      .replace('{entreprise}', entreprise)
    
    const sujet = template.sujet.replace('{poste}', poste)
    
    emailService.sendEmail(email, sujet, contenu)
    
    emailService.addNotification({
      type: 'candidature',
      titre: 'Candidat refuse',
      message: `${candidat} a ete refuse pour le poste de ${poste}`,
      destinataire: email,
      expediteur: entreprise,
      important: false,
      actionRequise: false,
      metadata: { candidat, poste }
    })
  },
}