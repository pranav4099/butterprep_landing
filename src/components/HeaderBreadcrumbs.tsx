import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Maps URL path segments to friendly labels for the admin shell.
 * Unknown segments are title-cased and de-slugged.
 */
const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  insights: 'Insights',
  'master-data': 'Master Data',
  'paper-library': 'Paper Library',
  'question-papers': 'Question Papers',
  'upload-papers': 'Upload Papers',
  're-scan-papers': 'Re-Scan Requests',
  're-exams': 'Re-Exams',
  'review-progress': 'Review Progress',
  results: 'Results',
  'print-reports': 'Print Reports',
  tracking: 'Tracking',
  preview: 'Preview',
  edit: 'Edit',
  create: 'Create',
};

const prettify = (seg: string) =>
  LABELS[seg] ??
  seg
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const HeaderBreadcrumbs: React.FC<{ className?: string }> = ({ className }) => {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  // Build cumulative paths
  const crumbs = segments.map((seg, idx) => ({
    label: prettify(seg),
    href: '/' + segments.slice(0, idx + 1).join('/'),
  }));

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-sm', className)}>
      <Link
        to="/dashboard"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={c.href}>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[200px]">{c.label}</span>
            ) : (
              <Link
                to={c.href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[160px]"
              >
                {c.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default HeaderBreadcrumbs;
