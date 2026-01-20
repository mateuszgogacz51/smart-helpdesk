import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';
  private authUrl = 'http://localhost:8080/api/auth/register';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  registerUser(user: User): Observable<any> {
    return this.http.post(this.authUrl, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  changeRole(id: number, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/role`, role, {
       headers: { 'Content-Type': 'application/json' }
    });
  }

  changeDefaultPriority(id: number, priority: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/default-priority`, priority, {
       headers: { 'Content-Type': 'application/json' }
    });
  }
}