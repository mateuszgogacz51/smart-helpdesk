import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { AddTicketComponent } from './add-ticket/add-ticket'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add-ticket', component: AddTicketComponent }, 
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];