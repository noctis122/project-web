import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Updated to match the actual response from your API
interface RegisterResponse {
  user_id: number;
  username: string;
  email: string;
  role: string;
  classe: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private helper = new JwtHelperService();
  private _token: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Try to load token from storage on service init
    this._token = localStorage.getItem('token');
    console.log('Auth service initialized, token exists:', !!this._token);
  }

  login(username: string, password: string): Observable<AuthResponse> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    console.log(`Logging in user: ${username}`);
    console.log(`API URL: ${this.apiUrl}/token`);
    

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/token`,
      body.toString(),
      { headers }
    ).pipe(
      tap(response => console.log('Login response received:', response.token_type)),
      catchError(this.handleError)
    );
  }

  register(username: string, email: string, password: string, classe: string): Observable<RegisterResponse> {
    console.log(`Registering user: ${username}`);
    
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`, 
      { username, email, password, classe }
    ).pipe(
      tap(response => console.log('Registration successful for user ID:', response.user_id)),
      catchError(this.handleError)
    );
  }
+
  // Helper to handle HTTP errors
  private handleError(error: HttpErrorResponse) {
    console.error('API error:', error);
    
    let errorMsg = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMsg = `Error Code: ${error.status}, Message: ${error.error?.detail || error.message}`;
    }
    
    return throwError(() => new Error(errorMsg));
  }

  saveToken(token: string): void {
    console.log('Saving token to storage...');
    this._token = token;
    localStorage.setItem('token', token);
    console.log('Token saved, length:', token.length);
  }

  getToken(): string | null {
    if (!this._token) {
      this._token = localStorage.getItem('token');
    }
    return this._token;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('No token found, user not logged in');
      return false;
    }
    
    try {
      const isExpired = this.helper.isTokenExpired(token);
      console.log('Token expired?', isExpired);
      return !isExpired;
    } catch (e) {
      console.error('Error validating token:', e);
      // If there's an error parsing the token, consider the user not logged in
      return false;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decodedToken = this.helper.decodeToken(token);
      console.log('Decoded token role:', decodedToken?.role);
      return decodedToken?.role || null;
    } catch (e) {
      console.error('Error decoding token for role:', e);
      return null;
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decodedToken = this.helper.decodeToken(token);
      return decodedToken?.sub || null;
    } catch (e) {
      console.error('Error decoding token for user ID:', e);
      return null;
    }
  }

  logout(): void {
    console.log('Logging out user');
    this._token = null;
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  authenticatedRequest<T>(method: string, url: string, body?: any): Observable<T> {
    const token = this.getToken();
    debugger
  
    if (!token) {
      console.error('No authentication token found');
      this.router.navigate(['/login']);
      return throwError(() => new Error('Authentication required'));
    }
    debugger
  
    // Create headers with authorization
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    debugger
  
    // Debug logging (consider using a proper logger in production)
    console.log(`Making authenticated ${method} request to ${this.apiUrl}${url}`);
    if (token.length > 15) {
      console.log('Auth header:', `Bearer ${token.substring(0, 15)}...`);
    }
    
    debugger
  
    // Prepare request options
    const options: {
      headers: HttpHeaders;
      body?: any;
      observe?: 'body';
      responseType?: 'json';
    } = {
      headers,
      observe: 'body',
      responseType: 'json'
    };
    debugger
  
    // For non-GET requests, add the body if it exists
    if (method !== 'GET' && body) {
      options.body = JSON.stringify(body);
    }
    debugger
  
    return this.http.request<T>(method, `${this.apiUrl}${url}`, options).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error in ${method} ${url}:`, error);
        debugger
        if (error.status === 401) {
          console.log('Unauthorized request (401), logging out');
          this.logout();
          this.router.navigate(['/login']);
          debugger
        }
        
        // Convert to a more descriptive error if needed
        const errorMsg = error.error?.message || error.message || 'Unknown error occurred';
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}