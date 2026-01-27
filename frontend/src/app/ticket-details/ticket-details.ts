import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../ticket.service';
import { CommentService } from '../comment.service';
import { AuthService } from '../auth.service';
import { Ticket, TicketHistory } from '../ticket.model';
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
  history: TicketHistory[] = [];
  newCommentContent: string = '';
  supportStaff: User[] = []; 
  currentUserRole: string = '';
  ticketId: number = 0;

  attachments: any[] = [];
  isUploading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public ticketService: TicketService,
    private commentService: CommentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserRole = this.authService.getRole();
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.ticketId) {
      this.loadTicket();
      this.loadComments();
      this.loadHistory();
      this.loadAttachments();
    }

    if (this.currentUserRole === 'ADMIN' || this.currentUserRole === 'HELPDESK') {
      this.loadSupportStaff();
    }
  }

  loadTicket(): void {
    this.ticketService.getTicket(this.ticketId).subscribe({
      next: (data) => {
        this.ticket = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        if (err.status !== 401 && err.status !== 403) {
           alert('Nie udało się pobrać szczegółów zgłoszenia.');
           this.router.navigate(['/dashboard']);
        }
      }
    });
  }

  loadComments(): void {
    this.commentService.getComments(this.ticketId).subscribe({
      next: (data) => {
        this.comments = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Błąd pobierania komentarzy:', err)
    });
  }

  loadHistory(): void {
    this.ticketService.getHistory(this.ticketId).subscribe({
      next: (data) => {
        this.history = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Błąd historii', err)
    });
  }

  loadAttachments(): void {
    this.ticketService.getAttachments(this.ticketId).subscribe({
      next: (data) => {
        this.attachments = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Błąd załączników', err)
    });
  }

  // --- ZMIANA TUTAJ: Wyślij od razu po wybraniu ---
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File): void {
    this.isUploading = true;
    this.ticketService.uploadAttachment(this.ticketId, file).subscribe({
      next: () => {
        this.isUploading = false;
        this.loadAttachments(); // Odśwież listę po wgraniu
      },
      error: () => {
        alert('Błąd wysyłania pliku (Sprawdź czy plik nie jest za duży)');
        this.isUploading = false;
      }
    });
  }
  // ------------------------------------------------

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
    if (!this.newCommentContent.trim()) return;

    this.commentService.addComment(this.ticketId, this.newCommentContent).subscribe({
      next: () => {
        this.newCommentContent = '';
        this.loadComments();
        this.loadHistory();
      },
      error: (err) => alert('Błąd dodawania komentarza')
    });
  }

  changeStatus(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;

    this.ticketService.changeStatus(this.ticketId, newStatus).subscribe({
        next: () => {
          if (this.ticket) this.ticket.status = newStatus;
          this.loadHistory();
          this.cdr.detectChanges();
        },
        error: (err) => alert('Błąd zmiany statusu')
    });
  }

  updatePriority(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPriority = select.value;

    this.ticketService.changePriority(this.ticketId, newPriority).subscribe({
        next: () => {
          if (this.ticket) this.ticket.priority = newPriority;
          this.loadHistory();
          this.cdr.detectChanges();
        },
        error: (err) => alert('Błąd zmiany priorytetu')
    });
  }

  assignTicket(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const val = select.value;
    if (val === 'null' || val === '') return;

    const staffId = Number(val);
    this.ticketService.assignTicket(this.ticketId, staffId).subscribe({
        next: (updated) => {
            this.ticket = updated;
            this.loadHistory();
            this.cdr.detectChanges();
        },
        error: (err) => alert('Błąd przypisywania')
    });
  }

  assignToMe(): void {
    this.ticketService.assignToMe(this.ticketId).subscribe({
        next: (updated) => {
          this.ticket = updated;
          this.loadHistory();
          this.cdr.detectChanges();
        },
        error: (err) => alert('Błąd przypisywania')
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}