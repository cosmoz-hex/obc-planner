import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, input, output} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

// Composants WebAwesome utilisés (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/button/button.js';

/**
 * Boîte de dialogue de confirmation réutilisable.
 * Utilisée pour toute action destructive (règle d'accessibilité : confirmation obligatoire).
 * Le focus est géré nativement par <wa-dialog> et restitué au déclencheur à la fermeture.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {

  readonly open = input<boolean>(false);
  /** Clé i18n du titre. */
  readonly titleKey = input<string>('common.confirm.title');
  /** Clé i18n du message. */
  readonly messageKey = input<string>('common.confirm.message');
  /** Clé i18n du bouton de confirmation. */
  readonly confirmKey = input<string>('common.actions.confirm');
  /** Variante du bouton de confirmation (ex. 'danger'). */
  readonly confirmVariant = input<string>('danger');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected onConfirm(): void {
    this.confirmed.emit();
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  /** Ferme uniquement si l'événement vient du dialog lui-même (pas d'un enfant). */
  protected onDialogHide(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
