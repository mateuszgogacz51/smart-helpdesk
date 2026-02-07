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

  // Lista kategorii pobierana z bazy
  categories: any[] = [];

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
    
    // Zawsze pobierz kategorie (potrzebne do edycji)
    this.loadCategories();
  }

  loadCategories() {
      this.ticketService.getCategories().subscribe({
          next: (data) => this.categories = data,
          error: () => console.error('Błąd kategorii')
      });
  }

loadTicket() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.ticketService.getTicket(id).subscribe({
      next: (data) => {
        this.ticket = data;
        this.loadHistory(); 
        
        // <--- TA LINIA NAPRAWIA BŁĄD NG0100 --->
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Błąd pobierania zgłoszenia', err);
        
        if (err.status === 403) {
          alert('⛔ BRAK DOSTĘPU: To zgłoszenie nie należy do Ciebie!');
          this.router.navigate(['/dashboard']); 
        } else if (err.status === 404) {
          alert('❌ Nie znaleziono takiego zgłoszenia.');
          this.router.navigate(['/dashboard']);
        } else {
          alert('Wystąpił błąd podczas ładowania zgłoszenia.');
        }
      }
    });
  }
  
  // ... (Reszta metod: loadComments, loadHistory, loadAttachments, uploadFile, loadSupportStaff, addComment, changeStatus, updatePriority - BEZ ZMIAN) ...
  
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
        this.loadAttachments();
      },
      error: () => {
        alert('Błąd wysyłania pliku');
        this.isUploading = false;
      }
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

  changeCategory(newCategory: string): void {
    if (!this.ticket || !this.ticket.id) return;

    this.ticketService.changeCategory(this.ticket.id, newCategory).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.loadHistory();
        this.cdr.detectChanges();
      },
      error: () => alert('Błąd zmiany kategorii')
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