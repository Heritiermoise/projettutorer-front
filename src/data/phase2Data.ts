// Données mock pour les modules Phase 2

export interface BulletinPaie {
  id: number
  employe_id: string
  employe_nom: string
  mois: string
  annee: string
  salaire_base: number
  primes: number
  heures_sup: number
  deductions: number
  impots: number
  salaire_net: number
  statut: 'Genere' | 'Valide' | 'Paye'
}

export interface TacheOnboarding {
  id: number
  titre: string
  description: string
  categorie: 'Administratif' | 'Technique' | 'Formation' | 'Integration'
  statut: 'A_faire' | 'En_cours' | 'Termine'
  responsable: string
  date_limite: string
}

export interface EmployeOnboarding {
  id: string
  nom: string
  prenom: string
  poste: string
  date_debut: string
  progression: number
  taches: TacheOnboarding[]
}

export interface Annonce {
  id: number
  titre: string
  contenu: string
  auteur: string
  date: string
  categorie: 'General' | 'RH' | 'Technique' | 'Evenement'
  likes: number
  commentaires: number
  important: boolean
}

export interface KPIAnalytics {
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: string
}

export const mockBulletinsPaie: BulletinPaie[] = [
  { id: 1, employe_id: 'EMP-001', employe_nom: 'Moise Vita', mois: 'Juin', annee: '2026', salaire_base: 2500, primes: 300, heures_sup: 150, deductions: 200, impots: 400, salaire_net: 2350, statut: 'Paye' },
  { id: 2, employe_id: 'EMP-002', employe_nom: 'Grace Mbuyi', mois: 'Juin', annee: '2026', salaire_base: 2200, primes: 200, heures_sup: 100, deductions: 150, impots: 350, salaire_net: 2000, statut: 'Valide' },
  { id: 3, employe_id: 'EMP-003', employe_nom: 'David Kasongo', mois: 'Juin', annee: '2026', salaire_base: 2000, primes: 150, heures_sup: 200, deductions: 100, impots: 300, salaire_net: 1950, statut: 'Genere' },
  { id: 4, employe_id: 'EMP-004', employe_nom: 'Pierre Kabongo', mois: 'Juin', annee: '2026', salaire_base: 2800, primes: 400, heures_sup: 100, deductions: 250, impots: 450, salaire_net: 2600, statut: 'Paye' },
  { id: 5, employe_id: 'EMP-005', employe_nom: 'Marie Tshimanga', mois: 'Juin', annee: '2026', salaire_base: 1500, primes: 100, heures_sup: 50, deductions: 80, impots: 200, salaire_net: 1370, statut: 'Paye' }
]

export const mockOnboarding: EmployeOnboarding[] = [
  {
    id: 'ONB-001', nom: 'Ngoy', prenom: 'Alain', poste: 'Developpeur Junior', date_debut: '2026-06-15', progression: 75,
    taches: [
      { id: 1, titre: 'Signature du contrat', description: 'Signer le contrat de travail', categorie: 'Administratif', statut: 'Termine', responsable: 'RH', date_limite: '2026-06-15' },
      { id: 2, titre: 'Creation email pro', description: 'Creer compte email et acces', categorie: 'Technique', statut: 'Termine', responsable: 'IT', date_limite: '2026-06-16' },
      { id: 3, titre: 'Formation securite', description: 'Module de sensibilisation', categorie: 'Formation', statut: 'En_cours', responsable: 'RSSI', date_limite: '2026-06-20' },
      { id: 4, titre: 'Dejeuner d\'equipe', description: 'Rencontre avec l\'equipe', categorie: 'Integration', statut: 'A_faire', responsable: 'Manager', date_limite: '2026-06-22' }
    ]
  },
  {
    id: 'ONB-002', nom: 'Lunda', prenom: 'Beatrice', poste: 'Designer UX', date_debut: '2026-06-20', progression: 40,
    taches: [
      { id: 5, titre: 'Signature du contrat', description: 'Signer le contrat de travail', categorie: 'Administratif', statut: 'Termine', responsable: 'RH', date_limite: '2026-06-20' },
      { id: 6, titre: 'Setup poste de travail', description: 'Installation logiciels design', categorie: 'Technique', statut: 'En_cours', responsable: 'IT', date_limite: '2026-06-21' },
      { id: 7, titre: 'Presentation entreprise', description: 'Vision et valeurs', categorie: 'Integration', statut: 'A_faire', responsable: 'DG', date_limite: '2026-06-25' }
    ]
  }
]

