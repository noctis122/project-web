  import { Routes } from '@angular/router';
  import { LoginComponent } from './components/login/login.component';
  import { RegisterComponent } from './components/register/register.component';
  import { DashboardComponent } from './components/dashboard/dashboard.component';
  import { ProfileComponent } from './components/profile/profile.component';
  import { GradesComponent } from './components/grades/grades.component';
  import { AbsencesComponent } from './components/absences/absences.component';
  import { AdminprofileComponent } from './components/adminprofile/adminprofile.component';
  import { AdmingradesComponent } from './components/admingrades/admingrades.component';
  import { RoleGuard } from './guards/role.guard';
  import { DashboardelemComponent } from './components/dashboardelem/dashboardelem.component';

  export const routes: Routes = [
    { 
      path: '',
      redirectTo: '/login',
      pathMatch: 'full'
    },
    { 
      path: 'register', 
      component: RegisterComponent 
    },
    { 
      path: 'login', 
      component: LoginComponent 
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
      canActivate: [RoleGuard],
      children: [
        {
          path: 'profile/:userId',  
          component: ProfileComponent,
          data: { expectedRole: 'student' }
        },
        {
          path: 'grades',
          component: GradesComponent,
          data: { expectedRole: 'student' }
        },
        {
          path: 'absences',
          component: AbsencesComponent,
          data: { expectedRole: 'student' }
        },
        {
          path: 'adminprofile',
          component: AdminprofileComponent,
          data: { expectedRoles: ['admin'] }
        },
        {
          path: 'admingrades',
          component: AdmingradesComponent,
          data: { expectedRoles: ['admin'] }
        },
        {
          path:'dashboardelem',
          component: DashboardelemComponent
        }
      ]
    },
    { 
      path: '**',
      redirectTo: '/login'
    }
  ];
  