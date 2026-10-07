// ⚠️ Do not change this file. It simulates a slow, unreliable backend.
import { Injectable, computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchQuery, SearchResponse, Vehicle } from './vehicle.models';

export class HttpLikeError extends Error {
  constructor(public readonly status: number) {
    super(`HTTP ${status}`);
  }
}

const VEHICLES: readonly Vehicle[] = [
  ['BMW', '116i', 'petrol', 2023, 32900],
  ['BMW', '118d', 'diesel', 2022, 34500],
  ['BMW', '120 xDrive', 'petrol', 2024, 41200],
  ['BMW', '218 Gran Coupé', 'petrol', 2023, 36800],
  ['BMW', '220d Active Tourer', 'diesel', 2022, 38900],
  ['BMW', '225e Active Tourer', 'hybrid', 2024, 45600],
  ['BMW', '320i', 'petrol', 2023, 46300],
  ['BMW', '320d Touring', 'diesel', 2022, 49800],
  ['BMW', '330e', 'hybrid', 2024, 54100],
  ['BMW', 'M340i xDrive', 'petrol', 2024, 72500],
  ['BMW', 'i4 eDrive35', 'electric', 2024, 56900],
  ['BMW', 'i4 M50', 'electric', 2023, 71800],
  ['BMW', '520d', 'diesel', 2023, 59900],
  ['BMW', '530e', 'hybrid', 2024, 66400],
  ['BMW', 'i5 eDrive40', 'electric', 2024, 74200],
  ['BMW', 'i5 M60 xDrive', 'electric', 2024, 99900],
  ['BMW', '740d xDrive', 'diesel', 2023, 112000],
  ['BMW', 'i7 xDrive60', 'electric', 2024, 135900],
  ['BMW', 'X1 sDrive18i', 'petrol', 2023, 42100],
  ['BMW', 'X1 xDrive25e', 'hybrid', 2024, 51300],
  ['BMW', 'iX1 xDrive30', 'electric', 2024, 55800],
  ['BMW', 'X2 sDrive20i', 'petrol', 2024, 46700],
  ['BMW', 'iX2 eDrive20', 'electric', 2024, 52400],
  ['BMW', 'X3 20d', 'diesel', 2023, 58900],
  ['BMW', 'X3 30e', 'hybrid', 2024, 66900],
  ['BMW', 'iX3', 'electric', 2023, 67300],
  ['BMW', 'X5 xDrive40d', 'diesel', 2023, 94600],
  ['BMW', 'X5 xDrive50e', 'hybrid', 2024, 101200],
  ['BMW', 'X7 xDrive40i', 'petrol', 2024, 118400],
  ['BMW', 'iX xDrive40', 'electric', 2023, 82500],
  ['BMW', 'iX M60', 'electric', 2024, 129900],
  ['BMW', 'Z4 sDrive20i', 'petrol', 2023, 52700],
  ['BMW', 'M2', 'petrol', 2024, 79900],
  ['BMW', 'M3 Competition', 'petrol', 2024, 104300],
  ['MINI', 'Cooper C', 'petrol', 2024, 28900],
  ['MINI', 'Cooper S', 'petrol', 2024, 33500],
  ['MINI', 'Cooper E', 'electric', 2024, 34900],
  ['MINI', 'Cooper SE', 'electric', 2024, 39900],
  ['MINI', 'Countryman D', 'diesel', 2023, 39400],
  ['MINI', 'Countryman SE ALL4', 'electric', 2024, 49800],
  ['MINI', 'Aceman E', 'electric', 2024, 36900],
].map(([brand, model, fuel, year, price], i) => ({
  id: `v-${i + 1}`,
  brand,
  model,
  fuel,
  year,
  price,
}) as Vehicle);

const FAILURE_RATE = 0.1;
/** Any term containing this word always fails with HTTP 503 — use it to test the error path. */
export const FORCE_ERROR_TERM = 'boom';

@Injectable({ providedIn: 'root' })
export class FakeVehicleApi {
  private readonly started = signal(0);
  private readonly completed = signal(0);
  private readonly canceled = signal(0);

  /** Debug counters shown in the UI. Use them to prove debounce, cancellation and cache work. */
  readonly stats = computed(() => ({
    started: this.started(),
    completed: this.completed(),
    canceled: this.canceled(),
    inFlight: this.started() - this.completed() - this.canceled(),
  }));

  search(query: SearchQuery): Observable<SearchResponse> {
    return new Observable<SearchResponse>(subscriber => {
      const requestId = this.started() + 1;
      this.started.update(n => n + 1);
      // Random latency on purpose: responses can arrive out of order.
      const latency = 300 + Math.random() * 1200;
      let finished = false;
      console.debug(`[api] #${requestId} →`, query, `(${Math.round(latency)}ms)`);

      const timeoutId = setTimeout(() => {
        finished = true;
        this.completed.update(n => n + 1);
        const term = query.term.trim().toLowerCase();

        if (term.includes(FORCE_ERROR_TERM) || Math.random() < FAILURE_RATE) {
          console.debug(`[api] #${requestId} ✖ 503`);
          subscriber.error(new HttpLikeError(503));
          return;
        }

        const items = VEHICLES.filter(
          v =>
            `${v.brand} ${v.model}`.toLowerCase().includes(term) &&
            (query.fuel === 'all' || v.fuel === query.fuel),
        );
        console.debug(`[api] #${requestId} ✔ ${items.length} results`);
        subscriber.next({ items, total: items.length });
        subscriber.complete();
      }, latency);

      return () => {
        clearTimeout(timeoutId);
        if (!finished) {
          this.canceled.update(n => n + 1);
          console.debug(`[api] #${requestId} ⊘ canceled`);
        }
      };
    });
  }
}
