import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestService } from './services/test.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'front-end';

  // Inject service
  private readonly apiService = inject(TestService);

  // Access service signals directly in template
  loading = this.apiService.loading;
  testResult = this.apiService.data;
  error = this.apiService.error;
  isReady = this.apiService.isReady;

  ngOnInit(): void {
    this.callTestApi();
  }

  callTestApi(): void {
    this.apiService.test();
  }
}
