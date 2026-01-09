import { Component, ChangeDetectorRef } from '@angular/core'; // <--- 1. Import
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private ticketService: TicketService, 
    private router: Router,
    private cdr: ChangeDetectorRef // <--- 2. Wstrzyknięcie wykrywacza zmian
  ) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Wpisz login i hasło!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Generujemy klucz Basic Auth
    const basicAuthToken = 'Basic ' + window.btoa(this.username + ':' + this.password);

    // Zapisujemy "na próbę"
    localStorage.setItem('token', basicAuthToken);
    localStorage.setItem('username', this.username);

    // WERYFIKACJA
    this.ticketService.getTickets().subscribe({
      next: () => {
        this.isLoading = false;
        console.log('Logowanie udane!');
        
        // Ustawianie ról
        if (this.username === 'admin') localStorage.setItem('role', 'ADMIN');
        else if (this.username === 'helpdesk') localStorage.setItem('role', 'HELPDESK');
        else localStorage.setItem('role', 'USER');

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        
        // Czyszczenie w razie błędu
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');

        // Ustawianie komunikatu
        if (err.status === 401) {
          this.errorMessage = '❌ Błędny login lub hasło!';
        } else if (err.status === 0) {
          this.errorMessage = '⚠️ Brak połączenia z serwerem Java.';
        } else {
          this.errorMessage = 'Wystąpił błąd logowania.';
        }

        // --- 3. KLUCZOWE: Wymuszenie odświeżenia widoku ---
        this.cdr.detectChanges(); 
      }
    });
  }
}