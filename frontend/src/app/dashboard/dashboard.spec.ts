import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Niezbędne do działania pętli *ngFor w HTML
import { Router } from '@angular/router'; // Niezbędne do nawigacji między stronami

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], // Importujemy to, aby HTML rozumiał pętle i warunki
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {

  // Przykładowa lista zgłoszeń (symulacja bazy danych)
  tickets = [
    { id: 101, title: 'Problem z drukarką na 2 piętrze', status: 'OTWARTE' },
    { id: 102, title: 'Brak dostępu do VPN', status: 'W TOKU' },
    { id: 103, title: 'Prośba o nowy monitor', status: 'ZAMKNIĘTE' },
    { id: 104, title: 'Awaria poczty Outlook', status: 'OTWARTE' },
    { id: 105, title: 'Klawiatura zalana kawą', status: 'NOWE' }
  ];

  // Wstrzykujemy Router w konstruktorze
  constructor(private router: Router) {}

  // 1. Funkcja Wylogowania
  logout() {
    console.log('Wylogowywanie użytkownika...');
    // Tutaj w przyszłości można dodać czyszczenie tokenów logowania
    this.router.navigate(['/login']); // Przekierowanie do ekranu logowania
  }

  // 2. Funkcja Dodawania Zgłoszenia
  createNewTicket() {
    console.log('Nawigacja do formularza dodawania...');
    // To jest kluczowa zmiana - idziemy do nowej strony, którą stworzyliśmy
    this.router.navigate(['/add-ticket']); 
  }

  // 3. Funkcja pomocnicza do kolorów statusów
  getStatusClass(status: string): string {
    switch (status) {
      case 'OTWARTE': return 'status-open';     // Klasa z CSS (niebieski)
      case 'W TOKU': return 'status-pending';   // Klasa z CSS (żółty/pomarańczowy)
      case 'ZAMKNIĘTE': return 'status-closed'; // Klasa z CSS (zielony)
      case 'NOWE': return 'status-open';        // Traktujemy jak otwarte lub można dodać nową klasę
      default: return '';
    }
  }
}