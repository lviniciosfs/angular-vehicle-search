import { Injectable, inject } from '@angular/core';
import { Observable, Subject, combineLatest, concatMap, debounce, debounceTime, distinctUntilChanged, map, of, startWith, switchMap, tap } from 'rxjs';
import { FakeVehicleApi } from './fake-vehicle-api';
import { FuelType, INITIAL_VIEW_MODEL, SearchResponse, SearchViewModel } from './vehicle.models';

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
  readonly viewModel$: Observable<SearchViewModel> = combineLatest({
    term: this.term$,
    fuel: this.fuel$.pipe(startWith('all')),
  }).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    map(({ term, fuel }) => {
      const termTrimmed = term.trim();
      const fuelTrimmed = fuel.trim() as FuelType;
      return {
        term: termTrimmed,
        fuel: fuelTrimmed
      }
    }),
    switchMap(({ term, fuel }) => {
      return this.api.search({term, fuel}).pipe(
        map((res) => {
          const searchViewModel: SearchViewModel =  {
            status: 'success',
            query: {term: (term as string), fuel: (fuel as FuelType)},
            results: res.items,
            total: res.total,
            fromCache: false
          }
          return searchViewModel
        })
      )
    })
  )

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
