import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../ticket.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Ticket } from '../ticket.model';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../theme.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  tickets: Ticket[] = [];        // Wszystkie pobrane z bazy
  visibleTickets: Ticket[] = []; // Wszystkie po przefiltrowaniu (szukanie)
  paginatedTickets: Ticket[] = []; // Tylko te widoczne na OBECNEJ stronie
  
  currentUser: string = '';
  currentUserRole: string = '';
  
  // --- PAGINACJA ---
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  // --- POWIADOMIENIA ---
  unreadCount: number = 0;
  notifications: any[] = [];
  showNotifications: boolean = false;
  isLoadingNotifications: boolean = false;

  stats: any = {
    myOpen: 0, myInProgress: 0, myClosed: 0,
    globalOpen: 0, globalTotal: 0,
    users: [], categories: []
  };

  viewMode: 'ALL' | 'MY' = 'ALL'; 
  currentStatusFilter: string = 'ALL'; 
  searchTerm: string = ''; 

  sortColumn: string = 'lastUpdated'; 
  sortDirection: 'asc' | 'desc' = 'desc'; 

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private notificationService: NotificationService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUsername();
    this.currentUserRole = this.authService.getRole();

    if (this.currentUserRole === 'USER') {
      this.viewMode = 'MY';
    }

    this.loadTickets();
    this.loadStats();
    this.loadNotificationCount();
  }

  // --- LOGIKA PAGINACJI ---

  updatePagination() {
    this.totalPages = Math.ceil(this.visibleTickets.length / this.itemsPerPage) || 1;
    
    // Zabezpieczenie: jeśli jesteśmy na stronie 5, a zmienimy filtr i są tylko 2 strony
    if (this.currentPage > this.totalPages) {
        this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    this.paginatedTickets = this.visibleTickets.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.updatePagination();
    }
  }

  onPageSizeChange() {
      this.currentPage = 1; // Reset do pierwszej strony przy zmianie rozmiaru
      this.updatePagination();
  }

  // --- LOGIKA DANYCH ---

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.applyFilters(); 
      },
      error: (err) => console.error('Błąd pobierania biletów', err)
    });
  }

  applyFilters() {
    let temp = [...this.tickets];

    // 1. Filtrowanie (Moje/Wszystkie)
    if (this.viewMode === 'MY') {
      if (this.currentUserRole === 'ADMIN' || this.currentUserRole === 'HELPDESK') {
        temp = temp.filter(t => t.assignedUser?.username === this.currentUser);
      } else {
        temp = temp.filter(t => t.author?.username === this.currentUser);
      }
    }

    // 2. Status
    if (this.currentStatusFilter !== 'ALL') {
      temp = temp.filter(t => t.status === this.currentStatusFilter);
    }

    // 3. Wyszukiwanie
    if (this.searchTerm) {
      const lowerTerm = this.searchTerm.toLowerCase();
      temp = temp.filter(t => 
        t.title.toLowerCase().includes(lowerTerm) ||
        (t.author?.username && t.author.username.toLowerCase().includes(lowerTerm)) ||
        (t.assignedUser?.username && t.assignedUser.username.toLowerCase().includes(lowerTerm))
      );
    }

    // 4. Sortowanie
    temp.sort((a: any, b: any) => {
       const valA = this.resolveFieldData(a, this.sortColumn);
       const valB = this.resolveFieldData(b, this.sortColumn);
       
       let comparison = 0;
       if (valA === valB) return 0;
       if (valA === null || valA === undefined) return 1;
       if (valB === null || valB === undefined) return -1;

       if (typeof valA === 'string' && typeof valB === 'string') {
         comparison = valA.localeCompare(valB);
       } else {
         comparison = (valA < valB ? -1 : 1);
       }
       return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.visibleTickets = temp; // Zapisujemy przefiltrowaną całość
    this.currentPage = 1;       // Reset strony po filtrowaniu
    this.updatePagination();    // Wycinamy kawałek dla obecnej strony
  }
  
  resolveFieldData(data: any, field: string): any {
    if (data && field) {
      if (field === 'lastUpdated') {
         return data.lastUpdated || data.createdDate;
      }
      return field.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), data);
    }
    return null;
  }

  // --- RESZTA METOD ---
  loadStats() {
    this.ticketService.getStats().subscribe({
        next: (data) => {
            this.stats = data;
            if (!this.stats.users) this.stats.users = [];
            if (!this.stats.categories) this.stats.categories = [];
            this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
    });
  }

  loadNotificationCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount = count,
      error: (err) => console.error(err)
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.isLoadingNotifications = true;
      this.notifications = [];
      this.notificationService.getNotifications().subscribe({
        next: (data) => {
          this.notifications = data;
          this.isLoadingNotifications = false;
          this.cdr.detectChanges();
        },
        error: (err) => this.isLoadingNotifications = false
      });
    }
  }

  onNotificationClick(notification: any) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        notification.read = true;
      });
    }
    this.showNotifications = false;
    this.router.navigate(['/ticket', notification.ticketId]);
  }

  deleteNotification(event: Event, notification: any) {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        if (!notification.read) this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  setFilter(status: string) { this.currentStatusFilter = status; this.applyFilters(); }
  sortTable(column: string) {
    if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    else { this.sortColumn = column; this.sortDirection = 'desc'; }
    this.applyFilters();
  }
  
  goToAddTicket() { this.router.navigate(['/add-ticket']); }
  goToDetails(id: number) { this.router.navigate(['/ticket', id]); }
  logout() { this.authService.logout(); this.router.navigate(['/login']); }
  goToUsers() { this.router.navigate(['/users']); }
  toggleTheme() { this.themeService.toggleTheme(); }
  goToProfile() { this.router.navigate(['/profile']); }
}