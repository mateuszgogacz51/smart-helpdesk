import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../ticket.service';
import { Router } from '@angular/router';
import { Ticket } from '../ticket.model'; // <--- 1. Importujemy interfejs Ticket

@Component({
  selector: 'app-add-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-ticket.html',
  styleUrls: ['./add-ticket.css']
})
export class AddTicketComponent {
  
  // <--- 2. Dodajemy typ ': Ticket' i uzupełniamy brakujące pola (status, location)
  ticket: Ticket = {
    title: '',
    description: '',
    category: '', 
    priority: 'NORMAL',
    status: 'OPEN',         // Wymagane przez model (domyślnie otwarte)
    location: 'Brak danych' // Wymagane przez model (możesz tu wpisać cokolwiek lub dodać input w HTML)
  };

  constructor(private ticketService: TicketService, private router: Router) {}

  submitTicket() {
    if (!this.ticket.title.trim() || !this.ticket.category) {
      alert('Proszę uzupełnić tytuł i wybrać kategorię!');
      return;
    }

    this.ticketService.createTicket(this.ticket).subscribe({
      next: () => {
        alert('Zgłoszenie zostało pomyślnie dodane!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Błąd dodawania zgłoszenia:', err);
        alert('Wystąpił błąd podczas wysyłania zgłoszenia. Sprawdź konsolę.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}