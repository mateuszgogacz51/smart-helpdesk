import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { AddTicketComponent } from './add-ticket/add-ticket';
import { TicketDetailsComponent } from './ticket-details/ticket-details';
import { UserListComponent } from './user-list/user-list'; // <--- 1. Import

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add-ticket', component: AddTicketComponent },
  { path: 'ticket/:id', component: TicketDetailsComponent },
  { path: 'users', component: UserListComponent }, // <--- 2. Nowa trasa
  { path: '**', redirectTo: 'login' }
];