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
        
        // --- PROSTA LOGIKA RÓL (Zaktualizowana) ---
        let role = 'USER';
        
        // Tutaj ustalamy role "na sztywno" na podstawie loginu (dopóki backend nie zwróci roli)
        if (username === 'admin') role = 'ADMIN';
        if (username === 'marek' || username === 'helpdesk') role = 'HELPDESK';
        if (username === 'prezes') role = 'BOARD'; // <--- DODANE DLA PREZESA
        
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

  // --- METODY POMOCNICZE ---

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

  // --- BRAKUJĄCA METODA (TO NAPRAWI BŁĄD) ---
  getRole(): string {
    return localStorage.getItem('role') || 'USER';
  }
}