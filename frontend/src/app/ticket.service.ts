import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from './ticket.model';
import { User } from './user.model';
import { Comment } from './comment.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', token);
    }
    return headers;
  }

  // --- ZGŁOSZENIA ---
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket, { headers: this.getHeaders() });
  }

  assignToMe(id: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/assign`, {}, { headers: this.getHeaders() });
  }

  changeStatus(id: number, newStatus: string): Observable<Ticket> {
    const body = { status: newStatus };
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/status`, body, { headers: this.getHeaders() });
  }

  getSupportStaff(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staff`, { headers: this.getHeaders() });
  }

  assignToUser(ticketId: number, userId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}/assign/${userId}`, {}, { headers: this.getHeaders() });
  }

  // --- KOMENTARZE ---
  getComments(ticketId: number): Observable<Comment[]> {
    const url = 'http://localhost:8080/api/comments/ticket/' + ticketId;
    return this.http.get<Comment[]>(url, { headers: this.getHeaders() });
  }

  addComment(ticketId: number, content: string): Observable<Comment> {
    const url = 'http://localhost:8080/api/comments/ticket/' + ticketId;
    const body = { content: content };
    return this.http.post<Comment>(url, body, { headers: this.getHeaders() });
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }
}