// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  path?: string;
}

export type SortDirection = 'ASC' | 'DESC';

export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: SortDirection;
}
