import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, input, output} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {WizardStepperItem, WizardStepperState} from './wizard.types';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/tooltip/tooltip.js';

/** Compteur d'instances : garantit des `id` uniques dans le document. */
let nextStepperId = 0;

/**
 * Fragments cliquables d'un wizard : un bouton par étape, avec tooltip du libellé.
 *
 * Composant présentationnel : il affiche les {@link WizardStepperItem} reçus et
 * émet le numéro de l'étape choisie. Aucun contrôle de validité ici (le saut
 * libre est autorisé, la validation finale est portée par le wizard).
 *
 * Rendu : une rangée unique de segments de même taille (flex-1, 20px de haut) ;
 * seule la couleur signale l'état : courante = blanc, à venir (après la courante) =
 * gris neutre, avant la courante : valide = vert (success), non valide = orange (warning).
 * L'état est aussi porté par aria-current et le nom accessible (stepAria).
 *
 * Le projet n'utilise pas Preflight : le <button> garde ses styles navigateur
 * (padding, bordure, fond) sauf si on les neutralise explicitement.
 *
 * Le tooltip est lié par [attr.for] : Angular mappe [for] vers la propriété
 * DOM htmlFor, que wa-tooltip n'observe pas (il lit l'attribut for).
 *
 * Le popup de `wa-tooltip` (WebAwesome 3.12) est rendu dans la couche supérieure
 * (popover) : l'attribut `hoist` n'existe plus et n'est pas nécessaire pour
 * éviter le rognage par l'`overflow` du corps de la modale.
 */
@Component({
  selector: 'app-wizard-stepper',
  standalone: true,
  imports: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wizard-stepper.component.html'
})
export class WizardStepperComponent {

  /** Fragments à afficher, dans l'ordre. */
  readonly items = input.required<readonly WizardStepperItem[]>();

  /** Numéro (1-based) de l'étape demandée par un clic ou le clavier. */
  readonly select = output<number>();

  /** Préfixe d'`id` propre à cette instance (liaison bouton ↔ tooltip). */
  protected readonly uid = `wizard-stepper-${nextStepperId++}`;

  /** Classes de couleur d'un segment (littéraux complets : détectés par Tailwind). */
  protected segmentClass(state: WizardStepperState): string {
    switch (state) {
      case 'current':
        return 'bg-white';
      case 'valid':
        return 'bg-[var(--wa-color-success-fill-loud)]';
      case 'incomplete':
        return 'bg-[var(--wa-color-warning-fill-loud)]';
      default:
        return 'bg-[var(--wa-color-neutral-border-normal)]';
    }
  }
}