export const mockAnnonces: Annonce[] = [
  { id: 1, titre: 'Bienvenue a nos nouveaux collegues !', contenu: 'Nous sommes heureux d\'accueillir Alain et Beatrice dans nos equipes. N\'hesitez pas a aller les saluer.', auteur: 'Grace Mbuyi', date: '2026-06-21', categorie: 'General', likes: 24, commentaires: 8, important: true },
  { id: 2, titre: 'Maintenance systeme ce weekend', contenu: 'Une maintenance preventive aura lieu samedi de 22h a 06h. Les services seront indisponibles.', auteur: 'Service IT', date: '2026-06-20', categorie: 'Technique', likes: 5, commentaires: 2, important: false },
  { id: 3, titre: 'Resultats du sondage satisfaction', contenu: 'Les resultats du sondage annuel sont disponibles. Merci a tous pour votre participation !', auteur: 'Direction RH', date: '2026-06-18', categorie: 'RH', likes: 45, commentaires: 15, important: true },
  { id: 4, titre: 'Team building du 15 Juillet', contenu: 'Save the date ! Notre team building annuel se deroulera le 15 juillet. Plus de details bientot.', auteur: 'Comite Social', date: '2026-06-15', categorie: 'Evenement', likes: 67, commentaires: 23, important: false }
]

export const mockAnalyticsData = {
  effectifsHistory: [
    { mois: 'Jan', effectif: 120, recrutements: 5, depart: 2 },
    { mois: 'Fev', effectif: 123, recrutements: 4, depart: 1 },
    { mois: 'Mar', effectif: 128, recrutements: 7, depart: 2 },
    { mois: 'Avr', effectif: 134, recrutements: 8, depart: 2 },
    { mois: 'Mai', effectif: 141, recrutements: 9, depart: 2 },
    { mois: 'Jun', effectif: 148, recrutements: 10, depart: 3 }
  ],
  turnoverReasons: [
    { name: 'Meilleure opportunite', value: 45, color: '#ef4444' },
    { name: 'Salaire', value: 25, color: '#f59e0b' },
    { name: 'Management', value: 15, color: '#8b5cf6' },
    { name: 'Autre', value: 15, color: '#10b981' }
  ],
  repartitionContrats: [
    { name: 'CDI', value: 75, color: '#10b981' },
    { name: 'CDD', value: 15, color: '#f59e0b' },
    { name: 'Stage', value: 7, color: '#3b82f6' },
    { name: 'Freelance', value: 3, color: '#8b5cf6' }
  ],
  kpis: [
    { label: 'Taux de turnover', value: '8.5%', change: '-2.1%', trend: 'down', icon: 'TrendingDown' },
    { label: 'Taux d\'absenteisme', value: '3.2%', change: '+0.5%', trend: 'up', icon: 'AlertCircle' },
    { label: 'Delai recrutement', value: '28 jours', change: '-5 jours', trend: 'down', icon: 'Clock' },
    { label: 'Satisfaction employes', value: '4.2/5', change: '+0.3', trend: 'up', icon: 'Smile' },
    { label: 'Cout par embauche', value: '$1,200', change: '-$150', trend: 'down', icon: 'DollarSign' },
    { label: 'Taux de retention', value: '91.5%', change: '+2.1%', trend: 'up', icon: 'Users' }
  ]
}