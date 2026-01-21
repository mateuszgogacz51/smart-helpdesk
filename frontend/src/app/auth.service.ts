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
    // 1. Tworzymy token
    const token = btoa(username + ':' + password);
    
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token
    });

    console.log('AUTH SERVICE: Próba logowania użytkownika:', username);

    // 2. Wysyłamy GET (zgodnie z Twoim Backendem)
    return this.http.get<any>(this.baseUrl + '/auth/login', { headers }).pipe(
      map(response => {
        console.log('AUTH SERVICE: Logowanie udane! Zapisuję dane.');
        
        // 3. ZAPIS DANYCH (Kluczowy moment)
        localStorage.setItem('username', username);
        localStorage.setItem('token', token); // <--- Tutaj zapisujemy "klucz"
        
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
    console.log('AUTH SERVICE: Wylogowano.');
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