import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Login, Register, ServiceBookState } from '../../state/service-book.state';

@Component({
  selector: 'app-auth-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-panel.html',
  styleUrl: './auth-panel.css'
})
export class AuthPanelComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  protected readonly authMessage$ = this.store.select(ServiceBookState.authMessage);

  protected loginEmail = '';
  protected loginPassword = '';
  protected registerName = '';
  protected registerEmail = '';
  protected registerPassword = '';

  protected login(): void {
    this.store
      .dispatch(new Login(this.loginEmail, this.loginPassword))
      .subscribe(() => this.navigateAfterAuth());
  }

  protected register(): void {
    this.store
      .dispatch(new Register(this.registerName, this.registerEmail, this.registerPassword))
      .subscribe(() => this.navigateAfterAuth());
  }

  private navigateAfterAuth(): void {
    const activeUserId = this.store.selectSnapshot(ServiceBookState.activeUserId);
    if (activeUserId) {
      this.loginEmail = '';
      this.loginPassword = '';
      this.registerName = '';
      this.registerEmail = '';
      this.registerPassword = '';
      void this.router.navigateByUrl('/dashboard');
    }
  }
}
