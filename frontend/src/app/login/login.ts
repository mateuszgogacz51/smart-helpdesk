import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { TicketService } from '../ticket.service';

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

  constructor(
    private authService: AuthService, 
    private ticketService: TicketService,
    private router: Router
  ) {}

  login() {
    // 1. Zapisz dane w "portfelu"
    this.authService.setCredentials(this.username, this.password);

    // 2. Spróbuj pobrać cokolwiek z API, żeby sprawdzić czy dane są poprawne
    this.ticketService.getTickets().subscribe({
      next: () => {
        // SUKCES: Przekieruj do dashboardu
        console.log('Logowanie udane!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // BŁĄD: Pokaż komunikat i wyczyść błędne hasło
        console.error('Błąd logowania:', err);
        this.errorMessage = 'Nieprawidłowy login lub hasło ❌';
        this.authService.logout(); // Czyścimy błędne dane
      }
    });
  }
}