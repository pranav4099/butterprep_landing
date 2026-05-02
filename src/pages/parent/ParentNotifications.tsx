import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useParent } from '@/contexts/ParentContext';
import { cn } from '@/lib/utils';
import { Bell, FileText, MessageSquare, CheckCheck, TrendingUp } from 'lucide-react';

const iconMap: Record<string, { icon: typeof Bell; emoji: string }> = {
  result: { icon: TrendingUp, emoji: '📢' },
  answer_sheet: { icon: FileText, emoji: '📄' },
  feedback: { icon: MessageSquare, emoji: '💬' },
};

const ParentNotifications = () => {
  const { getNotifications, markNotificationRead } = useParent();
  const notifications = getNotifications();
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  const renderNotification = (n: typeof notifications[0]) => {
    const config = iconMap[n.type] || { icon: Bell, emoji: '🔔' };
    const timeAgo = getTimeAgo(n.date);

    return (
      <Card
        key={n.id}
        className={cn(
          "border-0 card-shadow rounded-xl cursor-pointer transition-all tap-target",
          !n.read && "ring-1 ring-primary/15 bg-primary/[0.02]"
        )}
        onClick={() => markNotificationRead(n.id)}
      >
        <CardContent className="p-4 flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg",
            !n.read ? "bg-primary/8" : "bg-muted"
          )}>
            {config.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn("text-sm leading-tight", !n.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
                {n.title}
              </p>
              {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-medium">{timeAgo}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Stay updated on your child's progress</p>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <CheckCheck className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <p className="text-foreground font-medium">All caught up!</p>
          <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
        </div>
      ) : (
        <div className="space-y-5">
          {unread.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-primary uppercase tracking-widest px-1">
                New ({unread.length})
              </p>
              {unread.map(renderNotification)}
            </div>
          )}
          {read.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                Earlier
              </p>
              {read.map(renderNotification)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default ParentNotifications;
