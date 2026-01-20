import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
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
  isLoading: boolean = false;
  
  newUser = {
    username: '',
    password: '',
    fullName: '',
    role: 'USER'
  };

  constructor(
    private userService: UserService, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          setTimeout(() => {
            this.users = data;
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 0);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Błąd:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  createUser(): void {
    if (!this.newUser.username || !this.newUser.password) {
      alert('Login i hasło są wymagane!');
      return;
    }

    this.isLoading = true;

    this.userService.registerUser(this.newUser).subscribe({
      next: (createdUser: any) => {
        this.ngZone.run(() => {
          setTimeout(() => {
            this.users.push(createdUser); 
            alert('Użytkownik dodany pomyślnie!');
            this.newUser = { username: '', password: '', fullName: '', role: 'USER' };
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 0);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error(err);
          alert('Błąd: ' + (err.error?.message || 'Nie udało się dodać użytkownika'));
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  deleteUser(id?: number): void {
    if (!id) return;
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;

    this.isLoading = true;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          setTimeout(() => {
            this.users = this.users.filter(u => u.id !== id);
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 0);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          alert('Nie można usunąć użytkownika.');
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  updateRole(user: User, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newRole = selectElement.value;

    if (!user.id) return;

    this.userService.changeRole(user.id, newRole).subscribe({
      next: () => {
        this.ngZone.run(() => {
            console.log(`Zmieniono rolę ${user.username} na ${newRole}`);
            user.role = newRole;
            this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
            alert('Błąd zmiany roli');
            this.loadUsers(); 
        });
      }
    });
  }

  // --- NOWA METODA ---
  updateDefaultPriority(user: User, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPriority = select.value;

    if (!user.id) return;

    this.userService.changeDefaultPriority(user.id, newPriority).subscribe({
      next: () => {
        this.ngZone.run(() => {
          console.log(`Zmieniono priorytet ${user.username} na ${newPriority}`);
          user.defaultPriority = newPriority;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          alert('Błąd zmiany priorytetu');
          this.loadUsers();
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}