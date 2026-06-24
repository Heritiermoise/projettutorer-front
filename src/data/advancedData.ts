// Données mock pour les modules avancés (Phase 1)
// TOUS les exports nécessaires pour les pages Phase 1

// ===== INTERFACES =====

export interface Objectif {
  id: number
  description: string
  mesure: string
  cible: string
  realise: string
  pourcentage: number
  statut: 'Atteint' | 'En_cours' | 'Non_atteint'
}

export interface CompetenceEval {
  nom: string
  niveau_actuel: 1 | 2 | 3 | 4 | 5
  niveau_cible: 1 | 2 | 3 | 4 | 5
  commentaires: string
}

export interface OffrePublication {
  id: number
  poste_id: number
  titre: string
  description: string
  exigences: string[]
  avantages: string[]
  type_contrat: string
  niveau: string
  departement: string
  salaire_min: number
  salaire_max: number
  localisation: string
  date_publication: string
  date_expiration: string
  statut: 'Brouillon' | 'Publiee' | 'Expiree' | 'Suspendue'
  nombre_vues: number
  nombre_candidatures: number
  competences_requises: string[]
  experience_requise: string
  niveau_etude: string
  langues: string[]
  remote: 'Presentiel' | 'Hybride' | 'Remote'
}

export interface Evaluation {
  id: number
  employe_id: string
  employe_nom: string
  evaluateur_id: string
  evaluateur_nom: string
  type: 'Annuelle' | 'Trimestrielle' | 'Probation' | '360'
  periode: string
  date_evaluation: string
  statut: 'Planifiee' | 'En_cours' | 'Terminee'
  note_globale: number
  objectifs: Objectif[]
  competences: CompetenceEval[]
  commentaires: string
  plan_developpement: string
  forces: string[]
  axes_amelioration: string[]
}

export interface Formation {
  id: number
  titre: string
  description: string
  formateur: string
  type: 'Presentiel' | 'En_ligne' | 'Hybride'
  categorie: string
  date_debut: string
  date_fin: string
  duree_heures: number
  cout: number
  places_total: number
  places_restantes: number
  statut: 'Planifiee' | 'En_cours' | 'Terminee' | 'Annulee'
  participants: string[]
  competences_acquises: string[]
  certification: boolean
  evaluation_moyenne: number
}

export interface InscriptionFormation {
  id: number
  formation_id: number
  employe_id: string
  employe_nom: string
  statut: 'Inscrit' | 'Annule' | 'Termine' | 'En_cours'
  progression: number
  note_finale: number
  certification_obtenue: boolean
}

export interface NoeudOrganigramme {
  id: string
  employe_id: string
  nom: string
  prenom: string
  poste: string
  departement: string
  email: string
  telephone: string
  photo?: string
  parent_id: string | null
  enfants: NoeudOrganigramme[]
  niveau: number
  date_embauche: string
  statut: 'Actif' | 'Inactif' | 'En_conge'
}

// ===== DONNEES MOCK =====

