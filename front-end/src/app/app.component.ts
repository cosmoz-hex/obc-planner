import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

// Traductions internes des composants WebAwesome (résumé de pagination, labels par
// défaut, etc.). Le fichier appelle lui-même registerTranslation à l'import : un
// simple import d'effet de bord suffit à rendre la langue disponible. L'anglais est
// déjà enregistré par défaut par WebAwesome.
import '@awesome.me/webawesome/dist/translations/fr.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private readonly translate = inject(TranslateService);

  ngOnInit(): void {
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = browserLang?.startsWith('fr') ? 'fr' : 'en';
    this.translate.use(defaultLang);

    // Synchronise l'attribut lang du <html> avec la langue active. WebAwesome lit
    // document.documentElement.lang pour localiser ses composants : sans cette
    // synchro, les <wa-*> resteraient figés sur la langue initiale de l'index.html.
    this.syncDocumentLang(defaultLang);
    this.translate.onLangChange.subscribe(({lang}) => this.syncDocumentLang(lang));
  }

  /** Répercute la langue active sur l'attribut lang du document (pour WebAwesome). */
  private syncDocumentLang(lang: string): void {
    document.documentElement.lang = lang;
  }
}
