import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Layers,
  Users,
  UserCheck,
  BookOpen,
  GitBranch,
  LayoutList,
  FileText,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { MasterDataProvider, useMasterData } from '@/contexts/MasterDataContext';

const stepIcons = [Calendar, Layers, Users, UserCheck, BookOpen, GitBranch, Users, LayoutList, FileText];

const MasterDataSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { steps, completedCount, totalSteps, isStepUnlocked } = useMasterData();
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const [collapsed, setCollapsed] = React.useState(false);
  const allComplete = completedCount === totalSteps;

  // Redirect /master-data to first step
  React.useEffect(() => {
    if (location.pathname === '/master-data') {
      navigate(steps[0].path, { replace: true });
    }
  }, [location.pathname, navigate, steps]);

  return (
    <Card className={cn('h-fit card-shadow sticky top-6 shrink-0 transition-all duration-200', collapsed ? 'w-16' : 'w-72')}>
      <CardContent className={cn('p-3', !collapsed && 'p-5')}>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center mb-3 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors text-primary"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight className={cn('w-4 h-4 transition-transform', collapsed ? '' : 'rotate-180')} />
        </button>

        {/* Header - only show setup progress when not all complete */}
        {!collapsed && !allComplete && (
          <div className="mb-5">
            <h3 className="font-semibold text-foreground text-base">School Setup</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step {completedCount} of {totalSteps} completed
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={progressPercent} className="h-2 flex-1" />
              <span className="text-xs font-medium text-primary">{progressPercent}%</span>
            </div>
          </div>
        )}

        {!collapsed && allComplete && (
          <div className="mb-4">
            <h3 className="font-semibold text-foreground text-base">Master Data</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your school data</p>
          </div>
        )}

        {/* Collapsed progress ring - only during setup */}
        {collapsed && !allComplete && (
          <div className="flex justify-center mb-3">
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray={`${progressPercent} 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary">{progressPercent}%</span>
            </div>
          </div>
        )}

        {/* Steps */}
        <nav className="space-y-0.5">
          {steps.map((step, index) => {
            const Icon = stepIcons[index];
            const unlocked = allComplete || isStepUnlocked(step.number);
            const isActive = location.pathname === step.path;
            
            return (
              <NavLink
                key={step.id}
                to={unlocked ? step.path : '#'}
                onClick={(e) => { if (!unlocked) e.preventDefault(); }}
                title={collapsed ? step.title : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm transition-all group relative',
                  collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2.5',
                  isActive
                    ? 'bg-primary/8 text-primary font-medium'
                    : unlocked
                      ? 'text-foreground hover:bg-muted/60'
                      : 'text-muted-foreground/50 cursor-not-allowed'
                )}
              >
                {/* Icon mode (post-setup) vs Step number mode (during setup) */}
                {allComplete ? (
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground'
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                ) : (
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold transition-colors',
                    step.isCompleted
                      ? 'bg-success text-success-foreground'
                      : isActive
                        ? 'bg-primary text-primary-foreground'
                        : unlocked
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-muted/50 text-muted-foreground/50'
                  )}>
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : !unlocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      step.number
                    )}
                  </div>
                )}

                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{step.title}</span>
                      {isActive && !allComplete && (
                        <span className="block text-[11px] text-muted-foreground mt-0.5 truncate">
                          {step.description}
                        </span>
                      )}
                    </div>

                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-primary/50 shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};

const MasterDataContent = () => {
  return (
    <div className="p-6 flex gap-6">
      <MasterDataSidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

const MasterData = () => {
  return (
    <MasterDataProvider>
      <MasterDataContent />
    </MasterDataProvider>
  );
};

export default MasterData;
