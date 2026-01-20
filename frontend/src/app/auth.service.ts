import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    // 1. Tworzymy token
    const token = btoa(username + ':' + password);
    
    // 2. Tworzymy nagłówki
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token
    });

    // 3. UWAGA: TU MUSI BYĆ .get !!! 
    // Backend ma @GetMapping("/login"), więc musimy użyć GET.
    // W metodzie GET, 'headers' przekazujemy jako drugi argument (opcje).
    return this.http.get<any>(this.baseUrl + '/auth/login', { headers }).pipe(
      map(response => {
        localStorage.setItem('username', username);
        localStorage.setItem('token', token);
        
        if (response.role) {
            localStorage.setItem('role', response.role);
        } else {
            localStorage.setItem('role', 'USER');
        }
        return response;
      })
    );
  }

  logout() {
    localStorage.clear();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string {
    return localStorage.getItem('role') || 'USER';
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}