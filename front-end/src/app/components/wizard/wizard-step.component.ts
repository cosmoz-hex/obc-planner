import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {WizardHost} from './wizard.types';

/**
 * Étape d'un {@link WizardComponent}. Wrapper générique et fin : il ne porte
 * aucune logique métier, il ne fait que projeter son contenu et se masquer
 * lorsqu'il n'est pas l'étape courante.
 *
 * Le contenu projeté (typiquement un composant métier possédant son propre
 * Signal Form) reste monté dans le DOM même masqué (`[hidden]`) afin de
 * **préserver son état** lors de la navigation entre étapes.
 *
 * Usage :
 * ```html
 * <app-wizard-step [step]="1" [valid]="force.valid()" label="evaluations.wizard.force">
 *   <app-eval-wizard-force #force />
 * </app-wizard-step>
 * ```
 */
@Component({
  selector: 'app-wizard-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col min-w-0 col-start-1 row-start-1"
      [class.invisible]="!active()"
      [class.pointer-events-none]="!active()"
      [attr.aria-hidden]="!active() ? true : null">
      <ng-content />
    </div>
  `,
  // display:contents : le wrapper d'hôte ne perturbe pas la mise en page flex.
  host: {class: 'contents'}
})
export class WizardStepComponent {

  /** Position (1-based) de l'étape dans le wizard. */
  readonly step = input.required<number>();

  /**
   * Validité de l'étape. Pilote l'activation des boutons Suivant / Valider.
   * Le parent la branche depuis l'état de son Signal Form (ex. `[valid]="form().valid()"`).
   */
  readonly valid = input<boolean>(true);

  /** Clé i18n du libellé affiché dans l'indicateur de progression. */
  readonly label = input<string>('');

  private readonly wizard = inject(WizardHost);

  /** Vrai lorsque cette étape est l'étape courante du wizard. */
  readonly active = computed(() => this.wizard.currentStep() === this.step());
}
