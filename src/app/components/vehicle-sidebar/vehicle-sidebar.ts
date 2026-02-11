import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AddVehicle, RemoveVehicle, SelectVehicle, ServiceBookState } from '../../state/service-book.state';

@Component({
  selector: 'app-vehicle-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-sidebar.html',
  styleUrl: './vehicle-sidebar.css'
})
export class VehicleSidebarComponent {
  private readonly store = inject(Store);

  protected readonly vehicles$ = this.store.select(ServiceBookState.accessibleVehicles);
  protected readonly selectedVehicleId$ = this.store.select(ServiceBookState.selectedVehicleId);
  protected readonly currentUser$ = this.store.select(ServiceBookState.currentUser);
  protected readonly vehicleMessage$ = this.store.select(ServiceBookState.vehicleMessage);

  protected newVehicle = {
    nickname: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: ''
  };

  protected selectVehicle(vehicleId: string): void {
    this.store.dispatch(new SelectVehicle(vehicleId));
  }

  protected addVehicle(): void {
    this.store.dispatch(new AddVehicle({ ...this.newVehicle })).subscribe(() => {
      const message = this.store.selectSnapshot(ServiceBookState.vehicleMessage);
      if (!message) {
        this.newVehicle = {
          nickname: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          vin: ''
        };
      }
    });
  }

  protected removeVehicle(vehicleId: string): void {
    this.store.dispatch(new RemoveVehicle(vehicleId));
  }
}
