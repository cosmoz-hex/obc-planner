import {Injectable, signal, computed, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TestModel } from '../models/test.model';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private readonly apiUrl = 'http://localhost:8080/api';

  // Signal states
  readonly loading = signal(false);
  readonly data = signal<TestModel | null>(null);
  readonly error = signal<string | null>(null);

  // Computed state
  readonly isReady = computed(() => !this.loading() && this.data() !== null);

  readonly http = inject(HttpClient);

  test(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<TestModel>(`${this.apiUrl}/test`).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors de l\'appel API: ' + err.message);
        this.loading.set(false);
      }
    });
  }
}

