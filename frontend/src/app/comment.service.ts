import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from './comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  // ZMIANA 1: Zmiana bazowego adresu na /api/comments
  private apiUrl = 'http://localhost:8080/api/comments';

  constructor(private http: HttpClient) {}

  // Pobieranie komentarzy dla zgłoszenia
  getComments(ticketId: number): Observable<Comment[]> {
    // ZMIANA 2: Poprawna ścieżka zgodna z CommentController ( @GetMapping("/ticket/{ticketId}") )
    return this.http.get<Comment[]>(`${this.apiUrl}/ticket/${ticketId}`);
  }

  // Dodawanie komentarza
  addComment(ticketId: number, content: string): Observable<Comment> {
    // ZMIANA 3: Poprawna ścieżka oraz wysyłanie obiektu JSON { content: ... }
    // Backend oczekuje @RequestBody Map<String, String>, więc musimy wysłać obiekt.
    const body = { content: content };
    return this.http.post<Comment>(`${this.apiUrl}/ticket/${ticketId}`, body);
  }
}