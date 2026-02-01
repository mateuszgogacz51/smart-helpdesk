import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { TicketDetailsComponent } from './ticket-details/ticket-details';
import { AddTicketComponent } from './add-ticket/add-ticket';
import { UserListComponent } from './user-list/user-list';
import { AdminComponent } from './admin/admin'; // <--- IMPORT

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'ticket/:id', component: TicketDetailsComponent },
  { path: 'add-ticket', component: AddTicketComponent },
  { path: 'users', component: UserListComponent },
  { path: 'admin', component: AdminComponent } // <--- NOWA ŚCIEŻKA
];