import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FakeVehicleApi, FORCE_ERROR_TERM } from './fake-vehicle-api';
import { VehicleSearchService } from './vehicle-search.service';
import { FuelType, INITIAL_VIEW_MODEL, MIN_TERM_LENGTH } from './vehicle.models';

@Component({
  selector: 'app-vehicle-search',
  templateUrl: './vehicle-search.component.html',
  styleUrl: './vehicle-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  providers: [VehicleSearchService],
})
export class VehicleSearchComponent {
  private readonly search = inject(VehicleSearchService);

  protected readonly vm = toSignal(this.search.viewModel$, { initialValue: INITIAL_VIEW_MODEL });
  protected readonly apiStats = inject(FakeVehicleApi).stats;

  protected readonly minTermLength = MIN_TERM_LENGTH;
  protected readonly forceErrorTerm = FORCE_ERROR_TERM;
  protected readonly fuelOptions: readonly { value: FuelType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'electric', label: 'Electric' },
  ];

  protected onTermInput(event: Event): void {
    this.search.setTerm((event.target as HTMLInputElement).value);
  }

  protected onFuelChange(event: Event): void {
    this.search.setFuel((event.target as HTMLSelectElement).value as FuelType);
  }

  protected onRetry(): void {
    this.search.retry();
  }
}
