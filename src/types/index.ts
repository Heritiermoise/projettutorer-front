export interface User {
  id: number;
  nom: string;
  post_nom?: string;
  prenom: string;
  name: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: string;
  statut: string;
  id_entreprise?: number;
}