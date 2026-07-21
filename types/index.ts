export interface User {
  id: number;
  nom: string;
  post_nom: string;
  prenom: string;
  name: string;
  email: string;
  telephone: string;
  adresse: string;
  role: string;
  statut: string;
  id_entreprise?: number;
}

export interface Entreprise {
  id_entreprise: number;
  user_id: number;
  nom: string;
  nom_commercial?: string;
  email: string;
  telephone: string;
  photo_profil?: string;
  photo_couverture?: string;
  description?: string;
  adresse?: string;
  statut: string;
}

export interface Employe {
  matricule: string;
  nom: string;
  post_nom: string;
  prenom: string;
  sexe: string;
  date_naissance: string;
  lieu_naissance: string;
  adresse: string;
  telephone: string;
  email: string;
  date_embauche: string;
  statut: string;
  id_poste: number;
  id: number;
  // Accept both french `id_entreprise` and english `company_id` used across branches
  id_entreprise?: number;
  company_id?: number;
}

export interface Service {
  id_service: number;
  nom: string;
  description?: string;
  statut: string;
  id_entreprise: number;
}

export interface Poste {
  id_poste: number;
  titre_poste: string;
  detail: string;
  statut: string;
  id_service: number;
}