// src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ProfileService, StudentProfile } from '../../services/profile.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile?: StudentProfile;
  isLoading = true;
  error: string | null = null;
  currentUserId: number | null = null;

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    debugger;
    
    // Get userId from route params
    const userId = this.route.snapshot.params['userId'];
    debugger;
    
    if (!userId) {
      this.error = 'No user ID provided';
      this.isLoading = false;
      return;
    }
    debugger

    this.loadProfile(+userId);
  }

  private loadProfile(userId: number): void {
    this.profileService.getStudentProfile(userId).subscribe({
      next: (data) => {
        debugger
        this.profile = data;
        this.isLoading = false;
        debugger
      },
      error: (err) => {
        console.error('Profile loading error:', err);
        this.error = err.error?.detail || 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  get isOwnProfile(): boolean {
    return this.profile?.user_id === this.currentUserId;
  }

  retryLoad(): void {
    this.isLoading = true;
    this.error = null;
    this.loadProfile(this.route.snapshot.params['userId']);
  }
}