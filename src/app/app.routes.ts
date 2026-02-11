import { Routes } from '@angular/router';
import { AuthPageComponent } from './pages/auth-page/auth-page';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: AuthPageComponent },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: '**', redirectTo: 'login' }
];
