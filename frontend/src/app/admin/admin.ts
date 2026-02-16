import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TicketService } from '../ticket.service';
import { FormsModule } from '@angular/forms';

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
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadCategories();
  }

  loadStats() {
    // Używam ticketService zamiast bezpośredniego http dla porządku
    this.ticketService.getStats().subscribe({
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
      }
    });
  }

  // --- NOWOŚĆ: POBIERANIE RAPORTU ---
  downloadReport() {
    this.ticketService.exportToCsv().subscribe({
      next: (blob: Blob) => {
        // Tworzymy wirtualny link do pliku
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Ustawiamy nazwę pliku z datą
        a.download = `raport_helpdesk_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        // Sprzątamy po sobie
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(err);
        alert('Błąd pobierania raportu.');
      }
    });
  }

  // --- KATEGORIE ---
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

  goBack() {
    this.router.navigate(['/dashboard']);
  }
  
  goToUsers() {
    this.router.navigate(['/users']);
  }
}