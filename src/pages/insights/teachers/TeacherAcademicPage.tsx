import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, AlertTriangle, ChevronRight, BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import TeacherAspectShell from '@/components/insights/TeacherAspectShell';
import { useTeacherMetrics } from '@/hooks/useTeacherMetrics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TeacherAcademicPage = () => {
  const navigate = useNavigate();
  const { selectedExamType } = useAuth();
  const { teacherMetrics, currentSections } = useTeacherMetrics(selectedExamType);
  const [tab, setTab] = useState<'ranking' | 'subjects'>('ranking');

  const sorted = [...teacherMetrics].sort((a, b) => b.avgScore - a.avgScore);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const avg = sorted.length > 0 ? Math.round(sorted.reduce((s, t) => s + t.avgScore, 0) / sorted.length) : 0;

  const subjectComparison = useMemo(() => {
    const subjectMap: Record<string, { teacherId: string; teacherName: string; avgScore: number }[]> = {};
    teacherMetrics.forEach(tm => {
      const subjectScores: Record<string, number[]> = {};
      tm.teacher.assignments.forEach(a => {
        const cs = currentSections.find(s => s.classNum === a.classNum && s.section === a.section);
        const sub = cs?.subjects.find(s => s.id === a.subjectId);
        if (sub) {
          if (!subjectScores[a.subjectName]) subjectScores[a.subjectName] = [];
          subjectScores[a.subjectName].push(sub.avgScore);
        }
      });
      Object.entries(subjectScores).forEach(([subName, scores]) => {
        const aScore = Math.round(scores.reduce((x, y) => x + y, 0) / scores.length);
        if (!subjectMap[subName]) subjectMap[subName] = [];
        subjectMap[subName].push({ teacherId: tm.teacher.id, teacherName: tm.teacher.name, avgScore: aScore });
      });
    });
    return Object.entries(subjectMap)
      .map(([subject, tms]) => ({ subject, teachers: tms.sort((a, b) => b.avgScore - a.avgScore) }))
      .sort((a, b) => a.subject.localeCompare(b.subject));
  }, [teacherMetrics, currentSections]);

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-destructive" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <TeacherAspectShell title="Academic Performance" subtitle="How each teacher's students are scoring">
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">School-wide Avg</p>
            <p className={cn('text-3xl font-extrabold mt-1', avg >= 70 ? 'text-success' : avg >= 55 ? 'text-primary' : 'text-warning')}>
              {avg}<span className="text-base font-normal text-muted-foreground">%</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Across {teacherMetrics.length} teachers</p>
          </CardContent>
        </Card>
        <Card className="border-0 card-shadow rounded-2xl border-l-[3px] border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-success" />
              <p className="text-[10px] font-bold text-success uppercase tracking-widest">Top Teacher</p>
            </div>
            <p className="text-base font-bold text-foreground">{top?.teacher.name}</p>
            <p className="text-[11px] text-muted-foreground">{top?.subjectsLabel} · {top?.avgScore}% avg</p>
          </CardContent>
        </Card>
        <Card className="border-0 card-shadow rounded-2xl border-l-[3px] border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Needs Support</p>
            </div>
            <p className="text-base font-bold text-foreground">{bottom?.teacher.name}</p>
            <p className="text-[11px] text-muted-foreground">{bottom?.subjectsLabel} · {bottom?.avgScore}% avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart */}
      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-5">
          <h3 className="font-bold text-sm text-foreground mb-3">Teacher Average Scores</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sorted.map(t => ({ name: t.teacher.name.split(' ')[0], score: t.avgScore }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid hsl(var(--border))' }} formatter={(v: number) => [`${v}%`, 'Avg Score']} />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['ranking', 'subjects'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-all',
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
            )}
          >
            {t === 'ranking' ? 'Teacher Ranking' : 'Subject-wise Comparison'}
          </button>
        ))}
      </div>

      {tab === 'ranking' && (
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-5 space-y-2">
            {sorted.map((tm, idx) => (
              <div key={tm.teacher.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-6">#{idx + 1}</span>
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0',
                  tm.avgScore >= 70 ? 'bg-success/10 text-success' : tm.avgScore >= 55 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                )}>
                  {tm.avgScore}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tm.teacher.name}</p>
                  <p className="text-[11px] text-muted-foreground">{tm.subjectsLabel} · {tm.classesHandled}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium">
                  <TrendIcon trend={tm.trend} />
                  <span className={cn(
                    tm.trend === 'up' ? 'text-success' : tm.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {tm.change > 0 ? '+' : ''}{tm.change}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'subjects' && (
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-5 space-y-4">
            {subjectComparison.map(sc => (
              <div key={sc.subject}>
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-bold text-foreground">{sc.subject}</p>
                </div>
                <div className="space-y-1.5">
                  {sc.teachers.map((tm, idx) => {
                    const isTop = idx === 0;
                    const barColor = tm.avgScore >= 70 ? 'bg-success' : tm.avgScore >= 55 ? 'bg-warning' : 'bg-destructive';
                    return (
                      <div key={tm.teacherId} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-muted/20">
                        {isTop ? <Award className="w-3.5 h-3.5 text-success shrink-0" /> : <div className="w-3.5" />}
                        <span className="text-xs font-medium text-foreground flex-1 truncate">{tm.teacherName}</span>
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', barColor)} style={{ width: `${tm.avgScore}%` }} />
                        </div>
                        <span className={cn(
                          'text-xs font-bold w-10 text-right',
                          tm.avgScore >= 70 ? 'text-success' : tm.avgScore >= 55 ? 'text-warning' : 'text-destructive'
                        )}>{tm.avgScore}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </TeacherAspectShell>
  );
};

export default TeacherAcademicPage;
