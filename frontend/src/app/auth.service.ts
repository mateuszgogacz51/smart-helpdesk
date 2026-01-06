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
    // Tworzymy nagłówek Basic Auth
    const token = btoa(username + ':' + password);
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + token
    });

    // Próbujemy pobrać bilety, aby sprawdzić, czy hasło jest poprawne.
    // (To prosty sposób weryfikacji przy Basic Auth)
    return this.http.get(this.baseUrl + '/tickets', { headers }).pipe(
      map(response => {
        // SUKCES: Zapisujemy dane w przeglądarce
        localStorage.setItem('username', username);
        localStorage.setItem('token', token);
        
        // Prosta logika ról (docelowo Backend powinien to zwracać)
        let role = 'USER';
        if (username === 'admin') role = 'ADMIN';
        if (username === 'marek') role = 'HELPDESK'; // Marek to nasz informatyk
        
        localStorage.setItem('role', role);
        
        return response;
      })
    );
  }

  logout() {
    // Czyścimy pamięć przy wylogowaniu
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  }

  // --- OTO METODY, KTÓRYCH BRAKOWAŁO I POWODOWAŁY BŁĄD ---

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getRole(): string {
    return localStorage.getItem('role') || 'USER'; // Domyślnie zwykły user
  }

  // Pomocnicza metoda dla innych serwisów (np. TicketService)
  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: 'Basic ' + token
    });
  }
}