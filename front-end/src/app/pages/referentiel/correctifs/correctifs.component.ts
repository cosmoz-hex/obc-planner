import {Component} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-correctifs',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p class="py-4 opacity-70">{{ 'pages.referentiel.correctifs.placeholder' | translate }}</p>`
})
export class CorrectifsComponent {
}
