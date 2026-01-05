import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-ticket.html',
  styleUrl: './add-ticket.css'
})
export class AddTicketComponent {
  
  // Model danych formularza
  ticket = {
    location: '',     // Nowe pole
    title: '',
    description: '',
    priority: 'Normalny' // Ustawiamy na sztywno, użytkownik tego nie widzi
  };

  constructor(private router: Router) {}

  saveTicket() {
    // Walidacja - sprawdź czy pola nie są puste
    if(!this.ticket.title || !this.ticket.description || !this.ticket.location) {
      alert('Proszę wypełnić wszystkie pola!');
      return;
    }

    console.log('Wysyłanie zgłoszenia:', this.ticket);
    // Tutaj normalnie poszłoby zapytanie do API
    
    alert('Dziękujemy! Zgłoszenie zostało przyjęte.');
    this.router.navigate(['/dashboard']);
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }
}