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
  users: User[] = [];         // Wszystkie dane z bazy
  visibleUsers: User[] = [];  // Dane wyświetlane (przefiltrowane/posortowane)
  
  // Zmienne do wyszukiwania i sortowania
  searchTerm: string = '';
  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Zmienne do obsługi Modala
  newUser: any = {}; 
  isEditing = false;
  showModal = false;

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
        this.filterUsers(); // Od razu inicjujemy widoczną listę
      },
      error: (err) => console.error('Błąd pobierania użytkowników:', err)
    });
  }

  // --- LOGIKA WYSZUKIWANIA ---
  filterUsers() {
    let temp = [...this.users];

    if (this.searchTerm) {
      const lowerTerm = this.searchTerm.toLowerCase();
      temp = temp.filter(u => 
        u.username.toLowerCase().includes(lowerTerm) ||
        (u.firstName && u.firstName.toLowerCase().includes(lowerTerm)) ||
        (u.lastName && u.lastName.toLowerCase().includes(lowerTerm)) ||
        (u.email && u.email.toLowerCase().includes(lowerTerm)) ||
        (u.department && u.department.toLowerCase().includes(lowerTerm))
      );
    }

    this.sortData(temp);
  }

  // --- LOGIKA SORTOWANIA ---
  sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.filterUsers();
  }

  sortData(data: User[]) {
    data.sort((a: any, b: any) => {
      const valA = a[this.sortColumn] || '';
      const valB = b[this.sortColumn] || '';

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else {
        comparison = valA < valB ? -1 : (valA > valB ? 1 : 0);
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.visibleUsers = data;
    this.cdr.detectChanges();
  }

  // --- MODAL I AKCJE ---
  openAddModal() {
    this.isEditing = false;
    this.showModal = true;
    this.newUser = { 
        role: 'USER', 
        defaultPriority: 'NORMAL',
        username: '', password: '', firstName: '', lastName: '', email: '', department: ''
    };
  }

  editUser(user: User) {
    this.isEditing = true;
    this.showModal = true;
    this.newUser = { ...user };
    this.newUser.password = ''; 
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

  saveUser() {
    if (!this.isEditing) {
      this.http.post('http://localhost:8080/api/users', this.newUser, { responseType: 'text' }).subscribe({
        next: () => { this.closeModal(); this.loadUsers(); },
        error: (err) => alert('Błąd tworzenia: ' + err.error)
      });
    } else {
      const updates = { ...this.newUser };
      if (!updates.password) delete updates.password;
      this.http.put(`http://localhost:8080/api/users/${this.newUser.id}`, updates, { responseType: 'text' }).subscribe({
        next: () => { this.closeModal(); this.loadUsers(); },
        error: (err) => alert('Błąd zapisu.')
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}