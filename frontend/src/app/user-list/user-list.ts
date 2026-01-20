import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  
  // Obiekt do formularza nowego użytkownika
  newUser = {
    username: '',
    password: '',
    fullName: '',
    role: 'USER'
  };

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Błąd pobierania użytkowników', err)
    });
  }

  createUser(): void {
    if (!this.newUser.username || !this.newUser.password) {
      alert('Login i hasło są wymagane!');
      return;
    }

    this.userService.registerUser(this.newUser).subscribe({
      next: () => {
        alert('Użytkownik dodany pomyślnie!');
        this.loadUsers(); // Odśwież tabelę
        // Wyczyść formularz
        this.newUser = { username: '', password: '', fullName: '', role: 'USER' };
      },
      error: (err) => {
        console.error(err);
        alert('Błąd: ' + (err.error?.message || 'Nie udało się dodać użytkownika'));
      }
    });
  }

  // POPRAWKA 1: Akceptujemy id, które może być undefined (id?: number)
  deleteUser(id?: number): void {
    if (!id) return; // Jeśli nie ma ID, przerwij
    
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => alert('Nie można usunąć użytkownika.')
    });
  }

  // POPRAWKA 2: Typowanie eventu
  updateRole(user: User, event: Event): void {
    // Rzutowanie event.target na HTMLSelectElement, żeby TypeScript widział pole .value
    const selectElement = event.target as HTMLSelectElement;
    const newRole = selectElement.value;

    if (!user.id) return; // Zabezpieczenie braku ID

    this.userService.changeRole(user.id, newRole).subscribe({
      next: () => console.log(`Zmieniono rolę ${user.username} na ${newRole}`),
      error: (err) => {
        alert('Błąd zmiany roli');
        this.loadUsers(); // Cofnij zmianę w tabeli w razie błędu
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}