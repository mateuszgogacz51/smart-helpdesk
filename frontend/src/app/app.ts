import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Ważne dla formatowania daty (pipe date)
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
export class AppComponent implements OnInit {
  
  tickets: Ticket[] = [];
  currentFilter: string = 'WSZYSTKIE';

  // Domyślne sortowanie: MALEJĄCO (DESC) - czyli najnowsze na górze
  sortDirection: 'ASC' | 'DESC' = 'DESC';

  newTicket: Ticket = {
    title: '',
    description: '',
    category: 'AWARIA',
    status: 'NOWE',
    location: ''
  };

  selectedDescription: string | null = null;

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.loadTickets();
  }

  openDescription(description: string) {
    this.selectedDescription = description;
  }

  closeDescription() {
    this.selectedDescription = null;
  }

  // --- 1. SORTOWANIE I FILTROWANIE ---

  // Zmienia kierunek sortowania po kliknięciu w nagłówek "Data"
  toggleSort() {
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.sortTickets();
  }

  // Logika układająca bilety wg daty
  sortTickets() {
    this.tickets.sort((a, b) => {
      // Jeśli brak daty, przyjmij 0 (żeby się nie wywaliło)
      const dateA = new Date(a.createdDate || 0).getTime();
      const dateB = new Date(b.createdDate || 0).getTime();

      return this.sortDirection === 'ASC' 
        ? dateA - dateB  // Od najstarszych
        : dateB - dateA; // Od najnowszych
    });
  }

  changeFilter(status: string) {
    this.currentFilter = status;
  }

  // "Inteligentna lista" do wyświetlania w tabeli
  get visibleTickets(): Ticket[] {
    let filtered = this.tickets;

    // 1. Najpierw filtrujemy
    if (this.currentFilter !== 'WSZYSTKIE') {
      filtered = this.tickets.filter(t => t.status === this.currentFilter);
    }

    // 2. Zwracamy posortowane (sortowanie robimy na głównej liście w loadTickets/toggleSort)
    return filtered;
  }

  // --- 2. WYGLĄD (KOLORY) ---

  getStatusColor(status: string): string {
    switch (status) {
      case 'NOWE': return '#ffcdd2';       // Czerwony
      case 'W TRAKCIE': return '#bbdefb';  // Niebieski
      case 'UKONCZONE': return '#c8e6c9';  // Zielony
      default: return '#f5f5f5';
    }
  }

  // --- 3. KOMUNIKACJA Z JAVĄ (CRUD) ---

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.sortTickets(); // WAŻNE: Posortuj od razu po pobraniu danych!
      },
      error: (err) => console.error('Błąd pobierania:', err)
    });
  }

  addTicket() {
    this.ticketService.createTicket(this.newTicket).subscribe({
      next: (response) => {
        console.log('Dodano:', response);
        this.loadTickets(); 
        // Reset formularza
        this.newTicket = { 
          title: '', 
          description: '', 
          category: 'AWARIA', 
          status: 'NOWE', 
          location: '' 
        };
        this.currentFilter = 'WSZYSTKIE';
      },
      error: (err) => console.error('Błąd dodawania:', err)
    });
  }

  updateStatus(ticket: Ticket, newStatus: string) {
    const updatedTicket = { ...ticket, status: newStatus };
    
    this.ticketService.updateTicket(updatedTicket).subscribe({
      next: () => {
        // Tutaj trik: zamiast przeładowywać wszystko z serwera (co może zmienić kolejność),
        // aktualizujemy lokalnie, żeby było szybciej i płynniej.
        ticket.status = newStatus; 
      },
      error: (err) => {
        console.error('Błąd zmiany statusu:', err);
        this.loadTickets(); // Jak błąd, to przywróć stan z serwera
      }
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
}