import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../ticket.service';
import { CommentService } from '../comment.service';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { Ticket } from '../ticket.model';
import { Comment } from '../comment.model';
import { User } from '../user.model';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-details.html',
  styleUrls: ['./ticket-details.css']
})
export class TicketDetailsComponent implements OnInit {
  ticket: Ticket | null = null;
  comments: Comment[] = [];
  newCommentContent: string = '';
  ticketId: number = 0;
  
  currentUserRole: string = '';
  currentUserId: number = 0;
  supportStaff: User[] = [];

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private commentService: CommentService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUserRole = this.authService.getRole();
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) this.currentUserId = parseInt(userIdStr);

    // Pobranie ID z adresu URL
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.ticketId) {
      this.loadTicket();
      this.loadComments();
    }
    
    // Pobranie listy pracowników tylko dla Admina/Helpdesku
    if (this.currentUserRole === 'ADMIN' || this.currentUserRole === 'HELPDESK') {
      this.loadSupportStaff();
    }
  }

  loadTicket() {
    this.ticketService.getTicket(this.ticketId).subscribe({
      next: (data) => {
        this.ticket = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Błąd pobierania biletu:', err);
        // Ignorujemy 401/403 (robi to interceptor), reagujemy na inne błędy
        if (err.status !== 401 && err.status !== 403) {
            alert('Nie udało się pobrać szczegółów zgłoszenia.');
            this.router.navigate(['/dashboard']);
        }
      }
    });
  }

  loadComments() {
    this.commentService.getComments(this.ticketId).subscribe({
      next: (data) => {
        this.comments = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Błąd pobierania komentarzy', err)
    });
  }

  addComment() {
      if (!this.newCommentContent.trim()) return;
      
      // UWAGA: Twój CommentService.addComment przyjmuje (ticketId, content: string)
      // Wysyłamy więc sam tekst komentarza, a nie obiekt.
      this.commentService.addComment(this.ticketId, this.newCommentContent).subscribe({
        next: () => {
          this.newCommentContent = '';
          this.loadComments(); // Odśwież listę po dodaniu
        },
        error: (err) => alert('Błąd dodawania komentarza')
      });
  }

  changeStatus(event: any) {
      const newStatus = event.target.value;
      // POPRAWKA: Używamy metody 'changeStatus' z TicketService (nie updateStatus)
      this.ticketService.changeStatus(this.ticketId, newStatus).subscribe({
        next: () => {
          if (this.ticket) this.ticket.status = newStatus;
          // Opcjonalnie: alert('Status zmieniony');
        },
        error: (err) => alert('Błąd zmiany statusu')
      });
  }

  updatePriority(event: any) {
      const newPriority = event.target.value;
      // POPRAWKA: Używamy metody 'changePriority' z TicketService (nie updatePriority)
      this.ticketService.changePriority(this.ticketId, newPriority).subscribe({
        next: () => {
          if (this.ticket) this.ticket.priority = newPriority;
        },
        error: (err) => alert('Błąd zmiany priorytetu')
      });
  }

  assignTicket(event: any) {
      const val = event.target.value;
      if (val === 'null' || val === '') {
          return; 
      }
      const userId = Number(val);
      this.ticketService.assignTicket(this.ticketId, userId).subscribe({
        next: (updated) => {
          this.ticket = updated;
          this.cdr.detectChanges();
        },
        error: (err) => alert('Błąd przypisywania')
      });
  }

  assignToMe() {
      this.ticketService.assignToMe(this.ticketId).subscribe({
        next: (updated) => {
          this.ticket = updated;
          this.cdr.detectChanges();
        },
        error: (err) => alert('Błąd przypisywania')
      });
  }

  loadSupportStaff() {
      this.ticketService.getSupportStaff().subscribe(data => {
          this.supportStaff = data;
      });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}