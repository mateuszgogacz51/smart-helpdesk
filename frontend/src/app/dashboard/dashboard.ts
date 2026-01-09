import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../ticket.service';
import { AuthService } from '../auth.service';
import { Ticket } from '../ticket.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  allTickets: Ticket[] = [];
  visibleTickets: Ticket[] = [];
  
  currentUser: string = '';
  currentUserRole: string = '';
  
  // NOWOŚĆ: Zmienna sterująca widokiem (Wszystkie vs Moje)
  // Domyślnie 'ALL' (Wszystkie)
  currentView: 'ALL' | 'MINE' = 'ALL'; 

  filterStatus: string = 'ALL';
  sortOrder: string = 'LAST_ACTIVITY';

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = this.authService.getUsername();
    this.currentUserRole = localStorage.getItem('role') || 'USER';
    
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.allTickets = data;
        this.applyFilters();
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // NOWOŚĆ: Metoda do przełączania zakładek
  setView(view: 'ALL' | 'MINE') {
    this.currentView = view;
    this.applyFilters(); // Od razu odświeżamy listę
  }

  applyFilters() {
    let temp = [...this.allTickets];

    // 1. FILTR WIDOKU (Zakładki: Wszystkie vs Moje)
    // Działa tylko dla Helpdesku/Admina, bo zwykły User i tak widzi tylko swoje
    if (this.currentView === 'MINE' && this.currentUserRole !== 'USER') {
       temp = temp.filter(t => t.assignedUser?.username === this.currentUser);
    }

    // 2. FILTR STATUSU (Działa wewnątrz wybranej zakładki)
    if (this.filterStatus !== 'ALL') {
      temp = temp.filter(t => t.status === this.filterStatus);
    }

    // 3. SORTOWANIE
    temp.sort((a, b) => {
      const dateCreatedA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const dateCreatedB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      const dateUpdatedA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : dateCreatedA;
      const dateUpdatedB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : dateCreatedB;
      const idA = a.id || 0;
      const idB = b.id || 0;

      switch (this.sortOrder) {
        case 'LAST_ACTIVITY': return dateUpdatedB - dateUpdatedA;
        case 'NEWEST': return dateCreatedB - dateCreatedA;
        case 'OLDEST': return dateCreatedA - dateCreatedB;
        case 'ID_DESC': return idB - idA;
        case 'ID_ASC': return idA - idB;
        case 'STATUS': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });

    this.visibleTickets = temp;
    this.cdr.detectChanges();
  }

  openTicketDetails(id: number | undefined) {
    if (id) this.router.navigate(['/ticket', id]);
  }

  createNewTicket() { this.router.navigate(['/add-ticket']); }
  logout() { this.authService.logout(); this.router.navigate(['/login']); }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-pending';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  }
}