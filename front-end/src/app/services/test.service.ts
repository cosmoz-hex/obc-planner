import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestModel } from '../models/test.model';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private readonly http = inject(HttpClient);

  test(): Observable<TestModel> {
    return this.http.get<TestModel>('/api/test');
  }
}


