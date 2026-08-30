import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {TranslateService, TranslatePipe} from '@ngx-translate/core';
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
    wa-page::part(body) {
      min-height: 0;
      height: 100%;
    }
  `
})
export class LayoutComponent {
  private readonly translate = inject(TranslateService);

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
