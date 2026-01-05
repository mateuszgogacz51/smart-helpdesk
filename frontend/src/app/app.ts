import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html', // Upewnij się, że nazwa pliku HTML się zgadza
  styleUrl: './app.css' // Zamiast app.component.css, jeśli masz app.css
})
export class AppComponent {
  title = 'smart-helpdesk';
}