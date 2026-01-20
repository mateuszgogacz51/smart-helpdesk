import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from './comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  // Adres backendu (upewnij się, że port 8080 jest poprawny)
  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) {}

  // Pobieranie komentarzy dla zgłoszenia
  getComments(ticketId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${ticketId}/comments`);
  }

  // Dodawanie komentarza (Backend przyjmuje String w body)
  addComment(ticketId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${ticketId}/comments`, content);
  }
}