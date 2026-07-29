import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { AthleteListComponent } from './components/athlete-list/athlete-list.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'athletes', pathMatch: 'full' },
      { path: 'athletes', component: AthleteListComponent }
    ]
  },
  { path: '**', redirectTo: 'athletes' }
];
