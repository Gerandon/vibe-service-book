import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AddRecord, ServiceBookState } from '../../state/service-book.state';

@Component({
  selector: 'app-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './record-form.html'
})
export class RecordFormComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  protected readonly recordMessage$ = this.store.select(ServiceBookState.recordMessage);

  protected readonly recordForm = this.fb.group({
    title: ['', Validators.required],
    date: ['', Validators.required],
    odometer: [0, [Validators.min(0)]],
    cost: [0, [Validators.min(0)]],
    notes: ['']
  });

  protected addRecord(): void {
    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }

    const payload = this.recordForm.getRawValue();
    this.store.dispatch(new AddRecord({ ...payload } as any)).subscribe(() => {
      const message = this.store.selectSnapshot(ServiceBookState.recordMessage);
      if (!message) {
        this.recordForm.reset({
          title: '',
          date: '',
          odometer: 0,
          cost: 0,
          notes: ''
        });
      }
    });
  }
}
