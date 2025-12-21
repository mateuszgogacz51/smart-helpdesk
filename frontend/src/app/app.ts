import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- 1. To jest ten słownik!
import { TicketService } from './ticket.service';
import { Ticket } from './ticket.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule], // <--- 2. Tutaj musimy go użyć!
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  
  tickets: Ticket[] = [];

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        console.log('Sukces! Pobrane dane:', data);
      },
      error: (err) => {
        console.error('Błąd pobierania:', err);
      }
    });
  }
}