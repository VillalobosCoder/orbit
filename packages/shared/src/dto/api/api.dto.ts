export interface ApiError {
  status: number;
  error: string;
  message: string;
  fields?: Record<string, string>;
  timestamp: string;
}

export type PageDto<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
