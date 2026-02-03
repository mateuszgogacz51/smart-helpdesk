import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Sprawdzamy, czy użytkownik jest zalogowany
  if (authService.isLoggedIn()) {
    return true; // Wpuszczamy
  } else {
    // Jeśli nie jest zalogowany, odsyłamy do logowania
    router.navigate(['/login']);
    return false; // Blokujemy wstęp
  }
};