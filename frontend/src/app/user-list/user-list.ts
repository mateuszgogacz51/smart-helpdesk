import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  selectedUser: any = null;
  isCreating = false; // Flaga czy tworzymy nowego

  // Obiekt do formularza (używany zarówno przy edycji jak i tworzeniu)
  newUser: any = {};

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<User[]>('http://localhost:8080/api/users').subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Błąd pobierania użytkowników:', err)
    });
  }

  openCreateModal() {
    this.isCreating = true;
    this.selectedUser = null;
    this.newUser = { 
        role: 'USER', 
        defaultPriority: 'NORMAL',
        username: '', password: '', firstName: '', lastName: '', email: '', department: ''
    };
  }

  editUser(user: User) {
    this.isCreating = false;
    this.selectedUser = user;
    // Kopiujemy dane do obiektu formularza
    this.newUser = { ...user };
    this.newUser.password = ''; // Hasło czyścimy
  }

  closeModal() {
    this.selectedUser = null;
    this.isCreating = false;
  }

  saveChanges() {
    if (this.isCreating) {
      // TWORZENIE
      if (!this.newUser.username || !this.newUser.password) {
        alert('Login i hasło są wymagane!');
        return;
      }
      this.http.post('http://localhost:8080/api/users', this.newUser, { responseType: 'text' }).subscribe({
        next: () => {
          alert('Utworzono użytkownika!');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => alert('Błąd tworzenia: ' + err.error)
      });
    } else {
      // EDYCJA
      const updates = { ...this.newUser };
      if (!updates.password) delete updates.password; // Nie wysyłaj pustego hasła

      this.http.put(`http://localhost:8080/api/users/${this.selectedUser.id}`, updates, { responseType: 'text' }).subscribe({
        next: () => {
          alert('Zapisano zmiany!');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => alert('Błąd zapisu.')
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}