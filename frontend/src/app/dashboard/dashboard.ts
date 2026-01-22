import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../ticket.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Ticket } from '../ticket.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  tickets: Ticket[] = [];        // Wszystkie pobrane bilety (baza)
  visibleTickets: Ticket[] = []; // Bilety aktualnie wyświetlane (po filtrach)
  
  currentUser: string = '';
  currentUserRole: string = '';
  
  // Obiekt statystyk zainicjowany zerami, pasujący do kluczy z Backendu
  stats: any = {
    myOpen: 0,
    myInProgress: 0,
    myClosed: 0,
    globalOpen: 0,
    globalTotal: 0
  };

  // Zmienne do filtrów
  viewMode: 'ALL' | 'MY' = 'ALL';  // Tryb widoku
  currentStatusFilter: string = 'ALL'; // Filtr statusu (kliknięcie w kafel)
  searchTerm: string = ''; // Wyszukiwarka

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    public router: Router,
    private cdr: ChangeDetectorRef // Do odświeżania widoku (liczb)
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUsername();
    this.currentUserRole = this.authService.getRole();

    // Domyślny widok dla zwykłego usera to "MY" (bo widzi tylko swoje)
    if (this.currentUserRole === 'USER') {
      this.viewMode = 'MY';
    }

    this.loadTickets();
    this.loadStats();
  }

  loadStats() {
    this.ticketService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.detectChanges(); // Wymuszenie odświeżenia widoku liczb
      },
      error: (err) => console.error('Błąd pobierania statystyk', err)
    });
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.applyFilters(); // Po pobraniu od razu nałóż filtry
      },
      error: (err) => console.error('Błąd pobierania biletów', err)
    });
  }

  // Funkcja wywoływana po kliknięciu w kafel
  setFilter(status: string) {
    this.currentStatusFilter = status;
    this.applyFilters();
  }

  // Główna logika filtrowania tabeli
  applyFilters() {
    let temp = this.tickets;

    // 1. Filtr: Moje vs Wszystkie
    if (this.viewMode === 'MY') {
      if (this.currentUserRole === 'ADMIN' || this.currentUserRole === 'HELPDESK') {
        // Dla Admina "Moje" to te, które są do niego PRZYPISANE
        temp = temp.filter(t => t.assignedUser?.username === this.currentUser);
      } else {
        // Dla Usera "Moje" to te, których jest AUTOREM
        temp = temp.filter(t => t.author?.username === this.currentUser);
      }
    }

    // 2. Filtr: Status (po kliknięciu w kafel)
    if (this.currentStatusFilter !== 'ALL') {
      temp = temp.filter(t => t.status === this.currentStatusFilter);
    }

    // 3. Filtr: Wyszukiwarka (po tytule)
    if (this.searchTerm) {
      const lowerTerm = this.searchTerm.toLowerCase();
      temp = temp.filter(t => t.title.toLowerCase().includes(lowerTerm));
    }

    this.visibleTickets = temp;
    this.cdr.detectChanges();
  }
  
  // Sortowanie tabeli po kliknięciu w nagłówek
  sortTable(column: string) {
    this.visibleTickets.sort((a: any, b: any) => {
       // Obsługa zagnieżdżonych pól np. 'author.username'
       const valA = column.split('.').reduce((o, i) => o?.[i], a) || '';
       const valB = column.split('.').reduce((o, i) => o?.[i], b) || '';
       
       if (typeof valA === 'string') {
         return valA.localeCompare(valB);
       }
       return valA > valB ? 1 : -1;
    });
  }

  goToAddTicket() {
    this.router.navigate(['/add-ticket']);
  }

  goToDetails(id: number) {
    this.router.navigate(['/ticket-details', id]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}