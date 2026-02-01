import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Import ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  // Inicjalizujemy pustymi tablicami, żeby uniknąć błędów 'undefined'
  stats: any = { users: [], categories: [] };
  
  maxUserVal = 1; // Domyślnie 1, żeby nie dzielić przez 0
  maxCatVal = 1;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef // 2. Wstrzykujemy detektor zmian
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.http.get<any>('http://localhost:8080/api/tickets/stats').subscribe({
      next: (data) => {
        console.log('Otrzymane statystyki:', data); // Debug w konsoli (F12)

        // Przypisujemy dane lub puste obiekty, jeśli null
        this.stats = data || { users: [], categories: [] };

        // Zabezpieczenie dla users (jeśli nie ma pola w JSON)
        if (!this.stats.users) this.stats.users = [];
        // Zabezpieczenie dla categories
        if (!this.stats.categories) this.stats.categories = [];

        // 3. Obliczamy MAX (zabezpieczenie przed -Infinity)
        if (this.stats.users.length > 0) {
            const values = this.stats.users.map((u: any) => u.value);
            this.maxUserVal = Math.max(...values) || 1; // Jeśli max to 0, ustaw 1
        } else {
            this.maxUserVal = 1;
        }

        if (this.stats.categories.length > 0) {
            const values = this.stats.categories.map((c: any) => c.value);
            this.maxCatVal = Math.max(...values) || 1;
        } else {
            this.maxCatVal = 1;
        }

        // 4. Wymuszamy odświeżenie widoku
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Błąd statystyk', err);
        // Nawet przy błędzie chcemy odświeżyć widok (żeby pokazać stan pusty)
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
  
  goToUsers() {
    this.router.navigate(['/users']);
  }
}