import {Component} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-trame-generale',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p class="py-4 opacity-70">{{ 'pages.referentiel.trame-generale.placeholder' | translate }}</p>`
})
export class TrameGeneraleComponent {
}
