import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Athlete } from '../../models/athlete.model';
import { AthleteService } from '../../services/athlete.service';

@Component({
  selector: 'app-athlete-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './athlete-list.component.html',
  styleUrl: './athlete-list.component.css'
})
export class AthleteListComponent {
  // Inyección del servicio
  private readonly athleteService = inject(AthleteService);

  // Obtenemos los atletas directamente del servicio
  athletes = this.athleteService.athletes;

  // Estados de filtros y búsqueda
  searchTerm = signal('');
  selectedCategory = signal('');
  selectedLevel = signal('');

  // Listas de referencia para selectores
  hommesCategories = ['55kg', '61kg', '67kg', '73kg', '81kg', '89kg', '96kg', '102kg', '+102kg'];
  femmesCategories = ['45kg', '49kg', '55kg', '59kg', '64kg', '71kg', '76kg', '81kg', '+81kg'];
  niveaux = ['Débutant', 'Intermédiaire', 'National', 'Élite'];

  // Estados de la Modale y Formulario
  showModal = signal(false);
  isEditMode = signal(false);

  athleteForm = signal<Athlete>({
    id: 0,
    nom: '',
    prenom: '',
    age: undefined,
    sexe: 'Homme',
    poids: undefined,
    categorie: '73kg',
    niveau: 'Débutant',
    derniereEvaluation: ''
  });

  // Athlètes filtrés (computados reactivamente)
  filteredAthletes = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const cat = this.selectedCategory();
    const lev = this.selectedLevel();

    return this.athletes().filter(athlete => {
      const matchesSearch = search === '' ||
        athlete.nom.toLowerCase().includes(search) ||
        athlete.prenom.toLowerCase().includes(search);

      const matchesCat = cat === '' || athlete.categorie === cat;
      const matchesLev = lev === '' || athlete.niveau === lev;

      return matchesSearch && matchesCat && matchesLev;
    });
  });

  // Apertura de modales
  openAddModal() {
    this.isEditMode.set(false);
    this.athleteForm.set({
      id: 0,
      nom: '',
      prenom: '',
      age: undefined,
      sexe: 'Homme',
      poids: undefined,
      categorie: this.hommesCategories[0],
      niveau: this.niveaux[0],
      derniereEvaluation: new Date().toLocaleDateString()
    });
    this.showModal.set(true);
  }

  openEditModal(athlete: Athlete) {
    this.isEditMode.set(true);
    this.athleteForm.set({ ...athlete }); // Copia para evitar mutación directa
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  // Guardar (Añadir o Editar) usando el servicio
  saveAthlete() {
    const formValue = this.athleteForm();
    if (!formValue.nom || !formValue.prenom) return; // Validación básica

    if (this.isEditMode()) {
      this.athleteService.updateAthlete(formValue);
    } else {
      this.athleteService.addAthlete(formValue);
    }
    this.closeModal();
  }

  // Eliminar usando el servicio
  deleteAthlete(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cet athlète ?')) {
      this.athleteService.deleteAthlete(id);
    }
  }
}
