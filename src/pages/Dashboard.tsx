import React, { useState } from 'react';
import { Upload, FileStack, ClipboardCheck, CheckSquare, FileText, Table2, BarChart3, Clock, CheckCircle2, Loader2, Lock, LayoutDashboard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';

const examOptions = [
  { id: 'fa1', name: 'FA1 (Formative Assessment 1)' },
  { id: 'fa2', name: 'FA2 (Formative Assessment 2)' },
  { id: 'sa1', name: 'SA1 (Summative Assessment 1)' },
  { id: 'annual', name: 'Annual Exam' },
];

const stages = [
  { icon: Upload, title: 'Papers Uploaded', count: 18, total: 24, label: 'class PDFs uploaded', duration: '1 day', tone: 'info' },
  { icon: FileStack, title: 'Answer Sheets Assigned', count: 3720, total: 4200, label: 'answer sheets', duration: '4 hrs', tone: 'teal' },
  { icon: ClipboardCheck, title: 'Teacher Review', count: 3205, total: 3720, label: 'reviewed', duration: '3 days', tone: 'success' },
  { icon: FileText, title: 'Student Reports Generated', count: 20, total: 24, label: 'classes done', duration: '2 hrs', tone: 'sky' },
  { icon: CheckSquare, title: 'Marks Finalized', count: 2850, total: 3205, label: 'finalized', duration: '1 day', tone: 'success' },
  { icon: Table2, title: 'Grade Sheet / SATs Generated', count: 12, total: 24, label: 'classes done', duration: '—', tone: 'warning' },
  { icon: BarChart3, title: 'Insights Generated', count: 0, total: 24, label: 'classes done', duration: '—', tone: 'purple' },
];

type Tone = 'info' | 'teal' | 'success' | 'sky' | 'warning' | 'purple';

const toneStyles: Record<Tone, { bg: string; icon: string; bar: string }> = {
  info:    { bg: 'bg-info-light',    icon: 'text-info',    bar: 'bg-info' },
  teal:    { bg: 'bg-teal-light',    icon: 'text-teal',    bar: 'bg-teal' },
  success: { bg: 'bg-success-light', icon: 'text-success', bar: 'bg-success' },
  sky:     { bg: 'bg-sky-light',     icon: 'text-sky',     bar: 'bg-sky' },
  warning: { bg: 'bg-warning-light', icon: 'text-warning', bar: 'bg-warning' },
  purple:  { bg: 'bg-purple-light',  icon: 'text-purple',  bar: 'bg-purple' },
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'complete') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-success-light text-success border border-success/20">
        <CheckCircle2 className="w-3 h-3" /> Complete
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-warning-light text-warning border border-warning/20">
        <Loader2 className="w-3 h-3 animate-spin" /> In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
      <Lock className="w-3 h-3" /> Pending
    </span>
  );
};

const Dashboard = () => {
  const [selectedExam, setSelectedExam] = useState('fa1');

  // Overall progress
  const totalPapers = stages[0].total;
  const insightsReady = stages[6].count;
  const overallPct = Math.round((stages.reduce((sum, s) => sum + (s.count / s.total), 0) / stages.length) * 100);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Track progress from upload to insights"
        icon={LayoutDashboard}
        actions={
          <div className="w-56">
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="bg-card text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                {examOptions.map(exam => (
                  <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Stage Cards */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const pct = stage.total === 0 ? 0 : Math.round((stage.count / stage.total) * 100);
          const prevComplete = idx === 0 ? true : Math.round((stages[idx - 1].count / stages[idx - 1].total) * 100) === 100;
          const isUnlocked = idx === 0 || prevComplete;
          const status = pct === 100 ? 'complete' : (pct > 0 && isUnlocked) ? 'in-progress' : 'pending';
          const isPending = !isUnlocked;
          const isActive = isUnlocked && pct < 100;
          const tone = toneStyles[stage.tone as Tone];

          return (
            <div
              key={stage.title}
              className={cn(
                'rounded-xl border border-border bg-card p-4 card-shadow transition-all',
                isPending && 'opacity-40 pointer-events-none',
                isActive && 'ring-2 ring-primary/25 border-primary/40 card-shadow-elevated'
              )}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', tone.bg)}>
                  <Icon className={cn('w-[18px] h-[18px]', tone.icon)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate">{stage.title}</span>
                      <StatusBadge status={status} />
                    </div>
                    <span className="text-sm font-bold tabular-nums text-foreground shrink-0">{pct}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', tone.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{stage.count.toLocaleString()}</span>
                      {' / '}{stage.total.toLocaleString()} {stage.label}
                    </span>
                    {stage.duration !== '—' && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {stage.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
