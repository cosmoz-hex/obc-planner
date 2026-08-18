import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './layout.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LayoutComponent implements OnInit {
  readonly #translate = inject(TranslateService);

  currentLanguage = signal('fr');
  appVersion = signal('0.1.0');
  currentYear = new Date().getFullYear();

  readonly availableLanguages = [
    {code: 'fr', label: 'Français', flag: '🇫🇷'},
    {code: 'en', label: 'English', flag: '🇬🇧'}
  ];

  ngOnInit(): void {
    const lang = this.#translate.currentLang;
    if (lang && typeof lang === 'string') {
      this.currentLanguage.set(lang);
    }
  }

  setLanguage(lang: string): void {
    this.#translate.use(lang);
    this.currentLanguage.set(lang);
  }

  onLanguageSelect(event: Event): void {
    const detail = (event as CustomEvent).detail;
    if (detail?.item?.value) {
      this.setLanguage(detail.item.value);
    }
  }
}
