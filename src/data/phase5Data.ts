// Données mock Phase 5 - Modules critiques

export interface Candidature {
  id: number
  offre_id: number
  offre_titre: string
  entreprise: string
  date_postulation: string
  statut: 'Soumise' | 'En_revision' | 'Entretien' | 'Acceptee' | 'Refusee'
  etape: number
  messages: CandidatureMessage[]
}

export interface CandidatureMessage {
  id: number
  auteur: string
  contenu: string
  date: string
  est_systeme: boolean
}

export interface Conversation {
  id: number
  titre: string
  participants: string[]
  dernier_message: string
  date_dernier_message: string
  non_lus: number
  avatar: string
  type: 'direct' | 'groupe'
}

export interface Message {
  id: number
  conversation_id: number
  expediteur: string
  contenu: string
  date: string
  lu: boolean
  type: 'texte' | 'fichier' | 'systeme'
}

export interface EvenementCalendrier {
  id: number
  titre: string
  description: string
  date_debut: string
  date_fin: string
  type: 'conge' | 'entretien' | 'formation' | 'ferie' | 'reunion'
  couleur: string
  participants?: string[]
  lieu?: string
}

export interface Permission {
  id: number
  role: string
  module: string
  lecture: boolean
  ecriture: boolean
  suppression: boolean
  administration: boolean
}

export interface EntrepriseMulti {
  id: number
  nom: string
  code: string
  role: string
  statut: string
  logo?: string
  date_rejoins: string
}

export const mockCandidatures: Candidature[] = [
  {
    id: 1,
    offre_id: 1,
    offre_titre: 'Developpeur Full Stack Senior',
    entreprise: 'VitaService SARL',
    date_postulation: '2026-06-20',
    statut: 'Entretien',
    etape: 3,
    messages: [
      { id: 1, auteur: 'Systeme', contenu: 'Candidature recue', date: '2026-06-20 10:00', est_systeme: true },
      { id: 2, auteur: 'RH VitaService', contenu: 'Votre profil nous interesse', date: '2026-06-21 14:30', est_systeme: false },
      { id: 3, auteur: 'Systeme', contenu: 'Entretien planifie le 25/06', date: '2026-06-22 09:00', est_systeme: true }
    ]
  },
  {
    id: 2,
    offre_id: 2,
    offre_titre: 'Designer UX/UI',
    entreprise: 'Tech Solutions',
    date_postulation: '2026-06-18',
    statut: 'En_revision',
    etape: 2,
    messages: [
      { id: 4, auteur: 'Systeme', contenu: 'Candidature recue', date: '2026-06-18 11:00', est_systeme: true }
    ]
  },
  {
    id: 3,
    offre_id: 3,
    offre_titre: 'Chef de Projet IT',
    entreprise: 'VitaService SARL',
    date_postulation: '2026-06-15',
    statut: 'Refusee',
    etape: 4,
    messages: [
      { id: 5, auteur: 'Systeme', contenu: 'Candidature recue', date: '2026-06-15 09:00', est_systeme: true },
      { id: 6, auteur: 'RH VitaService', contenu: 'Merci mais profil ne correspond pas', date: '2026-06-17 16:00', est_systeme: false }
    ]
  }
]

export const mockConversations: Conversation[] = [
  { id: 1, titre: 'Grace Mbuyi (RH)', participants: ['Grace Mbuyi'], dernier_message: 'Votre demande de conge est approuvee', date_dernier_message: '2026-06-25 14:30', non_lus: 2, avatar: 'GM', type: 'direct' },
  { id: 2, titre: 'Equipe Informatique', participants: ['David Kasongo', 'Jean Ilunga', 'Alice Mukendi'], dernier_message: 'Reunion demain a 10h', date_dernier_message: '2026-06-25 11:00', non_lus: 0, avatar: 'EI', type: 'groupe' },
  { id: 3, titre: 'Pierre Kabongo (Directeur)', participants: ['Pierre Kabongo'], dernier_message: 'Merci pour le rapport', date_dernier_message: '2026-06-24 16:45', non_lus: 1, avatar: 'PK', type: 'direct' },
  { id: 4, titre: 'Support RH', participants: ['Service RH'], dernier_message: 'Votre bulletin est pret', date_dernier_message: '2026-06-24 09:00', non_lus: 0, avatar: 'SR', type: 'direct' }
]

export const mockMessages: Message[] = [
  { id: 1, conversation_id: 1, expediteur: 'Grace Mbuyi', contenu: 'Bonjour, j\'ai bien recu votre demande', date: '2026-06-25 14:00', lu: true, type: 'texte' },
  { id: 2, conversation_id: 1, expediteur: 'Moi', contenu: 'Merci, quand aurai-je une reponse ?', date: '2026-06-25 14:15', lu: true, type: 'texte' },
  { id: 3, conversation_id: 1, expediteur: 'Grace Mbuyi', contenu: 'Votre demande de conge est approuvee', date: '2026-06-25 14:30', lu: false, type: 'texte' }
]

export const mockEvenements: EvenementCalendrier[] = [
  { id: 1, titre: 'Conge annuel - Marie T.', description: 'Conge du 1 au 15 juillet', date_debut: '2026-07-01', date_fin: '2026-07-15', type: 'conge', couleur: '#10b981' },
  { id: 2, titre: 'Entretien - Alain Ngoy', description: 'Entretien technique', date_debut: '2026-06-26', date_fin: '2026-06-26', type: 'entretien', couleur: '#f59e0b', lieu: 'Salle A' },
  { id: 3, titre: 'Formation React', description: 'Formation avancee', date_debut: '2026-07-10', date_fin: '2026-07-12', type: 'formation', couleur: '#8b5cf6', participants: ['EMP-001', 'EMP-003'] },
  { id: 4, titre: 'Fete de l\'Independance', description: 'Jour ferie national', date_debut: '2026-06-30', date_fin: '2026-06-30', type: 'ferie', couleur: '#ef4444' },
  { id: 5, titre: 'Reunion d\'equipe', description: 'Point hebdomadaire', date_debut: '2026-06-27', date_fin: '2026-06-27', type: 'reunion', couleur: '#3b82f6', lieu: 'Salle B' }
]

export const mockPermissions: Permission[] = [
  { id: 1, role: 'Directeur', module: 'Employes', lecture: true, ecriture: true, suppression: true, administration: true },
  { id: 2, role: 'Directeur', module: 'Paie', lecture: true, ecriture: true, suppression: false, administration: true },
  { id: 3, role: 'Directeur', module: 'Recrutement', lecture: true, ecriture: true, suppression: true, administration: true },
  { id: 4, role: 'RH', module: 'Employes', lecture: true, ecriture: true, suppression: false, administration: false },
  { id: 5, role: 'RH', module: 'Paie', lecture: true, ecriture: true, suppression: false, administration: false },
  { id: 6, role: 'Manager', module: 'Employes', lecture: true, ecriture: false, suppression: false, administration: false },
  { id: 7, role: 'Employe', module: 'Profil', lecture: true, ecriture: true, suppression: false, administration: false }
]

export const mockEntreprisesMulti: EntrepriseMulti[] = [
  { id: 1, nom: 'VitaService SARL', code: 'VIT-VWGH', role: 'Directeur', statut: 'Actif', date_rejoins: '2026-01-15' },
  { id: 2, nom: 'Tech Solutions', code: 'TEC-ABCD', role: 'Manager', statut: 'Actif', date_rejoins: '2026-03-01' },
  { id: 3, nom: 'Innovation Corp', code: 'INN-XYZ', role: 'Employe', statut: 'Inactif', date_rejoins: '2025-06-01' }
]