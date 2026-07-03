// Données mock pour la Phase 3

export interface DocumentSignature {
  id: number
  titre: string
  type: 'Contrat' | 'Avenant' | 'Attestation' | 'Evaluation' | 'Autre'
  signataire: string
  signataire_email: string
  date_creation: string
  date_signature?: string
  statut: 'En_attente' | 'Signe' | 'Refuse' | 'Expiré'
  document_url: string
  hash: string
  ip_signature?: string
  historique: SignatureEvent[]
}

export interface SignatureEvent {
  date: string
  action: string
  utilisateur: string
  details: string
}

export interface IntegrationExterne {
  id: number
  nom: string
  description: string
  categorie: 'Communication' | 'Comptabilite' | 'Productivite' | 'RH' | 'Stockage'
  icone: string
  couleur: string
  statut: 'Connecte' | 'Deconnecte' | 'Configuration'
  date_connexion?: string
  donnees_sync: number
  dernier_sync?: string
  fonctionnalites: string[]
  plan: 'Gratuit' | 'Standard' | 'Premium'
}

export interface TicketSupport {
  id: number
  titre: string
  description: string
  categorie: 'Administratif' | 'Technique' | 'Paie' | 'Conges' | 'Formation' | 'Autre'
  priorite: 'Basse' | 'Moyenne' | 'Haute' | 'Urgente'
  statut: 'Ouvert' | 'En_cours' | 'Resolu' | 'Ferme'
  demandeur: string
  assigne_a?: string
  date_creation: string
  date_resolution?: string
  messages: TicketMessage[]
}

export interface TicketMessage {
  id: number
  auteur: string
  contenu: string
  date: string
  est_interne: boolean
}

export interface AppMobileConfig {
  fonctionnalite: string
  active: boolean
  description: string
}

export const mockDocumentsSignature: DocumentSignature[] = [
  {
    id: 1,
    titre: 'Contrat de travail - Alain Ngoy',
    type: 'Contrat',
    signataire: 'Alain Ngoy',
    signataire_email: 'alain@mail.com',
    date_creation: '2026-06-20',
    statut: 'En_attente',
    document_url: '/docs/contrat_alain.pdf',
    hash: 'sha256:a1b2c3d4e5f6...',
    historique: [
      { date: '2026-06-20 10:30', action: 'Creation', utilisateur: 'Grace Mbuyi', details: 'Document cree et envoye pour signature' },
      { date: '2026-06-20 10:31', action: 'Envoi email', utilisateur: 'Systeme', details: 'Email envoye a alain@mail.com' }
    ]
  },
  {
    id: 2,
    titre: 'Avenant contrat - Marie Tshimanga',
    type: 'Avenant',
    signataire: 'Marie Tshimanga',
    signataire_email: 'marie@demo.com',
    date_creation: '2026-06-18',
    date_signature: '2026-06-19',
    statut: 'Signe',
    document_url: '/docs/avenant_marie.pdf',
    hash: 'sha256:f6e5d4c3b2a1...',
    ip_signature: '192.168.1.45',
    historique: [
      { date: '2026-06-18 14:00', action: 'Creation', utilisateur: 'Grace Mbuyi', details: 'Avenant cree' },
      { date: '2026-06-19 09:15', action: 'Signature', utilisateur: 'Marie Tshimanga', details: 'Signe depuis IP 192.168.1.45' }
    ]
  },
  {
    id: 3,
    titre: 'Attestation de travail - David Kasongo',
    type: 'Attestation',
    signataire: 'David Kasongo',
    signataire_email: 'david@demo.com',
    date_creation: '2026-06-15',
    date_signature: '2026-06-15',
    statut: 'Signe',
    document_url: '/docs/attest_david.pdf',
    hash: 'sha256:1a2b3c4d5e6f...',
    ip_signature: '192.168.1.78',
    historique: [
      { date: '2026-06-15 11:00', action: 'Creation et signature', utilisateur: 'David Kasongo', details: 'Document signe immediatement' }
    ]
  },
  {
    id: 4,
    titre: 'Evaluation annuelle - Pierre Kabongo',
    type: 'Evaluation',
    signataire: 'Pierre Kabongo',
    signataire_email: 'pierre@demo.com',
    date_creation: '2026-06-10',
    statut: 'Refuse',
    document_url: '/docs/eval_pierre.pdf',
    hash: 'sha256:9z8y7x6w5v4u...',
    historique: [
      { date: '2026-06-10 16:00', action: 'Creation', utilisateur: 'Moise Vita', details: 'Evaluation envoyee' },
      { date: '2026-06-12 10:00', action: 'Refus', utilisateur: 'Pierre Kabongo', details: 'Demande de modification' }
    ]
  }
]

