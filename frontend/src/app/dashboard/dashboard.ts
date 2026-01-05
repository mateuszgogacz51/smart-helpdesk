import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {

  // 1. Użytkownik
  currentUser = {
    name: 'Jan Kowalski',
    role: 'USER' 
  };

  // 2. Baza wszystkich zgłoszeń
  allTickets = [
    { id: 101, title: 'Problem z drukarką na 2 piętrze', status: 'OTWARTE', owner: 'Jan Kowalski' },
    { id: 102, title: 'Brak dostępu do VPN', status: 'W TOKU', owner: 'Anna Nowak' },
    { id: 103, title: 'Prośba o nowy monitor', status: 'ZAMKNIĘTE', owner: 'Jan Kowalski' },
    { id: 104, title: 'Awaria poczty Outlook', status: 'OTWARTE', owner: 'Piotr Wiśniewski' },
    { id: 105, title: 'Klawiatura zalana kawą', status: 'NOWE', owner: 'Jan Kowalski' }
  ];

  // 3. Zmienna, którą widzi HTML (musi być zdefiniowana tutaj!)
  visibleTickets: any[] = [];

  constructor(private router: Router) {
    // 4. Logika filtrowania uruchamiana OD RAZU przy starcie
    this.filterTickets();
  }

  filterTickets() {
    if (this.currentUser.role === 'ADMIN' || this.currentUser.role === 'HELPDESK') {
      // Admin widzi wszystko
      this.visibleTickets = this.allTickets;
    } else {
      // Zwykły user widzi tylko swoje
      this.visibleTickets = this.allTickets.filter(ticket => ticket.owner === this.currentUser.name);
    }
  }

  // --- Funkcje przycisków ---

  logout() {
    this.router.navigate(['/login']);
  }

  createNewTicket() {
    this.router.navigate(['/add-ticket']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OTWARTE': return 'status-open';
      case 'W TOKU': return 'status-pending';
      case 'ZAMKNIĘTE': return 'status-closed';
      case 'NOWE': return 'status-open';
      default: return '';
    }
  }
}