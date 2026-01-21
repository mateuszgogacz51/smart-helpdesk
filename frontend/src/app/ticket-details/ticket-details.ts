import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- 1. Import
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
  currentUserRole: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private commentService: CommentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef // <--- 2. Wstrzyknięcie detektora zmian
  ) {}

  ngOnInit(): void {
    this.currentUserRole = this.authService.getRole();
    console.log('TicketDetails - Rola:', this.currentUserRole);

    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id) {
      this.loadTicket(id);
      this.loadComments(id);
    }

    if (this.currentUserRole === 'ADMIN' || this.currentUserRole === 'HELPDESK') {
      this.loadSupportStaff();
    }
  }

  loadTicket(id: number): void {
    console.log('Pobieranie biletu ID:', id);
    this.ticketService.getTicket(id).subscribe({
      next: (data) => {
        this.ticket = data;
        console.log('Załadowano bilet:', data);
        
        // 3. WYMUSZENIE ODŚWIEŻENIA WIDOKU
        // To sprawi, że Angular natychmiast zauważy zmianę i usunie ekran ładowania
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Błąd pobierania biletu:', err);
        if (err.status === 401) {
          alert('Sesja wygasła. Zaloguj się ponownie.');
          this.authService.logout();
        }
      }
    });
  }

  loadComments(id: number): void {
    (this.commentService as any).getComments(id).subscribe({
      next: (data: any) => {
        this.comments = data;
        this.cdr.detectChanges(); // Tutaj też warto odświeżyć
      },
      error: (err: any) => console.error('Błąd pobierania komentarzy:', err)
    });
  }

  loadSupportStaff(): void {
    this.ticketService.getSupportStaff().subscribe({
      next: (data) => {
        this.supportStaff = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Błąd pobierania pracowników', err)
    });
  }

  addComment(): void {
    if (!this.newCommentContent.trim() || !this.ticket?.id) return;

    (this.commentService as any).addComment(this.ticket.id, this.newCommentContent).subscribe({
      next: (comment: any) => {
        this.comments.push(comment);
        this.newCommentContent = '';
        this.cdr.detectChanges(); // Odśwież po dodaniu komentarza
      },
      error: (err: any) => console.error('Błąd dodawania komentarza:', err)
    });
  }

  changeStatus(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;

    if (this.ticket?.id) {
      this.ticketService.changeStatus(this.ticket.id, newStatus).subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          this.cdr.detectChanges();
          alert('Status zmieniony!');
        },
        error: (err) => alert('Błąd zmiany statusu')
      });
    }
  }

  updatePriority(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPriority = select.value;

    if (this.ticket?.id) {
      this.ticketService.changePriority(this.ticket.id, newPriority).subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          this.cdr.detectChanges();
          alert('Priorytet został zmieniony.');
        },
        error: (err) => {
          console.error(err);
          alert('Błąd podczas zmiany priorytetu.');
        }
      });
    }
  }

  assignTicket(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const staffId = Number(select.value);

    // Warunek staffId !== 0, bo Number("null") w JS bywa mylące, a value z selecta może być stringiem
    if (this.ticket?.id && !isNaN(staffId) && staffId !== 0) {
        this.ticketService.assignTicket(this.ticket.id, staffId).subscribe({
            next: (updatedTicket) => {
                this.ticket = updatedTicket;
                this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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