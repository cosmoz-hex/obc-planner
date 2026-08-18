import {Component} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-exercices',
  standalone: true,
  imports: [TranslatePipe],
  template: `<p class="py-4 opacity-70">{{ 'pages.referentiel.exercices.placeholder' | translate }}</p>`
})
export class ExercicesComponent {
}
