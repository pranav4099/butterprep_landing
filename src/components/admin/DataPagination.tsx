import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface DataPaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  rangeLabel?: string;
  className?: string;
}

/**
 * Smart numbered pagination with ellipsis. Hidden when only 1 page.
 */
const buildPages = (page: number, pageCount: number): (number | 'ellipsis')[] => {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (page > 3) pages.push('ellipsis');
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (page < pageCount - 2) pages.push('ellipsis');
  pages.push(pageCount);
  return pages;
};

const DataPagination: React.FC<DataPaginationProps> = ({
  page,
  pageCount,
  onChange,
  rangeLabel,
  className,
}) => {
  if (pageCount <= 1) {
    if (!rangeLabel) return null;
    return (
      <div className={cn('flex items-center justify-between text-xs text-muted-foreground', className)}>
        <span>{rangeLabel}</span>
      </div>
    );
  }

  const pages = buildPages(page, pageCount);
  const go = (p: number) => onChange(Math.min(pageCount, Math.max(1, p)));

  return (
    <div className={cn('flex flex-col gap-2 md:flex-row md:items-center md:justify-between', className)}>
      {rangeLabel && (
        <span className="text-xs text-muted-foreground order-2 md:order-1">{rangeLabel}</span>
      )}
      <Pagination className="order-1 md:order-2 md:mx-0 md:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => { e.preventDefault(); go(page - 1); }}
              className={cn('cursor-pointer h-9 px-3', page === 1 && 'pointer-events-none opacity-50')}
            />
          </PaginationItem>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <PaginationItem key={`e-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={(e) => { e.preventDefault(); go(p); }}
                  className="cursor-pointer h-9 w-9"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              onClick={(e) => { e.preventDefault(); go(page + 1); }}
              className={cn('cursor-pointer h-9 px-3', page === pageCount && 'pointer-events-none opacity-50')}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default DataPagination;
