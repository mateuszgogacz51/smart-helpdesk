import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  selectedStatus: string = '';
  selectedAssigneeId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // NAPRAWA: Wymuszenie wielkich liter
    this.currentUserRole = (localStorage.getItem('role') || 'USER').toUpperCase();
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
        this.ticket = data;
        this.selectedStatus = data.status || 'OPEN';
        this.selectedAssigneeId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Nie udało się pobrać danych zgłoszenia.';
        this.cdr.detectChanges();
      }
    });
  }

  loadComments(id: number): void {
    this.ticketService.getComments(id).subscribe({
      next: (data) => {
        this.comments = data;
        this.cdr.detectChanges();
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

  assignToMe(): void {
    if (!this.ticket?.id) return;
    this.ticketService.assignToMe(this.ticket.id).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        alert('Sukces: Przypisano do Ciebie!');
        this.cdr.detectChanges();
      },
      error: (err) => alert('Błąd: ' + (err.error?.message || err.message))
    });
  }

  updateTicketStatus(): void {
    if (!this.ticket?.id || !this.selectedStatus) return;
    this.ticketService.changeStatus(this.ticket.id, this.selectedStatus).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        alert('Status zmieniony na: ' + this.selectedStatus);
        this.cdr.detectChanges();
      },
      error: (err) => alert('Błąd zmiany statusu')
    });
  }

  assignSelectedUser(): void {
    if (!this.ticket?.id) return;
    if (!this.selectedAssigneeId) {
      alert('Wybierz pracownika z listy!');
      return;
    }
    
    this.ticketService.assignToUser(this.ticket.id, Number(this.selectedAssigneeId)).subscribe({
      next: (updatedTicket) => {
        this.ticket = updatedTicket;
        alert('Przypisano pracownika.');
        this.cdr.detectChanges();
      },
      error: (err) => alert('Błąd przypisywania')
    });
  }

  addComment(): void {
    if (!this.ticket?.id || !this.newCommentContent.trim()) return;
    this.ticketService.addComment(this.ticket.id, this.newCommentContent).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newCommentContent = '';
        this.cdr.detectChanges();
      },
      error: (err) => alert('Błąd dodawania komentarza')
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}