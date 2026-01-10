import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-add-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-ticket.html',
  styleUrls: ['./add-ticket.css']
})
export class AddTicketComponent {
  ticketData = {
    title: '',
    description: '',
    category: 'IT',
    location: ''
  };

  isSubmitting = false;
  errorMessage = '';

  constructor(private ticketService: TicketService, private router: Router) {}

  submitTicket() {
    if (!this.ticketData.title || !this.ticketData.description) {
      this.errorMessage = 'Tytuł i opis są wymagane!';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // TUTAJ POPRAWKA: Dodano "as any", żeby TypeScript nie krzyczał o brakujące ID/Status
    this.ticketService.createTicket(this.ticketData as any).subscribe({
      next: () => {
        alert('Zgłoszenie zostało wysłane pomyślnie!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.errorMessage = 'Nie udało się wysłać zgłoszenia. Sprawdź konsolę.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}