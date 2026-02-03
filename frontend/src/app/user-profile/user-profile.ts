import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; //
import { CommonModule } from '@angular/common'; //
import { FormsModule } from '@angular/forms'; //
import { HttpClient } from '@angular/common/http'; //
import { Router } from '@angular/router'; //
import { AuthService } from '../auth.service'; //
import { finalize } from 'rxjs/operators'; //

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfileComponent implements OnInit {
  user: any = {}; 
  originalUserSnapshot: any = {}; 
  password = '';
  
  isEditing = false; 
  isLoading = true;

  // Wstrzyknij ChangeDetectorRef do konstruktora
  constructor(
    private http: HttpClient, 
    private router: Router, 
    public authService: AuthService,
    private cdr: ChangeDetectorRef // Dodaj to
  ) {}

  ngOnInit() {
    this.loadMyProfile();
  }

  loadMyProfile() {
    this.isLoading = true;
    this.http.get<any>('http://localhost:8080/api/users/me')
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('Ładowanie zakończone, stan isLoading:', this.isLoading);
          this.cdr.detectChanges(); // WYMUŚ ODŚWIEŻENIE WIDOKU
        })
      )
      .subscribe({
        next: (data) => {
          this.user = data;
          console.log('Dane przypisane do profilu:', this.user);
          this.cdr.detectChanges(); // WYMUŚ ODŚWIEŻENIE WIDOKU
        },
        error: (err) => {
          console.error('Błąd w subscribe:', err);
          this.cdr.detectChanges(); // Wyłącz loader nawet przy błędzie
        }
      });
  }

  // Reszta Twoich metod (enableEditMode, cancelEdit, saveProfile, goBack) pozostaje bez zmian
  enableEditMode() {
    this.isEditing = true;
    this.originalUserSnapshot = JSON.parse(JSON.stringify(this.user));
  }

  cancelEdit() {
    this.isEditing = false;
    this.user = this.originalUserSnapshot;
    this.password = '';
  }

  saveProfile() {
    if (!confirm('Czy na pewno chcesz zapisać zmiany w swoim profilu?')) return;

    const payload = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      phoneNumber: this.user.phoneNumber,
      department: this.user.department,
      password: this.password 
    };

    this.http.put('http://localhost:8080/api/users/me', payload).subscribe({
      next: () => {
        alert('Profil zaktualizowany pomyślnie!');
        this.password = '';
        this.isEditing = false;
        this.loadMyProfile();
      },
      error: () => alert('Błąd aktualizacji profilu')
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}