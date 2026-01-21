import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Do nawigacji

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null;
  newPassword = '';
  newRole = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef, // Do odświeżania widoku
    private router: Router          // Do przycisku "Wróć"
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:8080/api/users').subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges(); // <--- Ważne: wymusza pokazanie danych
      },
      error: (err) => console.error('Błąd pobierania użytkowników:', err)
    });
  }

  editUser(user: any) {
    this.selectedUser = user;
    this.newRole = user.role;
    this.newPassword = ''; 
  }

  saveChanges() {
    if (!this.selectedUser) return;

    const payload: any = { role: this.newRole };
    if (this.newPassword) {
      payload.password = this.newPassword;
    }

    this.http.put(`http://localhost:8080/api/users/${this.selectedUser.id}`, payload, { responseType: 'text' })
      .subscribe({
        next: () => {
          alert('Zapisano zmiany!');
          this.selectedUser = null;
          this.loadUsers(); // Przeładuj listę
        },
        error: (err) => alert('Błąd zapisu')
      });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}