import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Login, Register, ServiceBookState } from '../../state/service-book.state';

@Component({
  selector: 'app-auth-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-panel.html',
  styleUrl: './auth-panel.css'
})
export class AuthPanelComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly authMessage$ = this.store.select(ServiceBookState.authMessage);

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  protected readonly registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  protected login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const value = this.loginForm.getRawValue();
    this.store.dispatch(new Login(value.email ?? '', value.password ?? '')).subscribe(() => {
      this.navigateAfterAuth();
    });
  }

  protected register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const value = this.registerForm.getRawValue();
    this.store
      .dispatch(new Register(value.name ?? '', value.email ?? '', value.password ?? ''))
      .subscribe(() => {
        this.navigateAfterAuth();
      });
  }

  private navigateAfterAuth(): void {
    const activeUserId = this.store.selectSnapshot(ServiceBookState.activeUserId);
    if (activeUserId) {
      this.loginForm.reset();
      this.registerForm.reset();
      void this.router.navigateByUrl('/dashboard');
    }
  }
}
