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
  
  // Zainicjalizowane zerami, klucze zgodne z Backendem
  stats: any = {
    myOpen: 0,
    myInProgress: 0,
    myClosed: 0,
    globalOpen: 0,
    globalTotal: 0
  };

  viewMode: 'ALL' | 'MY' = 'ALL'; 
  currentStatusFilter: string = 'ALL'; 
  searchTerm: string = ''; 

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUsername();
    this.currentUserRole = this.authService.getRole();

    // Domyślny widok
    if (this.currentUserRole === 'USER') {
      this.viewMode = 'MY';
    }

    this.loadTickets();
    this.loadStats();
  }

  loadStats() {
    this.ticketService.getStats().subscribe({
      next: (data) => {
        console.log('Otrzymane statystyki:', data); // Debug w konsoli
        this.stats = data;
        this.cdr.detectChanges(); // Wymuszenie odświeżenia
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

  applyFilters() {
    let temp = this.tickets;

    if (this.viewMode === 'MY') {
      if (this.currentUserRole === 'ADMIN' || this.currentUserRole === 'HELPDESK') {
        temp = temp.filter(t => t.assignedUser?.username === this.currentUser);
      } else {
        temp = temp.filter(t => t.author?.username === this.currentUser);
      }
    }

    if (this.currentStatusFilter !== 'ALL') {
      temp = temp.filter(t => t.status === this.currentStatusFilter);
    }

 if (this.searchTerm) {
      const lowerTerm = this.searchTerm.toLowerCase();
      temp = temp.filter(t => 
        // Szukanie w tytule
        t.title.toLowerCase().includes(lowerTerm) ||
        // Szukanie w nazwie autora (bezpieczne sprawdzanie czy istnieje)
        (t.author?.username && t.author.username.toLowerCase().includes(lowerTerm)) ||
        // Szukanie w nazwie przypisanego pracownika
        (t.assignedUser?.username && t.assignedUser.username.toLowerCase().includes(lowerTerm))
      );
    }

    this.visibleTickets = temp;
    this.cdr.detectChanges();
  }
  
  sortTable(column: string) {
    this.visibleTickets.sort((a: any, b: any) => {
       const valA = column.split('.').reduce((o, i) => o?.[i], a) || '';
       const valB = column.split('.').reduce((o, i) => o?.[i], b) || '';
       
       if (typeof valA === 'string') return valA.localeCompare(valB);
       return valA > valB ? 1 : -1;
    });
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
}