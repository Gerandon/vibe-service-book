import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Logout, ServiceBookState } from '../../state/service-book.state';
import { PdfExportService } from '../../services/pdf-export.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css'
})
export class AppHeaderComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly pdfExport = inject(PdfExportService);

  protected readonly title$ = this.store.select(ServiceBookState.title);
  protected readonly currentUser$ = this.store.select(ServiceBookState.currentUser);

  protected logout(): void {
    this.store.dispatch(new Logout());
    void this.router.navigateByUrl('/login');
  }

  protected exportPdf(): void {
    this.pdfExport.exportAllVehicles();
  }
}
