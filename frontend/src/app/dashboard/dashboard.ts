import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- WAŻNE
import { TicketService } from '../ticket.service';
import { AuthService } from '../auth.service';
import { Ticket } from '../ticket.model';
import { Router, RouterModule } from '@angular/router'; // Dodaj RouterModule

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // <--- Dodaj tutaj
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  allTickets: Ticket[] = [];     // Wszystkie pobrane z bazy
  visibleTickets: Ticket[] = []; // Te aktualnie wyświetlane (przefiltrowane)
  
  currentUser: string = '';
  currentUserRole: string = '';
  currentUserId: number | null = null; // Potrzebne do filtrowania "Moje"

  // Filtry
  filterStatus: string = 'ALL';
  onlyAssignedToMe: boolean = false;
  sortOrder: string = 'NEWEST';

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
    
    // Pobieramy ID zalogowanego (uproszczenie: filtrujemy po username w pętli, bo ID nie zawsze mamy w localStorage)
    
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.allTickets = data;
        this.applyFilters(); // <--- Od razu filtrujemy
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // --- LOGIKA FILTROWANIA I SORTOWANIA ---
// Wewnątrz DashboardComponent...

  applyFilters() {
    let temp = [...this.allTickets];

    // 1. FILTR: STATUS
    if (this.filterStatus !== 'ALL') {
      temp = temp.filter(t => t.status === this.filterStatus);
    }

    // 2. FILTR: TYLKO MOJE (NAPRAWIONE)
    // Sprawdzamy, czy checkbox jest zaznaczony ORAZ czy zgłoszenie ma assignedUser
    if (this.onlyAssignedToMe && (this.currentUserRole === 'HELPDESK' || this.currentUserRole === 'ADMIN')) {
       temp = temp.filter(t => t.assignedUser?.username === this.currentUser);
    }

    // 3. SORTOWANIE
    if (this.sortOrder === 'NEWEST') {
      temp.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (this.sortOrder === 'OLDEST') {
      temp.sort((a, b) => (a.id || 0) - (b.id || 0));
    } else if (this.sortOrder === 'STATUS') {
       temp.sort((a, b) => a.status.localeCompare(b.status));
    }

    this.visibleTickets = temp;
    this.cdr.detectChanges();
  }
  // ----------------------------------------

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