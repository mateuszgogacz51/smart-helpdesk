import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token'); 
  const router = inject(Router);

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // <--- Tu musi być Bearer, nie Basic
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // Jeśli dostaniesz 401/403 (brak dostępu), dopiero wtedy wyloguj
      if (error.status === 401 || error.status === 403) {
        console.warn('Błąd autoryzacji - wylogowywanie...');
        localStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};