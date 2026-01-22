import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string) {
    // Generujemy token Basic Auth
    const token = btoa(username + ':' + password);
    const headers = new HttpHeaders({ Authorization: 'Basic ' + token });

    // Backend oczekuje GET na /auth/login
    return this.http.get<any>(this.baseUrl + '/auth/login', { headers }).pipe(
      map(response => {
        console.log('AUTH: Logowanie udane. Zapisuję token.');
        
        // Zapisujemy token i dane użytkownika
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
    console.log('AUTH: Wylogowywanie...');
    localStorage.clear();
    this.router.navigate(['/login']);
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