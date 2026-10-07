export type FuelType = 'all' | 'petrol' | 'diesel' | 'electric' | 'hybrid';

export interface Vehicle {
  readonly id: string;
  readonly brand: 'BMW' | 'MINI';
  readonly model: string;
  readonly fuel: Exclude<FuelType, 'all'>;
  readonly year: number;
  readonly price: number;
}

export interface SearchQuery {
  readonly term: string;
  readonly fuel: FuelType;
}

export interface SearchResponse {
  readonly items: readonly Vehicle[];
  readonly total: number;
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SearchViewModel {
  readonly status: SearchStatus;
  readonly query: SearchQuery;
  /** While `loading`, keeps the previous results so the list does not flicker. */
  readonly results: readonly Vehicle[];
  readonly total: number;
  readonly fromCache: boolean;
  readonly error?: string;
}

export const MIN_TERM_LENGTH = 2;

export const INITIAL_VIEW_MODEL: SearchViewModel = {
  status: 'idle',
  query: { term: '', fuel: 'all' },
  results: [],
  total: 0,
  fromCache: false,
};
