import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- NIEZBĘDNE DO DZIAŁANIA SELECTÓW
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../ticket.service';
import { Ticket } from '../ticket.model';
import { User } from '../user.model';
import { Comment } from '../comment.model';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- BEZ TEGO PRZYCISKI SĄ MARTWE
  templateUrl: './ticket-details.html',
  styleUrl: './ticket-details.css'
})
export class TicketDetailsComponent implements OnInit {

  ticket: Ticket | null = null;
  errorMessage: string = '';
  
  // Zmienne do Panelu Obsługi
  currentUserRole: string = '';
  staffList: User[] = [];
  selectedStaffId: number | null = null;
  selectedStatus: string = 'OPEN'; 
  comments: Comment[] = [];
  newCommentContent: string = '';
  currentUsername: string = '';

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserRole = localStorage.getItem('role') || '';
    this.currentUsername = localStorage.getItem('usernam') || '';
    
    // 1. Pobierz ID
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.fetchTicket(id);
    }

    // 2. Jeśli Helpdesk/Admin -> Pobierz listę pracowników
    if (this.currentUserRole === 'HELPDESK' || this.currentUserRole === 'ADMIN') {
      this.fetchStaff();
    }
  }

  fetchTicket(id: number) {
    this.ticketService.getTicket(id).subscribe({
      next: (data) => {
        this.ticket = data;
        
        // Aktualizujemy selecty danymi z bazy
        this.selectedStatus = this.ticket.status;
        if (this.ticket.assignedUser) {
          this.selectedStaffId = this.ticket.assignedUser.id || null;
        }

        this.cdr.detectChanges(); // Odśwież widok
        this.fetchComments(id);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Nie udało się załadować zgłoszenia.';
        this.cdr.detectChanges();
      }
    });
  }

  fetchStaff() {
    this.ticketService.getSupportStaff().subscribe({
      next: (data) => this.staffList = data,
      error: (err) => console.error('Błąd pobierania pracowników', err)
    });
  }

  // --- AKCJA 1: PRZYPISANIE ---
  assignToSelectedUser() {
    if (!this.selectedStaffId || !this.ticket?.id) return;
    
    this.ticketService.assignToUser(this.ticket.id, this.selectedStaffId).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        alert('✅ Zgłoszenie zostało przekazane!');
        this.cdr.detectChanges();
      },
      error: () => alert('❌ Błąd podczasypisywania.')
    });
  }

  // --- AKCJA 2: ZMIANA STATUSU ---
  updateStatusManual() {
    console.log('Kliknięto przycisk! Wybrany status:', this.selectedStatus); // Log dla pewności

    if (!this.ticket || !this.ticket.id) {
      alert('Błąd: Brak danych zgłoszenia.');
      return;
    }

    this.ticketService.changeStatus(this.ticket.id, this.selectedStatus).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        alert('✅ Status zmieniony na: ' + updatedTicket.status);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Błąd zmiany statusu (Sprawdź konsolę F12).');
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    switch (status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-pending';
      case 'CLOSED': return 'status-closed';
      default: return '';
    }
  }
fetchComments(ticketId: number) {
  this.ticketService.getComments(ticketId).subscribe({
    next: (data) => {
      this.comments = data;
      this.cdr.detectChanges();
    }
  });
}

addComment() {
  if (!this.newCommentContent.trim() || !this.ticket?.id) return;

  this.ticketService.addComment(this.ticket.id, this.newCommentContent).subscribe({
    next: (comment) => {
      this.comments.push(comment); // Dodaj nowy komentarz do listy
      this.newCommentContent = ''; // Wyczyść pole tekstowe
      this.cdr.detectChanges();
    },
    error: () => alert('Błąd wysyłania komentarza.')
  });
}

}