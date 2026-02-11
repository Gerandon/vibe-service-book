import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AddRecord, ServiceBookState } from '../../state/service-book.state';

@Component({
  selector: 'app-record-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './record-form.html'
})
export class RecordFormComponent {
  private readonly store = inject(Store);

  protected readonly recordMessage$ = this.store.select(ServiceBookState.recordMessage);

  protected newRecord = {
    title: '',
    date: '',
    odometer: 0,
    cost: 0,
    notes: ''
  };

  protected addRecord(): void {
    this.store.dispatch(new AddRecord({ ...this.newRecord })).subscribe(() => {
      const message = this.store.selectSnapshot(ServiceBookState.recordMessage);
      if (!message) {
        this.newRecord = {
          title: '',
          date: '',
          odometer: 0,
          cost: 0,
          notes: ''
        };
      }
    });
  }
}
