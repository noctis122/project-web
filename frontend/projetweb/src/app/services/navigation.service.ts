import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  // Basic menu structure without role filtering
  getNavItems() {
    return [
      {
        label: 'Profile',
        path: '/dashboard/profile',
        icon: 'person'
      },
      {
        label: 'Grades',
        path: '/dashboard/grades',
        icon: 'grade'
      },
      {
        label: 'Absences',
        path: '/dashboard/absences',
        icon: 'event_busy'
      },
      {
        label: 'Admin Panel',
        path: '/dashboard/adminprofile',
        icon: 'admin_panel_settings'
      },
      {
        label: 'Manage Grades',
        path: '/dashboard/admingrades',
        icon: 'school'
      }
    ];
  }
}