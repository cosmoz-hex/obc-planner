import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {applyEach, form, FormField, required, validate} from '@angular/forms/signals';
import {WaInputControlDirective} from '../../../directives/wa-forms/wa-input-control.directive';
import {WaNumberInputControlDirective} from '../../../directives/wa-forms/wa-number-input-control.directive';
import {WaFieldErrorDirective} from '../../../directives/wa-forms/wa-field-error.directive';
import {CellExercice, CellSeries, ProgrammeCellUpdateRequest} from '../../../models/programme.model';
import {EditCellEvent} from '../programme-detail-dialog/programme-detail-dialog.component';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

/**
 * Série éditable d'un exercice d'une cellule.
 *
 * Les champs numériques (`setNumber`, `minWeight`, `maxWeight`) sont typés
 * `number | null` pour s'interfacer avec {@link WaNumberInputControlDirective} ;
 * `repNumber` est un **champ texte** (formats libres `6`, `30s`, `(1 + 1)`).
 */
interface SeriesFormRow {
  programmeSeriesId: number | null;
  setNumber: number | null;
  repNumber: string;
  minWeight: number | null;
  maxWeight: number | null;
}

/** Exercice éditable d'une cellule : un nom + sa liste de séries. */
interface ExerciceFormRow {
  programmeExerciceId: number | null;
  exerciceName: string;
  series: SeriesFormRow[];
}

/** Modèle interne du formulaire : la liste des exercices de la cellule. */
interface CellFormModel {
  exercices: ExerciceFormRow[];
}

/**
 * Modale d'**édition d'une cellule** (séance × position d'exercice) d'un programme.
 *
 * Reflétant le modèle hiérarchique à 3 niveaux (séance → exercice → série), le
 * formulaire présente **un bloc par exercice** (nom + bouton de suppression),
 * contenant une **sous-liste de séries** éditables (nombre de séries, répétitions
 * en texte libre, charges min/max). L'utilisateur peut ajouter/supprimer un exercice
 * et, par exercice, ajouter/supprimer une série. Les ajouts se font **en fin de
 * liste** pour ne pas déplacer le focus des champs situés avant (a11y).
 *
 * À la validation, la cellule est remplacée **en bloc** côté backend : les exercices
 * et séries absents (par identifiant) sont supprimés, les présents mis à jour, les
 * nouveaux (identifiant `null`) insérés.
 *
 * Chaque exercice exige un **nom** ; les champs de série sont optionnels. Quand
 * `minWeight` et `maxWeight` sont tous deux renseignés, `maxWeight >= minWeight`.
 */
@Component({
  selector: 'app-programme-cell-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    FormField,
    WaInputControlDirective,
    WaNumberInputControlDirective,
    WaFieldErrorDirective
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './programme-cell-dialog.component.html'
})
export class ProgrammeCellDialogComponent {

  private readonly translate = inject(TranslateService);

  readonly open = input<boolean>(false);
  readonly cell = input<EditCellEvent | null>(null);

  /** Émis à la validation : payload de mise à jour en bloc de la cellule. */
  readonly save = output<ProgrammeCellUpdateRequest>();
  readonly close = output<void>();

  /** Source de vérité du formulaire. */
  protected readonly model = signal<CellFormModel>({exercices: [this.emptyExercice()]});

  /**
   * Formulaire Signal Forms : chaque exercice doit porter un nom ; pour chaque série,
   * `maxWeight >= minWeight` quand les deux charges sont renseignées.
   */
  protected readonly cellForm = form(this.model, (path) => {
    applyEach(path.exercices, (exercicePath) => {
      required(exercicePath.exerciceName, {message: 'programmes.cell.errors.name'});
      applyEach(exercicePath.series, (seriesPath) => {
        validate(seriesPath.maxWeight, (ctx) => {
          const max = ctx.value();
          const min = ctx.valueOf(seriesPath.minWeight);
          if (max == null || min == null) {
            return undefined;
          }
          return max < min
            ? {kind: 'weightRange', message: 'programmes.cell.errors.weightRange'}
            : undefined;
        });
      });
    });
  });

  /** Exercices du formulaire (pour l'itération `@for` du template). */
  protected readonly exercices = computed<readonly ExerciceFormRow[]>(() => this.model().exercices);

