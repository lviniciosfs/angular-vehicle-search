# Challenge: Vehicle search with RxJS (1h)

Angular 21 · RxJS 7.8 · zoneless · signals

```bash
npm start   # http://localhost:4200
```

## Context

The UI is already done. `FakeVehicleApi` simulates a slow backend (300–1500 ms) that **responds out of order** and fails ~10% of calls with `HTTP 503`.

Your job is to implement `viewModel$` in
`src/app/vehicle-search/vehicle-search.service.ts`.

The component consumes `viewModel$` via `toSignal` and calls `setTerm`, `setFuel` and `retry`.

## Files

| File | Can change? |
| --- | --- |
| `vehicle-search.service.ts` | **Yes — this is the challenge** |
| `vehicle.models.ts` | Only if needed (justify it) |
| `vehicle-search.component.*` | No (except bonus) |
| `fake-vehicle-api.ts` | **No** |

## Requirements

1. **Term:** apply `trim`, debounce **300 ms** and ignore repeated values.
2. **Minimum length:** a term shorter than `MIN_TERM_LENGTH` (2) → `status: 'idle'`, `results: []` and **no request**.
3. **Fuel:** a change triggers the search **immediately** (no debounce), combined with the latest term. The initial value is `'all'`.
4. **Only the latest search wins:** an in-flight request is **canceled** when a new query arrives. A stale result must never be shown.
5. **Loading:** during the request, `status: 'loading'`. `results` and `total` **keep the previous search's values**, and the UI shows them dimmed.
6. **Error:** `status: 'error'`, `error` = error message, `results: []` and `total: 0`. The stream **stays alive**: typing again searches normally.
7. **Retry:** `retry()` repeats the **latest query**, even if it is identical to the previous one.
8. **Cache:** if the same query (lower-cased term + fuel) succeeded within the last **30 s**:
   - respond without a request, with `fromCache: true`;
   - skip the `loading` state;
   - errors are never cached.

## Constraints

- No `subscribe` (the component's `toSignal` is the only subscription).
- No `setTimeout`, `setInterval`, `async`/`await`, `Promise`, `firstValueFrom` or `toPromise`.
- No `effect()`.
- `viewModel$` must subscribe to the inputs **once**, even if it is subscribed to more than once.

## How to validate (the "API" panel at the bottom of the page)

| Scenario | Expected |
| --- | --- |
| Type `x3` quickly | `started` +1 |
| With `x3` already searched, delete the `3` and retype it in < 300 ms | 0 new requests |
| Type `i`, `i4`, `i` (fast, each > 300 ms apart) | 1 request (`i4`), then `idle`, and `canceled` +1 if it was still in flight |
| Change the fuel several times quickly | Only the last one shows; `canceled` goes up |
| Type `boom` | `error` + button; click it → new request for `boom` |
| After `boom`, type `x5` | Search works (stream alive) |
| `x3` → `x5` → `x3` (< 30 s) | Second `x3` shows the **cache** badge; `started` does not go up |
| `X3` vs `x3` | Same cache entry |

Open DevTools: the API logs `→`, `✔`, `✖` and `⊘ canceled`.

## Bonus (if time allows)

- Automatic retry **once** on 5xx errors, waiting 500 ms, before showing the error.
- Sync `term` and `fuel` with the URL query params (`?q=x3&fuel=diesel`). Reloading the page repeats the search.
- Make time injectable (`SchedulerLike`) so debounce and cache can be tested with `TestScheduler`.

## What is assessed

- Operator choice: `debounceTime`, `distinctUntilChanged`, `combineLatest`, `switchMap` vs `concatMap`/`exhaustMap`, `catchError` in the right place, `startWith`, `scan`, `shareReplay`.
- No race conditions (stale results, loading that never ends).
- View model design (no flicker, correct state transitions).
- Readability: short pipeline, small functions, clear names.
