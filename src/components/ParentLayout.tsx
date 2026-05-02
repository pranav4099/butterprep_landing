import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Bell, Users, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { useParent } from '@/contexts/ParentContext';

const navItems = [
  { path: '/parent/dashboard', label: 'Home', icon: Home },
  { path: '/parent/exams', label: 'Exams', icon: FileText },
  { path: '/parent/action', label: 'Action', icon: Sparkles },
];

const ParentLayout = () => {
  const { selectedChild, children: childrenList, selectChild, getNotifications } = useParent();
  const navigate = useNavigate();
  const location = useLocation();
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);

  const unreadCount = getNotifications().filter(n => !n.read).length;

  const handleChildSwitch = (child: typeof childrenList[0]) => {
    selectChild(child);
    setChildDropdownOpen(false);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-bar border-b border-border/60">
        <div className="flex items-center justify-between px-4 md:px-6 h-14 max-w-5xl mx-auto">
          <Logo size="sm" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 px-4 relative rounded-lg font-medium",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {/* Notification bell */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/parent/notifications')}
              className="relative text-muted-foreground hover:text-foreground h-8 w-8"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Button>

            {selectedChild && childrenList.length > 1 && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setChildDropdownOpen(!childDropdownOpen)}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-3 w-3 text-primary" />
                  </div>
                  <span className="hidden sm:inline">{selectedChild.name.split(' ')[0]}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", childDropdownOpen && "rotate-180")} />
                </Button>
                {childDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setChildDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg py-1.5 min-w-[200px] z-50 overflow-hidden">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-1.5">Switch Child</p>
                      {childrenList.map(c => (
                        <button
                          key={c.id}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3",
                            c.id === selectedChild.id
                              ? "bg-primary/8 text-primary font-medium"
                              : "hover:bg-muted/50 text-foreground"
                          )}
                          onClick={() => handleChildSwitch(c)}
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                            c.id === selectedChild.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground">Class {c.className}-{c.section}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-5 md:p-6 lg:p-8 max-w-5xl mx-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-bar border-t border-border/60 safe-bottom">
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map(item => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all relative tap-target",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                onClick={() => navigate(item.path)}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-7 rounded-full transition-colors",
                  active && "bg-primary/12"
                )}>
                  <item.icon className={cn("h-[18px] w-[18px]", active && "stroke-[2.5]")} />
                </div>
                <span className={cn("text-[10px]", active ? "font-semibold" : "font-medium")}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ParentLayout;
