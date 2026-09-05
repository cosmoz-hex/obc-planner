import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {HttpClient, provideHttpClient, withXsrfConfiguration, withXhr} from '@angular/common/http';
import {provideTranslateService, TranslateLoader} from '@ngx-translate/core';
import {provideSignalFormsConfig} from '@angular/forms/signals';
import {CustomTranslateLoader} from './services/custom-translate.loader';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Applique automatiquement les classes de statut sur tout champ lié via
    // [formField], à l'image des Reactive Forms. Permet de styliser l'état
    // d'erreur des formulaires globalement (voir styles.css) sans code par champ
    // ni par écran. Le prédicat reçoit le FormFieldBinding (state = FieldState).
    provideSignalFormsConfig({
      classes: {
        'ng-valid': (b) => b.state().valid(),
        'ng-invalid': (b) => b.state().invalid(),
        'ng-touched': (b) => b.state().touched(),
        'ng-dirty': (b) => b.state().dirty(),
        'ng-pending': (b) => b.state().pending()
      }
    }),
    provideHttpClient(withXhr(), 
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    ),
    provideTranslateService({
      fallbackLang: 'en',
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [HttpClient]
      }
    })
  ]
};
