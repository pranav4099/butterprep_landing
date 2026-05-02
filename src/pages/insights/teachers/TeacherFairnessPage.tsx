import React, { useState } from 'react';
import { Scale, ShieldCheck, AlertTriangle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import TeacherAspectShell from '@/components/insights/TeacherAspectShell';
import { useTeacherMetrics } from '@/hooks/useTeacherMetrics';

const TeacherFairnessPage = () => {
  const { selectedExamType } = useAuth();
  const { gradingFairness } = useTeacherMetrics(selectedExamType);
  const [filter, setFilter] = useState<'all' | 'fair' | 'minor' | 'review'>('all');

  const sevConfig = {
    fair: { label: 'Fair', color: 'success', icon: ShieldCheck },
    minor: { label: 'Minor Variance', color: 'warning', icon: Scale },
    review: { label: 'Needs Review', color: 'destructive', icon: AlertTriangle },
  } as const;

  const filtered = filter === 'all' ? gradingFairness.rows : gradingFairness.rows.filter(r => r.severity === filter);

  return (
    <TeacherAspectShell title="Grading Fairness" subtitle="How teacher-given marks compare to AI-suggested marks">
      {/* AI explainer */}
      <Card className="border-0 card-shadow rounded-2xl bg-[hsl(var(--purple))]/5 border-l-[3px] border-l-[hsl(var(--purple))]">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--purple))]/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[hsl(var(--purple))]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--purple))] uppercase tracking-widest mb-1">How this works</p>
            <p className="text-sm text-foreground leading-relaxed">
              ButterPrep AI re-evaluates every paper independently. We compare each teacher's average to the AI's average. Large gaps may indicate consistently lenient or strict grading patterns worth reviewing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary tiles — clickable filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'all' as const, label: 'All Teachers', value: String(gradingFairness.rows.length), sub: `Avg gap ${gradingFairness.avgAbsGap}`, color: 'primary' },
          { key: 'fair' as const, label: 'Fair', value: String(gradingFairness.fairCount), sub: '≤3 marks gap', color: 'success' },
          { key: 'minor' as const, label: 'Minor', value: String(gradingFairness.minorCount), sub: '4–7 marks gap', color: 'warning' },
          { key: 'review' as const, label: 'Needs Review', value: String(gradingFairness.reviewCount), sub: '>7 marks gap', color: 'destructive' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={cn(
              'p-3.5 rounded-xl text-center border transition-all',
              `bg-${s.color}/5 border-${s.color}/10 hover:bg-${s.color}/10`,
              filter === s.key && 'ring-2 ring-primary/30 shadow-sm'
            )}
          >
            <p className={cn('text-2xl font-bold leading-none', `text-${s.color}`)}>{s.value}</p>
            <p className="text-xs font-semibold text-foreground mt-1.5">{s.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
          </button>
        ))}
      </div>

      {/* Teacher list */}
      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-5">
          <h3 className="font-bold text-sm text-foreground mb-3">
            {filter === 'all' ? 'All Teachers' : `${sevConfig[filter as keyof typeof sevConfig]?.label} Teachers`}
            <span className="text-muted-foreground font-normal ml-2">({filtered.length})</span>
          </h3>
          <div className="space-y-2">
            {filtered.map(r => {
              const cfg = sevConfig[r.severity];
              const dirLabel = r.direction === 'lenient' ? 'Lenient' : r.direction === 'strict' ? 'Strict' : 'Aligned';
              const dirColor = r.direction === 'lenient' ? 'warning' : r.direction === 'strict' ? 'primary' : 'success';
              return (
                <div
                  key={r.teacher.id}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-xl border bg-card',
                    r.severity === 'review' ? 'border-destructive/30' : 'border-border/60'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', `bg-${cfg.color}/10`)}>
                    <cfg.icon className={cn('w-4 h-4', `text-${cfg.color}`)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{r.teacher.name}</p>
                      <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider', `bg-${dirColor}/10 text-${dirColor}`)}>
                        {dirLabel}
                      </span>
                      <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider', `bg-${cfg.color}/10 text-${cfg.color}`)}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {r.subjectsLabel} · {r.flaggedPct}% papers flagged for variance
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-foreground">{r.teacherAvg}</span>
                      <span className="text-[10px] text-muted-foreground">vs</span>
                      <span className="text-xs font-bold text-[hsl(var(--purple))]">{r.aiAvg}</span>
                    </div>
                    <p className={cn('text-[10px] font-bold mt-0.5', `text-${cfg.color}`)}>
                      {r.gap > 0 ? '+' : ''}{r.gap} mark gap
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </TeacherAspectShell>
  );
};

export default TeacherFairnessPage;
