// Données mock Phase 6 - Modules importants

export interface Pointage {
  id: number
  employe_id: string
  employe_nom: string
  date: string
  heure_arrivee: string
  heure_depart: string
  latitude?: number
  longitude?: number
  adresse?: string
  statut: 'Present' | 'Retard' | 'Absent' | 'Conge'
  heures_travaillees: number
}

export interface WorkflowConfig {
  id: number
  nom: string
  type: string
  etapes: WorkflowEtape[]
  actif: boolean
}

export interface WorkflowEtape {
  id: number
  nom: string
  approbateur: string
  ordre: number
}

export interface DemandeApprobation {
  id: number
  titre: string
  type: string
  demandeur: string
  date_demande: string
  montant?: number
  statut: 'En_attente' | 'Approuvee' | 'Refusee'
  etape_actuelle: number
  total_etapes: number
}

export interface NoteFrais {
  id: number
  employe_id: string
  employe_nom: string
  titre: string
  description: string
  montant: number
  date: string
  categorie: string
  statut: 'Brouillon' | 'Soumise' | 'Approuvee' | 'Refusee' | 'Payee'
  justificatif_url?: string
  date_soumission?: string
  date_approbation?: string
}

export interface Equipement {
  id: number
  nom: string
  type: string
  numero_serie: string
  marque: string
  modele: string
  date_acquisition: string
  valeur: number
  statut: 'Disponible' | 'Attribue' | 'En_reparation' | 'Retire'
  assigne_a?: string
  date_attribution?: string
  date_retour?: string
}

export interface Reconnaissance {
  id: number
  de: string
  pour: string
  message: string
  date: string
  type: 'Felicitation' | 'Remerciement' | 'Encouragement' | 'Succes'
  badges: string[]
  likes: number
}

export interface Badge {
  id: number
  nom: string
  description: string
  icone: string
  couleur: string
  condition: string
  nombre_attribues: number
}

export const mockPointages: Pointage[] = [
  { id: 1, employe_id: 'EMP-001', employe_nom: 'Moise Vita', date: '2026-06-25', heure_arrivee: '08:00', heure_depart: '17:00', latitude: -11.6609, longitude: 27.4794, adresse: 'Lubumbashi, RDC', statut: 'Present', heures_travaillees: 9 },
  { id: 2, employe_id: 'EMP-002', employe_nom: 'Grace Mbuyi', date: '2026-06-25', heure_arrivee: '08:15', heure_depart: '17:00', statut: 'Retard', heures_travaillees: 8.75 },
  { id: 3, employe_id: 'EMP-003', employe_nom: 'David Kasongo', date: '2026-06-25', heure_arrivee: '08:00', heure_depart: '18:30', latitude: -11.6609, longitude: 27.4794, adresse: 'Lubumbashi, RDC', statut: 'Present', heures_travaillees: 10.5 },
  { id: 4, employe_id: 'EMP-004', employe_nom: 'Pierre Kabongo', date: '2026-06-25', statut: 'Conge', heures_travaillees: 0 },
  { id: 5, employe_id: 'EMP-005', employe_nom: 'Marie Tshimanga', date: '2026-06-24', heure_arrivee: '08:00', heure_depart: '17:00', statut: 'Present', heures_travaillees: 9 }
]

export const mockWorkflowConfigs: WorkflowConfig[] = [
  {
    id: 1, nom: 'Approbation Conges', type: 'conge', actif: true,
    etapes: [
      { id: 1, nom: 'Manager direct', approbateur: 'Manager', ordre: 1 },
      { id: 2, nom: 'RH', approbateur: 'RH', ordre: 2 },
      { id: 3, nom: 'Directeur (si > 5 jours)', approbateur: 'Directeur', ordre: 3 }
    ]
  },
  {
    id: 2, nom: 'Approbation Notes de Frais', type: 'note_frais', actif: true,
    etapes: [
      { id: 4, nom: 'Manager', approbateur: 'Manager', ordre: 1 },
      { id: 5, nom: 'Finance', approbateur: 'Finance', ordre: 2 }
    ]
  },
  {
    id: 3, nom: 'Approbation Recrutement', type: 'recrutement', actif: true,
    etapes: [
      { id: 6, nom: 'RH', approbateur: 'RH', ordre: 1 },
      { id: 7, nom: 'Manager', approbateur: 'Manager', ordre: 2 },
      { id: 8, nom: 'Directeur', approbateur: 'Directeur', ordre: 3 }
    ]
  }
]

export const mockDemandesApprobation: DemandeApprobation[] = [
  { id: 1, titre: 'Conge annuel - 10 jours', type: 'conge', demandeur: 'Marie Tshimanga', date_demande: '2026-06-20', statut: 'En_attente', etape_actuelle: 1, total_etapes: 3 },
  { id: 2, titre: 'Note de frais - Deplacement', type: 'note_frais', demandeur: 'David Kasongo', date_demande: '2026-06-22', montant: 450, statut: 'En_attente', etape_actuelle: 1, total_etapes: 2 },
  { id: 3, titre: 'Recrutement - 2 developpeurs', type: 'recrutement', demandeur: 'Grace Mbuyi', date_demande: '2026-06-18', montant: 6000, statut: 'Approuvee', etape_actuelle: 3, total_etapes: 3 },
  { id: 4, titre: 'Formation externe - React', type: 'formation', demandeur: 'Jean Ilunga', date_demande: '2026-06-15', montant: 800, statut: 'Refusee', etape_actuelle: 2, total_etapes: 2 }
]

