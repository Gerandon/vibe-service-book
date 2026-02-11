import { Routes } from '@angular/router';
import { AuthPageComponent } from './pages/auth-page/auth-page';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page';
import { vehicleMakesResolver } from './resolvers/vehicle-makes.resolver';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: AuthPageComponent },
  {
    path: 'dashboard',
    component: DashboardPageComponent,
    resolve: {
      makes: vehicleMakesResolver
    }
  },
  { path: '**', redirectTo: 'login' }
];
