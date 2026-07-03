export const mockUsers = [
  { id: 1, nom: 'Vita', post_nom: 'Heritier', prenom: 'Moise', name: 'Moise Vita', email: 'admin@demo.com', telephone: '+243 988 401 637', adresse: 'Lubumbashi', role: 'admin', statut: 'actif', password: 'password', id_entreprise: null, created_at: '2026-01-15' },
  { id: 2, nom: 'Kabongo', post_nom: 'Jean', prenom: 'Pierre', name: 'Pierre Kabongo', email: 'directeur@demo.com', telephone: '+243 977 123 456', adresse: 'Lubumbashi', role: 'directeur', statut: 'actif', password: 'password', id_entreprise: 1, created_at: '2026-01-20' },
  { id: 3, nom: 'Mbuyi', post_nom: 'Sarah', prenom: 'Grace', name: 'Grace Mbuyi', email: 'rh@demo.com', telephone: '+243 966 789 012', adresse: 'Kinshasa', role: 'rh', statut: 'actif', password: 'password', id_entreprise: 1, created_at: '2026-02-01' },
  { id: 4, nom: 'Kasongo', post_nom: 'Paul', prenom: 'David', name: 'David Kasongo', email: 'manager@demo.com', telephone: '+243 955 345 678', adresse: 'Lubumbashi', role: 'manager', statut: 'actif', password: 'password', id_entreprise: 1, created_at: '2026-02-10' },
  { id: 5, nom: 'Tshimanga', post_nom: 'Grace', prenom: 'Marie', name: 'Marie Tshimanga', email: 'employe@demo.com', telephone: '+243 944 567 890', adresse: 'Kinshasa', role: 'employe', statut: 'actif', password: 'password', id_entreprise: 1, created_at: '2026-03-01' },
  { id: 6, nom: 'Ilunga', post_nom: 'David', prenom: 'Jean', name: 'Jean Ilunga', email: 'david@demo.com', telephone: '+243 933 234 567', adresse: 'Lubumbashi', role: 'employe', statut: 'actif', password: 'password', id_entreprise: 1, created_at: '2026-03-15' },
  { id: 7, nom: 'Mukendi', post_nom: 'Marie', prenom: 'Alice', name: 'Alice Mukendi', email: 'marie@demo.com', telephone: '+243 922 890 123', adresse: 'Kinshasa', role: 'employe', statut: 'actif', password: 'password', id_entreprise: 1, created_at: '2026-04-01' },
];

export const mockEntreprises = [
  { id_entreprise: 1, user_id: 2, nom: 'VitaService SARL', nom_commercial: 'VitaService', email: 'contact@vitaservice.com', telephone: '+243 988 401 637', adresse: 'Lubumbashi, RDC', description: 'Entreprise de services informatiques', statut: 'Actif', code_entreprise: 'VIT-VWGH', created_at: '2026-01-15' },
  { id_entreprise: 2, user_id: 3, nom: 'Tech Solutions', nom_commercial: 'TechSol', email: 'info@techsol.com', telephone: '+243 977 111 222', adresse: 'Kinshasa, RDC', description: 'Solutions technologiques', statut: 'Actif', code_entreprise: 'TEC-ABCD', created_at: '2026-02-01' },
];

export const mockServices = [
  { id_service: 1, nom: 'Informatique', description: 'Developpement et maintenance', statut: 'Actif', id_entreprise: 1 },
  { id_service: 2, nom: 'Ressources Humaines', description: 'Gestion du personnel', statut: 'Actif', id_entreprise: 1 },
  { id_service: 3, nom: 'Finance', description: 'Comptabilite et finance', statut: 'Actif', id_entreprise: 1 },
  { id_service: 4, nom: 'Marketing', description: 'Communication et marketing', statut: 'Actif', id_entreprise: 1 },
  { id_service: 5, nom: 'Direction', description: 'Gestion generale', statut: 'Actif', id_entreprise: 1 },
];

