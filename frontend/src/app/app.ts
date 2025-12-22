import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Ważne do formularzy
import { TicketService } from './ticket.service';
import { Ticket } from './ticket.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule], // Ważne: ładujemy moduł formularzy
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  
  // --- TEGO PEWNIE BRAKOWAŁO ---
  tickets: Ticket[] = []; 
  
  newTicket: Ticket = {
    title: '',
    description: '',
    category: 'AWARIA',
    status: 'NOWE',
    location: 'Biuro 302',
  };
  // -----------------------------

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
      },
      error: (err) => console.error('Błąd:', err)
    });
  }

addTicket() {
    this.ticketService.createTicket(this.newTicket).subscribe({
      next: (response) => {
        console.log('Dodano zgłoszenie:', response);
        this.loadTickets(); 
        
        // --- ZMIANA TUTAJ ---
        // Reset formularza (tu też musimy podać location!)
        this.newTicket = { 
            title: '', 
            description: '', 
            category: 'AWARIA', 
            status: 'NOWE',
            location: 'Biuro' // <--- DODAJ TO!
        };
        // --------------------
      },
      error: (err) => console.error('Nie udało się dodać:', err)
    });
  }
}