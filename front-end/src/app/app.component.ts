import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestService } from './services/test.service';
import { CommonModule } from '@angular/common';
import { TestModel } from './models/test.model';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TranslatePipe],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'OBC Planner';

  private readonly apiService = inject(TestService);
  private readonly translate = inject(TranslateService);

  // Component state management with Signals
  loading = signal(false);
  testResult = signal<TestModel | null>(null);
  error = signal<string | null>(null);
  currentLanguage = signal('en');

  ngOnInit(): void {
    // Initialize translation service
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = browserLang?.startsWith('fr') ? 'fr' : 'en';
    
    this.setLanguage(defaultLang);
    this.callTestApi();
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLanguage.set(lang);
  }

  callTestApi(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.apiService.test().subscribe({
      next: (result) => {
        this.testResult.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.translate.instant('api.api_call_error') + err.message);
        this.loading.set(false);
      }
    });
  }
}



