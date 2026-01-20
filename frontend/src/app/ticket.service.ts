import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from './ticket.model';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) {}

  // Pobierz wszystkie zgłoszenia
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  // Pobierz jedno zgłoszenie
  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  // Utwórz nowe
  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

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

  // --- METODY DO OBSŁUGI PRACOWNIKÓW ---

  // Pobierz listę pracowników (HELPDESK + ADMIN)
  getSupportStaff(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staff`);
  }

  // Przypisz zgłoszenie do konkretnego pracownika
  assignTicket(ticketId: number, userId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/assign?userId=${userId}`, {});
  }

  // Przypisz zgłoszenie do mnie (zalogowanego użytkownika)
  assignToMe(ticketId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/assign-me`, {});
  }
}