import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {LocalizedDatePipe} from '../../../pipes/localized-date.pipe';
import {
  ProgrammeCellUpdateRequest,
  ProgrammeDetail,
  ProgrammeTraining,
  ProgrammeWeek
} from '../../../models/programme.model';
import {ProgrammeService} from '../../../services/programme.service';
import {ProgrammeCellDialogComponent} from '../programme-cell-dialog/programme-cell-dialog.component';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/toast/toast.js';
import type WaToast from '@awesome.me/webawesome/dist/components/toast/toast.js';

/** Option du sélecteur de semaines. */
export interface WeekOption {
  readonly weekNumber: number;
  readonly startDate: string;
  readonly endDate: string;
}

/** Cellule de la grille pivot : toutes les séances d'un couple (séance × position). */
export interface GridCell {
  readonly trainingNumber: number;
  readonly exerciceOrder: number;
  readonly trainings: readonly ProgrammeTraining[];
}

/** Ligne de la grille pivot : une position d'exercice avec ses cellules par séance. */
export interface GridRow {
  readonly exerciceOrder: number;
  readonly cells: readonly GridCell[];
}

/** Grille pivot d'une semaine : en-têtes de séances + lignes par position. */
export interface PivotGrid {
  readonly trainingNumbers: readonly number[];
  readonly rows: readonly GridRow[];
}

/** Payload émis au clic sur une cellule (consommé par la popup d'édition au Lot 10). */
export interface EditCellEvent {
  readonly weekNumber: number;
  readonly trainingNumber: number;
  readonly exerciceOrder: number;
  readonly trainings: readonly ProgrammeTraining[];
}

/**
 * Modale de **consultation / édition** d'un programme d'entraînement.
 *
 * Elle charge elle-même le détail du programme ({@link ProgrammeService.getDetail})
 * dès qu'elle est ouverte avec un identifiant. Un sélecteur de semaines permet de
 * naviguer entre les semaines ; chaque semaine est présentée via un en-tête
 * (type / base % / 6 objectifs) et une **grille pivot** calquée sur l'écran Planning
 * (colonnes = séances `trainingNumber`, lignes = positions `exerciceOrder`).
 *
 * Chaque cellule regroupe toutes les séances du couple (séance × position) :
 * plusieurs séances empilées correspondent à des alternatives « au choix » ou aux
 * sets d'un même exercice. Un clic sur une cellule émet {@link EditCellEvent} ; la
 * popup d'édition proprement dite est traitée au Lot 10 (ici on ne fait qu'émettre).
 */
