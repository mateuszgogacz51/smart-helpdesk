import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../ticket.service';
import { CommentService } from '../comment.service';
import { AuthService } from '../auth.service';
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
  ticket?: Ticket;
  comments: Comment[] = [];
  newCommentContent: string = '';
  supportStaff: User[] = []; 
  
  // Domyślnie pusta, ale zaraz ją wypełnimy
  currentUserRole: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. NAJWAŻNIEJSZE: Pobierz rolę od razu przy wejściu
    this.currentUserRole = this.authService.getRole();
    console.log('Aktualna rola użytkownika:', this.currentUserRole); // Sprawdź w konsoli F12 co tu się wypisuje

    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id) {
      this.loadTicket(id);
      this.loadComments(id);
    }

    // Pobieramy listę pracowników tylko jeśli jesteś ADMIN lub HELPDESK
    if (this.currentUserRole === 'ADMIN' || this.currentUserRole === 'HELPDESK') {
      this.loadSupportStaff();
    }
  }

  loadTicket(id: number): void {
    this.ticketService.getTicket(id).subscribe({
      next: (data) => this.ticket = data,
      error: (err) => console.error(err)
    });
  }

  loadComments(id: number): void {
    // Używamy rzutowania 'as any' dla bezpieczeństwa kompilacji
    (this.commentService as any).getComments(id).subscribe({
      next: (data: any) => this.comments = data,
      error: (err: any) => console.error(err)
    });
  }

  loadSupportStaff(): void {
    this.ticketService.getSupportStaff().subscribe({
      next: (data) => this.supportStaff = data,
      error: (err) => console.error('Błąd pobierania pracowników', err)
    });
  }

  addComment(): void {
    if (!this.newCommentContent.trim() || !this.ticket?.id) return;

    (this.commentService as any).addComment(this.ticket.id, this.newCommentContent).subscribe({
      next: (comment: any) => {
        this.comments.push(comment);
        this.newCommentContent = '';
      },
      error: (err: any) => console.error(err)
    });
  }

  changeStatus(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;

    if (this.ticket?.id) {
      this.ticketService.changeStatus(this.ticket.id, newStatus).subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          alert('Status zmieniony!');
        },
        error: (err) => alert('Błąd zmiany statusu')
      });
    }
  }

  // --- ZMIANA PRIORYTETU ---
  updatePriority(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPriority = select.value;

    console.log('Próba zmiany priorytetu na:', newPriority);

    if (this.ticket?.id) {
      this.ticketService.changePriority(this.ticket.id, newPriority).subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          // Wymuszamy aktualizację widoku lokalnie
          if (this.ticket) this.ticket.priority = newPriority;
          alert('Priorytet został zmieniony.');
        },
        error: (err) => {
          console.error(err);
          alert('Błąd podczas zmiany priorytetu. Sprawdź konsolę.');
        }
      });
    }
  }

  assignTicket(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const staffId = Number(select.value);

    if (this.ticket?.id && !isNaN(staffId)) {
        this.ticketService.assignTicket(this.ticket.id, staffId).subscribe({
            next: (updatedTicket) => {
                this.ticket = updatedTicket;
                alert('Przypisano pracownika!');
            },
            error: (err) => alert('Błąd przypisywania')
        });
    }
  }

  assignToMe(): void {
    if (this.ticket?.id) {
      this.ticketService.assignToMe(this.ticket.id).subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          alert('Zgłoszenie przypisane do Ciebie!');
        },
        error: (err) => alert('Błąd przypisywania')
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}