import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestModel } from '../models/test.model';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private readonly apiUrl = 'http://localhost:8080/api';
  private readonly http = inject(HttpClient);

  test(): Observable<TestModel> {
    return this.http.get<TestModel>(`${this.apiUrl}/test`);
  }
}


