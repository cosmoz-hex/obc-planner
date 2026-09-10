import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/switch/switch.js';

/**
 * Étape 1 du wizard d'évaluation : Force-Vitesse (placeholder).
 *
 * Le vrai formulaire viendra plus tard. Le composant expose déjà le contrat
 * attendu par le wizard : le signal public {@link valid}. L'interrupteur permet
 * de basculer la validité pour tester la logique du wizard (bouton Suivant
 * désactivé quand l'étape est invalide).
 */
@Component({
  selector: 'app-eval-wizard-force',
  standalone: true,
  imports: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eval-wizard-force.component.html'
})
export class EvalWizardForceComponent {

  private readonly stepValid = signal(true);

  /** Contrat exposé au wizard : validité de l'étape. */
  readonly valid = this.stepValid.asReadonly();

  protected onToggle(event: Event): void {
    this.stepValid.set((event.target as HTMLInputElement).checked);
  }
}
