import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useParent } from '@/contexts/ParentContext';
import { cn } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, Minus, Lightbulb,
  CheckCircle2, ChevronRight, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Sparkles, BookOpen, Target, Flame, Star
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Line, ComposedChart } from 'recharts';
import { Users } from 'lucide-react';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const {
    selectedChild, getStrengths, getWeaknesses,
    getProgress, getActions, getExamResults,
    getOverallAverage, getStrongSubjects, getNeedsAttentionSubjects,
    getSubjectInsight,
  } = useParent();

  if (!selectedChild) return null;

  const allResults = getExamResults();
  const overallAvg = getOverallAverage();
  const strongSubjects = getStrongSubjects();
  const needsAttention = getNeedsAttentionSubjects();
  const weaknesses = getWeaknesses();
  const actions = getActions();
  const firstName = selectedChild.name.split(' ')[0];

  const classAvgOverall = Math.round(
    allResults.reduce((s, r) => s + (r.classAverage / r.total) * 100, 0) / (allResults.length || 1)
  );
  const diffFromClassAvg = overallAvg - classAvgOverall;
  const percentile = diffFromClassAvg > 10 ? 'Top 10%' : diffFromClassAvg > 5 ? 'Top 20%' : diffFromClassAvg > 0 ? 'Top 40%' : 'Average';

  const examTypeOrder = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];
  const overallByExamType = examTypeOrder.map(et => {
    const exams = allResults.filter(r => r.examType === et);
    const avg = exams.length > 0 ? Math.round(exams.reduce((s, r) => s + (r.score / r.total) * 100, 0) / exams.length) : null;
    const classAvg = exams.length > 0 ? Math.round(exams.reduce((s, r) => s + (r.classAverage / r.total) * 100, 0) / exams.length) : null;
    return { name: et, score: avg, classAvg };
  });
  const hasAnyExamData = overallByExamType.some(d => d.score !== null);

  const withScores = overallByExamType.filter(d => d.score !== null);
  const isImproving = withScores.length >= 2 &&
    withScores[withScores.length - 1].score! > withScores[withScores.length - 2].score!;
  const isDeclining = withScores.length >= 2 &&
    withScores[withScores.length - 1].score! < withScores[withScores.length - 2].score!;

  const trendLabel = isImproving ? 'Improving' : isDeclining ? 'Needs Attention' : 'Stable';
  const TrendIcon = isImproving ? TrendingUp : isDeclining ? TrendingDown : Minus;

  const aiInsight = (() => {
    const strong = strongSubjects.slice(0, 2).join(' and ');
    const weak = weaknesses.length > 0 ? weaknesses[0].area : null;
    if (strong && weak) return `${firstName} is strong in ${strong}, but consistently loses marks in ${weak.toLowerCase()}.`;
    if (strong) return `${firstName} is performing exceptionally well in ${strong}. Keep up the momentum!`;
    return `${firstName} is making steady progress across all subjects.`;
  })();

  const biggestImprovement = (() => {
    const subjects = [...new Set(allResults.map(r => r.subject))];
    let best = { subject: '', diff: 0 };
    for (const subj of subjects) {
      const exams = allResults.filter(r => r.subject === subj).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (exams.length >= 2) {
        const last = (exams[exams.length - 1].score / exams[exams.length - 1].total) * 100;
        const prev = (exams[exams.length - 2].score / exams[exams.length - 2].total) * 100;
        const diff = Math.round(last - prev);
        if (diff > best.diff) best = { subject: subj, diff };
      }
    }
    return best.diff > 0 ? best : null;
  })();

  const biggestConcern = weaknesses.length > 0 ? weaknesses[0] : null;

  const subjects = [...new Set(allResults.map(r => r.subject))];
  const subjectAvgs = subjects.map(subject => {
    const subjectResults = allResults.filter(r => r.subject === subject);
    const avg = Math.round(subjectResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / subjectResults.length);
    const classAvg = Math.round(subjectResults.reduce((s, r) => s + (r.classAverage / r.total) * 100, 0) / subjectResults.length);
    const diff = avg - classAvg;
    return { subject, avg, classAvg, diff };
  }).sort((a, b) => b.avg - a.avg);

  const totalExams = [...new Set(allResults.map(r => r.examType))].length;

  // Class distribution: average across all results
  const avgTotalStudents = allResults.length > 0 ? Math.round(allResults.reduce((s, r) => s + r.totalStudents, 0) / allResults.length) : 0;
  const avgStudentsAboveAvg = allResults.length > 0 ? Math.round(allResults.reduce((s, r) => s + r.studentsAboveAvg, 0) / allResults.length) : 0;
  const avgStudentsBelowAvg = avgTotalStudents - avgStudentsAboveAvg;

  return (
    <div className="space-y-4">
      {/* ───── 1. HERO PERFORMANCE CARD ───── */}
      <Card className="border-0 card-shadow-elevated overflow-hidden relative rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-success/4" />
        <CardContent className="p-5 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide">{selectedChild.schoolName}</p>
              <h1 className="text-lg font-bold text-foreground mt-0.5 tracking-tight">{selectedChild.name}</h1>
              <p className="text-xs text-muted-foreground">Class {selectedChild.className}-{selectedChild.section}</p>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-4xl font-extrabold leading-none tracking-tight",
                overallAvg >= 75 ? "text-success" : overallAvg >= 60 ? "text-primary" : "text-warning"
              )}>
                {overallAvg}<span className="text-lg font-normal text-muted-foreground">%</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Overall Average</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full",
              diffFromClassAvg >= 0 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            )}>
              {diffFromClassAvg >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {diffFromClassAvg >= 0 ? 'Above average' : 'Below average'}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full",
              isImproving ? "bg-success/10 text-success" : isDeclining ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
            )}>
              <TrendIcon className="w-3 h-3" /> {trendLabel}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ───── 2. AI INSIGHT ───── */}
      <Card className="border-0 card-shadow rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[hsl(var(--purple))]/5 to-[hsl(var(--purple))]/2">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--purple))]/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[hsl(var(--purple))]" />
            </div>
            <div className="pt-0.5">
              <p className="text-[10px] font-bold text-[hsl(var(--purple))] uppercase tracking-widest mb-1">AI Insight</p>
              <p className="text-[13px] text-foreground leading-relaxed">{aiInsight}</p>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* ───── 3. KEY STATS ───── */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { icon: BookOpen, value: totalExams, label: 'Exams', color: 'primary', path: '/parent/exams' },
          { icon: CheckCircle2, value: strongSubjects.length, label: 'Strong', color: 'success', path: '/parent/subjects' },
          { icon: AlertTriangle, value: needsAttention.length, label: 'Needs Help', color: 'warning', path: '/parent/subjects' },
        ].map(({ icon: Icon, value, label, color, path }) => (
          <Card
            key={label}
            className="border-0 card-shadow rounded-xl cursor-pointer tap-target"
            onClick={() => navigate(path)}
          >
            <CardContent className="p-3.5 text-center">
              <Icon className={cn("w-5 h-5 mx-auto mb-1.5", `text-${color}`)} />
              <p className={cn("text-2xl font-bold tracking-tight", `text-${color}`)}>{value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* ───── 5. PERFORMANCE TREND ───── */}
      {hasAnyExamData && (
        <Card className="border-0 card-shadow rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Performance Trend
              </h2>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium",
                isImproving ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                {isImproving ? 'Improving' : 'Stable'}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-3 h-0.5 rounded-full bg-primary inline-block" /> {firstName}'s Score
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-3 h-0.5 rounded-full bg-muted-foreground/40 inline-block border-dashed" style={{ borderTop: '1.5px dashed hsl(var(--muted-foreground))', height: 0, width: 12 }} /> Class Avg
              </span>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={overallByExamType}>
                  <defs>
                    <linearGradient id="dashTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    formatter={(v: number, name: string) => [`${v}%`, name === 'score' ? firstName : 'Class Avg']}
                    contentStyle={{
                      fontSize: 12, borderRadius: 10, border: 'none',
                      boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
                      background: 'hsl(var(--card))'
                    }}
                  />
                  <Area
                    type="monotone" dataKey="score" stroke="hsl(var(--primary))"
                    fill="url(#dashTrend)" strokeWidth={2.5} connectNulls
                    dot={({ cx, cy, payload }) => payload.score !== null ? (
                      <circle key={payload.name} cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth={2} />
                    ) : <g key={payload.name} />}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  />
                  <Line
                    type="monotone" dataKey="classAvg" stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1.5} strokeDasharray="4 4" connectNulls
                    dot={false} activeDot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

          </CardContent>
        </Card>
      )}

      {/* ───── 6. EXAMS ───── */}
      <Card className="border-0 card-shadow rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Exams</h2>
            <button className="text-xs text-primary font-medium flex items-center gap-0.5 tap-target" onClick={() => navigate('/parent/exams')}>
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {examTypeOrder.map(et => {
              const exams = allResults.filter(r => r.examType === et);
              if (exams.length === 0) return (
                <div key={et} className="flex items-center gap-3 py-2.5 px-2 -mx-2 opacity-40">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground">{et}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              );
              const avg = Math.round(exams.reduce((s, r) => s + (r.score / r.total) * 100, 0) / exams.length);
              const classAvg = Math.round(exams.reduce((s, r) => s + (r.classAverage / r.total) * 100, 0) / exams.length);
              const diff = avg - classAvg;
              const isSA = et.startsWith('SA');
              const totalObtained = exams.reduce((s, r) => s + r.score, 0);
              const totalMarks = exams.reduce((s, r) => s + r.total, 0);
              return (
                <button
                  key={et}
                  className="w-full flex items-center gap-3 py-3 text-left hover:bg-muted/40 rounded-xl transition-colors px-3 -mx-2 tap-target"
                  onClick={() => navigate(`/parent/exam/${et}`)}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold",
                    avg >= 75 ? "bg-success/10 text-success" : avg >= 60 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                  )}>
                    {avg}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{et}</p>
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                        diff >= 0 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      )}>
                        {diff >= 0 ? 'Above average' : 'Below average'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {totalObtained}/{totalMarks} marks · {exams.length} subjects
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>


      <p className="text-[10px] text-center text-muted-foreground/60 pb-2">
        Teachers remain in full control of grading. AI insights are assistive.
      </p>
    </div>
  );
};

export default ParentDashboard;
