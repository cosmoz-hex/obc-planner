import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-trame-generale',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Trame générale</p>`
})
export class TrameGeneraleComponent {
}