export const mockPostes = [
  { id_poste: 1, titre_poste: 'Developpeur Senior', detail: 'Developpement full-stack', statut: 'Occupe', id_service: 1, id_entreprise: 1 },
  { id_poste: 2, titre_poste: 'Responsable RH', detail: 'Gestion des ressources humaines', statut: 'Occupe', id_service: 2, id_entreprise: 1 },
  { id_poste: 3, titre_poste: 'Comptable', detail: 'Gestion comptable', statut: 'Occupe', id_service: 3, id_entreprise: 1 },
  { id_poste: 4, titre_poste: 'Designer UX/UI', detail: 'Conception interfaces', statut: 'Occupe', id_service: 1, id_entreprise: 1 },
  { id_poste: 5, titre_poste: 'Chef de Projet', detail: 'Gestion de projets', statut: 'Vacant', id_service: 1, id_entreprise: 1 },
  { id_poste: 6, titre_poste: 'Marketing Manager', detail: 'Strategie marketing', statut: 'Occupe', id_service: 4, id_entreprise: 1 },
];

export const mockEmployes = [
  { matricule: 'EMP-A1B2C3', nom: 'Vita', post_nom: 'Heritier', prenom: 'Moise', sexe: 'M', date_naissance: '1995-05-15', lieu_naissance: 'Lubumbashi', adresse: 'Lubumbashi', telephone: '+243 988 401 637', email: 'admin@demo.com', date_embauche: '2026-01-15', statut: 'Actif', id_poste: 8, id: 2, id_entreprise: 1 },
  { matricule: 'EMP-D4E5F6', nom: 'Mbuyi', post_nom: 'Sarah', prenom: 'Grace', sexe: 'F', date_naissance: '1992-08-22', lieu_naissance: 'Kinshasa', adresse: 'Kinshasa', telephone: '+243 966 789 012', email: 'rh@demo.com', date_embauche: '2026-02-01', statut: 'Actif', id_poste: 2, id: 3, id_entreprise: 1 },
  { matricule: 'EMP-G7H8I9', nom: 'Kasongo', post_nom: 'Paul', prenom: 'David', sexe: 'M', date_naissance: '1990-03-10', lieu_naissance: 'Lubumbashi', adresse: 'Lubumbashi', telephone: '+243 955 345 678', email: 'manager@demo.com', date_embauche: '2026-02-10', statut: 'Actif', id_poste: 5, id: 4, id_entreprise: 1 },
  { matricule: 'EMP-J1K2L3', nom: 'Tshimanga', post_nom: 'Grace', prenom: 'Marie', sexe: 'F', date_naissance: '1998-11-05', lieu_naissance: 'Kinshasa', adresse: 'Kinshasa', telephone: '+243 944 567 890', email: 'employe@demo.com', date_embauche: '2026-03-01', statut: 'Actif', id_poste: 4, id: 5, id_entreprise: 1 },
  { matricule: 'EMP-M4N5O6', nom: 'Ilunga', post_nom: 'David', prenom: 'Jean', sexe: 'M', date_naissance: '1993-07-18', lieu_naissance: 'Lubumbashi', adresse: 'Lubumbashi', telephone: '+243 933 234 567', email: 'david@demo.com', date_embauche: '2026-03-15', statut: 'Actif', id_poste: 1, id: 6, id_entreprise: 1 },
];

export const mockContrats = [
  { id_contrat: 1, type: 'CDI', date_debut: '2026-01-15', details: 'Contrat a duree indeterminee', salaire_base: 2500, date_fin: null, contrat: 'REF-A1B2C3', statut: 'Actif', matricule: 'EMP-A1B2C3', id_entreprise: 1 },
  { id_contrat: 2, type: 'CDI', date_debut: '2026-02-01', details: 'Contrat a duree indeterminee', salaire_base: 1800, date_fin: null, contrat: 'REF-D4E5F6', statut: 'Actif', matricule: 'EMP-D4E5F6', id_entreprise: 1 },
  { id_contrat: 3, type: 'CDD', date_debut: '2026-02-10', details: 'Contrat 1 an', salaire_base: 1500, date_fin: '2027-02-10', contrat: 'REF-G7H8I9', statut: 'Actif', matricule: 'EMP-G7H8I9', id_entreprise: 1 },
  { id_contrat: 4, type: 'CDI', date_debut: '2026-03-01', details: 'Contrat a duree indeterminee', salaire_base: 1200, date_fin: null, contrat: 'REF-J1K2L3', statut: 'Actif', matricule: 'EMP-J1K2L3', id_entreprise: 1 },
];

