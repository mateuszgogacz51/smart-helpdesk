import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service'; // Upewnij się, że masz ten import
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // --- LOGIKA: Wyloguj TYLKO przy 401 (Wygasły token) ---
      if (error.status === 401) {
        console.warn('Sesja wygasła (401) - wylogowywanie...');
        authService.logout();
        router.navigate(['/login']);
      }

      // Błędy 403 (Brak dostępu) i inne puszczamy dalej do komponentu
      return throwError(() => error);
    })
  );
};