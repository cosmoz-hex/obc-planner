import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-exercices',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Exercices</p>`
})
export class ExercicesComponent {
}
