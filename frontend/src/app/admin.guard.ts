import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Sprawdzamy, czy użytkownik ma rolę ADMIN
  if (authService.getRole() === 'ADMIN') {
    return true; // Wpuszczamy
  } else {
    // Jeśli nie jest adminem, odsyłamy go na Dashboard (lub do logowania)
    // alert('Brak uprawnień administratora!'); // Opcjonalnie można odkomentować
    router.navigate(['/dashboard']);
    return false; // Blokujemy wstęp
  }
};