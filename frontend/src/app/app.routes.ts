import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { AddTicketComponent } from './add-ticket/add-ticket';
// Import nowego komponentu (ścieżka może się różnić zależnie od generatora, sprawdź podpowiedź)
import { TicketDetailsComponent } from './ticket-details/ticket-details'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add-ticket', component: AddTicketComponent },
  { path: 'ticket/:id', component: TicketDetailsComponent }, 
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];