@Component({
  selector: 'app-programme-detail-dialog',
  standalone: true,
  imports: [TranslatePipe, ProgrammeCellDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './programme-detail-dialog.component.html',
  providers: [LocalizedDatePipe]
})
export class ProgrammeDetailDialogComponent {

  private readonly programmeService = inject(ProgrammeService);
  private readonly translate = inject(TranslateService);
  private readonly localizedDate = inject(LocalizedDatePipe);

  readonly open = input<boolean>(false);
  readonly programmeId = input<number | null>(null);

  readonly close = output<void>();
  /**
   * Émis au clic sur une cellule (conservé pour un éventuel câblage parent).
   * L'édition est traitée **localement** via la popup `app-programme-cell-dialog`
   * intégrée à ce composant : il possède déjà le contexte (programmeId, semaine) et
   * peut se rafraîchir lui-même après la mise à jour.
   */
  readonly editCell = output<EditCellEvent>();

  /** Cellule en cours d'édition (null tant qu'aucune cellule n'est ouverte). */
  protected readonly editingCell = signal<EditCellEvent | null>(null);
  /** Ouverture de la popup d'édition de cellule. */
  protected readonly cellDialogOpen = signal(false);

  /** Détail du programme en cours de consultation (null tant que non chargé). */
  protected readonly detail = signal<ProgrammeDetail | null>(null);
  protected readonly loading = signal(false);

  /** Numéro de la semaine affichée (réinitialisé à 1 au chargement d'un détail). */
  protected readonly selectedWeekNumber = signal<number>(1);

  private readonly errorToast = viewChild<ElementRef<WaToast>>('errorToast');

  /** Titre de la modale (inclut le nom de l'athlète si le détail est chargé). */
  protected readonly athleteName = computed<string>(() => {
    const d = this.detail();
    return d ? `${d.athleteLastName} ${d.athleteFirstName}` : '';
  });

  /** Options du sélecteur de semaines, triées par numéro croissant. */
  protected readonly weekOptions = computed<readonly WeekOption[]>(() => {
    const d = this.detail();
    if (!d) {
      return [];
    }
    return [...d.programmeWeeks]
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .map((w) => ({weekNumber: w.weekNumber, startDate: w.startDate, endDate: w.endDate}));
  });

  /** Semaine actuellement sélectionnée (ou null si introuvable). */
  protected readonly selectedWeek = computed<ProgrammeWeek | null>(() => {
    const d = this.detail();
    if (!d) {
      return null;
    }
    return d.programmeWeeks.find((w) => w.weekNumber === this.selectedWeekNumber()) ?? null;
  });

  /**
   * Grille pivot de la semaine sélectionnée : colonnes = numéros de séances distincts
   * (triés), lignes = positions d'exercice distinctes (triées). Chaque cellule agrège
   * toutes les séances du couple (séance × position) — alternatives / sets empilés.
   */
  protected readonly grid = computed<PivotGrid>(() => {
    const week = this.selectedWeek();
    if (!week) {
      return {trainingNumbers: [], rows: []};
    }
    const trainings = week.trainings;
    const trainingNumbers = [...new Set(trainings.map((t) => t.trainingNumber))].sort((a, b) => a - b);
    const exerciceOrders = [...new Set(trainings.map((t) => t.exerciceOrder))].sort((a, b) => a - b);

    const rows: GridRow[] = exerciceOrders.map((exerciceOrder) => ({
      exerciceOrder,
      cells: trainingNumbers.map((trainingNumber) => ({
        trainingNumber,
        exerciceOrder,
        trainings: trainings.filter(
          (t) => t.trainingNumber === trainingNumber && t.exerciceOrder === exerciceOrder
        )
      }))
    }));

    return {trainingNumbers, rows};
  });

  constructor() {
    // Charge le détail à chaque ouverture avec un identifiant valide.
    effect(() => {
      const id = this.programmeId();
      if (this.open() && id !== null) {
        void this.load(id);
      }
    });
  }

  /** Traduit une clé i18n de manière impérative (pour aria-label et messages). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  /** Formate une date selon la langue active (sélecteur de semaines). */
  protected formatDate(value: string): string {
    return this.localizedDate.transform(value) ?? value;
  }

  /** Change la semaine affichée (valeur `<wa-select>` reçue en string). */
  protected onWeekChange(value: string): void {
    const weekNumber = Number(value);
    if (!Number.isNaN(weekNumber)) {
      this.selectedWeekNumber.set(weekNumber);
    }
  }

  /**
   * Clic sur une cellule : ouvre la popup locale d'édition (et émet aussi
   * {@link editCell} pour un éventuel usage parent).
   */
  protected onCellClick(cell: GridCell): void {
    const event: EditCellEvent = {
      weekNumber: this.selectedWeekNumber(),
      trainingNumber: cell.trainingNumber,
      exerciceOrder: cell.exerciceOrder,
      trainings: cell.trainings
    };
    this.editCell.emit(event);
    this.editingCell.set(event);
    this.cellDialogOpen.set(true);
  }

  /**
   * Validation de la popup d'édition de cellule : persiste la mise à jour en bloc,
   * met à jour le détail avec la réponse (en conservant la semaine sélectionnée) et
   * ferme la popup. En cas d'échec : toast d'erreur, popup conservée.
   */
  protected async onCellSave(request: ProgrammeCellUpdateRequest): Promise<void> {
    const id = this.programmeId();
    if (id === null) {
      return;
    }
    try {
      const detail = await this.programmeService.updateCell(id, request);
      this.detail.set(detail);
      this.cellDialogOpen.set(false);
    } catch {
      this.showError('programmes.cell.errors.save');
    }
  }

  protected onClose(): void {
    this.close.emit();
  }

  /**
   * Ferme la modale uniquement si l'événement provient bien du dialog lui-même.
   * Les `<wa-select>` internes émettent aussi `wa-after-hide` (bubbling) : on ignore
   * ces événements enfants.
   */
  protected onDialogHide(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  /**
   * Recharge le détail du programme en conservant la semaine sélectionnée.
   * Appelable par le parent après une édition de cellule (Lot 10).
   */
  async reload(): Promise<void> {
    const id = this.programmeId();
    if (id === null) {
      return;
    }
    const current = this.selectedWeekNumber();
    await this.load(id, current);
  }

  /** Charge le détail ; `keepWeek` conserve la semaine affichée (défaut : 1re semaine). */
  private async load(id: number, keepWeek?: number): Promise<void> {
    this.loading.set(true);
    try {
      const detail = await this.programmeService.getDetail(id);
      this.detail.set(detail);
      const available = detail.programmeWeeks.map((w) => w.weekNumber);
      const target = keepWeek !== undefined && available.includes(keepWeek)
        ? keepWeek
        : (available.length > 0 ? Math.min(...available) : 1);
      this.selectedWeekNumber.set(target);
    } catch {
      this.detail.set(null);
      this.showError('programmes.detail.errors.load');
    } finally {
      this.loading.set(false);
    }
  }

  /** Affiche une notification d'erreur transitoire (wa-toast, variant danger). */
  private showError(key: string): void {
    this.errorToast()?.nativeElement.create(this.t(key), {variant: 'danger', icon: 'triangle-exclamation'});
  }
}
