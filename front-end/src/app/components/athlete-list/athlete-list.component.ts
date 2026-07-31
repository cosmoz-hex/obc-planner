import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Athlete } from '../../models/athlete.model';
import { AthleteService } from '../../services/athlete.service';

@Component({
  selector: 'app-athlete-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './athlete-list.component.html',
  styleUrl: './athlete-list.component.css',
})
export class AthleteListComponent {
  // Inyección de servicios
  private readonly athleteService = inject(AthleteService);
  private readonly fb = inject(FormBuilder);

  // Liste des athlètes (Observable du service → Signal)
  athletes = toSignal(this.athleteService.getAthletes(), {
    initialValue: [] as Athlete[],
  });

  // Listes de référence (déplacées dans le service)
  hommesCategories = this.athleteService.getHommesCategories();
  femmesCategories = this.athleteService.getFemmesCategories();
  niveaux = this.athleteService.getNiveaux();

  // --- Formulaire de filtres (regroupé) ---
  filterForm = this.fb.group({
    search: [''],
    categorie: [''],
    niveau: [''],
  });

  private filterValues = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.value,
  });

  // --- État de la modale ---
  showModal = signal(false);
  isEditMode = signal(false);

  // --- Formulaire réactif de l'athlète (avec validations) ---
  athleteFormGroup = this.fb.group({
    id: [0],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    age: [undefined as number | undefined, [Validators.min(10), Validators.max(100)]],
    sexe: ['Homme' as 'Homme' | 'Femme'],
    poids: [undefined as number | undefined, [Validators.min(20), Validators.max(300)]],
    categorie: ['73kg'],
    niveau: ['Débutant'],
    derniereEvaluation: [''],
  });

  // --- Confirmation de suppression (popup) ---
  athleteToDeleteId = signal<number | null>(null);

  // Athlètes filtrés (reactif via filterForm)
  filteredAthletes = computed(() => {
    const { search, categorie, niveau } = this.filterValues();
    const s = (search ?? '').toLowerCase().trim();

    return this.athletes().filter((athlete) => {
      const matchesSearch =
        s === '' ||
        athlete.nom.toLowerCase().includes(s) ||
        athlete.prenom.toLowerCase().includes(s);

      const matchesCat = !categorie || athlete.categorie === categorie;
      const matchesLev = !niveau || athlete.niveau === niveau;

      return matchesSearch && matchesCat && matchesLev;
    });
  });

  // --- Ouverture des modales ---
  openAddModal() {
    this.isEditMode.set(false);
    this.athleteFormGroup.reset({
      id: 0,
      nom: '',
      prenom: '',
      age: undefined,
      sexe: 'Homme',
      poids: undefined,
      categorie: this.hommesCategories[0],
      niveau: this.niveaux[0],
      derniereEvaluation: new Date().toLocaleDateString(),
    });
    this.showModal.set(true);
  }

  openEditModal(athlete: Athlete) {
    this.isEditMode.set(true);
    this.athleteFormGroup.reset({ ...athlete });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  // --- Enregistrer (Ajout ou Édition) via le service ---
  saveAthlete() {
    if (this.athleteFormGroup.invalid) {
      this.athleteFormGroup.markAllAsTouched();
      return;
    }

    const formValue = this.athleteFormGroup.getRawValue() as Athlete;

    if (this.isEditMode()) {
      this.athleteService.updateAthlete(formValue);
    } else {
      this.athleteService.addAthlete(formValue);
    }
    this.closeModal();
  }

  // --- Suppression avec popup de confirmation ---
  askDeleteConfirmation(id: number) {
    this.athleteToDeleteId.set(id);
  }

  confirmDelete() {
    const id = this.athleteToDeleteId();
    if (id !== null) {
      this.athleteService.deleteAthlete(id);
    }
    this.athleteToDeleteId.set(null);
  }

  cancelDelete() {
    this.athleteToDeleteId.set(null);
  }
}
