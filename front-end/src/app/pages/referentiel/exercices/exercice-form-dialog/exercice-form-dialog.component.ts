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
import {form, required, FormField} from '@angular/forms/signals';
import {WaSelectControlDirective} from '../../../../directives/wa-forms/wa-select-control.directive';
import {WaInputControlDirective} from '../../../../directives/wa-forms/wa-input-control.directive';
import {WaNumberInputControlDirective} from '../../../../directives/wa-forms/wa-number-input-control.directive';
import {WaFieldErrorDirective} from '../../../../directives/wa-forms/wa-field-error.directive';
import {
  CATEGORIE_EXERCICES,
  CategorieExercice,
  Exercice,
  ExerciceRequest,
  REFERENCE_EXERCICES,
  TYPE_EXERCICES,
  TypeExercice
} from '../../../../models/exercice.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/callout/callout.js';

/** Mode d'affichage de la modale. */
export type ExerciceFormMode = 'create' | 'edit';

/**
 * Modèle interne du formulaire. Les listes (type, catégorie, référence) sont
 * manipulées en chaînes (value accessors WebAwesome) ; la charge est saisie en
 * pourcentage entier et convertie en ratio à l'enregistrement.
 */
interface ExerciceFormModel {
  typeExercice: string;
  categorieExercice: string;
  exerciceCode: string;
  exerciceRef: string;
  estimatePercent: number | null;
}

/**
 * Modale de gestion d'un exercice de référence (création / modification).
 *
 * Le type, la catégorie et le code sont requis. L'exercice de référence et la
 * charge de travail (en % de l'exercice de référence) sont facultatifs.
 */
@Component({
  selector: 'app-exercice-form-dialog',
  standalone: true,
  imports: [TranslatePipe, FormField, WaSelectControlDirective, WaInputControlDirective, WaNumberInputControlDirective, WaFieldErrorDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exercice-form-dialog.component.html'
})
export class ExerciceFormDialogComponent {

  private readonly translate = inject(TranslateService);

  readonly open = input<boolean>(false);
  readonly mode = input<ExerciceFormMode>('create');
  readonly exerciceRow = input<Exercice | null>(null);
  readonly errorKey = input<string | null>(null);

  readonly save = output<ExerciceRequest>();
  readonly close = output<void>();

  protected readonly typeExercices = TYPE_EXERCICES;
  protected readonly categorieExercices = CATEGORIE_EXERCICES;
  protected readonly referenceExercices = REFERENCE_EXERCICES;

  /** Source de vérité du formulaire. */
  protected readonly model = signal<ExerciceFormModel>(this.emptyModel());

  /** Formulaire Signal Forms : type, catégorie et code requis. */
  protected readonly exerciceForm = form(this.model, (path) => {
    required(path.typeExercice, {message: 'exercices.form.errors.type'});
    required(path.categorieExercice, {message: 'exercices.form.errors.categorie'});
    required(path.exerciceCode, {message: 'exercices.form.errors.exerciceCode'});
  });

  protected readonly title = computed(() =>
    this.mode() === 'create' ? 'exercices.form.title.create' : 'exercices.form.title.edit'
  );

  constructor() {
    // Réinitialise le formulaire à chaque (ré)ouverture ou changement de ligne.
    effect(() => {
      this.open();
      const source = this.exerciceRow();
      this.model.set(source ? this.toModel(source) : this.emptyModel());
    });
  }

  /** Traduit une clé i18n de manière impérative (pour aria-label). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  protected onSubmit(): void {
    if (this.exerciceForm().invalid()) {
      this.exerciceForm().markAsTouched();
      return;
    }
    const m = this.model();
    this.save.emit({
      typeExercice: m.typeExercice as TypeExercice,
      categorieExercice: m.categorieExercice as CategorieExercice,
      exerciceCode: m.exerciceCode.trim(),
      exerciceRef: m.exerciceRef === '' ? null : Number(m.exerciceRef),
      estimateValue: m.estimatePercent == null ? null : this.round2(m.estimatePercent / 100)
    });
  }

  protected onClose(): void {
    this.close.emit();
  }

  /**
   * Ferme la modale uniquement si l'événement provient du dialog lui-même.
   * Les `<wa-select>` internes émettent aussi `wa-after-hide` (bubbling).
   */
  protected onDialogHide(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private emptyModel(): ExerciceFormModel {
    return {
      typeExercice: '',
      categorieExercice: '',
      exerciceCode: '',
      exerciceRef: '',
      estimatePercent: null
    };
  }

  private toModel(row: Exercice): ExerciceFormModel {
    return {
      typeExercice: row.typeExercice,
      categorieExercice: row.categorieExercice,
      exerciceCode: row.exerciceCode,
      exerciceRef: row.exerciceRef == null ? '' : String(row.exerciceRef),
      estimatePercent: row.estimateValue == null ? null : Math.round(row.estimateValue * 100)
    };
  }

  /** Arrondit à 2 décimales pour rester cohérent avec NUMERIC(4,2) côté base. */
  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
