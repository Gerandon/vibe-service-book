import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { ServiceBookState } from '../../state/service-book.state';
import { RecordListComponent } from '../record-list/record-list';
import { RecordFormComponent } from '../record-form/record-form';
import { SharingPanelComponent } from '../sharing-panel/sharing-panel';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RecordListComponent, RecordFormComponent, SharingPanelComponent],
  templateUrl: './vehicle-detail.html'
})
export class VehicleDetailComponent {
  private readonly store = inject(Store);

  protected readonly selectedVehicle$ = this.store.select(ServiceBookState.selectedVehicle);
  protected readonly sharedUsers$ = this.store.select(ServiceBookState.sharedUsers);
  protected readonly selectedOwnerName$ = this.store.select(ServiceBookState.selectedOwnerName);
}
