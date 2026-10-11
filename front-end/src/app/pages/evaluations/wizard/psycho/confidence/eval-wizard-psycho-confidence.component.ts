import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/switch/switch.js';

/**
 * Étape 9 du wizard d'évaluation : profil psycho — Confiance en soi (placeholder).
 *
 * Le vrai formulaire viendra plus tard. Expose sa validité via le signal
 * public {@link valid} ; l'interrupteur permet de tester la logique du wizard.
 */
@Component({
  selector: 'app-eval-wizard-psycho-confidence',
  standalone: true,
  imports: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-psycho-confidence.component.html'
})
export class EvalWizardPsychoConfidenceComponent {

  private readonly stepValid = signal(true);

  /** Contrat exposé au wizard : validité de l'étape. */
  readonly valid = this.stepValid.asReadonly();

  protected onToggle(event: Event): void {
    this.stepValid.set((event.target as HTMLInputElement).checked);
  }
}
