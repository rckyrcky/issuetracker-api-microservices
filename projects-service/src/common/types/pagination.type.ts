export type Pagination = {
  total: number;
  page: number;
  limit?: number;
  totalPages: number;
  hasMorePage: boolean;
  nextPage: number | null;
};

export type CursorPagination = {
  hasMore: boolean;
  nextCursor: number | null;
};
