import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestService } from './services/test.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'front-end';
  testResult: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private apiService: TestService) {}

  ngOnInit() {
    this.callTestApi();
  }

  callTestApi() {
    this.loading = true;
    this.error = null;
    this.apiService.test().subscribe({
      next: (result) => {
        this.testResult = result;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'appel API: ' + err.message;
        this.loading = false;
      }
    });
  }
}
