import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- WAŻNE: ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../ticket.service';
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
  staffList: User[] = [];
  
  currentUserRole: string = 'USER';
  currentUsername: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private router: Router,
    private cdr: ChangeDetectorRef // <--- WSTRZYKUJEMY DETEKTOR ZMIAN
  ) {}

  ngOnInit(): void {
    this.currentUserRole = localStorage.getItem('role') || 'USER';
    this.currentUsername = localStorage.getItem('username') || '';

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (idParam && !isNaN(id)) {
      this.loadTicket(id);
      this.loadComments(id);
    } else {
      this.errorMessage = 'Błędne ID zgłoszenia.';
    }

    if (this.currentUserRole !== 'USER') {
      this.loadStaff();
    }
  }

  loadTicket(id: number): void {
    this.ticketService.getTicket(id).subscribe({
      next: (data) => {
        console.log('Pobrano zgłoszenie:', data);
        this.ticket = data;
        this.cdr.detectChanges(); // <--- WYMUSZENIE ODŚWIEŻENIA WIDOKU!
      },
      error: (err) => {
        console.error('Błąd:', err);
        this.errorMessage = 'Nie udało się pobrać danych.';
        this.cdr.detectChanges();
      }
    });
  }

  loadComments(id: number): void {
    this.ticketService.getComments(id).subscribe({
      next: (data) => {
        this.comments = data;
        this.cdr.detectChanges(); // <--- WYMUSZENIE
      },
      error: (err) => console.error(err)
    });
  }

  loadStaff(): void {
    this.ticketService.getSupportStaff().subscribe({
      next: (data) => {
        this.staffList = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // --- AKCJE ---

  assignToMe(): void {
    if (!this.ticket || !this.ticket.id) return;

    this.ticketService.assignToMe(this.ticket.id).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        alert('Przypisano zgłoszenie do Ciebie!');
        this.cdr.detectChanges(); // <--- WYMUSZENIE PO AKCJI
      },
      error: (err) => alert('Błąd: ' + err.message)
    });
  }

  changeStatus(status: string): void {
    if (!this.ticket || !this.ticket.id) return;

    this.ticketService.changeStatus(this.ticket.id, status).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        this.cdr.detectChanges(); // <--- WYMUSZENIE PO AKCJI
      },
      error: (err) => alert('Błąd zmiany statusu')
    });
  }

  assignToUser(userIdStr: string): void {
    if (!this.ticket || !this.ticket.id) return;
    const userId = Number(userIdStr);
    
    this.ticketService.assignToUser(this.ticket.id, userId).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        alert('Przypisano pracownika.');
        this.cdr.detectChanges(); // <--- WYMUSZENIE PO AKCJI
      },
      error: (err) => alert('Błąd przypisywania')
    });
  }

  addComment(): void {
    if (!this.ticket || !this.ticket.id || !this.newCommentContent.trim()) return;

    this.ticketService.addComment(this.ticket.id, this.newCommentContent).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newCommentContent = '';
        this.cdr.detectChanges(); // <--- WYMUSZENIE PO AKCJI
      },
      error: (err) => alert('Błąd dodawania komentarza')
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}