export const mockFichesPaie = [
  { id_paie: 1, mois_paiement: 'Janvier', annee_paiement: '2026', montant: 2500, statut: 'Payee', matricule: 'EMP-A1B2C3', id_entreprise: 1 },
  { id_paie: 2, mois_paiement: 'Fevrier', annee_paiement: '2026', montant: 2500, statut: 'Payee', matricule: 'EMP-A1B2C3', id_entreprise: 1 },
  { id_paie: 3, mois_paiement: 'Mars', annee_paiement: '2026', montant: 2500, statut: 'Payee', matricule: 'EMP-A1B2C3', id_entreprise: 1 },
  { id_paie: 4, mois_paiement: 'Janvier', annee_paiement: '2026', montant: 1800, statut: 'Payee', matricule: 'EMP-D4E5F6', id_entreprise: 1 },
  { id_paie: 5, mois_paiement: 'Fevrier', annee_paiement: '2026', montant: 1800, statut: 'Payee', matricule: 'EMP-D4E5F6', id_entreprise: 1 },
];

export const mockConges = [
  { id_conge: 1, matricule: 'EMP-A1B2C3', type_conge: 'Annuel', date_debut: '2026-06-01', date_fin: '2026-06-10', nombre_jours: 10, motif: 'Vacances familiales', statut: 'Approuve' },
  { id_conge: 2, matricule: 'EMP-D4E5F6', type_conge: 'Maladie', date_debut: '2026-05-15', date_fin: '2026-05-18', nombre_jours: 3, motif: 'Grippe', statut: 'Approuve' },
  { id_conge: 3, matricule: 'EMP-J1K2L3', type_conge: 'Annuel', date_debut: '2026-07-01', date_fin: '2026-07-15', nombre_jours: 15, motif: 'Vacances', statut: 'En attente' },
];

export const mockPresences = [
  { id_presence: 1, matricule: 'EMP-A1B2C3', date_presence: '2026-06-10', heure_arrivee: '08:00', heure_depart: '17:00', statut: 'Present', justification: null, id_entreprise: 1 },
  { id_presence: 2, matricule: 'EMP-A1B2C3', date_presence: '2026-06-11', heure_arrivee: '08:15', heure_depart: '17:00', statut: 'Retard', justification: 'Embouteillage', id_entreprise: 1 },
  { id_presence: 3, matricule: 'EMP-D4E5F6', date_presence: '2026-06-10', heure_arrivee: '08:00', heure_depart: '17:00', statut: 'Present', justification: null, id_entreprise: 1 },
  { id_presence: 4, matricule: 'EMP-J1K2L3', date_presence: '2026-06-10', heure_arrivee: '08:30', heure_depart: '17:00', statut: 'Retard', justification: null, id_entreprise: 1 },
];

export const mockDocuments = [
  { id_document: 1, type_document: 'CV', fichier: '/docs/cv_grace.pdf', statut: 'Valide', matricule: 'EMP-J1K2L3', id_entreprise: 1, created_at: '2026-03-01' },
  { id_document: 2, type_document: 'Diplome', fichier: '/docs/diplome_david.pdf', statut: 'Valide', matricule: 'EMP-M4N5O6', id_entreprise: 1, created_at: '2026-03-15' },
];

export const mockAvantages = [
  { id_avantage: 1, libelle: 'Assurance sante', description: 'Couverture medicale complete', type_avantage: 'Sante', valeur: '500', date_expiration: '2026-12-31', statut: 'Actif', matricule: 'EMP-A1B2C3', id_entreprise: 1 },
  { id_avantage: 2, libelle: 'Tickets restaurant', description: '10 tickets/mois', type_avantage: 'Alimentation', valeur: '100', date_expiration: '2026-12-31', statut: 'Actif', matricule: 'EMP-A1B2C3', id_entreprise: 1 },
  { id_avantage: 3, libelle: 'Transport', description: 'Remboursement transport', type_avantage: 'Transport', valeur: '150', date_expiration: '2026-12-31', statut: 'Actif', matricule: 'EMP-D4E5F6', id_entreprise: 1 },
];

