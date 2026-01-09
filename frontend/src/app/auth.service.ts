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
    // Generujemy token Basic Auth (Base64)
    const token = btoa(username + ':' + password);
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token
    });

    // Próbujemy pobrać bilety, aby zweryfikować poprawność hasła
    return this.http.get(this.baseUrl + '/tickets', { headers }).pipe(
      map(response => {
        // SUKCES: Zapisujemy token i dane użytkownika
        localStorage.setItem('username', username);
        localStorage.setItem('token', token);
        
        // Prosta logika ról (dla uproszczenia frontendu)
        let role = 'USER';
        if (username === 'admin') role = 'ADMIN';
        if (username === 'marek') role = 'HELPDESK';
        
        localStorage.setItem('role', role);
        return response;
      })
    );
  }

  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  }

  // --- METODY POTRZEBNE DLA TICKET-SERVICE ---

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}