import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { AppHeaderComponent } from '../../components/app-header/app-header';
import { VehicleSidebarComponent } from '../../components/vehicle-sidebar/vehicle-sidebar';
import { VehicleDetailComponent } from '../../components/vehicle-detail/vehicle-detail';
import { ServiceBookState } from '../../state/service-book.state';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule, AppHeaderComponent, VehicleSidebarComponent, VehicleDetailComponent],
  templateUrl: './dashboard-page.html'
})
export class DashboardPageComponent {
  private readonly store = inject(Store);
  protected readonly currentUser$ = this.store.select(ServiceBookState.currentUser);
}
