import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import {
  NotificationMessage,
  RemoveNotification,
  ServiceBookState
} from '../../state/service-book.state';

@Component({
  selector: 'app-toast-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notifications.html',
  styleUrl: './toast-notifications.css'
})
export class ToastNotificationsComponent {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly notifications$ = this.store.select(ServiceBookState.notifications);

  private readonly scheduled = new Set<string>();
  private readonly timers = new Map<string, number>();

  constructor() {
    this.notifications$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((notifications) => this.scheduleDismissals(notifications));
  }

  protected dismiss(id: string): void {
    this.store.dispatch(new RemoveNotification(id));
  }

  protected toastClass(notification: NotificationMessage): string {
    switch (notification.type) {
      case 'success':
        return 'text-bg-success';
      case 'error':
        return 'text-bg-danger';
      case 'info':
        return 'text-bg-info';
      default:
        return 'text-bg-secondary';
    }
  }

  private scheduleDismissals(notifications: NotificationMessage[]): void {
    const activeIds = new Set(notifications.map((item) => item.id));

    notifications.forEach((notification) => {
      if (this.scheduled.has(notification.id)) {
        return;
      }

      this.scheduled.add(notification.id);
      const timer = window.setTimeout(() => {
        this.store.dispatch(new RemoveNotification(notification.id));
      }, 3000);
      this.timers.set(notification.id, timer);
    });

    this.timers.forEach((timer, id) => {
      if (!activeIds.has(id)) {
        window.clearTimeout(timer);
        this.timers.delete(id);
        this.scheduled.delete(id);
      }
    });
  }
}
