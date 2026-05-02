import React from 'react';
import { Target, TrendingUp, AlertTriangle, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import TeacherAspectShell from '@/components/insights/TeacherAspectShell';
import { useTeacherMetrics } from '@/hooks/useTeacherMetrics';

const TeacherOutcomesPage = () => {
  const { selectedExamType } = useAuth();
  const { teacherMetrics } = useTeacherMetrics(selectedExamType);

  const totalStudents = teacherMetrics.reduce((s, t) => s + t.totalStudents, 0);
  const totalImproving = teacherMetrics.reduce((s, t) => s + t.improvingCount, 0);
  const totalNeedsSupport = teacherMetrics.reduce((s, t) => s + t.needsSupportCount, 0);
  const totalTopPerformers = teacherMetrics.reduce((s, t) => s + t.topPerformerCount, 0);
  const avgPassRate = teacherMetrics.length > 0
    ? Math.round(teacherMetrics.reduce((s, t) => s + t.passRate, 0) / teacherMetrics.length)
    : 0;

  const sortedByImpact = [...teacherMetrics].sort((a, b) => b.improvingCount - a.improvingCount);
  const needsSupportTeachers = teacherMetrics.filter(t => t.needsSupportCount > 0).sort((a, b) => b.needsSupportCount - a.needsSupportCount);

  return (
    <TeacherAspectShell title="Student Outcomes" subtitle="Pass rates, improvement & support needs across teachers">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pass Rate', value: `${avgPassRate}%`, sub: 'School-wide average', icon: Target, color: avgPassRate >= 80 ? 'success' : avgPassRate >= 60 ? 'warning' : 'destructive' },
          { label: 'Improving', value: String(totalImproving), sub: `of ${totalStudents} students`, icon: TrendingUp, color: 'success' },
          { label: 'Top Performers', value: String(totalTopPerformers), sub: 'Scoring 80%+', icon: Award, color: 'primary' },
          { label: 'Need Support', value: String(totalNeedsSupport), sub: 'Scoring below 55%', icon: AlertTriangle, color: 'destructive' },
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

      {/* Most impactful teachers */}
      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-success" />
            <h3 className="font-bold text-sm text-foreground">Most students improving under</h3>
          </div>
          <div className="space-y-2">
            {sortedByImpact.slice(0, 5).map(tm => (
              <div key={tm.teacher.id} className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/10">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-xs font-bold text-success shrink-0">
                  {tm.improvingCount}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tm.teacher.name}</p>
                  <p className="text-[11px] text-muted-foreground">{tm.subjectsLabel} · {tm.passRate}% pass rate</p>
                </div>
                <span className="text-[11px] text-success font-semibold shrink-0">improving</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teachers with most students needing support */}
      {needsSupportTeachers.length > 0 && (
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="font-bold text-sm text-foreground">Most students needing support under</h3>
            </div>
            <div className="space-y-2">
              {needsSupportTeachers.slice(0, 5).map(tm => (
                <div key={tm.teacher.id} className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-xs font-bold text-destructive shrink-0">
                    {tm.needsSupportCount}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tm.teacher.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {tm.subjectsLabel}{tm.weakAreas.length > 0 ? ` · weak: ${tm.weakAreas.join(', ')}` : ''}
                    </p>
                  </div>
                  <span className="text-[11px] text-destructive font-semibold shrink-0">need help</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </TeacherAspectShell>
  );
};

export default TeacherOutcomesPage;
