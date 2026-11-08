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
import {CellLine, ProgrammeCellUpdateRequest} from '../../../models/programme.model';
import {EditCellEvent} from '../programme-detail-dialog/programme-detail-dialog.component';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

/**
 * Ligne éditable d'une cellule (séance × position) du programme.
 *
 * Les champs numériques (`setNumber`, `minWeight`, `maxWeight`) sont typés
 * `number | null` pour s'interfacer avec {@link WaNumberInputControlDirective} ;
 * `repNumber` est un **champ texte** (RG11 : formats libres `6`, `30s`, `(1 + 1)`).
 *
 * `programmeTrainingId` et `repLabel` ne sont pas édités dans le formulaire : ils
 * sont conservés tels quels pour être renvoyés au backend (voir note sur le choix
 * d'édition des répétitions dans la javadoc du composant).
 */
interface CellLineFormRow {
  programmeTrainingId: number | null;
  exerciceName: string;
  setNumber: number | null;
  repNumber: string;
  repLabel: string | null;
  minWeight: number | null;
  maxWeight: number | null;
}

/** Modèle interne du formulaire : la liste des lignes de la cellule. */
interface CellFormModel {
  lines: CellLineFormRow[];
}

/**
 * Modale d'**édition d'une cellule** (séance × position d'exercice) d'un programme.
 *
 * Elle présente un **bloc de lignes dynamique** (pattern du bloc « séries » de
 * l'écran Protocoles) : chaque ligne correspond à une alternative « au choix » ou à
 * un set d'un même exercice. L'utilisateur peut ajouter une ligne (en fin de liste)
 * ou supprimer une ligne. La cellule peut même être entièrement vidée (le backend
 * remplace alors la case en bloc).
 *
 * **Choix d'édition des répétitions** : le formulaire n'expose qu'**un seul** champ
 * « répétitions » éditable, mappé sur `repNumber` (texte libre). `repLabel`
 * (utilisé pour les exercices combinés épaulé-jeté, ex. `(4 + 4)`) est **conservé
 * inchangé** en arrière-plan et renvoyé tel quel au backend : on ne l'écrase pas.
 * L'affichage côté détail privilégie `repLabel` quand il existe, sinon `repNumber`.
 *
 * Chaque ligne exige au minimum un **nom d'exercice** ; les autres champs sont
 * optionnels (`number | null`, texte libre). Si `minWeight` et `maxWeight` sont tous
 * deux renseignés, `maxWeight >= minWeight` (validation légère, message i18n).
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
  protected readonly model = signal<CellFormModel>({lines: [this.emptyLine()]});

  /**
   * Formulaire Signal Forms : chaque ligne doit au moins porter un nom d'exercice.
   * `maxWeight >= minWeight` quand les deux charges sont renseignées.
   */
  protected readonly cellForm = form(this.model, (path) => {
    applyEach(path.lines, (rowPath) => {
      required(rowPath.exerciceName, {message: 'programmes.cell.errors.name'});
      validate(rowPath.maxWeight, (ctx) => {
        const max = ctx.value();
        const min = ctx.valueOf(rowPath.minWeight);
        if (max == null || min == null) {
          return undefined;
        }
        return max < min
          ? {kind: 'weightRange', message: 'programmes.cell.errors.weightRange'}
          : undefined;
      });
    });
  });

  /** Lignes du formulaire (pour l'itération `@for` du template). */
  protected readonly lines = computed<readonly CellLineFormRow[]>(() => this.model().lines);

  constructor() {
    // Réinitialise le formulaire à chaque (ré)ouverture ou changement de cellule.
    effect(() => {
      this.open();
      const source = this.cell();
      const rows = source && source.trainings.length > 0
        ? source.trainings.map((t) => this.toFormRow(t))
        : [this.emptyLine()];
      this.model.set({lines: rows});
    });
  }

  /** Traduit une clé i18n de manière impérative (pour aria-label). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  /** Ajoute une ligne vide à la **fin** de la liste (ne déplace pas le focus courant). */
  protected addLine(): void {
    this.model.update((m) => ({lines: [...m.lines, this.emptyLine()]}));
  }

  /** Supprime la ligne à l'index donné (la liste peut devenir vide). */
  protected removeLine(index: number): void {
    this.model.update((m) => ({lines: m.lines.filter((_, i) => i !== index)}));
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
      lines: this.model().lines.map((line) => this.toCellLine(line))
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

  /** Normalise une ligne de formulaire en {@link CellLine} (champs vides → null). */
  private toCellLine(line: CellLineFormRow): CellLine {
    const repNumber = line.repNumber.trim();
    return {
      programmeTrainingId: line.programmeTrainingId,
      exerciceName: line.exerciceName.trim(),
      setNumber: line.setNumber,
      repNumber: repNumber ? repNumber : null,
      repLabel: line.repLabel,
      minWeight: line.minWeight,
      maxWeight: line.maxWeight
    };
  }

  private toFormRow(training: EditCellEvent['trainings'][number]): CellLineFormRow {
    return {
      programmeTrainingId: training.programmeTrainingId,
      exerciceName: training.exerciceName,
      setNumber: training.setNumber,
      repNumber: training.repNumber ?? '',
      repLabel: training.repLabel,
      minWeight: training.minWeight,
      maxWeight: training.maxWeight
    };
  }

  private emptyLine(): CellLineFormRow {
    return {
      programmeTrainingId: null,
      exerciceName: '',
      setNumber: null,
      repNumber: '',
      repLabel: null,
      minWeight: null,
      maxWeight: null
    };
  }
}
