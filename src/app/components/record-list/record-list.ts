import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { RemoveRecord, ServiceBookState } from '../../state/service-book.state';

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './record-list.html',
  styleUrl: './record-list.css'
})
export class RecordListComponent {
  private readonly store = inject(Store);

  protected readonly records$ = this.store.select(ServiceBookState.selectedRecords);
  protected readonly totalCost$ = this.store.select(ServiceBookState.selectedRecordsTotalCost);

  protected removeRecord(recordId: string): void {
    this.store.dispatch(new RemoveRecord(recordId));
  }
}
