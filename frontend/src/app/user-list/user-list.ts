import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 50px; text-align: center;">
      <h1>🚧 Panel Administratora 🚧</h1>
      <p>Tutaj jutro zbudujemy tabelę użytkowników.</p>
      <a href="/dashboard" style="color: blue; cursor: pointer;">Wróć do Dashboardu</a>
    </div>
  `
})
export class UserListComponent {}