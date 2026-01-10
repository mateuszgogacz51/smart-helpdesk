import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from './ticket.model';
import { Comment } from './comment.model';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  createTicket(ticket: any): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  // --- NAPRAWA BŁĘDU 404 ---
  // Było: .../assign/${userId} (BŁĄD)
  // Jest: .../assign?userId=${userId} (POPRAWNIE)
  assignToUser(ticketId: number, userId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/assign?userId=${userId}`, {});
  }

  assignToMe(ticketId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/assign-me`, {});
  }

  changeStatus(ticketId: number, status: string): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/status`, status); // Spring wczyta to jako String body
  }

  getComments(ticketId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${ticketId}/comments`);
  }

  addComment(ticketId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${ticketId}/comments`, content);
  }

  getSupportStaff(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staff`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}