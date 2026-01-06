import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- Dodano ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { TicketService } from '../ticket.service';
import { AuthService } from '../auth.service';
import { Ticket } from '../ticket.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  visibleTickets: Ticket[] = [];
  currentUser: string = '';

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // <--- Wstrzykujemy narzędzie do odświeżania
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = this.authService.getUsername();
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        console.log('✅ DANE PRZYSZŁY:', data);
        
        // 1. Przypisujemy dane
        this.visibleTickets = data;

        // 2. WYMUSZAMY ODŚWIEŻENIE EKRANU (To jest Twój ratunek!)
        this.cdr.detectChanges(); 
        
        console.log('✅ Ekran odświeżony. Liczba zgłoszeń:', this.visibleTickets.length);
      },
      error: (err) => {
        console.error('❌ BŁĄD:', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    switch (status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-pending';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  }

  createNewTicket() {
    this.router.navigate(['/add-ticket']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}