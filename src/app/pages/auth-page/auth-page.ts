import { Component } from '@angular/core';
import { AppHeaderComponent } from '../../components/app-header/app-header';
import { AuthPanelComponent } from '../../components/auth-panel/auth-panel';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [AppHeaderComponent, AuthPanelComponent],
  templateUrl: './auth-page.html'
})
export class AuthPageComponent {}
