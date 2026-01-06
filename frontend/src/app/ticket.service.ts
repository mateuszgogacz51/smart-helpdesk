import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from './ticket.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // --- NAPRAWIONA METODA POMOCNICZA ---
  private getHeaders(): HttpHeaders {
    // Używamy nazwy z 's' na końcu, tak jak w AuthService
    return this.authService.getAuthHeaders(); 
  }

  // Pobieranie wszystkich zgłoszeń
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Dodawanie nowego zgłoszenia
  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket, { headers: this.getHeaders() });
  }
}