export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand';
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  price?: number;
}

export interface SearchResult {
  products: import('./product').ProductSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  query: string;
  didYouMean?: string;
  appliedFilters: import('./product').ProductFilter;
}
