import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { RemoveShare, ServiceBookState, ShareVehicle } from '../../state/service-book.state';

@Component({
  selector: 'app-sharing-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sharing-panel.html',
  styleUrl: './sharing-panel.css'
})
export class SharingPanelComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  protected readonly canShareSelected$ = this.store.select(ServiceBookState.canShareSelected);
  protected readonly shareMessage$ = this.store.select(ServiceBookState.shareMessage);
  protected readonly sharedUsers$ = this.store.select(ServiceBookState.sharedUsers);

  protected readonly shareForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected shareVehicle(): void {
    if (this.shareForm.invalid) {
      this.shareForm.markAllAsTouched();
      return;
    }

    const email = String(this.shareForm.get('email')?.value ?? '');
    this.store.dispatch(new ShareVehicle(email)).subscribe(() => {
      const message = this.store.selectSnapshot(ServiceBookState.shareMessage);
      if (!message) {
        this.shareForm.reset({ email: '' });
      }
    });
  }

  protected removeShare(userId: string): void {
    this.store.dispatch(new RemoveShare(userId));
  }
}
