import { Injectable } from '@angular/core';
import { Athlete } from '../models/athlete.model';
import { Observable, of, EMPTY } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AthleteService {

  // Tableau privé simulant les données
  private readonly athletes: Athlete[] = [
    { id: 1, nom: 'Dupont', prenom: 'Thomas', age: 24, sexe: 'Homme', poids: 83.5, categorie: '-85kg', niveau: 'NAT', derniereEvaluation: '15/03/2026' },
    { id: 2, nom: 'Martin', prenom: 'Sophie', age: 21, sexe: 'Femme', poids: 55, categorie: '-57kg', niveau: 'REG', derniereEvaluation: '20/02/2026' },
  ];

  // Listes de référence privées
  private readonly categoriesHommes = [
    '60kg', '65kg', '70kg', '75kg', '85kg', '95kg', '110kg', '+110kg'
  ];
  private readonly categoriesFemmes = [
    '49kg', '53kg', '57kg', '61kg', '69kg', '77kg', '86kg', '+86kg'
  ];
  private readonly niveauxList = [
    'DEB', 'DPT', 'REG', 'IRG', 'HON', 'NAT', 'EUR', 'MONDE'
  ];

  // Retourne un Observable pour simuler une requête HTTP
  getAthletes(): Observable<Athlete[]> {
    return of(this.athletes);
  }

  // --- Méthodes pour récupérer les listes de référence ---
  getHommesCategories(): string[] {
    return this.categoriesHommes;
  }

  getFemmesCategories(): string[] {
    return this.categoriesFemmes;
  }

  getNiveaux(): string[] {
    return this.niveauxList;
  }

  // --- Méthodes d'action ---

  // Méthode pour ajouter (retourne un Observable vide en attendant le backend)
  addAthlete(athleteData: Omit<Athlete, 'id'>): Observable<void> {
    return EMPTY;
  }

  // Méthode pour mettre à jour
  updateAthlete(updatedAthlete: Athlete): Observable<void> {
    return EMPTY;
  }

  // Méthode pour supprimer
  deleteAthlete(id: number): Observable<void> {
    return EMPTY;
  }

}
