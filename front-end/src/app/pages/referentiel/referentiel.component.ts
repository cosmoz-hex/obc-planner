import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal} from '@angular/core';
import {Router, RouterOutlet, NavigationEnd} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {filter} from 'rxjs';

@Component({
  selector: 'app-referentiel',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe],
  templateUrl: './referentiel.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReferentielComponent implements OnInit {
  readonly #router = inject(Router);

  activeTab = signal('exercices');

  readonly tabs = [
    {panel: 'exercices', route: '/referentiel/exercices', icon: 'dumbbell'},
    {panel: 'correctifs', route: '/referentiel/correctifs', icon: 'wrench'},
    {panel: 'archetypes', route: '/referentiel/archetypes', icon: 'shapes'},
    {panel: 'trame-generale', route: '/referentiel/trame-generale', icon: 'calendar-days'}
  ];

  ngOnInit(): void {
    this.#syncTabFromUrl(this.#router.url);
    this.#router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.#syncTabFromUrl(e.urlAfterRedirects));
  }

  onTabChange(event: Event): void {
    const detail = (event as CustomEvent).detail;
    const tabName = detail?.name;
    if (tabName) {
      const tab = this.tabs.find(t => t.panel === tabName);
      if (tab) {
        this.activeTab.set(tabName);
        this.#router.navigate([tab.route]);
      }
    }
  }

  #syncTabFromUrl(url: string): void {
    const tab = this.tabs.find(t => url.includes(t.panel));
    if (tab) {
      this.activeTab.set(tab.panel);
    }
  }
}
