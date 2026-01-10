import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    console.log('INTERCEPTOR: Doklejam token do zapytania!', token.substring(0, 10) + '...');
    
    const cloned = req.clone({
      setHeaders: {
        Authorization: token
      }
    });
    return next(cloned);
  }

  console.warn('INTERCEPTOR: Brak tokena! Wysyłam zapytanie bez autoryzacji.');
  return next(req);
};