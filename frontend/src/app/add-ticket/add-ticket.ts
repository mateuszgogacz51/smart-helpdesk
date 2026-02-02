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
    category: '',
    location: '' // <--- NOWE POLE
  };

  // Już nie hardkodujemy ['Awaria', 'Inne'], pobierzemy z bazy
  categories: any[] = [];

  constructor(private ticketService: TicketService, private router: Router) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.ticketService.getCategories().subscribe({
        next: (data) => {
            this.categories = data;
            // Ustaw domyślnie pierwszą kategorię, jeśli lista niepusta
            if (this.categories.length > 0) {
                this.ticket.category = this.categories[0].name;
            }
        },
        error: () => console.error('Nie udało się pobrać kategorii')
    });
  }

  onSubmit() {
    this.ticketService.createTicket(this.ticket).subscribe({
      next: () => {
        alert('Zgłoszenie dodane!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        alert('Wystąpił błąd podczas dodawania zgłoszenia.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}