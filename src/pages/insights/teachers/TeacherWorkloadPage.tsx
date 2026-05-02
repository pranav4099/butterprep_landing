import React from 'react';
import { ClipboardCheck, Clock, BookOpen, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import TeacherAspectShell from '@/components/insights/TeacherAspectShell';
import { useTeacherMetrics } from '@/hooks/useTeacherMetrics';

const TeacherWorkloadPage = () => {
  const { selectedExamType } = useAuth();
  const { teacherMetrics } = useTeacherMetrics(selectedExamType);

  const totalPapers = teacherMetrics.reduce((s, t) => s + t.papersTotal, 0);
  const reviewedPapers = teacherMetrics.reduce((s, t) => s + t.papersReviewed, 0);
  const reviewRate = totalPapers > 0 ? Math.round((reviewedPapers / totalPapers) * 100) : 0;
  const avgCoverage = teacherMetrics.length > 0
    ? Math.round(teacherMetrics.reduce((s, t) => s + t.syllabusCoverage, 0) / teacherMetrics.length)
    : 0;
  const avgTurnaround = teacherMetrics.length > 0
    ? (teacherMetrics.reduce((s, t) => s + t.avgTurnaroundDays, 0) / teacherMetrics.length).toFixed(1)
    : '0';
  const totalClasses = teacherMetrics.reduce((s, t) => s + t.classCount, 0);

  const sorted = [...teacherMetrics].sort((a, b) => b.classCount - a.classCount);

  return (
    <TeacherAspectShell title="Workload & Coverage" subtitle="Classes handled, papers reviewed, syllabus completion">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Review Rate', value: `${reviewRate}%`, sub: `${reviewedPapers}/${totalPapers} papers`, icon: ClipboardCheck, color: 'primary' },
          { label: 'Syllabus', value: `${avgCoverage}%`, sub: 'Average coverage', icon: BookOpen, color: 'success' },
          { label: 'Turnaround', value: `${avgTurnaround}d`, sub: 'Avg days to grade', icon: Clock, color: 'warning' },
          { label: 'Total Classes', value: String(totalClasses), sub: `Across ${teacherMetrics.length} teachers`, icon: Layers, color: 'primary' },
        ].map(s => (
          <Card key={s.label} className="border-0 card-shadow rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', `bg-${s.color}/10`)}>
                  <s.icon className={cn('w-4 h-4', `text-${s.color}`)} />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
              </div>
              <p className={cn('text-2xl font-bold leading-none', `text-${s.color}`)}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-teacher breakdown */}
      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-5">
          <h3 className="font-bold text-sm text-foreground mb-3">Per-teacher workload</h3>
          <div className="space-y-2.5">
            {sorted.map(tm => {
              const reviewPct = tm.papersTotal > 0 ? Math.round((tm.papersReviewed / tm.papersTotal) * 100) : 0;
              const reviewColor = reviewPct >= 90 ? 'success' : reviewPct >= 70 ? 'warning' : 'destructive';
              const covColor = tm.syllabusCoverage >= 85 ? 'success' : tm.syllabusCoverage >= 70 ? 'warning' : 'destructive';
              return (
                <div key={tm.teacher.id} className="p-3.5 rounded-xl bg-muted/20 border border-border/40">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tm.teacher.name}</p>
                      <p className="text-[11px] text-muted-foreground">{tm.subjectsLabel} · {tm.classesHandled}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{tm.avgTurnaroundDays}d turnaround</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground font-medium">Papers reviewed</span>
                        <span className={cn('font-bold', `text-${reviewColor}`)}>{tm.papersReviewed}/{tm.papersTotal}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full', `bg-${reviewColor}`)} style={{ width: `${reviewPct}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground font-medium">Syllabus coverage</span>
                        <span className={cn('font-bold', `text-${covColor}`)}>{tm.syllabusCoverage}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full', `bg-${covColor}`)} style={{ width: `${tm.syllabusCoverage}%` }} />
                      </div>
                    </div>
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

export default TeacherWorkloadPage;
