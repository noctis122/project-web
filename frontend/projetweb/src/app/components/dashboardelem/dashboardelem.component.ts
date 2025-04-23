import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboardelem',
  templateUrl: './dashboardelem.component.html',
  styleUrls: ['./dashboardelem.component.css']
})
export class DashboardelemComponent {
  // Existing stats data
  stats = [
    { title: 'Total Students', value: '2155', change: '+0.5%', trend: 'up', period: 'than last month' },
    { title: 'Total Teachers', value: '654', change: '-3%', trend: 'down', period: 'than last month' },
    { title: 'Events', value: '656', change: '6%', trend: 'up', period: 'than last month' },
    { title: 'Invoice Status', value: '1,397', change: '+2%', trend: 'up', period: 'than last month' }
  ];

  // New calendar data
  calendar = {
    title: 'School Event Calendar',
    studentCount: '2155 Students',
    month: 'January',
    year: '2022',
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    days: [
      [1, 2, 3, 4, 5, 6, 7],
      [8, 9, 10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19, 20, 21],
      [22, 23, 24, 25, 26, 27, 28],
      [29, 30, 31, 1, 2, 3, 4]
    ]
  };
}