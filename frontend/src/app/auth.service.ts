import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private username: string | null = null;
  private password: string | null = null;

  constructor() { }

  // Zapisz dane (logowanie)
  setCredentials(user: string, pass: string) {
    this.username = user;
    this.password = pass;
    // Opcjonalnie: Zapisz w localStorage, żeby nie wylogowało po odświeżeniu
    localStorage.setItem('username', user);
    localStorage.setItem('password', pass);
  }

  // Pobierz nagłówek autoryzacji (Basic Auth)
  getAuthHeader(): string | null {
    // Sprawdź czy mamy dane w pamięci lub w localStorage
    if (!this.username) {
        this.username = localStorage.getItem('username');
        this.password = localStorage.getItem('password');
    }

    if (this.username && this.password) {
      // Zamień user:pass na format Base64 (wymagane przez Basic Auth)
      const token = btoa(this.username + ':' + this.password);
      return 'Basic ' + token;
    }
    return null;
  }

  // Wyloguj
  logout() {
    this.username = null;
    this.password = null;
    localStorage.removeItem('username');
    localStorage.removeItem('password');
  }
  
  isLoggedIn(): boolean {
      return this.username !== null || localStorage.getItem('username') !== null;
  }
}