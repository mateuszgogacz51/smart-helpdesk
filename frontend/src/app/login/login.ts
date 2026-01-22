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
          if (response.token) {
              // Zapisujemy token JWT
              localStorage.setItem('token', response.token); 
              localStorage.setItem('username', response.username);
              localStorage.setItem('role', response.role ? response.role.toUpperCase() : 'USER');
              
              this.router.navigate(['/dashboard']);
          } else {
              this.errorMessage = 'Błąd: Serwer nie zwrócił tokena.';
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Nieprawidłowy login lub hasło';
        }
      });
  }
}