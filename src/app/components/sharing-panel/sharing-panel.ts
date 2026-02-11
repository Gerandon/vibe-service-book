import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { RemoveShare, ServiceBookState, ShareVehicle } from '../../state/service-book.state';

@Component({
  selector: 'app-sharing-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sharing-panel.html',
  styleUrl: './sharing-panel.css'
})
export class SharingPanelComponent {
  private readonly store = inject(Store);

  protected readonly canShareSelected$ = this.store.select(ServiceBookState.canShareSelected);
  protected readonly shareMessage$ = this.store.select(ServiceBookState.shareMessage);
  protected readonly sharedUsers$ = this.store.select(ServiceBookState.sharedUsers);

  protected shareEmail = '';

  protected shareVehicle(): void {
    this.store.dispatch(new ShareVehicle(this.shareEmail)).subscribe(() => {
      const message = this.store.selectSnapshot(ServiceBookState.shareMessage);
      if (!message) {
        this.shareEmail = '';
      }
    });
  }

  protected removeShare(userId: string): void {
    this.store.dispatch(new RemoveShare(userId));
  }
}