export const mockIntegrations: IntegrationExterne[] = [
  {
    id: 1,
    nom: 'Slack',
    description: 'Notifications et communication en temps reel avec vos equipes',
    categorie: 'Communication',
    icone: '💬',
    couleur: 'from-primary-500 to-primary-700',
    statut: 'Connecte',
    date_connexion: '2026-01-15',
    donnees_sync: 1247,
    dernier_sync: '2026-06-25 08:30',
    fonctionnalites: ['Notifications automatiques', 'Alertes conges', 'Rappels evaluations', 'Annonces RH'],
    plan: 'Standard'
  },
  {
    id: 2,
    nom: 'Microsoft Teams',
    description: 'Integration complete avec l\'ecosysteme Microsoft 365',
    categorie: 'Communication',
    icone: '👥',
    couleur: 'from-accent-500 to-accent-700',
    statut: 'Connecte',
    date_connexion: '2026-02-01',
    donnees_sync: 856,
    dernier_sync: '2026-06-25 09:00',
    fonctionnalites: ['Reunions automatiques', 'Partage de documents', 'Chat RH', 'SSO'],
    plan: 'Premium'
  },
  {
    id: 3,
    nom: 'QuickBooks',
    description: 'Synchronisation comptable automatique des paies',
    categorie: 'Comptabilite',
    icone: '📊',
    couleur: 'from-warm-500 to-warm-600',
    statut: 'Connecte',
    date_connexion: '2026-01-20',
    donnees_sync: 342,
    dernier_sync: '2026-06-25 02:00',
    fonctionnalites: ['Export paies', 'Charges sociales', 'Rapports fiscaux', 'Budget RH'],
    plan: 'Premium'
  },
  {
    id: 4,
    nom: 'Sage Paie',
    description: 'Solution de paie francaise integree',
    categorie: 'Comptabilite',
    icone: '💰',
    couleur: 'from-slate-500 to-slate-700',
    statut: 'Deconnecte',
    donnees_sync: 0,
    fonctionnalites: ['Bulletins de paie', 'DSN', 'Conges payes', 'Mutuelle'],
    plan: 'Standard'
  },
  {
    id: 5,
    nom: 'Google Workspace',
    description: 'Email, calendrier et stockage cloud Google',
    categorie: 'Productivite',
    icone: '📧',
    couleur: 'from-primary-600 to-accent-600',
    statut: 'Connecte',
    date_connexion: '2026-01-10',
    donnees_sync: 2156,
    dernier_sync: '2026-06-25 10:15',
    fonctionnalites: ['Email automatique', 'Calendrier conges', 'Drive documents', 'Meet entretiens'],
    plan: 'Standard'
  },
  {
    id: 6,
    nom: 'Dropbox Business',
    description: 'Stockage securise des documents RH',
    categorie: 'Stockage',
    icone: '📁',
    couleur: 'from-primary-500 to-accent-500',
    statut: 'Configuration',
    donnees_sync: 0,
    fonctionnalites: ['Archive documents', 'Partage securise', 'Versioning', 'Backup automatique'],
    plan: 'Gratuit'
  },
  {
    id: 7,
    nom: 'LinkedIn Recruiter',
    description: 'Recrutement et sourcing de candidats',
    categorie: 'RH',
    icone: '💼',
    couleur: 'from-primary-600 to-primary-800',
    statut: 'Deconnecte',
    donnees_sync: 0,
    fonctionnalites: ['Publication offres', 'Sourcing candidats', 'Messagerie', 'Analytics recrutement'],
    plan: 'Premium'
  },
  {
    id: 8,
    nom: 'BambooHR',
    description: 'Synchronisation avec d\'autres outils RH',
    categorie: 'RH',
    icone: '🌱',
    couleur: 'from-accent-500 to-accent-700',
    statut: 'Configuration',
    donnees_sync: 0,
    fonctionnalites: ['Import employes', 'Sync conges', 'Onboarding', 'Performance'],
    plan: 'Standard'
  }
]

