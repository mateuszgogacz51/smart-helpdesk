import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../ticket.service';
import { AuthService } from '../auth.service';
import { Ticket } from '../ticket.model';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  tickets: Ticket[] = [];
  currentUser: string = '';
  currentUserRole: string = 'USER';
  stats: any = null;
  
  // Tryby filtrowania
  viewMode: 'ALL' | 'MY' = 'ALL'; 
  
  // Status: ALL, OPEN, IN_PROGRESS, CLOSED lub UNASSIGNED (dla kafelka "Do wzięcia")
  activeFilter: string = 'ALL'; 
  
  sortColumn: string = 'createdDate'; 
  sortDirection: 'asc' | 'desc' = 'desc'; 

  constructor(
    private ticketService: TicketService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.refreshData();
    });
  }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.currentUser = localStorage.getItem('username') || '';
    this.currentUserRole = (localStorage.getItem('role') || 'USER').toUpperCase();

    // Domyślnie WSZYSTKIE dla Helpdesk/Admin
    if (this.currentUserRole !== 'USER') {
        this.viewMode = 'ALL'; 
    } else {
        this.viewMode = 'MY';
    }
    this.activeFilter = 'ALL';

    this.loadTickets();

    if (this.currentUserRole !== 'USER') {
      this.loadStats();
    }
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.performSort();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  loadStats(): void {
    this.ticketService.getStats().subscribe({
      next: (data) => { this.stats = data; this.cdr.detectChanges(); }
    });
  }

  get visibleTickets(): Ticket[] {
    let filtered = this.tickets;

    // 1. Filtracja MOJE vs WSZYSTKIE
    if (this.currentUserRole !== 'USER') {
      if (this.viewMode === 'MY') {
        filtered = filtered.filter(t => 
          t.assignedUser && 
          t.assignedUser.username && 
          t.assignedUser.username.toLowerCase() === this.currentUser.toLowerCase()
        );
      }
    }

    // 2. Filtracja po kafelkach
    if (this.activeFilter === 'UNASSIGNED') {
      // Pokaż tylko te bez przypisanego użytkownika
      filtered = filtered.filter(t => !t.assignedUser);
    } else if (this.activeFilter !== 'ALL') {
      // Pokaż konkretny status
      filtered = filtered.filter(t => t.status === this.activeFilter);
    }

    return filtered;
  }

  setFilter(filter: string): void {
    // Kliknięcie drugi raz w to samo resetuje filtr
    if (this.activeFilter === filter) {
      this.activeFilter = 'ALL';
    } else {
      this.activeFilter = filter;
    }
    this.cdr.detectChanges();
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.performSort();
    this.cdr.detectChanges();
  }

  performSort(): void {
    this.tickets.sort((a: any, b: any) => {
      let valA = this.getProperty(a, this.sortColumn);
      let valB = this.getProperty(b, this.sortColumn);

      if (this.sortColumn === 'createdDate') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      } else {
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => (o && o[p]) ? o[p] : null, obj);
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '🔼' : '🔽';
  }

  goToAddTicket(): void { this.router.navigate(['/add-ticket']); }
  goToDetails(id: number): void { this.router.navigate(['/ticket', id]); }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}