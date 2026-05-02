import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from '@/components/AppSidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';
import logoImage from '@/assets/butterprep-logo-horizontal.png';

const DashboardLayout = () => {
  const { user, selectedAcademicYear } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/dashboard');
    } else if (!selectedAcademicYear) {
      navigate('/dashboard');
    }
  }, [user, selectedAcademicYear, navigate]);

  if (!user || !selectedAcademicYear) {
    return null;
  }

  return (
    <div className="h-screen bg-background flex flex-col w-full overflow-hidden">
      {/* Header — full width, premium glass treatment */}
      <header className="h-16 border-b border-border/70 bg-card/95 backdrop-blur-sm px-4 md:px-6 flex items-center justify-between shrink-0 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        {/* Left: Logo + Breadcrumbs */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center shrink-0 tap-target"
            aria-label="Go to dashboard"
          >
            <img
              src={logoImage}
              alt="ButterPrep"
              className="h-8 w-auto object-contain"
            />
          </button>
          <div className="hidden md:block h-6 w-px bg-border" />
          <div className="hidden md:block min-w-0">
            <HeaderBreadcrumbs />
          </div>
        </div>

        {/* Right: Year chip + user */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 border border-border text-xs font-medium text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{selectedAcademicYear.examName}</span>
          </div>
          <div className="flex items-center gap-2.5 pl-2 md:pl-3 md:border-l md:border-border">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
                {user.username}
              </span>
              <span className="text-[11px] text-muted-foreground">Administrator</span>
            </div>
            <Avatar className="h-9 w-9 ring-2 ring-primary/15">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex-1 flex w-full overflow-hidden">
        <div className="shrink-0 h-full sticky top-0 overflow-hidden">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
