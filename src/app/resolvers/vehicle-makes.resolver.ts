import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { VehicleMakesService } from '../services/vehicle-makes.service';

export const vehicleMakesResolver: ResolveFn<string[]> = () => {
  const makesService = inject(VehicleMakesService);
  return makesService.prefetch();
};
