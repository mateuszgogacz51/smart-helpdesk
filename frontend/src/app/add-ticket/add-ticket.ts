import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../ticket.service';
import { Router } from '@angular/router';
import { Ticket } from '../ticket.model';

@Component({
  selector: 'app-add-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-ticket.html',
  styleUrls: ['./add-ticket.css']
})
export class AddTicketComponent implements OnInit {
  ticket: Ticket = {
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'NORMAL',
    category: null, 
    location: ''
  };

  categories: any[] = [];
  selectedFile: File | null = null; // Zmienna na plik

  constructor(private ticketService: TicketService, private router: Router) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.ticketService.getCategories().subscribe({
        next: (data) => {
            this.categories = data;
        },
        error: (err) => console.error('Nie udało się pobrać kategorii', err)
    });
  }

  // Obsługa wyboru pliku z dysku
  onFileSelected(event: any) {
      const file: File = event.target.files[0];
      if (file) {
          this.selectedFile = file;
      }
  }

  onSubmit() {
    // 1. Najpierw tworzymy zgłoszenie
    this.ticketService.createTicket(this.ticket).subscribe({
      next: (newTicket) => {
        
        // 2. Jeśli wybrano plik, wysyłamy go teraz (korzystając z ID nowego zgłoszenia)
        if (this.selectedFile && newTicket.id) {
            this.ticketService.uploadAttachment(newTicket.id, this.selectedFile).subscribe({
                next: () => {
                    // Sukces: Zgłoszenie + Plik
                    this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                    console.error('Błąd wysyłania pliku', err);
                    alert('Zgłoszenie utworzono, ale nie udało się dodać załącznika.');
                    this.router.navigate(['/dashboard']);
                }
            });
        } else {
            // Brak pliku -> od razu idziemy do dashboardu
            this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error:', err);
        const msg = err.error && err.error.message ? err.error.message : 'Błąd połączenia z serwerem.';
        alert('Nie udało się dodać zgłoszenia: ' + msg);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}