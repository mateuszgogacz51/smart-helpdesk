import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = false;

  constructor() {
    // Sprawdź czy użytkownik miał już ustawiony tryb
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setDarkMode(true);
    }
  }

  toggleTheme() {
    this.setDarkMode(!this.darkMode);
  }

  isDarkMode() {
    return this.darkMode;
  }

  private setDarkMode(isDark: boolean) {
    this.darkMode = isDark;
    if (isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}