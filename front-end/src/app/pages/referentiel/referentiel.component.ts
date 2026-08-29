import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map, startWith} from 'rxjs';

/**
 * Conteneur du référentiel : barre d'onglets (wa-tab-group) pilotant la
 * navigation entre les sous-routes. L'onglet actif est déduit de l'URL courante.
 */
@Component({
  selector: 'app-referentiel',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <wa-tab-group [attr.active]="activeTab()" (wa-tab-show)="onTabShow($event)">
      @for (tab of tabs; track tab.path) {
        <wa-tab [attr.panel]="tab.path">{{ tab.label }}</wa-tab>
      }
      @for (tab of tabs; track tab.path) {
        <wa-tab-panel [attr.name]="tab.path">
          @if (tab.path === activeTab()) {
            <router-outlet></router-outlet>
          }
        </wa-tab-panel>
      }
    </wa-tab-group>
  `
})
export class ReferentielComponent {
  private readonly router = inject(Router);

  protected readonly tabs = [
    {path: 'exercices', label: 'Exercices'},
    {path: 'correctifs', label: 'Correctifs'},
    {path: 'archetypes', label: 'Archétypes'},
    {path: 'trame-generale', label: 'Trame générale'}
  ] as const;

  /** Segment de route actif (ex. "exercices"), dérivé de l'URL courante. */
  protected readonly activeTab = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.extractActiveTab()),
      startWith(this.extractActiveTab())
    ),
    {initialValue: this.extractActiveTab()}
  );

  /** Sélection d'un onglet WebAwesome : navigue vers la sous-route correspondante. */
  protected onTabShow(event: Event): void {
    const panel = (event as CustomEvent<{ name: string }>).detail?.name;
    if (panel && panel !== this.activeTab()) {
      void this.router.navigate(['/referentiel', panel]);
    }
  }

  private extractActiveTab(): string {
    const segments = this.router.url.split('/').filter(Boolean);
    const referentielIndex = segments.indexOf('referentiel');
    return referentielIndex >= 0 ? segments[referentielIndex + 1] ?? 'exercices' : 'exercices';
  }
}
