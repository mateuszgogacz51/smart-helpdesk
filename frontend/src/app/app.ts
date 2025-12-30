import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from './ticket.service';
import { Ticket } from './ticket.model';
import { User } from './user.model'; // <--- Nowy import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  
  tickets: Ticket[] = [];
  users: User[] = []; // <--- Tutaj będziemy trzymać pracowników
  currentFilter: string = 'WSZYSTKIE';
  sortDirection: 'ASC' | 'DESC' = 'DESC';
  selectedDescription: string | null = null;

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
    this.loadUsers(); // <--- Pobieramy pracowników przy starcie
  }

  loadUsers() {
    this.ticketService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Błąd pobierania pracowników:', err)
    });
  }

  // --- NOWOŚĆ: Przypisywanie pracownika ---
  assignUser(ticket: Ticket, event: any) {
    // Pobieramy ID wybranego pracownika z <select>
    const userId = event.target.value; 
    
    // Szukamy pełnego obiektu User na liście (lub null jeśli wybrano "Brak")
    const selectedUser = this.users.find(u => u.id == userId) || null;

    // Aktualizujemy bilet lokalnie i wysyłamy do bazy
    const updatedTicket = { ...ticket, assignedUser: selectedUser as User }; // Rzutowanie as User, bo może być undefined

    this.ticketService.updateTicket(updatedTicket).subscribe({
      next: () => {
        console.log(`Przypisano do: ${selectedUser ? selectedUser.firstName : 'Nikogo'}`);
        ticket.assignedUser = selectedUser as User; // Aktualizacja widoku
      },
      error: (err) => console.error('Błąd przypisywania:', err)
    });
  }

  // ... reszta funkcji bez zmian ...
  
  toggleSort() {
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.sortTickets();
  }

  sortTickets() {
    this.tickets.sort((a, b) => {
      const dateA = new Date(a.createdDate || 0).getTime();
      const dateB = new Date(b.createdDate || 0).getTime();
      return this.sortDirection === 'ASC' ? dateA - dateB : dateB - dateA;
    });
  }

  changeFilter(status: string) {
    this.currentFilter = status;
  }

  get visibleTickets(): Ticket[] {
    let filtered = this.tickets;
    if (this.currentFilter !== 'WSZYSTKIE') {
      filtered = this.tickets.filter(t => t.status === this.currentFilter);
    }
    return filtered;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'NOWE': return '#ffcdd2';
      case 'W TRAKCIE': return '#bbdefb';
      case 'UKONCZONE': return '#c8e6c9';
      default: return '#f5f5f5';
    }
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.sortTickets();
      },
      error: (err) => console.error('Błąd pobierania:', err)
    });
  }

  addTicket() {
    this.ticketService.createTicket(this.newTicket).subscribe({
      next: (response) => {
        this.loadTickets(); 
        this.newTicket = { title: '', description: '', category: 'AWARIA', status: 'NOWE', location: '' };
        this.currentFilter = 'WSZYSTKIE';
      },
      error: (err) => console.error('Błąd dodawania:', err)
    });
  }

  updateStatus(ticket: Ticket, newStatus: string) {
    const updatedTicket = { ...ticket, status: newStatus };
    this.ticketService.updateTicket(updatedTicket).subscribe({
      next: () => ticket.status = newStatus,
      error: (err) => this.loadTickets()
    });
  }

  removeTicket(id?: number) {
    if (!id) return;
    if(confirm('Usunąć zgłoszenie?')) {
      this.ticketService.deleteTicket(id).subscribe({
        next: () => this.loadTickets(),
        error: (err) => console.error('Błąd usuwania:', err)
      });
    }
  }

  openDescription(description: string) {
    this.selectedDescription = description;
  }

  closeDescription() {
    this.selectedDescription = null;
  }
}