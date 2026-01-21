import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:8080/api/users').subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error(err)
    });
  }

  editUser(user: any) {
    this.selectedUser = user;
    this.newRole = user.role;
    this.newPassword = ''; // Hasło puste na start
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
          this.loadUsers();
        },
        error: (err) => alert('Błąd zapisu')
      });
  }
}