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
import {WaFieldErrorDirective} from '../../../../directives/wa-forms/wa-field-error.directive';
import {
  EXERCICE_ORDERS,
  EXERCICE_TYPES,
  ExerciceType,
  RefPlanning,
  RefPlanningRequest,
  TRAINING_ORDERS,
  WEEKS_NUMBERS
} from '../../../../models/planning.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/button/button.js';

/** Mode d'affichage de la modale. */
export type PlanningFormMode = 'create' | 'edit';

/**
 * Modèle interne du formulaire. Toutes les valeurs sont des chaînes pour
 * s'interfacer directement avec les value accessors WebAwesome.
 */
interface PlanningFormModel {
  weeksNumbers: string;
  trainingOrder: string;
  exerciceOrder: string;
  exerciceType: string;
}

/**
 * Modale de gestion d'une ligne de planning de référence, pilotée par un
 * {@link PlanningFormMode} : création ou modification.
 *
 * Les 4 champs (format hebdo, n° séance, n° exercice, catégorie) sont empilés
 * verticalement. Tous les champs sont requis. Ils sont liés au formulaire Signal
 * Forms via `[formField]`, grâce au value accessor {@link WaSelectControlDirective}.
 */
@Component({
  selector: 'app-planning-form-dialog',
  standalone: true,
  imports: [TranslatePipe, FormField, WaSelectControlDirective, WaFieldErrorDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './planning-form-dialog.component.html'
})
export class PlanningFormDialogComponent {

  private readonly translate = inject(TranslateService);

  readonly open = input<boolean>(false);
  readonly mode = input<PlanningFormMode>('create');
  readonly planningRow = input<RefPlanning | null>(null);

  readonly save = output<RefPlanningRequest>();
  readonly close = output<void>();

  protected readonly weeksNumbers = WEEKS_NUMBERS;
  protected readonly trainingOrders = TRAINING_ORDERS;
  protected readonly exerciceOrders = EXERCICE_ORDERS;
  protected readonly exerciceTypes = EXERCICE_TYPES;

  /** Source de vérité du formulaire. */
  protected readonly model = signal<PlanningFormModel>(this.emptyModel());

  /** Formulaire Signal Forms : tous les champs sont requis. */
  protected readonly planningForm = form(this.model, (path) => {
    required(path.weeksNumbers, {message: 'planning.form.errors.weeksNumbers'});
    required(path.trainingOrder, {message: 'planning.form.errors.trainingOrder'});
    required(path.exerciceOrder, {message: 'planning.form.errors.exerciceOrder'});
    required(path.exerciceType, {message: 'planning.form.errors.exerciceType'});
  });

  protected readonly title = computed(() =>
    this.mode() === 'create' ? 'planning.form.title.create' : 'planning.form.title.edit'
  );

  constructor() {
    // Réinitialise le formulaire à chaque (ré)ouverture ou changement de ligne.
    effect(() => {
      this.open();
      const source = this.planningRow();
      this.model.set(source ? this.toModel(source) : this.emptyModel());
    });
  }

  /** Traduit une clé i18n de manière impérative (pour aria-label). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  protected onSubmit(): void {
    if (this.planningForm().invalid()) {
      this.planningForm().markAsTouched();
      return;
    }
    const m = this.model();
    this.save.emit({
      weeksNumbers: Number(m.weeksNumbers),
      trainingOrder: Number(m.trainingOrder),
      exerciceOrder: Number(m.exerciceOrder),
      exerciceType: m.exerciceType as ExerciceType
    });
  }

  protected onClose(): void {
    this.close.emit();
  }

  /**
   * Ferme la modale uniquement si l'événement provient bien du dialog lui-même.
   * Les composants `<wa-select>` internes émettent aussi `wa-after-hide` (bubbling)
   * lors de leur propre fermeture : on ignore ces événements enfants.
   */
  protected onDialogHide(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private emptyModel(): PlanningFormModel {
    return {
      weeksNumbers: '',
      trainingOrder: '',
      exerciceOrder: '',
      exerciceType: ''
    };
  }

  private toModel(row: RefPlanning): PlanningFormModel {
    return {
      weeksNumbers: String(row.weeksNumbers),
      trainingOrder: String(row.trainingOrder),
      exerciceOrder: String(row.exerciceOrder),
      exerciceType: row.exerciceType
    };
  }
}
