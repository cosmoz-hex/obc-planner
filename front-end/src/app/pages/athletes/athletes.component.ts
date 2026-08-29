import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-athletes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Athlètes</p>`
})
export class AthletesComponent {
}
