export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPaginationParams(query: Record<string, string | string[]>) {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 12));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function formatPaginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return { data, meta: buildMeta(total, page, limit) };
}
