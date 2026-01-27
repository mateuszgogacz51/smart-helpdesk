import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket, TicketHistory } from './ticket.model';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8080/api/tickets';
  private attachmentUrl = 'http://localhost:8080/api/attachments';

  constructor(private http: HttpClient) {}

  // --- BILETY ---
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  changeStatus(id: number, status: string): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
    });
  }

  changePriority(id: number, priority: string): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/priority`, priority, {
        headers: { 'Content-Type': 'application/json' }
    });
  }

  assignTicket(id: number, userId: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/assign?userId=${userId}`, {});
  }

  assignToMe(id: number): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/assign-me`, {});
  }

  getSupportStaff(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staff`);
  }
  
  // --- HISTORIA ---
  getHistory(id: number): Observable<TicketHistory[]> {
    return this.http.get<TicketHistory[]>(`${this.apiUrl}/${id}/history`);
  }

  // --- ZAŁĄCZNIKI (NOWE) ---
  getAttachments(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.attachmentUrl}/ticket/${ticketId}`);
  }

  uploadAttachment(ticketId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('ticketId', ticketId.toString());
    formData.append('file', file);

    return this.http.post(`${this.attachmentUrl}/upload`, formData);
  }

  getDownloadUrl(attachmentId: number): string {
    return `${this.attachmentUrl}/${attachmentId}`;
  }
}