export const mockOffresPublication: OffrePublication[] = [
  {
    id: 1,
    poste_id: 1,
    titre: 'Developpeur Full Stack Senior',
    description: 'Nous recherchons un developpeur Full Stack experimente pour rejoindre notre equipe technique.',
    exigences: ['5+ ans d\'experience', 'Maitrise React/Node.js'],
    avantages: ['Teletravail partiel', 'Mutuelle entreprise'],
    type_contrat: 'CDI',
    niveau: 'Senior',
    departement: 'Informatique',
    salaire_min: 2000,
    salaire_max: 3000,
    localisation: 'Lubumbashi, RDC',
    date_publication: '2026-06-01',
    date_expiration: '2026-07-31',
    statut: 'Publiee',
    nombre_vues: 245,
    nombre_candidatures: 18,
    competences_requises: ['React', 'Node.js', 'TypeScript'],
    experience_requise: '5 ans minimum',
    niveau_etude: 'Bac+5 en Informatique',
    langues: ['Francais', 'Anglais technique'],
    remote: 'Hybride'
  },
  {
    id: 2,
    poste_id: 2,
    titre: 'Responsable Ressources Humaines',
    description: 'Pilotez la strategie RH de notre entreprise.',
    exigences: ['7+ ans en RH', 'Expertise droit du travail'],
    avantages: ['Salaire competitif', 'Bonus annuel'],
    type_contrat: 'CDI',
    niveau: 'Manager',
    departement: 'Ressources Humaines',
    salaire_min: 2500,
    salaire_max: 3500,
    localisation: 'Lubumbashi, RDC',
    date_publication: '2026-06-10',
    date_expiration: '2026-08-10',
    statut: 'Publiee',
    nombre_vues: 189,
    nombre_candidatures: 12,
    competences_requises: ['Gestion RH', 'Droit du travail'],
    experience_requise: '7 ans minimum',
    niveau_etude: 'Master en RH',
    langues: ['Francais', 'Anglais'],
    remote: 'Presentiel'
  },
  {
    id: 3,
    poste_id: 3,
    titre: 'Comptable Junior',
    description: 'Rejoignez notre equipe finance.',
    exigences: ['Bac+3 en Comptabilite', 'Maitrise Excel'],
    avantages: ['Formation interne', 'Evolution rapide'],
    type_contrat: 'CDI',
    niveau: 'Junior',
    departement: 'Finance',
    salaire_min: 1000,
    salaire_max: 1500,
    localisation: 'Lubumbashi, RDC',
    date_publication: '2026-06-15',
    date_expiration: '2026-07-15',
    statut: 'Brouillon',
    nombre_vues: 0,
    nombre_candidatures: 0,
    competences_requises: ['Comptabilite', 'Excel'],
    experience_requise: '1-2 ans',
    niveau_etude: 'Bac+3 en Comptabilite',
    langues: ['Francais'],
    remote: 'Presentiel'
  }
]

export const mockEvaluations: Evaluation[] = [
  {
    id: 1,
    employe_id: 'EMP-001',
    employe_nom: 'Moise Vita',
    evaluateur_id: 'EVAL-001',
    evaluateur_nom: 'Pierre Kabongo',
    type: 'Annuelle',
    periode: '2025-2026',
    date_evaluation: '2026-06-15',
    statut: 'Terminee',
    note_globale: 4.5,
    objectifs: [
      { id: 1, description: 'Augmenter la productivite de 20%', mesure: 'KPIs mensuels', cible: '20%', realise: '25%', pourcentage: 100, statut: 'Atteint' },
      { id: 2, description: 'Former 2 developpeurs juniors', mesure: 'Nombre de formes', cible: '2', realise: '2', pourcentage: 100, statut: 'Atteint' }
    ],
    competences: [
      { nom: 'Leadership', niveau_actuel: 4, niveau_cible: 5, commentaires: 'Excellente progression' },
      { nom: 'Communication', niveau_actuel: 5, niveau_cible: 5, commentaires: 'Point fort' }
    ],
    commentaires: 'Excellente annee, objectifs depasses',
    plan_developpement: 'Formation management avance',
    forces: ['Leadership', 'Innovation', 'Travail d\'equipe'],
    axes_amelioration: ['Delegation', 'Gestion du stress']
  },
  {
    id: 2,
    employe_id: 'EMP-002',
    employe_nom: 'Grace Mbuyi',
    evaluateur_id: 'EVAL-001',
    evaluateur_nom: 'Pierre Kabongo',
    type: 'Annuelle',
    periode: '2025-2026',
    date_evaluation: '2026-06-20',
    statut: 'En_cours',
    note_globale: 0,
    objectifs: [
      { id: 3, description: 'Recruter 5 employes', mesure: 'Nombre de recrutements', cible: '5', realise: '3', pourcentage: 60, statut: 'En_cours' }
    ],
    competences: [
      { nom: 'Recrutement', niveau_actuel: 4, niveau_cible: 5, commentaires: 'Bonne progression' }
    ],
    commentaires: '',
    plan_developpement: '',
    forces: [],
    axes_amelioration: []
  }
]

