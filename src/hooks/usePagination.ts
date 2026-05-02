import { useEffect, useMemo, useState } from 'react';

/**
 * Standardized pagination hook for admin list pages.
 * Default page size: 10. Resets to page 1 when item count or pageSize changes.
 */
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  // Clamp on data change
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const start = items.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(items.length, page * pageSize);
  const rangeLabel =
    items.length === 0 ? 'No results' : `Showing ${start}–${end} of ${items.length}`;

  return { page, setPage, pageCount, pageItems, rangeLabel, total: items.length };
}
