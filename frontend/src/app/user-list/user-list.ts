import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  
  // Zmienne do obsługi Modala i Formularza
  newUser: any = {}; 
  isEditing = false;  // Zmieniono nazwę flagi, aby pasowała do HTML
  showModal = false;  // Nowa flaga do wyświetlania okna

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
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

  // Otwieranie okna dodawania (pasuje do przycisku w HTML)
  openAddModal() {
    this.isEditing = false;
    this.showModal = true;
    this.newUser = { 
        role: 'USER', 
        defaultPriority: 'NORMAL',
        username: '', password: '', firstName: '', lastName: '', email: '', department: ''
    };
  }

  // Otwieranie okna edycji
  editUser(user: User) {
    this.isEditing = true;
    this.showModal = true;
    // Kopiujemy dane
    this.newUser = { ...user };
    this.newUser.password = ''; // Czyścimy hasło dla bezpieczeństwa
  }

  deleteUser(user: User) {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${user.username}?`)) return;

    this.http.delete(`http://localhost:8080/api/users/${user.id}`).subscribe({
      next: () => this.loadUsers(),
      error: (err) => alert('Nie udało się usunąć użytkownika.')
    });
  }

  closeModal() {
    this.showModal = false;
  }

  // Metoda zapisu (z Twoją logiką responseType: 'text')
  saveUser() {
    if (!this.isEditing) {
      // TWORZENIE
      if (!this.newUser.username || !this.newUser.password) {
        alert('Login i hasło są wymagane!');
        return;
      }
      this.http.post('http://localhost:8080/api/users', this.newUser, { responseType: 'text' }).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => alert('Błąd tworzenia: ' + err.error)
      });
    } else {
      // EDYCJA
      const updates = { ...this.newUser };
      if (!updates.password) delete updates.password; // Nie wysyłaj pustego hasła

      this.http.put(`http://localhost:8080/api/users/${this.newUser.id}`, updates, { responseType: 'text' }).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => alert('Błąd zapisu.')
      });
    }
  }

  // WAŻNE: Powrót do Admina (a nie Dashboardu), bo teraz tam jest wejście
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}