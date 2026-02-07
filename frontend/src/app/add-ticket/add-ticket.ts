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
    priority: 'NORMAL', // To pole jest ignorowane przez backend, ale wymagane przez model
    category: null, 
    location: ''
  };

  categories: any[] = [];

  constructor(private ticketService: TicketService, private router: Router) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.ticketService.getCategories().subscribe({
        next: (data) => {
            this.categories = data;
            // Domyślnie ustawiamy pierwszą kategorię
            if (this.categories.length > 0) {
                this.ticket.category = this.categories[0];
            }
        },
        error: (err) => console.error('Nie udało się pobrać kategorii', err)
    });
  }

  onSubmit() {
    // Prosta walidacja
    if (!this.ticket.category) {
        alert("Wybierz kategorię!");
        return;
    }

    this.ticketService.createTicket(this.ticket).subscribe({
      next: () => {
        alert('Zgłoszenie zostało wysłane pomyślnie!');
        this.router.navigate(['/dashboard']);
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