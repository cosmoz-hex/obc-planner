import {Routes} from '@angular/router';
import {LayoutComponent} from './components/layout/layout.component';

export const routes: Routes = [
	{
		path: '',
		component: LayoutComponent,
		children: [
			{path: '', redirectTo: 'athletes', pathMatch: 'full'},
			{
				path: 'athletes',
				loadComponent: () => import('./pages/athletes/athletes.component').then(m => m.AthletesComponent),
				data: {title: 'athletes.title'}
			},
			{
				path: 'referentiel',
				loadComponent: () => import('./pages/referentiel/referentiel.component').then(m => m.ReferentielComponent),
				data: {title: 'pages.referentiel.title'},
				children: [
					{path: '', redirectTo: 'archetypes', pathMatch: 'full'},
					{
						path: 'archetypes',
						loadComponent: () => import('./pages/referentiel/archetypes/archetypes.component').then(m => m.ArchetypesComponent),
						data: {title: 'pages.referentiel.title'}
					}, {
						path: 'correctifs',
						loadComponent: () => import('./pages/referentiel/correctifs/correctifs.component').then(m => m.CorrectifsComponent),
						data: {title: 'pages.referentiel.title'}
					}, {
						path: 'exercices',
						loadComponent: () => import('./pages/referentiel/exercices/exercices.component').then(m => m.ExercicesComponent),
						data: {title: 'pages.referentiel.title'}
					}, {
						path: 'trame-generale',
						loadComponent: () => import('./pages/referentiel/trame-generale/trame-generale.component').then(m => m.TrameGeneraleComponent),
						data: {title: 'pages.referentiel.title'}
					}
				]
			}
		]
	}
];
