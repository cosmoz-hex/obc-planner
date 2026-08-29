import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-archetypes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Archétypes</p>`
})
export class ArchetypesComponent {
}
