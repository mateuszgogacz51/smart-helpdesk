import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from './ticket.service';
import { Ticket } from './ticket.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
// WAŻNE: Musi tu być słowo 'export', żeby main.ts to widział!
export class AppComponent implements OnInit {
  
  tickets: Ticket[] = [];
  currentFilter: string = 'WSZYSTKIE';

  newTicket: Ticket = {
    title: '',
    description: '',
    category: 'AWARIA',
    status: 'NOWE',
    location: ''
  };

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.loadTickets();
  }

  changeFilter(status: string) {
    this.currentFilter = status;
  }

  get visibleTickets(): Ticket[] {
    if (this.currentFilter === 'WSZYSTKIE') {
      return this.tickets;
    }
    return this.tickets.filter(t => t.status === this.currentFilter);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'NOWE': return '#ffcdd2';
      case 'W TRAKCIE': return '#bbdefb';
      case 'UKONCZONE': return '#c8e6c9';
      default: return '#f5f5f5';
    }
  }

  updateStatus(ticket: Ticket, newStatus: string) {
    const updatedTicket = { ...ticket, status: newStatus };
    this.ticketService.updateTicket(updatedTicket).subscribe({
      next: () => {
        console.log('Zmieniono status na:', newStatus);
        this.loadTickets();
      },
      error: (err) => console.error('Błąd zmiany statusu:', err)
    });
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
      },
      error: (err) => console.error('Błąd pobierania:', err)
    });
  }

  addTicket() {
    this.ticketService.createTicket(this.newTicket).subscribe({
      next: (response) => {
        console.log('Dodano zgłoszenie:', response);
        this.loadTickets(); 
        this.newTicket = { 
          title: '', 
          description: '', 
          category: 'AWARIA', 
          status: 'NOWE', 
          location: '' 
        };
        this.currentFilter = 'WSZYSTKIE';
      },
      error: (err) => console.error('Nie udało się dodać:', err)
    });
  }

  removeTicket(id?: number) {
    if (!id) return;
    if(confirm('Czy na pewno chcesz usunąć to zgłoszenie?')) {
      this.ticketService.deleteTicket(id).subscribe({
        next: () => {
          this.loadTickets();
        },
        error: (err) => console.error('Błąd usuwania:', err)
      });
    }
  }
}