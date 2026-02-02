import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TicketService } from '../ticket.service'; // Import serwisu
import { FormsModule } from '@angular/forms'; // Import Forms dla inputa kategorii

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  stats: any = { users: [], categories: [] };
  maxUserVal = 1;
  maxCatVal = 1;

  // --- ZMIENNE DO KATEGORII ---
  categoryList: any[] = [];
  newCategoryName: string = '';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ticketService: TicketService // Wstrzykujemy serwis
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadCategories(); // Ładujemy listę kategorii
  }

  loadStats() {
    this.http.get<any>('http://localhost:8080/api/tickets/stats').subscribe({
      next: (data) => {
        this.stats = data || { users: [], categories: [] };
        if (!this.stats.users) this.stats.users = [];
        if (!this.stats.categories) this.stats.categories = [];

        if (this.stats.users.length > 0) {
            const values = this.stats.users.map((u: any) => u.value);
            this.maxUserVal = Math.max(...values) || 1;
        } else {
            this.maxUserVal = 1;
        }

        if (this.stats.categories.length > 0) {
            const values = this.stats.categories.map((c: any) => c.value);
            this.maxCatVal = Math.max(...values) || 1;
        } else {
            this.maxCatVal = 1;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Błąd statystyk', err);
        this.cdr.detectChanges();
      }
    });
  }

  // --- METODY DO KATEGORII ---
  loadCategories() {
      this.ticketService.getCategories().subscribe({
          next: (data) => {
              this.categoryList = data;
              this.cdr.detectChanges();
          }
      });
  }

  addCategory() {
      if (!this.newCategoryName.trim()) return;
      this.ticketService.addCategory(this.newCategoryName).subscribe({
          next: () => {
              this.newCategoryName = '';
              this.loadCategories();
              alert('Dodano kategorię!');
          },
          error: () => alert('Błąd dodawania (może taka już istnieje?)')
      });
  }

  deleteCategory(id: number) {
      if(!confirm('Czy usunąć kategorię?')) return;
      this.ticketService.deleteCategory(id).subscribe({
          next: () => {
              this.loadCategories();
          },
          error: () => alert('Błąd usuwania')
      });
  }
  // ---------------------------

  goBack() {
    this.router.navigate(['/dashboard']);
  }
  
  goToUsers() {
    this.router.navigate(['/users']);
  }
}