export const mockOffresEmploi = [
  { id_offre: 1, titre: 'Developpeur React Senior', description: 'Nous recherchons un dev React experimente', photo: null, date_limite: '2026-07-30', salaire_base: 2000, statut: 'Publiee', id_entreprise: 1, created_at: '2026-06-01' },
  { id_offre: 2, titre: 'Designer UX/UI', description: 'Designer creatif pour projets web', photo: null, date_limite: '2026-07-15', salaire_base: 1500, statut: 'Publiee', id_entreprise: 1, created_at: '2026-06-05' },
  { id_offre: 3, titre: 'Chef de Projet IT', description: 'Gestion de projets informatiques', photo: null, date_limite: '2026-08-01', salaire_base: 2500, statut: 'Publiee', id_entreprise: 1, created_at: '2026-06-10' },
];

export const mockCandidats = [
  { id_candidat: 1, nom: 'Ngoy', post_nom: 'Kabuya', prenom: 'Alain', email: 'alain@mail.com', telephone: '+243 900 111 222', id_entreprise: 1 },
  { id_candidat: 2, nom: 'Lunda', post_nom: 'Mfumu', prenom: 'Beatrice', email: 'beatrice@mail.com', telephone: '+243 900 333 444', id_entreprise: 1 },
];

export const mockPostulations = [
  { id_postulation: 1, cv: '/cvs/alain.pdf', lettre: 'Je suis tres interesse...', statut: 'Soumise', id_candidat: 1, id_offre: 1, id_entreprise: 1, created_at: '2026-06-05' },
  { id_postulation: 2, cv: '/cvs/beatrice.pdf', lettre: 'Motivation...', statut: 'En cours', id_candidat: 2, id_offre: 2, id_entreprise: 1, created_at: '2026-06-07' },
];

export const mockStatsEvolution = {
  effectifs: [
    { mois: 'Jan', employes: 120, nouveaux: 15 },
    { mois: 'Fev', employes: 128, nouveaux: 8 },
    { mois: 'Mar', employes: 135, nouveaux: 7 },
    { mois: 'Avr', employes: 142, nouveaux: 7 },
    { mois: 'Mai', employes: 156, nouveaux: 14 },
    { mois: 'Jun', employes: 168, nouveaux: 12 },
  ],
  masseSalariale: [
    { mois: 'Jan', montant: 180000 },
    { mois: 'Fev', montant: 185000 },
    { mois: 'Mar', montant: 192000 },
    { mois: 'Avr', montant: 198000 },
    { mois: 'Mai', montant: 210000 },
    { mois: 'Jun', montant: 225000 },
  ],
  recrutements: [
    { mois: 'Jan', candidatures: 45, embauches: 8 },
    { mois: 'Fev', candidatures: 52, embauches: 10 },
    { mois: 'Mar', candidatures: 38, embauches: 6 },
    { mois: 'Avr', candidatures: 61, embauches: 12 },
    { mois: 'Mai', candidatures: 73, embauches: 15 },
    { mois: 'Jun', candidatures: 58, embauches: 11 },
  ],
  repartitionServices: [
    { name: 'Informatique', value: 35, color: '#3b82f6' },
    { name: 'RH', value: 15, color: '#06b6d4' },
    { name: 'Finance', value: 20, color: '#f59e0b' },
    { name: 'Marketing', value: 12, color: '#64748b' },
    { name: 'Direction', value: 8, color: '#2563eb' },
    { name: 'Commercial', value: 10, color: '#0e7490' },
  ],
  activiteSysteme: [
    { jour: 'Lun', connexions: 145, actions: 890 },
    { jour: 'Mar', connexions: 167, actions: 1023 },
    { jour: 'Mer', connexions: 189, actions: 1156 },
    { jour: 'Jeu', connexions: 156, actions: 987 },
    { jour: 'Ven', connexions: 178, actions: 1234 },
    { jour: 'Sam', connexions: 89, actions: 456 },
    { jour: 'Dim', connexions: 45, actions: 234 },
  ],
};