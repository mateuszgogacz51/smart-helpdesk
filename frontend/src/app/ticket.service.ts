import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from './ticket.model';
import { User } from './user.model';
import { AuthService } from './auth.service'; // <--- CZY MASZ TĘ LINIJKĘ?

@Injectable({
  providedIn: 'root'
})
export class TicketService {


  private apiUrl = 'http://localhost:8080/api/tickets';
  private usersUrl = 'http://localhost:8080/api/users';

  // Wstrzykujemy AuthService
  constructor(private http: HttpClient, private authService: AuthService) {}

  // Metoda pomocnicza do tworzenia nagłówków
  private getHeaders(): HttpHeaders {
    const authHeader = this.authService.getAuthHeader();
    return authHeader ? new HttpHeaders({ 'Authorization': authHeader }) : new HttpHeaders();
  }

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl, { headers: this.getHeaders() });
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket, { headers: this.getHeaders() });
  }

  updateTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticket.id}`, ticket, { headers: this.getHeaders() });
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}