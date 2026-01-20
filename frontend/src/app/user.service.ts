import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  // Pobierz wszystkich (dla tabeli admina)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Zarejestruj nowego pracownika
  registerUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Usuń pracownika
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Zmień rolę (np. na BOARD lub HELPDESK)
  changeRole(id: number, newRole: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/role`, { role: newRole });
  }
  changeDefaultPriority(id: number, priority: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/default-priority`, priority, {
       headers: { 'Content-Type': 'application/json' }
    });
  }
}