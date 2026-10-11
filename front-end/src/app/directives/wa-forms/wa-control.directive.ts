import {Directive, ElementRef, effect, inject, input, model, output} from '@angular/core';
import {transformedValue, type FormValueControl, type ParseResult} from '@angular/forms/signals';
import {waEventValue} from './wa-event-value';

/**
 * Base commune, générique, des value accessors des composants WebAwesome,
 * permettant de les relier à Signal Forms via `[formField]`.
 *
 * Implémente {@link FormValueControl}<T> : la valeur `T` du champ est convertie
 * en chaîne pour le web component (et inversement) via {@link transformedValue}.
 * Par défaut la conversion est l'identité (T = string) ; une sous-classe qui
 * gère un autre type (ex. `number`) surcharge {@link parse} / {@link format}.
 *
 * Les sous-classes fournissent leur sélecteur et leurs host bindings (lecture de
 * la valeur via `raw.set(readEventValue($event))`, `touch` au blur/fermeture).
 */
@Directive()
export abstract class WaControlDirective<T> implements FormValueControl<T> {

  /** Valeur du champ (contrat FormValueControl). Fournie par `[formField]`. */
  readonly value = model.required<T>();

  /** États pilotés par la directive Field (issus du schéma du formulaire). */
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly invalid = input<boolean>(false);

  /** Émis pour marquer le champ « touched » (blur / fermeture). */
  readonly touch = output<void>();

  protected readonly host = inject<ElementRef<HTMLElement & {value: string | string[]}>>(ElementRef);
  protected readEventValue = waEventValue;

  /** Valeur « brute » (chaîne) du web component, synchronisée avec `value`. */
  protected readonly raw = transformedValue<T, string>(this.value, {
    parse: (raw) => this.parse(raw),
    format: (value) => this.format(value)
  });

  constructor() {
    // Modèle (via raw) -> web component.
    effect(() => {
      const element = this.host.nativeElement;
      const next = this.raw() ?? '';
      if (element.value !== next) {
        element.value = next;
      }
    });

    // États -> attributs du web component.
    effect(() => this.reflectStates(this.host.nativeElement));
  }

  /** Conversion chaîne -> valeur du champ. Identité par défaut (T = string). */
  protected parse(raw: string): ParseResult<T> {
    return {value: raw as T};
  }

  /** Conversion valeur du champ -> chaîne. Identité par défaut. */
  protected format(value: T): string {
    return value == null ? '' : String(value);
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
