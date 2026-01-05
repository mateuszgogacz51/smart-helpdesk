import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // Upewnij się, że ścieżka pasuje do Twojego app.ts

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));