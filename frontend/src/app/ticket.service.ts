import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from './ticket.model';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  // Upewnij się, że port 8080 jest zgodny z Twoim Backendem
  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) {}

  // Pobierz wszystkie bilety
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  // Pobierz jeden bilet
  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  // Utwórz nowy bilet
  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  // --- TA METODA BYŁA BRAKUJĄCA ---
  // To ona naprawi błąd w dashboard.ts i pozwoli uruchomić stronę
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
  // -------------------------------

  // Zmiana statusu
  changeStatus(id: number, status: string): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
    });
  }

  // Zmiana priorytetu
  changePriority(id: number, priority: string): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/priority`, priority, {
        headers: { 'Content-Type': 'application/json' }
    });
  }

  // Przypisanie pracownika
  assignTicket(id: number, userId: number): Observable<Ticket> {
    // Backend oczekuje userId jako parametru URL: ?userId=...
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/assign?userId=${userId}`, {});
  }

  // Przypisanie do mnie
  assignToMe(id: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/assign-me`, {});
  }

  // Pobranie listy pracowników (do dropdowna przypisywania)
  getSupportStaff(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staff`);
  }
}