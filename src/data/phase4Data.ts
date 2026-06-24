// Données mock pour la Phase 4

export interface DocumentArchive {
  id: number
  titre: string
  type: 'Contrat' | 'Bulletin' | 'Evaluation' | 'Formation' | 'Juridique' | 'Autre'
  employe: string
  date_creation: string
  date_archivage: string
  duree_retention: string
  taille: string
  statut: 'Archive' | 'Actif' | 'Detruit'
  categorie: string
  hash: string
  acces_restreint: boolean
}

export interface JourFerie {
  id: number
  nom: string
  date: string
  pays: string
  type: 'National' | 'Regional' | 'Entreprise'
  recurrent: boolean
}

export interface AuditLog {
  id: number
  utilisateur: string
  action: string
  module: string
  date: string
  ip: string
  details: string
  severity: 'Info' | 'Warning' | 'Error' | 'Critical'
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

export interface RapportAutomatique {
  id: number
  nom: string
  type: 'Mensuel' | 'Trimestriel' | 'Annuel' | 'Personnalise'
  destinataires: string[]
  dernier_envoi?: string
  prochain_envoi: string
  statut: 'Actif' | 'Suspendu'
  format: 'PDF' | 'Excel' | 'Les deux'
}

export const mockArchives: DocumentArchive[] = [
  { id: 1, titre: 'Contrat CDI - Moise Vita', type: 'Contrat', employe: 'Moise Vita', date_creation: '2026-01-15', date_archivage: '2026-01-15', duree_retention: '10 ans', taille: '2.4 MB', statut: 'Actif', categorie: 'Ressources Humaines', hash: 'sha256:abc123...', acces_restreint: true },
  { id: 2, titre: 'Bulletin Paie Juin 2026 - Grace Mbuyi', type: 'Bulletin', employe: 'Grace Mbuyi', date_creation: '2026-06-25', date_archivage: '2026-06-25', duree_retention: '5 ans', taille: '856 KB', statut: 'Actif', categorie: 'Paie', hash: 'sha256:def456...', acces_restreint: true },
  { id: 3, titre: 'Evaluation Annuelle 2025 - David Kasongo', type: 'Evaluation', employe: 'David Kasongo', date_creation: '2025-12-20', date_archivage: '2025-12-20', duree_retention: '3 ans', taille: '1.2 MB', statut: 'Archive', categorie: 'Performance', hash: 'sha256:ghi789...', acces_restreint: false },
  { id: 4, titre: 'Certificat Formation React - Marie Tshimanga', type: 'Formation', employe: 'Marie Tshimanga', date_creation: '2026-05-15', date_archivage: '2026-05-15', duree_retention: 'Permanent', taille: '3.1 MB', statut: 'Actif', categorie: 'Formation', hash: 'sha256:jkl012...', acces_restreint: false },
  { id: 5, titre: 'Reglement Interieur 2026', type: 'Juridique', employe: 'Entreprise', date_creation: '2026-01-01', date_archivage: '2026-01-01', duree_retention: 'Permanent', taille: '5.7 MB', statut: 'Actif', categorie: 'Juridique', hash: 'sha256:mno345...', acces_restreint: false },
  { id: 6, titre: 'Contrat CDD - Alain Ngoy (Expire)', type: 'Contrat', employe: 'Alain Ngoy', date_creation: '2025-06-01', date_archivage: '2026-06-01', duree_retention: '10 ans', taille: '1.8 MB', statut: 'Archive', categorie: 'Ressources Humaines', hash: 'sha256:pqr678...', acces_restreint: true }
]

export const mockJoursFeries: JourFerie[] = [
  { id: 1, nom: 'Jour de l\'An', date: '2026-01-01', pays: 'RDC', type: 'National', recurrent: true },
  { id: 2, nom: 'Fete de l\'Independance', date: '2026-06-30', pays: 'RDC', type: 'National', recurrent: true },
  { id: 3, nom: 'Noel', date: '2026-12-25', pays: 'RDC', type: 'National', recurrent: true },
  { id: 4, nom: 'Fete du Travail', date: '2026-05-01', pays: 'RDC', type: 'National', recurrent: true },
  { id: 5, nom: 'Jour de la Liberation', date: '2026-05-17', pays: 'RDC', type: 'National', recurrent: true },
  { id: 6, nom: 'Jour du Fondateur', date: '2026-01-16', pays: 'RDC', type: 'National', recurrent: true },
  { id: 7, nom: 'Jour de l\'Entreprise', date: '2026-01-15', pays: 'Entreprise', type: 'Entreprise', recurrent: true },
  { id: 8, nom: 'Pont de l\'Ascension', date: '2026-05-14', pays: 'RDC', type: 'National', recurrent: true }
]

export const mockAuditLogs: AuditLog[] = [
  { id: 1, utilisateur: 'Moise Vita (DG)', action: 'Connexion reussie', module: 'Authentification', date: '2026-06-25 08:30', ip: '192.168.1.10', details: 'Connexion depuis Chrome/Windows', severity: 'Info' },
  { id: 2, utilisateur: 'Grace Mbuyi (RH)', action: 'Modification contrat', module: 'Contrats', date: '2026-06-25 09:15', ip: '192.168.1.25', details: 'Modification du contrat EMP-003', severity: 'Warning' },
  { id: 3, utilisateur: 'Systeme', action: 'Backup automatique', module: 'Systeme', date: '2026-06-25 02:00', ip: '127.0.0.1', details: 'Backup complet effectue (2.4 GB)', severity: 'Info' },
  { id: 4, utilisateur: 'Inconnu', action: 'Tentative connexion echouee', module: 'Authentification', date: '2026-06-24 23:45', ip: '203.0.113.45', details: '5 tentatives echouees - IP bloquee', severity: 'Critical' },
  { id: 5, utilisateur: 'David Kasongo', action: 'Telechargement bulletin', module: 'Paie', date: '2026-06-24 14:30', ip: '192.168.1.50', details: 'Telechargement bulletin Juin 2026', severity: 'Info' },
  { id: 6, utilisateur: 'Marie Tshimanga', action: 'Demande de conge', module: 'Conges', date: '2026-06-24 11:00', ip: '192.168.1.75', details: 'Demande de conge 15-20 Juillet', severity: 'Info' },
  { id: 7, utilisateur: 'Pierre Kabongo', action: 'Suppression employe', module: 'Employes', date: '2026-06-23 16:20', ip: '192.168.1.30', details: 'Suppression employe EMP-099', severity: 'Error' }
]

export const mockPermissions: Permission[] = [
  { id: 1, role: 'Directeur', module: 'Employes', lecture: true, ecriture: true, suppression: true, administration: true },
  { id: 2, role: 'Directeur', module: 'Paie', lecture: true, ecriture: true, suppression: false, administration: true },
  { id: 3, role: 'Directeur', module: 'Recrutement', lecture: true, ecriture: true, suppression: true, administration: true },
  { id: 4, role: 'RH', module: 'Employes', lecture: true, ecriture: true, suppression: false, administration: false },
  { id: 5, role: 'RH', module: 'Paie', lecture: true, ecriture: true, suppression: false, administration: false },
  { id: 6, role: 'RH', module: 'Recrutement', lecture: true, ecriture: true, suppression: true, administration: false },
  { id: 7, role: 'Manager', module: 'Employes', lecture: true, ecriture: false, suppression: false, administration: false },
  { id: 8, role: 'Manager', module: 'Evaluations', lecture: true, ecriture: true, suppression: false, administration: false },
  { id: 9, role: 'Employe', module: 'Profil', lecture: true, ecriture: true, suppression: false, administration: false },
  { id: 10, role: 'Employe', module: 'Conges', lecture: true, ecriture: true, suppression: false, administration: false }
]

export const mockRapports: RapportAutomatique[] = [
  { id: 1, nom: 'Rapport Mensuel RH', type: 'Mensuel', destinataires: ['direction@entreprise.com', 'rh@entreprise.com'], dernier_envoi: '2026-06-01', prochain_envoi: '2026-07-01', statut: 'Actif', format: 'PDF' },
  { id: 2, nom: 'Bilan Trimestriel Performance', type: 'Trimestriel', destinataires: ['direction@entreprise.com'], dernier_envoi: '2026-04-01', prochain_envoi: '2026-07-01', statut: 'Actif', format: 'Les deux' },
  { id: 3, nom: 'Rapport Annuel Complet', type: 'Annuel', destinataires: ['direction@entreprise.com', 'ca@entreprise.com'], dernier_envoi: '2026-01-15', prochain_envoi: '2027-01-15', statut: 'Actif', format: 'Les deux' },
  { id: 4, nom: 'Analyse Masse Salariale', type: 'Personnalise', destinataires: ['finance@entreprise.com'], dernier_envoi: '2026-06-15', prochain_envoi: '2026-07-15', statut: 'Actif', format: 'Excel' },
  { id: 5, nom: 'Rapport Recrutement', type: 'Mensuel', destinataires: ['rh@entreprise.com'], dernier_envoi: '2026-06-01', prochain_envoi: '2026-07-01', statut: 'Suspendu', format: 'PDF' }
]