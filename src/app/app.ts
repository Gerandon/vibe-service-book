import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastNotificationsComponent } from './components/toast-notifications/toast-notifications';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastNotificationsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
