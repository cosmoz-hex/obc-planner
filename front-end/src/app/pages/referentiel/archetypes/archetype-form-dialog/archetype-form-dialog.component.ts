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
  ARCHETYPES,
  Archetype,
  ENDURANCES,
  Endurance,
  RefArchetype,
  RefArchetypeRequest,
  STRENGTH_SPEEDS,
  StrengthSpeed,
  TECHNIQUES,
  Technique
} from '../../../../models/archetype.model';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/button/button.js';

/** Mode d'affichage de la modale. */
export type ArchetypeFormMode = 'create' | 'edit';

/**
 * Modèle interne du formulaire. Toutes les valeurs sont des chaînes pour
 * s'interfacer directement avec les value accessors WebAwesome.
 */
interface ArchetypeFormModel {
  strengthSpeed: string;
  technique: string;
  endurance: string;
  archetype: string;
}

/**
 * Modale de gestion d'un archétype de référence, pilotée par un
 * {@link ArchetypeFormMode} : création ou modification.
 *
 * Les 3 profils (force-vitesse, technique, endurance) sont présentés en colonnes,
 * l'archétype résultant en bas. Tous les champs sont requis. Les champs sont liés
 * au formulaire Signal Forms via `[formField]`, grâce au value accessor
 * {@link WaSelectControlDirective}.
 */
@Component({
  selector: 'app-archetype-form-dialog',
  standalone: true,
  imports: [TranslatePipe, FormField, WaSelectControlDirective, WaFieldErrorDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './archetype-form-dialog.component.html'
})
export class ArchetypeFormDialogComponent {

  private readonly translate = inject(TranslateService);

  readonly open = input<boolean>(false);
  readonly mode = input<ArchetypeFormMode>('create');
  readonly archetypeRow = input<RefArchetype | null>(null);

  readonly save = output<RefArchetypeRequest>();
  readonly close = output<void>();

  protected readonly strengthSpeeds = STRENGTH_SPEEDS;
  protected readonly techniques = TECHNIQUES;
  protected readonly endurances = ENDURANCES;
  protected readonly archetypes = ARCHETYPES;

  /** Source de vérité du formulaire. */
  protected readonly model = signal<ArchetypeFormModel>(this.emptyModel());

  /** Formulaire Signal Forms : tous les champs sont requis. */
  protected readonly archetypeForm = form(this.model, (path) => {
    required(path.strengthSpeed, {message: 'archetypes.form.errors.strengthSpeed'});
    required(path.technique, {message: 'archetypes.form.errors.technique'});
    required(path.endurance, {message: 'archetypes.form.errors.endurance'});
    required(path.archetype, {message: 'archetypes.form.errors.archetype'});
  });

  protected readonly title = computed(() =>
    this.mode() === 'create' ? 'archetypes.form.title.create' : 'archetypes.form.title.edit'
  );

  constructor() {
    // Réinitialise le formulaire à chaque (ré)ouverture ou changement de ligne.
    effect(() => {
      this.open();
      const source = this.archetypeRow();
      this.model.set(source ? this.toModel(source) : this.emptyModel());
    });
  }

  /** Traduit une clé i18n de manière impérative (pour aria-label). */
  protected t(key: string): string {
    return this.translate.instant(key);
  }

  protected onSubmit(): void {
    if (this.archetypeForm().invalid()) {
      this.archetypeForm().markAsTouched();
      return;
    }
    const m = this.model();
    this.save.emit({
      strengthSpeed: m.strengthSpeed as StrengthSpeed,
      technique: m.technique as Technique,
      endurance: m.endurance as Endurance,
      archetype: m.archetype as Archetype
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

  private emptyModel(): ArchetypeFormModel {
    return {
      strengthSpeed: '',
      technique: '',
      endurance: '',
      archetype: ''
    };
  }

  private toModel(row: RefArchetype): ArchetypeFormModel {
    return {
      strengthSpeed: row.strengthSpeed,
      technique: row.technique,
      endurance: row.endurance,
      archetype: row.archetype
    };
  }
}
