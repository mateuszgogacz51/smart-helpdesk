import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false; // Do obsługi kręciołka na przycisku

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Wpisz login i hasło!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Wywołujemy nową metodę login z AuthService
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Błędny login lub hasło!';
        console.error(err);
      }
    });
  }
}