import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

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
  }
}
