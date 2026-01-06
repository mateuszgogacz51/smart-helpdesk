import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../ticket.service';
import { Ticket } from '../ticket.model';

@Component({
  selector: 'app-add-ticket',
  standalone: true, // Ważne dla Angular 17+
  imports: [CommonModule, FormsModule],
  templateUrl: './add-ticket.html',
  styleUrl: './add-ticket.css'
})
export class AddTicketComponent {

  // Obiekt zgodny z nowym Backendem
  ticket: Ticket = {
    title: '',
    description: '',
    location: '',      // Backend może wymagać tego pola
    category: 'SPRZET', // Domyślna kategoria
    status: 'OPEN'     // Domyślny status
    // author: backend ustawi to sam na podstawie logowania!
  };

  isSubmitting = false;
  errorMessage = '';

  constructor(private ticketService: TicketService, private router: Router) {}

  onSubmit() {
    // Prosta walidacja
    if (!this.ticket.title || !this.ticket.description || !this.ticket.location) {
      this.errorMessage = 'Wypełnij wszystkie wymagane pola!';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    console.log('Wysyłanie zgłoszenia:', this.ticket); // Podgląd w konsoli

    this.ticketService.createTicket(this.ticket).subscribe({
      next: (response) => {
        console.log('Sukces! Odpowiedź serwera:', response);
        this.router.navigate(['/dashboard']); // Wracamy do panelu
      },
      error: (err) => {
        console.error('Błąd wysyłania:', err);
        this.isSubmitting = false;
        this.errorMessage = 'Wystąpił błąd podczas zapisywania. Sprawdź konsolę (F12).';
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }
}