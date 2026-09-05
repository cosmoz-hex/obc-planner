import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal
} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {FormField, disabled, form, readonly, required} from '@angular/forms/signals';
import {WaInputControlDirective} from '../../../directives/wa-forms/wa-input-control.directive';
import {WaSelectControlDirective} from '../../../directives/wa-forms/wa-select-control.directive';
import {WaFieldErrorDirective} from '../../../directives/wa-forms/wa-field-error.directive';
import {
  AGE_CATEGORIES,
  Athlete,
  AthleteRequest,
  COMP_LEVELS,
  Sexe,
  SEXES,
  WEIGHT_CATEGORIES
} from '../../../models/athlete.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/button/button.js';

/** Mode d'affichage de la modale. */
export type AthleteFormMode = 'create' | 'edit';

/**
 * Modèle interne du formulaire. Toutes les valeurs sont des chaînes pour
 * s'interfacer directement avec les value accessors WebAwesome ; la catégorie
 * de poids est convertie en nombre à la soumission.
 */
interface AthleteFormModel {
  firstName: string;
  lastName: string;
  sexe: string;
  ageCategorie: string;
  weightCategorie: string;
  compLevel: string;
}

/**
 * Modale unique de gestion d'un athlète, pilotée par un {@link AthleteFormMode} :
 * création ou modification.
 *
 * En modification, l'identité (nom, prénom, sexe) est verrouillée ; seuls la
 * catégorie d'âge, la catégorie de poids et le niveau sont modifiables.
 *
 * Les champs sont liés au formulaire Signal Forms via `[formField]`, grâce aux
 * value accessors {@link WaInputControlDirective} / {@link WaSelectControlDirective}.
 * La liste des catégories de poids dépend du sexe via un {@link linkedSignal}.
 */
@Component({
  selector: 'app-athlete-form-dialog',
  standalone: true,
  imports: [TranslatePipe, FormField, WaInputControlDirective, WaSelectControlDirective, WaFieldErrorDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './athlete-form-dialog.component.html'
})
export class AthleteFormDialogComponent {

  private readonly translate = inject(TranslateService);

  readonly open = input<boolean>(false);
  readonly mode = input<AthleteFormMode>('create');
  readonly athlete = input<Athlete | null>(null);

  readonly save = output<AthleteRequest>();
  readonly close = output<void>();

  protected readonly sexes = SEXES;
  protected readonly ageCategories = AGE_CATEGORIES;
  protected readonly compLevels = COMP_LEVELS;

  /** Source de vérité du formulaire. */
  protected readonly model = signal<AthleteFormModel>(this.emptyModel());

  /** Formulaire Signal Forms : tous les champs sont requis.
   * - En modification (edit) : l'identité (nom, prénom, sexe) est verrouillée ;
   *   seuls la catégorie d'âge, la catégorie de poids et le niveau sont modifiables.
   * - En création (create) : tous les champs sont modifiables. */
  protected readonly athleteForm = form(this.model, (path) => {
    // Identité non modifiable après création (verrouillée en edit).
    const isEdit = () => this.mode() === 'edit';

    required(path.firstName, {message: 'athletes.form.errors.firstName'});
    required(path.lastName, {message: 'athletes.form.errors.lastName'});
    required(path.sexe, {message: 'athletes.form.errors.sexe'});
    required(path.ageCategorie, {message: 'athletes.form.errors.ageCategorie'});
    required(path.weightCategorie, {message: 'athletes.form.errors.weightCategorie'});
    required(path.compLevel, {message: 'athletes.form.errors.compLevel'});

		disabled(path.firstName, {when: isEdit});
		disabled(path.lastName, {when: isEdit});
    disabled(path.sexe, {when: isEdit});
    disabled(path.weightCategorie, {when: () => !this.model().sexe});
  });

  protected readonly title = computed(() =>
    this.mode() === 'create' ? 'athletes.form.title.create' : 'athletes.form.title.edit'
  );

  /**
   * Catégories de poids disponibles, recalculées quand le sexe change tout en
   * restant modifiables (linkedSignal).
   */
  protected readonly weightOptions = linkedSignal<string, readonly number[]>({
    source: () => this.model().sexe,
    computation: (sexe) => (sexe ? WEIGHT_CATEGORIES[sexe as Sexe] ?? [] : [])
  });

  constructor() {
    // Réinitialise le formulaire à chaque (ré)ouverture ou changement d'athlète.
    effect(() => {
      this.open();
      const source = this.athlete();
      this.model.set(source ? this.toModel(source) : this.emptyModel());
    });

    // Si le sexe change et rend la catégorie de poids invalide, on la réinitialise.
    effect(() => {
      const options = this.weightOptions();
      const current = this.model().weightCategorie;
      if (current && !options.includes(Number(current))) {
        this.model.update((m) => ({...m, weightCategorie: ''}));
      }
    });
  }

  /** Traduit une clé i18n de manière impérative (pour aria-label). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  protected onSubmit(): void {
    if (this.athleteForm().invalid()) {
      this.athleteForm().markAsTouched();
      return;
    }
    const m = this.model();
    this.save.emit({
      firstName: m.firstName.trim(),
      lastName: m.lastName.trim(),
      sexe: m.sexe as Sexe,
      ageCategorie: m.ageCategorie as AthleteRequest['ageCategorie'],
      weightCategorie: Number(m.weightCategorie),
      compLevel: m.compLevel as AthleteRequest['compLevel']
    });
  }

  protected onClose(): void {
    this.close.emit();
  }

  /**
   * Ferme la modale uniquement si l'événement provient bien du dialog lui-même.
   * Les composants `<wa-select>`/`<wa-input>` internes émettent aussi `wa-after-hide`
   * (bubbling) lors de leur propre fermeture : on ignore ces événements enfants.
   */
  protected onDialogHide(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private emptyModel(): AthleteFormModel {
    return {
      firstName: '',
      lastName: '',
      sexe: '',
      ageCategorie: '',
      weightCategorie: '',
      compLevel: ''
    };
  }

  private toModel(athlete: Athlete): AthleteFormModel {
    return {
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      sexe: athlete.sexe,
      ageCategorie: athlete.ageCategorie ?? '',
      weightCategorie: athlete.weightCategorie != null ? String(athlete.weightCategorie) : '',
      compLevel: athlete.compLevel ?? ''
    };
  }
}