export const mockNotesFrais: NoteFrais[] = [
  { id: 1, employe_id: 'EMP-003', employe_nom: 'David Kasongo', titre: 'Deplacement Kinshasa', description: 'Frais de transport et hotel', montant: 450, date: '2026-06-22', categorie: 'Transport', statut: 'Soumise', date_soumission: '2026-06-22' },
  { id: 2, employe_id: 'EMP-001', employe_nom: 'Moise Vita', titre: 'Repas client', description: 'Dejeuner avec client potentiel', montant: 120, date: '2026-06-20', categorie: 'Repas', statut: 'Approuvee', date_soumission: '2026-06-20', date_approbation: '2026-06-21' },
  { id: 3, employe_id: 'EMP-005', employe_nom: 'Marie Tshimanga', titre: 'Fournitures bureau', description: 'Achat fournitures', montant: 85, date: '2026-06-18', categorie: 'Fournitures', statut: 'Payee', date_soumission: '2026-06-18', date_approbation: '2026-06-19' },
  { id: 4, employe_id: 'EMP-002', employe_nom: 'Grace Mbuyi', titre: 'Formation RH', description: 'Inscription formation', montant: 500, date: '2026-06-15', categorie: 'Formation', statut: 'Refusee', date_soumission: '2026-06-15' }
]

export const mockEquipements: Equipement[] = [
  { id: 1, nom: 'MacBook Pro 16"', type: 'Ordinateur', numero_serie: 'MBP-2024-001', marque: 'Apple', modele: 'MacBook Pro', date_acquisition: '2024-01-15', valeur: 2500, statut: 'Attribue', assigne_a: 'Moise Vita', date_attribution: '2024-01-20' },
  { id: 2, nom: 'Dell UltraSharp 27"', type: 'Ecran', numero_serie: 'DEL-2024-002', marque: 'Dell', modele: 'UltraSharp', date_acquisition: '2024-02-01', valeur: 600, statut: 'Attribue', assigne_a: 'David Kasongo', date_attribution: '2024-02-05' },
  { id: 3, nom: 'iPhone 15 Pro', type: 'Telephone', numero_serie: 'IPH-2024-003', marque: 'Apple', modele: 'iPhone 15 Pro', date_acquisition: '2024-03-01', valeur: 1200, statut: 'Disponible' },
  { id: 4, nom: 'Chaise ergonomique', type: 'Mobilier', numero_serie: 'CHR-2024-004', marque: 'Herman Miller', modele: 'Aeron', date_acquisition: '2024-01-10', valeur: 800, statut: 'En_reparation' },
  { id: 5, nom: 'Casque Sony WH-1000XM5', type: 'Accessoire', numero_serie: 'SNY-2024-005', marque: 'Sony', modele: 'WH-1000XM5', date_acquisition: '2024-04-01', valeur: 350, statut: 'Disponible' }
]

export const mockReconnaissances: Reconnaissance[] = [
  { id: 1, de: 'Grace Mbuyi', pour: 'David Kasongo', message: 'Excellent travail sur le projet React !', date: '2026-06-25', type: 'Felicitation', badges: ['Star Performer', 'Innovation'], likes: 12 },
  { id: 2, de: 'Pierre Kabongo', pour: 'Marie Tshimanga', message: 'Merci pour ton aide sur le rapport mensuel', date: '2026-06-24', type: 'Remerciement', badges: ['Team Player'], likes: 8 },
  { id: 3, de: 'David Kasongo', pour: 'Jean Ilunga', message: 'Bravo pour la presentation client !', date: '2026-06-23', type: 'Succes', badges: ['Client Success', 'Communication'], likes: 15 },
  { id: 4, de: 'Marie Tshimanga', pour: 'Grace Mbuyi', message: 'Courage pour la fin du mois !', date: '2026-06-22', type: 'Encouragement', badges: ['Support'], likes: 6 }
]

export const mockBadges: Badge[] = [
  { id: 1, nom: 'Star Performer', description: 'Attribue pour performance exceptionnelle', icone: '⭐', couleur: 'from-amber-500 to-yellow-500', condition: '5 reconnaissances en un mois', nombre_attribues: 12 },
  { id: 2, nom: 'Team Player', description: 'Excellent esprit d\'equipe', icone: '🤝', couleur: 'from-blue-500 to-cyan-500', condition: '10 collaborations', nombre_attribues: 28 },
  { id: 3, nom: 'Innovation', description: 'Idees innovantes implementees', icone: '💡', couleur: 'from-purple-500 to-pink-500', condition: '3 innovations acceptees', nombre_attribues: 8 },
  { id: 4, nom: 'Client Success', description: 'Satisfaction client exceptionnelle', icone: '🏆', couleur: 'from-green-500 to-emerald-500', condition: '5 clients satisfaits', nombre_attribues: 15 },
  { id: 5, nom: 'Communication', description: 'Excellentes competences en communication', icone: '📢', couleur: 'from-red-500 to-orange-500', condition: 'Presentations reussies', nombre_attribues: 20 },
  { id: 6, nom: 'Support', description: 'Toujours la pour aider', icone: '', couleur: 'from-indigo-500 to-purple-500', condition: '20 actes de soutien', nombre_attribues: 35 }
]