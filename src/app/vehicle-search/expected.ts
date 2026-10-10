/*readonly viewModel$: Observable<SearchViewModel> = combineLatest({
    term: this.term$.pipe(
      map(term => term.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      startWith(''),
    ),
    fuel: this.fuel$.pipe(startWith<FuelType>('all')),
    retryVersion: this.retry$.pipe(
      scan((count: number) => count + 1, 0),
      startWith(0),
    ),
  }).pipe(
    map(({ term, fuel, retryVersion }) => {
      const forceRefresh = retryVersion !== this.lastRetryVersion;
      this.lastRetryVersion = retryVersion;
      return { term, fuel, forceRefresh };
    }),
    switchMap(({ term, fuel, forceRefresh }) => {
      const query: SearchQuery = { term: term.trim(), fuel };
      const cacheKey = `${query.term.toLowerCase()}|${fuel}`;

      return this.api.search({ term: query.term, fuel: query.fuel }).pipe(
        map(response => {
          this.cache.set(cacheKey, { timestamp: Date.now(), response });

          return {
            status: 'success' as const,
            query,
            results: response.items,
            total: response.total,
            fromCache: false,
          };
        }),
        startWith({
          status: 'loading' as const,
          query,
          results: this.lastViewModel.results,
          total: this.lastViewModel.total,
          fromCache: false,
        }),
        catchError(error =>
          of({
            status: 'error' as const,
            query,
            results: [],
            total: 0,
            fromCache: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
        ),
      );
    }),
    tap(viewModel => {
      this.lastViewModel = viewModel;
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );*/