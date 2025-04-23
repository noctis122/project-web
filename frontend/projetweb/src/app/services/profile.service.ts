// src/app/services/profile.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface StudentProfile {
  user_id: number;
  username: string;
  email: string;
  classe: string;
  year?: string;
  specialty?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private authService: AuthService) {}

  getStudentProfile(userId: number): Observable<StudentProfile> {
    debugger
    return this.authService.authenticatedRequest<StudentProfile>(
      'GET', 
      `/student/profile/${userId}`
    );
    debugger
  }
}