import { Component, signal, computed, inject } from '@angular/core';
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
  private athleteService = inject(AthleteService);

  // Récupération du signal des athlètes depuis le service
  athletes = this.athleteService.athletes;

  // Filtres de recherche
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');
  selectedLevel = signal<string>('');

  // Options des catégories et niveaux
  hommesCategories = ['-60kg', '-65kg', '-70kg', '-75kg', '-85kg', '-95kg', '-110kg'];
  femmesCategories = ['-49kg', '-53kg', '-57kg', '-61kg', '-69kg', '-77kg', '-86kg'];
  niveaux = ['DEB', 'DPT', 'REG', 'IRG', 'HON', 'NAT', 'EUR', 'MONDE'];

  // État de la modale
  showModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingAthleteId = signal<number | null>(null);

  // Formulaire de l'athlète
  athleteForm = signal<Partial<Athlete>>({
    nom: '',
    prenom: '',
    age: undefined,
    sexe: 'Homme',
    poids: undefined,
    categorie: '-70kg',
    niveau: 'DEB'
  });

  // Liste filtrée dynamique
  filteredAthletes = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const cat = this.selectedCategory();
    const niv = this.selectedLevel();

    return this.athletes().filter(athlete => {
      const matchSearch = !search ||
        athlete.nom.toLowerCase().includes(search) ||
        athlete.prenom.toLowerCase().includes(search);

      const matchCategory = !cat || athlete.categorie === cat;
      const matchNiveau = !niv || athlete.niveau === niv;

      return matchSearch && matchCategory && matchNiveau;
    });
  });

  openAddModal() {
    this.isEditMode.set(false);
    this.editingAthleteId.set(null);
    this.athleteForm.set({
      nom: '',
      prenom: '',
      age: undefined,
      sexe: 'Homme',
      poids: undefined,
      categorie: '-70kg',
      niveau: 'DEB'
    });
    this.showModal.set(true);
  }

  openEditModal(athlete: Athlete) {
    this.isEditMode.set(true);
    this.editingAthleteId.set(athlete.id);
    this.athleteForm.set({ ...athlete });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveAthlete() {
    const form = this.athleteForm();
    if (!form.nom || !form.prenom) return;

    if (this.isEditMode() && this.editingAthleteId() !== null) {
      this.athleteService.updateAthlete({
        id: this.editingAthleteId()!,
        nom: form.nom,
        prenom: form.prenom,
        age: form.age,
        sexe: form.sexe || 'Homme',
        poids: form.poids,
        categorie: form.categorie || '-70kg',
        niveau: form.niveau || 'DEB',
        derniereEvaluation: form.derniereEvaluation || 'Non évalué'
      });
    } else {
      this.athleteService.addAthlete({
        nom: form.nom,
        prenom: form.prenom,
        age: form.age,
        sexe: form.sexe || 'Homme',
        poids: form.poids,
        categorie: form.categorie || '-70kg',
        niveau: form.niveau || 'DEB'
      });
    }

    this.closeModal();
  }

  deleteAthlete(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet athlète ?')) {
      this.athleteService.deleteAthlete(id);
    }
  }
}
