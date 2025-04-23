import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,   
    private router: Router
  ) {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      console.log('User already logged in, redirecting to dashboard');
      this.router.navigate(['/dashboard']);
    }
  }

  navigatetoregister() {
    this.router.navigateByUrl('register');
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Attempting login for user:', this.username);
  
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login successful');
        
        if (!response.access_token) {
          this.errorMessage = 'Server did not provide an authentication token';
          this.isLoading = false;
          return;
        }
        
        this.authService.saveToken(response.access_token);
        
        // Check what role is in the token
        const role = this.authService.getUserRole();
        console.log('User role from token:', role);
        const userid =this.authService.getUserId();
        console.log('user id:',userid);
        
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }
}