import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  classe = '';
  isLoading = false;
  errorMessage = '';
  registrationSuccess = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  navigatetologin() {
    this.router.navigateByUrl('login');
  }

  onSubmit(): void {
    if (!this.username || !this.email || !this.password || !this.classe) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    console.log('Attempting to register user:', this.username);

    this.authService.register(this.username, this.email, this.password, this.classe)
      .subscribe({
        next: (response) => {
          console.log('Registration successful for user:', response.username);
          this.isLoading = false;
          this.registrationSuccess = true;
          
          // Optionally auto-login after registration
          /* 
          this.authService.login(this.username, this.password).subscribe({
            next: (loginResponse) => {
              this.authService.saveToken(loginResponse.access_token);
              this.router.navigate(['/dashboard']);
            },
            error: (loginError) => {
              console.error('Auto-login failed after registration:', loginError);
              this.router.navigate(['/login']);
            }
          });
          */
          
          // Alternative: Just redirect to login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Registration error:', error);
          this.errorMessage = error.message || 'Registration failed. Please try again.';
        }
      });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}