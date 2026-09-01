import {Directive, ElementRef, effect, inject, input, model, output} from '@angular/core';
import type {FormValueControl} from '@angular/forms/signals';

/**
 * Base commune aux value accessors des composants WebAwesome, permettant de les
 * relier à Signal Forms via `[formField]`.
 *
 * Implémente le contrat {@link FormValueControl} : synchronise le `value` du champ
 * avec la propriété `value` du web component, remonte le `blur`/la fermeture pour
 * marquer « touched », et reflète les états (disabled/readonly/required/invalid)
 * pilotés par la directive Field vers les attributs du web component.
 *
 * Les sous-classes fournissent uniquement leur sélecteur et la lecture de leur
 * valeur (via {@link WaControlDirective#setValueFromEvent}).
 */
@Directive()
export abstract class WaControlDirective implements FormValueControl<string> {

  /** Valeur synchronisée avec le champ du formulaire. */
  readonly value = model<string>('');
  /** États pilotés par la directive Field (issus du schéma du formulaire). */
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  /** Émis pour marquer le champ « touched » (blur / fermeture). */
  readonly touch = output<void>();

  protected readonly host = inject<ElementRef<HTMLElement & { value: string | string[] }>>(ElementRef);

  constructor() {
    // Modèle -> web component.
    effect(() => {
      const element = this.host.nativeElement;
      const next = this.value() ?? '';
      if (element.value !== next) {
        element.value = next;
      }
    });

    // États -> attributs du web component.
    effect(() => {
      const element = this.host.nativeElement;
      this.reflectStates(element);
    });
  }

  /**
   * Reflète les états vers les attributs. Surchargeable si un composant ne gère
   * pas un état donné (ex. `<wa-select>` sans `readonly`).
   */
  protected reflectStates(element: HTMLElement): void {
    this.reflect(element, 'disabled', this.disabled());
    this.reflect(element, 'readonly', this.readonly());
    this.reflect(element, 'required', this.required());
    this.reflect(element, 'aria-invalid', this.invalid());
  }

  protected reflect(element: HTMLElement, attribute: string, active: boolean): void {
    if (active) {
      element.setAttribute(attribute, attribute === 'aria-invalid' ? 'true' : '');
    } else {
      element.removeAttribute(attribute);
    }
  }
}
