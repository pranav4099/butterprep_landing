import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardCheck, BarChart3, Home, Menu, X, BookOpen, FileSearch, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { useState } from 'react';

const navItems = [
  { path: '/teacher/dashboard', label: 'Home', icon: Home },
  { path: '/teacher/qp-review', label: 'Question Paper', icon: FileSearch },
  { path: '/teacher/review', label: 'Review Papers', icon: ClipboardCheck },
  { path: '/teacher/reports', label: 'Reports', icon: FileText },
  { path: '/teacher/rubrics', label: 'Rubrics', icon: BookOpen },
  // { path: '/teacher/question-bank', label: 'Question Bank', icon: Library }, // LOCKED
  { path: '/teacher/insights', label: 'Learning Patterns', icon: BarChart3 },
];

const TeacherLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header - Clean minimal design */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Logo size="sm" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "gap-2 px-4",
                  location.pathname === item.path && "bg-primary/10 text-primary"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border bg-card/95 backdrop-blur-lg p-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all tap-target",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Content - Tablet optimized padding */}
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
