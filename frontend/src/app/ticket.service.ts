import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from './ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) {}

  // 1. Pobieranie
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  // 2. Tworzenie (POST)
  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  // 3. Aktualizacja (PUT) - TEGO BRAKUJE TWOJEMU KOMPUTEROWI
  updateTicket(ticket: Ticket): Observable<Ticket> {
    // Ważne: ID musi być w adresie URL
    return this.http.put<Ticket>(`${this.apiUrl}/${ticket.id}`, ticket);
  }

  // 4. Usuwanie (DELETE)
  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}