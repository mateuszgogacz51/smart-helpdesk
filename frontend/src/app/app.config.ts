import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http'; // <--- WAŻNE: To naprawi błędy z serwisami

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),      // Włączamy nawigację (Login <-> Dashboard)
    provideHttpClient()         // Włączamy Internet (połączenie z Backendem)
  ]
};