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
  
  newUser: User = {
    username: '',
    password: '',
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
          this.users = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  createUser(): void {
    if (!this.newUser.username || !this.newUser.password) {
      alert('Brak loginu/hasła');
      return;
    }
    if (!this.newUser.defaultPriority) this.newUser.defaultPriority = 'NORMAL';
    
    this.userService.registerUser(this.newUser).subscribe({
      next: (u) => {
        this.users.push(u);
        alert('Dodano!');
        this.newUser = { username: '', password: '', role: 'USER' };
      },
      error: () => alert('Błąd dodawania')
    });
  }

  deleteUser(id?: number): void {
    if(!id) return;
    if(confirm('Usunąć?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(u => u.id !== id);
      });
    }
  }

  updateRole(user: User, event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    if(user.id) this.userService.changeRole(user.id, val).subscribe();
  }

  updateDefaultPriority(user: User, event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    if(user.id) this.userService.changeDefaultPriority(user.id, val).subscribe();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}