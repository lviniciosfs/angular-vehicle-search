import { Injectable, inject } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { FakeVehicleApi } from './fake-vehicle-api';
import { FuelType, INITIAL_VIEW_MODEL, SearchViewModel } from './vehicle.models';

@Injectable()
export class VehicleSearchService {
  private readonly api = inject(FakeVehicleApi);

  // Inputs coming from the UI. Feel free to change the Subject type (e.g. BehaviorSubject).
  private readonly term$ = new Subject<string>();
  private readonly fuel$ = new Subject<FuelType>();
  private readonly retry$ = new Subject<void>();

  /**
   * Single source of truth for the UI.
   *
   * TODO: replace the placeholder below with the real pipeline. See README.md for the rules.
   */
  readonly viewModel$: Observable<SearchViewModel> = of(INITIAL_VIEW_MODEL);

  setTerm(term: string): void {
    this.term$.next(term);
  }

  setFuel(fuel: FuelType): void {
    this.fuel$.next(fuel);
  }

  retry(): void {
    this.retry$.next();
  }
}
