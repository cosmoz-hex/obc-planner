import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/switch/switch.js';

/**
 * Étape 12 du wizard d'évaluation : profil psycho — Comportement compétitif (placeholder).
 *
 * Le vrai formulaire viendra plus tard. Expose sa validité via le signal
 * public {@link valid} ; l'interrupteur permet de tester la logique du wizard.
 */
@Component({
  selector: 'app-eval-wizard-psycho-competitive',
  standalone: true,
  imports: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-psycho-competitive.component.html'
})
export class EvalWizardPsychoCompetitiveComponent {

  private readonly stepValid = signal(true);

  /** Contrat exposé au wizard : validité de l'étape. */
  readonly valid = this.stepValid.asReadonly();

  protected onToggle(event: Event): void {
    this.stepValid.set((event.target as HTMLInputElement).checked);
  }
}
