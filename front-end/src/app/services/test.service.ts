import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private readonly http = inject(HttpClient);

  test(): Observable<any> {
    return this.http.get<any>('/api/test');
  }
}
