import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

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

  constructor(private http: HttpClient, private router: Router, public authService: AuthService) {}

  ngOnInit() {
    this.loadMyProfile();
  }

loadMyProfile() {
    this.isLoading = true;
    this.http.get<any>('http://localhost:8080/api/users/me').subscribe({
      next: (data) => {
        this.user = data;
        this.isLoading = false; // Sukces -> koniec ładowania
      },
      error: (err) => {
        console.error('Błąd pobierania profilu', err);
        this.isLoading = false; // <--- DODAJ TO: Błąd -> też koniec ładowania!
        
        // Opcjonalnie wyświetl komunikat, zamiast od razu uciekać
        // alert('Brak połączenia z serwerem.'); 
        // this.goBack(); 
      }
    });
  }

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