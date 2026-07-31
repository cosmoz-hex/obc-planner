export interface Athlete {
  id: number;
  nom: string;
  prenom: string;
  age?: number;
  sexe?: 'Homme' | 'Femme';
  poids?: number;
  categorie: string;
  niveau: string;
  derniereEvaluation?: string;
}