export const mockTickets: TicketSupport[] = [
  {
    id: 1,
    titre: 'Erreur sur bulletin de paie Juin',
    description: 'Mon bulletin de paie ne prend pas en compte mes heures supplementaires du mois de Juin.',
    categorie: 'Paie',
    priorite: 'Haute',
    statut: 'En_cours',
    demandeur: 'Moise Vita',
    assigne_a: 'Service Paie',
    date_creation: '2026-06-24',
    messages: [
      { id: 1, auteur: 'Moise Vita', contenu: 'Bonjour, j\'ai constate une erreur sur mon bulletin...', date: '2026-06-24 10:30', est_interne: false },
      { id: 2, auteur: 'Service Paie', contenu: 'Bonjour Moise, nous avons bien recu votre demande...', date: '2026-06-24 14:00', est_interne: true }
    ]
  },
  {
    id: 2,
    titre: 'Demande d\'attestation de travail',
    description: 'J\'ai besoin d\'une attestation de travail pour un dossier de location.',
    categorie: 'Administratif',
    priorite: 'Moyenne',
    statut: 'Resolu',
    demandeur: 'Grace Mbuyi',
    assigne_a: 'RH',
    date_creation: '2026-06-20',
    date_resolution: '2026-06-21',
    messages: [
      { id: 3, auteur: 'Grace Mbuyi', contenu: 'Bonjour, je souhaite obtenir une attestation...', date: '2026-06-20 09:00', est_interne: false },
      { id: 4, auteur: 'RH', contenu: 'Attestation generee et envoyee par email.', date: '2026-06-21 11:00', est_interne: true }
    ]
  },
  {
    id: 3,
    titre: 'Probleme de connexion portail employe',
    description: 'Impossible de me connecter au portail employe depuis hier.',
    categorie: 'Technique',
    priorite: 'Urgente',
    statut: 'En_cours',
    demandeur: 'David Kasongo',
    assigne_a: 'Support IT',
    date_creation: '2026-06-25',
    messages: [
      { id: 5, auteur: 'David Kasongo', contenu: 'J\'ai un message d\'erreur 403...', date: '2026-06-25 08:15', est_interne: false }
    ]
  },
  {
    id: 4,
    titre: 'Modification dates de conges',
    description: 'Je souhaite deplacer mes conges du 15-20 Juillet au 22-27 Juillet.',
    categorie: 'Conges',
    priorite: 'Basse',
    statut: 'Ouvert',
    demandeur: 'Marie Tshimanga',
    date_creation: '2026-06-25',
    messages: [
      { id: 6, auteur: 'Marie Tshimanga', contenu: 'Bonjour, est-il possible de modifier...', date: '2026-06-25 11:00', est_interne: false }
    ]
  }
]

export const mockAppMobileConfig: AppMobileConfig[] = [
  { fonctionnalite: 'Pointage GPS', active: true, description: 'Pointage geolocalise pour les employes sur le terrain' },
  { fonctionnalite: 'Notifications Push', active: true, description: 'Alertes en temps reel sur mobile' },
  { fonctionnalite: 'Demande de conges', active: true, description: 'Soumettre et suivre ses conges' },
  { fonctionnalite: 'Consultation paie', active: true, description: 'Voir ses bulletins de paie' },
  { fonctionnalite: 'Messagerie interne', active: false, description: 'Chat avec les collegues et RH' },
  { fonctionnalite: 'Formation mobile', active: true, description: 'Suivre des formations sur mobile' },
  { fonctionnalite: 'Signature mobile', active: true, description: 'Signer des documents sur mobile' },
  { fonctionnalite: 'Annuaire entreprise', active: true, description: 'Contacter facilement ses collegues' }
]