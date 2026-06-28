import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import '@awesome.me/webawesome/dist/styles/webawesome.css';
import './webawesome';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
