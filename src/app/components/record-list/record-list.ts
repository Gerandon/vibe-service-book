import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { RemoveRecord, ServiceBookState, UpdateRecord } from '../../state/service-book.state';

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './record-list.html',
  styleUrl: './record-list.css'
})
export class RecordListComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  protected readonly records$ = this.store.select(ServiceBookState.selectedRecords);
  protected readonly totalCost$ = this.store.select(ServiceBookState.selectedRecordsTotalCost);

  protected editingId: string | null = null;
  protected readonly editForm = this.fb.group({
    title: ['', Validators.required],
    date: ['', Validators.required],
    odometer: [0, [Validators.min(0)]],
    cost: [0, [Validators.min(0)]],
    notes: ['']
  });

  protected removeRecord(recordId: string): void {
    this.store.dispatch(new RemoveRecord(recordId));
  }

  protected startEdit(record: {
    id: string;
    title: string;
    date: string;
    odometer: number;
    cost: number;
    notes: string;
  }): void {
    this.editingId = record.id;
    this.editForm.reset({
      title: record.title,
      date: record.date,
      odometer: record.odometer,
      cost: record.cost,
      notes: record.notes
    });
  }

  protected cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset({
      title: '',
      date: '',
      odometer: 0,
      cost: 0,
      notes: ''
    });
  }

  protected saveEdit(recordId: string): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const payload = this.editForm.getRawValue();
    this.store.dispatch(new UpdateRecord(recordId, { ...payload } as any)).subscribe(() => {
      const message = this.store.selectSnapshot(ServiceBookState.recordMessage);
      if (!message) {
        this.cancelEdit();
      }
    });
  }
}
