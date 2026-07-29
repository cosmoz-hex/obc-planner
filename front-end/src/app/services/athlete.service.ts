import { Injectable, signal } from '@angular/core';
import { Athlete } from '../models/athlete.model';

@Injectable({
  providedIn: 'root'
})
export class AthleteService {
  // Signal privé contenant la liste des athlètes
  private athletesSignal = signal<Athlete[]>([
    { id: 1, nom: 'Dupont', prenom: 'Thomas', age: 24, sexe: 'Homme', poids: 83.5, categorie: '-85kg', niveau: 'NAT', derniereEvaluation: '15/03/2026' },
    { id: 2, nom: 'Martin', prenom: 'Sophie', age: 21, sexe: 'Femme', poids: 55.0, categorie: '-57kg', niveau: 'REG', derniereEvaluation: '20/02/2026' }
  ]);

  // Signal en lecture seule accessible par les composants
  athletes = this.athletesSignal.asReadonly();

  // Ajouter un athlète
  addAthlete(athleteData: Omit<Athlete, 'id' | 'derniereEvaluation'>) {
    const newAthlete: Athlete = {
      ...athleteData,
      id: Date.now(),
      derniereEvaluation: 'Non évalué'
    };
    this.athletesSignal.update(list => [newAthlete, ...list]);
  }

  // Mettre à jour un athlète
  updateAthlete(updatedAthlete: Athlete) {
    this.athletesSignal.update(list =>
      list.map(ath => ath.id === updatedAthlete.id ? updatedAthlete : ath)
    );
  }

  // Supprimer un athlète
  deleteAthlete(id: number) {
    this.athletesSignal.update(list => list.filter(ath => ath.id !== id));
  }
}
