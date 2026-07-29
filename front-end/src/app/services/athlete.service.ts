import { Injectable, signal } from '@angular/core';
import { Athlete } from '../models/athlete.model';

@Injectable({
  providedIn: 'root'
})
export class AthleteService {
  // Añadimos 'readonly'
  private readonly athletesSignal = signal<Athlete[]>([
    // Cambiamos 75.0 por 75
    { id: 1, nom: 'Dupont', prenom: 'Jean', age: 25, sexe: 'Homme', poids: 75, categorie: '77kg', niveau: 'Élite', derniereEvaluation: '10/05/2026' },
    { id: 2, nom: 'Martin', prenom: 'Claire', age: 22, sexe: 'Femme', poids: 60.5, categorie: '63kg', niveau: 'National', derniereEvaluation: '12/05/2026' }
  ]);

  // Exponemos la señal como de solo lectura hacia los componentes
  readonly athletes = this.athletesSignal.asReadonly();

  // Metodo para añadir
  addAthlete(athleteData: Omit<Athlete, 'id'>) {
    const newId = Date.now(); // Genera un ID único basado en timestamp
    const newAthlete: Athlete = { ...athleteData, id: newId };
    this.athletesSignal.update(list => [...list, newAthlete]);
  }

  // Metodo para actualizar
  updateAthlete(updatedAthlete: Athlete) {
    this.athletesSignal.update(list =>
      list.map(a => (a.id === updatedAthlete.id ? updatedAthlete : a))
    );
  }

  // Metodo para eliminar
  deleteAthlete(id: number) {
    this.athletesSignal.update(list => list.filter(a => a.id !== id));
  }
}
