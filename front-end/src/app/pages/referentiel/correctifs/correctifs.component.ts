import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-correctifs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Correctifs</p>`
})
export class CorrectifsComponent {
}
