import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-athletes',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './athletes.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AthletesComponent {
}
