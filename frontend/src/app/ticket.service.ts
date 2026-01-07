import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from './ticket.model';
import { AuthService } from './auth.service';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Basic ${token}`);
  }

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket, { headers: this.getHeaders() });
  }


  // Przypisz do mnie
  assignToMe(id: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/assign`, {}, { headers: this.getHeaders() });
  }

  // Zmień status (np. CLOSED)
changeStatus(id: number, newStatus: string): Observable<Ticket> {
    // Tworzymy obiekt, np. { status: "CLOSED" }
    const body = { status: newStatus };
    
    // Angular automatycznie wyśle to jako application/json
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/status`, body, { headers: this.getHeaders() });
  }
// Pobierz listę pracowników (Admin + Helpdesk)
  getSupportStaff(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staff`, { headers: this.getHeaders() });
  }

  // Przypisz zgłoszenie do konkretnej osoby
  assignToUser(ticketId: number, userId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/assign/${userId}`, {}, { headers: this.getHeaders() });
  }

}