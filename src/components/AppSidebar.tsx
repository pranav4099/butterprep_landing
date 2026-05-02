import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Settings,
  Upload,
  FileText,
  ClipboardList,
  RefreshCw,
  ScanSearch,
  Printer,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Library,
  FileEdit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavSection {
  label: string;
  items: { title: string; icon: React.ElementType; path: string }[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', icon: Home, path: '/dashboard' },
      { title: 'Insights', icon: TrendingUp, path: '/insights' },
    ],
  },
  {
    label: 'Exam Setup',
    items: [
      { title: 'Master Data', icon: Settings, path: '/master-data' },
      { title: 'Paper Library', icon: Library, path: '/paper-library' },
    ],
  },
  {
    label: 'Paper Processing',
    items: [
      // { title: 'Question Papers', icon: FileEdit, path: '/question-papers' }, // LOCKED
      // { title: 'Question Bank', icon: Library, path: '/question-bank-approvals' }, // LOCKED
      { title: 'Upload Papers', icon: Upload, path: '/upload-papers' },
      { title: 'Re-Scan Requests', icon: ScanSearch, path: '/re-scan-papers' },
      { title: 'Re-exams', icon: RotateCcw, path: '/re-exams' },
    ],
  },
  {
    label: 'Evaluation',
    items: [
      { title: 'Review Progress', icon: FileText, path: '/review-progress' },
    ],
  },
  {
    label: 'Results & Reports',
    items: [
      { title: 'Results', icon: ClipboardList, path: '/results' },
      { title: 'Print Reports', icon: Printer, path: '/print-reports' },
    ],
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'border-r border-border/70 bg-sidebar flex flex-col h-full transition-all duration-200',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Collapse toggle */}
      <div className={cn('flex items-center p-2', collapsed ? 'justify-center' : 'justify-end')}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/15 transition-colors text-primary border border-primary/20 tap-target"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-1 px-2 overflow-y-auto scrollbar-hide">
        {navSections.map((section, sIdx) => (
          <div key={section.label} className={cn(sIdx > 0 && 'mt-5')}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
                {section.label}
              </p>
            )}
            {collapsed && sIdx > 0 && (
              <div className="mx-3 mb-2 border-t border-border/70" />
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      title={collapsed ? item.title : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                        collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                          : 'text-sidebar-foreground hover:bg-muted/70 hover:text-foreground'
                      )}
                    >
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-primary" aria-hidden />
                      )}
                      <item.icon className={cn(
                        'w-[18px] h-[18px] shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )} />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer brand mark */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-border/70">
          <p className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">
            BUTTERPREP · v1.0
          </p>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
