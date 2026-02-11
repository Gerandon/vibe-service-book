import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { BehaviorSubject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { VehicleMakesService } from '../../services/vehicle-makes.service';
import { AddVehicle, RemoveVehicle, SelectVehicle, ServiceBookState } from '../../state/service-book.state';

@Component({
  selector: 'app-vehicle-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-sidebar.html',
  styleUrl: './vehicle-sidebar.css'
})
export class VehicleSidebarComponent {
  private readonly store = inject(Store);
  private readonly makesService = inject(VehicleMakesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private makesCache: string[] = [];

  protected readonly vehicles$ = this.store.select(ServiceBookState.accessibleVehicles);
  protected readonly selectedVehicleId$ = this.store.select(ServiceBookState.selectedVehicleId);
  protected readonly currentUser$ = this.store.select(ServiceBookState.currentUser);
  protected readonly vehicleMessage$ = this.store.select(ServiceBookState.vehicleMessage);

  private readonly makeQuery$ = new BehaviorSubject<string>('');
  protected readonly filteredMakes$ = this.makeQuery$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    switchMap((query) => this.makesService.getMakes(query, 5))
  );

  protected showMakeDropdown = false;
  protected makeValidationMessage = '';

  protected readonly newVehicleForm = this.fb.group({
    nickname: [''],
    make: ['', Validators.required],
    model: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1970), Validators.max(2100)]],
    vin: ['', Validators.required]
  });

  constructor() {
    this.makesService
      .getAllMakesStream()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((makes) => {
        this.makesCache = makes;
      });
  }

  protected selectVehicle(vehicleId: string): void {
    this.store.dispatch(new SelectVehicle(vehicleId));
  }

  protected addVehicle(): void {
    if (this.newVehicleForm.invalid) {
      this.newVehicleForm.markAllAsTouched();
      return;
    }

    if (!this.isMakeValid()) {
      return;
    }

    const payload = this.newVehicleForm.getRawValue();
    this.store.dispatch(new AddVehicle({ ...payload } as any)).subscribe(() => {
      const message = this.store.selectSnapshot(ServiceBookState.vehicleMessage);
      if (!message) {
        this.newVehicleForm.reset({
          nickname: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          vin: ''
        });
        this.makeQuery$.next('');
        this.makeValidationMessage = '';
      }
    });
  }

  protected removeVehicle(vehicleId: string): void {
    this.store.dispatch(new RemoveVehicle(vehicleId));
  }

  protected onMakeInput(): void {
    const value = String(this.newVehicleForm.get('make')?.value ?? '');
    this.makeQuery$.next(value.trim());
    this.makeValidationMessage = '';
  }

  protected onMakeFocus(): void {
    this.showMakeDropdown = true;
    const value = String(this.newVehicleForm.get('make')?.value ?? '');
    this.makeQuery$.next(value.trim());
  }

  protected onMakeBlur(): void {
    window.setTimeout(() => {
      this.showMakeDropdown = false;
      this.normalizeMake();
    }, 150);
  }

  protected selectMake(make: string): void {
    this.newVehicleForm.get('make')?.setValue(make);
    this.makeQuery$.next(make);
    this.showMakeDropdown = false;
    this.makeValidationMessage = '';
  }

  private normalizeMake(): void {
    const current = String(this.newVehicleForm.get('make')?.value ?? '').trim();
    if (!current || this.makesCache.length === 0) {
      return;
    }

    const match = this.makesCache.find((make) => make.toLowerCase() === current.toLowerCase());
    if (match) {
      this.newVehicleForm.get('make')?.setValue(match);
      this.makeValidationMessage = '';
    } else {
      this.newVehicleForm.get('make')?.setValue('');
      this.makeValidationMessage = $localize`:@@makeRequired:Válasszon a listából.`;
    }
  }

  private isMakeValid(): boolean {
    const current = String(this.newVehicleForm.get('make')?.value ?? '').trim();
    if (!current) {
      this.makeValidationMessage = $localize`:@@makeRequired:Válasszon a listából.`;
      return false;
    }

    const match = this.makesCache.find((make) => make.toLowerCase() === current.toLowerCase());
    if (!match) {
      this.makeValidationMessage = $localize`:@@makeRequired:Válasszon a listából.`;
      return false;
    }

    this.newVehicleForm.get('make')?.setValue(match);
    return true;
  }
}
