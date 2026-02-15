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

  constructor(private ticketService: TicketService, private router: Router) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.ticketService.getCategories().subscribe({
        next: (data) => {
            this.categories = data;
            // ZMIANA: Nie ustawiamy domyślnej kategorii "na siłę",
            // żeby zmusić użytkownika do świadomego wyboru (albo zostawiamy null).
            // Jeśli chcesz domyślną, odkomentuj poniższe:
            /*
            if (this.categories.length > 0) {
                this.ticket.category = this.categories[0];
            }
            */
        },
        error: (err) => console.error('Nie udało się pobrać kategorii', err)
    });
  }

  onSubmit() {
    // Walidacja jest teraz w HTML (przycisk disabled), więc tu tylko wysyłamy
    this.ticketService.createTicket(this.ticket).subscribe({
      next: () => {
        // alert('Zgłoszenie zostało wysłane pomyślnie!'); // Opcjonalnie można usunąć alert
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