  constructor() {
    // Réinitialise le formulaire à chaque (ré)ouverture ou changement de cellule :
    // mappe les exercices (et leurs séries) de la case sur le modèle hiérarchique.
    effect(() => {
      this.open();
      const source = this.cell();
      const rows = source && source.exercices.length > 0
        ? source.exercices.map((exercice) => this.toExerciceRow(exercice))
        : [this.emptyExercice()];
      this.model.set({exercices: rows});
    });
  }

  /** Traduit une clé i18n de manière impérative (pour aria-label). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  /** Ajoute un exercice vide à la **fin** de la liste (ne déplace pas le focus courant). */
  protected addExercice(): void {
    this.model.update((m) => ({exercices: [...m.exercices, this.emptyExercice()]}));
  }

  /** Supprime l'exercice à l'index donné (la liste peut devenir vide). */
  protected removeExercice(index: number): void {
    this.model.update((m) => ({exercices: m.exercices.filter((_, i) => i !== index)}));
  }

  /** Ajoute une série vide à la **fin** des séries de l'exercice donné. */
  protected addSeries(exerciceIndex: number): void {
    this.model.update((m) => ({
      exercices: m.exercices.map((exercice, i) =>
        i === exerciceIndex
          ? {...exercice, series: [...exercice.series, this.emptySeries()]}
          : exercice)
    }));
  }

  /** Supprime la série à l'index donné de l'exercice donné. */
  protected removeSeries(exerciceIndex: number, seriesIndex: number): void {
    this.model.update((m) => ({
      exercices: m.exercices.map((exercice, i) =>
        i === exerciceIndex
          ? {...exercice, series: exercice.series.filter((_, j) => j !== seriesIndex)}
          : exercice)
    }));
  }

  protected onSubmit(): void {
    if (this.cellForm().invalid()) {
      this.cellForm().markAsTouched();
      return;
    }
    const cell = this.cell();
    if (!cell) {
      return;
    }
    const request: ProgrammeCellUpdateRequest = {
      weekNumber: cell.weekNumber,
      trainingNumber: cell.trainingNumber,
      exerciceOrder: cell.exerciceOrder,
      exercices: this.model().exercices.map((exercice) => this.toCellExercice(exercice))
    };
    this.save.emit(request);
  }

  protected onClose(): void {
    this.close.emit();
  }

  /**
   * Ferme la modale uniquement si l'événement provient bien du dialog lui-même.
   * Les `<wa-input>` internes émettent aussi `wa-after-hide` (bubbling) : on ignore
   * ces événements enfants.
   */
  protected onDialogHide(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  /** Normalise un exercice de formulaire en {@link CellExercice} (champs vides → null). */
  private toCellExercice(exercice: ExerciceFormRow): CellExercice {
    return {
      programmeExerciceId: exercice.programmeExerciceId,
      exerciceName: exercice.exerciceName.trim(),
      series: exercice.series.map((series) => this.toCellSeries(series))
    };
  }

  /** Normalise une série de formulaire en {@link CellSeries} (répétitions vides → null). */
  private toCellSeries(series: SeriesFormRow): CellSeries {
    const repNumber = series.repNumber.trim();
    return {
      programmeSeriesId: series.programmeSeriesId,
      setNumber: series.setNumber,
      repNumber: repNumber ? repNumber : null,
      minWeight: series.minWeight,
      maxWeight: series.maxWeight
    };
  }

  /** Mappe un exercice de la case sur une ligne de formulaire éditable. */
  private toExerciceRow(exercice: EditCellEvent['exercices'][number]): ExerciceFormRow {
    return {
      programmeExerciceId: exercice.programmeExerciceId,
      exerciceName: exercice.exerciceName,
      series: exercice.series.map((series) => ({
        programmeSeriesId: series.programmeSeriesId,
        setNumber: series.setNumber,
        repNumber: series.repNumber ?? '',
        minWeight: series.minWeight,
        maxWeight: series.maxWeight
      }))
    };
  }

  private emptyExercice(): ExerciceFormRow {
    return {
      programmeExerciceId: null,
      exerciceName: '',
      series: [this.emptySeries()]
    };
  }

  private emptySeries(): SeriesFormRow {
    return {
      programmeSeriesId: null,
      setNumber: null,
      repNumber: '',
      minWeight: null,
      maxWeight: null
    };
  }
}
