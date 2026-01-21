import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // Zmienne bezpośrednio w klasie (pasują do [(ngModel)]="username" w HTML)
  username = '';
  password = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

login() {
    const loginData = { 
      username: this.username, 
      password: this.password 
    };

    this.http.post<any>('http://localhost:8080/api/auth/login', loginData)
      .subscribe({
        next: (response) => {
          // --- POPRAWKA ---
          // Backend nie zwraca tokena, więc musimy go utworzyć sami dla Basic Auth.
          // Tworzymy ciąg "login:hasło" zakodowany w Base64
          const token = btoa(this.username + ':' + this.password);
          
          localStorage.setItem('token', token); // Zapisujemy wygenerowany token
          localStorage.setItem('username', response.username);
          
          if (response.role) {
            localStorage.setItem('role', response.role.toUpperCase());
          } else {
            localStorage.setItem('role', 'USER');
          }

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Błędny login lub hasło';
        }
      });
  }
  }
