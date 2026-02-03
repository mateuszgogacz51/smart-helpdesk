import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { AdminComponent } from './admin/admin';
import { AddTicketComponent } from './add-ticket/add-ticket';
import { TicketDetailsComponent } from './ticket-details/ticket-details';
import { UserListComponent } from './user-list/user-list';
import { UserProfileComponent } from './user-profile/user-profile';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'add-ticket', 
    component: AddTicketComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'ticket/:id', 
    component: TicketDetailsComponent, 
    canActivate: [authGuard] 
  },
  
  // TO JEST NOWA ŚCIEŻKA DLA PROFILU
  { 
    path: 'profile', 
    component: UserProfileComponent, 
    canActivate: [authGuard] 
  },

  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [authGuard, adminGuard] 
  },
  { 
    path: 'users', 
    component: UserListComponent, 
    canActivate: [authGuard, adminGuard] 
  }
];