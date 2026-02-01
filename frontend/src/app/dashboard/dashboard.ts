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
  tickets: Ticket[] = [];        
  visibleTickets: Ticket[] = []; 
  
  currentUser: string = '';
  currentUserRole: string = '';
  
  // ZAKTUALIZOWANA STRUKTURA STATYSTYK
  // Dodałem pola 'users' i 'categories' dla Admina
  stats: any = {
    myOpen: 0,
    myInProgress: 0,
    myClosed: 0,
    globalOpen: 0,
    globalTotal: 0,
    users: [],      // <--- NOWE
    categories: []  // <--- NOWE
  };

  viewMode: 'ALL' | 'MY' = 'ALL'; 
  currentStatusFilter: string = 'ALL'; 
  searchTerm: string = ''; 

  // --- TWOJE SORTOWANIE ---
  sortColumn: string = 'id'; 
  sortDirection: 'asc' | 'desc' = 'desc'; 

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUsername();
    this.currentUserRole = this.authService.getRole();

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
        // Zabezpieczenie na wypadek gdyby backend zwrócił null dla list
        if (!this.stats.users) this.stats.users = [];
        if (!this.stats.categories) this.stats.categories = [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Błąd pobierania statystyk', err)
    });
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.applyFilters(); 
      },
      error: (err) => console.error('Błąd pobierania biletów', err)
    });
  }

  setFilter(status: string) {
    this.currentStatusFilter = status;
    this.applyFilters();
  }

  sortTable(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  applyFilters() {
    let temp = [...this.tickets];

    // 1. Filtrowanie (Widok)
    if (this.viewMode === 'MY') {
      if (this.currentUserRole === 'ADMIN' || this.currentUserRole === 'HELPDESK') {
        temp = temp.filter(t => t.assignedUser?.username === this.currentUser);
      } else {
        temp = temp.filter(t => t.author?.username === this.currentUser);
      }
    }

    // 2. Filtrowanie (Status)
    if (this.currentStatusFilter !== 'ALL') {
      temp = temp.filter(t => t.status === this.currentStatusFilter);
    }

    // 3. Wyszukiwanie
    if (this.searchTerm) {
      const lowerTerm = this.searchTerm.toLowerCase();
      temp = temp.filter(t => 
        t.title.toLowerCase().includes(lowerTerm) ||
        (t.author?.username && t.author.username.toLowerCase().includes(lowerTerm)) ||
        (t.assignedUser?.username && t.assignedUser.username.toLowerCase().includes(lowerTerm))
      );
    }

    // 4. SORTOWANIE
    temp.sort((a: any, b: any) => {
       const valA = this.resolveFieldData(a, this.sortColumn);
       const valB = this.resolveFieldData(b, this.sortColumn);
       
       let comparison = 0;
       
       if (valA === valB) return 0;
       if (valA === null || valA === undefined) return 1;
       if (valB === null || valB === undefined) return -1;

       if (typeof valA === 'string' && typeof valB === 'string') {
         comparison = valA.localeCompare(valB);
       } else {
         comparison = (valA < valB ? -1 : 1);
       }

       return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.visibleTickets = temp;
    this.cdr.detectChanges();
  }
  
  resolveFieldData(data: any, field: string): any {
    if (data && field) {
      return field.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), data);
    }
    return null;
  }

  goToAddTicket() {
    this.router.navigate(['/add-ticket']);
  }

  goToDetails(id: number) {
    this.router.navigate(['/ticket', id]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Metoda do nawigacji do użytkowników (używana w HTML)
  goToUsers() {
    this.router.navigate(['/users']);
  }
}