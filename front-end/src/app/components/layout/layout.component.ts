import {Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';
import {filter, map, startWith} from 'rxjs';
import {FR, GB} from 'country-flag-icons/string/3x2';
import {SanitizeHtmlPipe} from '../../pipes/sanitize-html.pipe';

// Composants WebAwesome utilisés par ce shell (enregistrement ciblé).
import '@awesome.me/webawesome/dist/components/page/page.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';

/**
 * Shell principal minimal : <wa-page> avec une navigation latérale pour le
 * routing et une zone de contenu routée.
 *
 * La chaîne de hauteur (hôte → wa-page → main) est gérée en classes Tailwind.
 * Seul subsiste ici le ciblage des parts internes de <wa-page> (base/body),
 * qui vivent dans le shadow DOM et ne sont pas atteignables en Tailwind :
 * <wa-page> les pose en `min-height` sans `height`, ce qui empêche le <main>
 * de s'étirer sur toute la hauteur.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, SanitizeHtmlPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './layout.component.html',
  host: {class: 'block h-dvh'},
  styles: `
    wa-page::part(base),
    wa-page::part(body),
    wa-page::part(main),
    wa-page::part(main-content) {
      min-height: 0;
      height: 100%;
    }
  `
})
export class LayoutComponent {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly titleService = inject(Title);

  /**
   * Clé i18n du titre de l'écran courant, lue dans `data.title` de la route
   * active la plus profonde. Recalculée à chaque navigation.
   */
  protected readonly currentTitleKey = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.deepestTitle())
    ),
    {initialValue: this.deepestTitle()}
  );

  constructor() {
    // Synchronise le titre de l'onglet du navigateur avec l'écran courant.
    effect(() => {
      const key = this.currentTitleKey();
      const screen = key ? this.translate.instant(key) : '';
      this.titleService.setTitle(screen ? `${screen} — OBC Planner` : 'OBC Planner');
    });
  }

  /** Parcourt l'arbre des routes actives et renvoie le `data.title` le plus profond. */
  private deepestTitle(): string | null {
    let route = this.activatedRoute.snapshot;
    let title: string | null = null;
    while (route) {
      if (route.data?.['title']) {
        title = route.data['title'] as string;
      }
      route = route.firstChild!;
    }
    return title;
  }

  /** Langues disponibles proposées dans le sélecteur du footer (avec drapeau SVG). */
  protected readonly languages = [
    {code: 'fr', label: 'Français', flag: FR},
    {code: 'en', label: 'English', flag: GB}
  ] as const;

  /** Langue courante, initialisée sur la langue active de ngx-translate. */
  protected readonly currentLang = signal(this.translate.getCurrentLang() ?? 'fr');

  /** Change la langue de l'application suite à la sélection dans le <wa-select>. */
  protected onLanguageChange(event: Event): void {
    // <wa-select> expose sa valeur via la propriété `value` (string | string[] | null).
    const value = (event.target as { value?: string | string[] | null }).value;
    const lang = Array.isArray(value) ? value[0] : value;
    if (lang && lang !== this.currentLang()) {
      this.translate.use(lang);
      this.currentLang.set(lang);
    }
  }
}
