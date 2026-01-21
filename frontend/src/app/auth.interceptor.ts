import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Pobieramy token prosto z "szuflady" przeglądarki
  const token = localStorage.getItem('token'); 

  // 2. Logujemy, żebyś widział w konsoli czy działa (F12)
  if (token) {
    console.log('✅ INTERCEPTOR: Mam token, doklejam go!', token.substring(0, 10) + '...');
    
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Basic ${token}`
      }
    });
    return next(cloned);
  } else {
    console.warn('⚠️ INTERCEPTOR: Brak tokenu w localStorage! Zapytanie leci bez autoryzacji.');
  }

  return next(req);
};