export const mockFormations: Formation[] = [
  {
    id: 1,
    titre: 'Leadership et Management d\'equipe',
    description: 'Developpez vos competences en leadership.',
    formateur: 'Dr. Jean Mukendi',
    type: 'Presentiel',
    categorie: 'Management',
    date_debut: '2026-07-01',
    date_fin: '2026-07-03',
    duree_heures: 24,
    cout: 500,
    places_total: 20,
    places_restantes: 8,
    statut: 'Planifiee',
    participants: ['EMP-001', 'EMP-004', 'EMP-007'],
    competences_acquises: ['Leadership', 'Communication', 'Gestion de conflit'],
    certification: true,
    evaluation_moyenne: 0
  },
  {
    id: 2,
    titre: 'React Avance et TypeScript',
    description: 'Maitrisez les concepts avances de React et TypeScript.',
    formateur: 'Marie Tshimanga',
    type: 'En_ligne',
    categorie: 'Technique',
    date_debut: '2026-06-15',
    date_fin: '2026-07-15',
    duree_heures: 40,
    cout: 300,
    places_total: 30,
    places_restantes: 12,
    statut: 'En_cours',
    participants: ['EMP-001', 'EMP-003', 'EMP-005', 'EMP-006'],
    competences_acquises: ['React', 'TypeScript', 'Redux', 'Testing'],
    certification: true,
    evaluation_moyenne: 4.5
  },
  {
    id: 3,
    titre: 'Gestion de Projet Agile',
    description: 'Apprenez les methodologies Agile et Scrum.',
    formateur: 'Paul Kasongo',
    type: 'Hybride',
    categorie: 'Methodologie',
    date_debut: '2026-05-01',
    date_fin: '2026-05-15',
    duree_heures: 16,
    cout: 400,
    places_total: 15,
    places_restantes: 0,
    statut: 'Terminee',
    participants: ['EMP-001', 'EMP-002', 'EMP-004'],
    competences_acquises: ['Scrum', 'Kanban', 'User Stories'],
    certification: true,
    evaluation_moyenne: 4.8
  }
]

export const mockInscriptionsFormation: InscriptionFormation[] = [
  {
    id: 1,
    formation_id: 1,
    employe_id: 'EMP-001',
    employe_nom: 'Moise Vita',
    statut: 'Termine',
    progression: 100,
    note_finale: 18,
    certification_obtenue: true
  },
  {
    id: 2,
    formation_id: 2,
    employe_id: 'EMP-002',
    employe_nom: 'Grace Mbuyi',
    statut: 'En_cours',
    progression: 45,
    note_finale: 0,
    certification_obtenue: false
  }
]

export const mockOrganigramme: NoeudOrganigramme = {
  id: 'root',
  employe_id: 'EMP-001',
  nom: 'Vita',
  prenom: 'Moise',
  poste: 'Directeur General',
  departement: 'Direction',
  email: 'moise@vitaservice.com',
  telephone: '+243 988 401 637',
  parent_id: null,
  niveau: 0,
  date_embauche: '2026-01-15',
  statut: 'Actif',
  enfants: [
    {
      id: 'rh',
      employe_id: 'EMP-002',
      nom: 'Mbuyi',
      prenom: 'Grace',
      poste: 'Responsable RH',
      departement: 'Ressources Humaines',
      email: 'grace@vitaservice.com',
      telephone: '+243 966 789 012',
      parent_id: 'root',
      niveau: 1,
      date_embauche: '2026-02-01',
      statut: 'Actif',
      enfants: []
    },
    {
      id: 'tech',
      employe_id: 'EMP-003',
      nom: 'Kasongo',
      prenom: 'David',
      poste: 'Lead Developpeur',
      departement: 'Informatique',
      email: 'david@vitaservice.com',
      telephone: '+243 955 345 678',
      parent_id: 'root',
      niveau: 1,
      date_embauche: '2026-02-10',
      statut: 'Actif',
      enfants: []
    }
  ]
}