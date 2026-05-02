import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, BarChart3, Users, BookOpen, GraduationCap } from 'lucide-react';
import { buildClassSections, getClassSubjectData } from '@/data/teacherInsightsData';
import { teachers } from '@/data/teacherData';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend,
} from 'recharts';

const EXAM_SEQUENCE = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];
const SUBJECT_NAMES: Record<string, string> = {
  math: 'Mathematics', science: 'Science', english: 'English',
  hindi: 'Hindi', kannada: 'Kannada', social: 'Social Science',
};
const SUBJECT_IDS = ['math', 'science', 'english', 'hindi', 'kannada', 'social'];
const SUBJECT_COLORS: Record<string, string> = {
  math: 'hsl(var(--primary))',
  science: '#10b981',
  english: '#f59e0b',
  hindi: '#ef4444',
  kannada: '#8b5cf6',
  social: '#06b6d4',
};

type TrendStatus = 'improving' | 'declining' | 'stable';

function getTrendStatus(values: number[]): { status: TrendStatus; change: number } {
  if (values.length < 2) return { status: 'stable', change: 0 };
  const recent = values.slice(-3);
  const change = recent[recent.length - 1] - recent[0];
  if (change > 2) return { status: 'improving', change };
  if (change < -2) return { status: 'declining', change };
  return { status: 'stable', change };
}

function StatusBadge({ status, change }: { status: TrendStatus; change: number }) {
  const config = {
    improving: { icon: TrendingUp, bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Improving' },
    declining: { icon: TrendingDown, bg: 'bg-red-500/10', text: 'text-red-500', label: 'Declining' },
    stable: { icon: Minus, bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Stable' },
  }[status];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold", config.bg, config.text)}>
      <Icon className="w-3 h-3" />
      {config.label} {change !== 0 && `(${change > 0 ? '+' : ''}${change}%)`}
    </span>
  );
}

const TrendsDashboard = () => {
  // ═══ 1. SCHOOL PERFORMANCE TREND ═══
  const schoolTrend = useMemo(() => {
    return EXAM_SEQUENCE.map(exam => {
      const sections = buildClassSections(exam);
      const avg = Math.round(sections.reduce((s, cs) => s + cs.avgScore, 0) / sections.length);
      return { exam, avg };
    });
  }, []);

  const schoolValues = schoolTrend.map(d => d.avg);
  const schoolStatus = getTrendStatus(schoolValues);

  // ═══ 2. CLASS-WISE TRENDS ═══
  const classTrends = useMemo(() => {
    const classData: Record<number, { exam: string; avg: number }[]> = {};
    for (let c = 1; c <= 10; c++) classData[c] = [];

    EXAM_SEQUENCE.forEach(exam => {
      const sections = buildClassSections(exam);
      for (let c = 1; c <= 10; c++) {
        const classSecs = sections.filter(s => s.classNum === c);
        const avg = Math.round(classSecs.reduce((s, cs) => s + cs.avgScore, 0) / classSecs.length);
        classData[c].push({ exam, avg });
      }
    });

    return Object.entries(classData).map(([classNum, data]) => {
      const values = data.map(d => d.avg);
      const trend = getTrendStatus(values);
      return { classNum: Number(classNum), data, ...trend };
    });
  }, []);

  const bestImproving = [...classTrends].sort((a, b) => b.change - a.change)[0];
  const mostDeclining = [...classTrends].sort((a, b) => a.change - b.change)[0];

  const classChartData = useMemo(() => {
    return EXAM_SEQUENCE.map((exam, i) => {
      const point: Record<string, string | number> = { exam };
      classTrends.forEach(ct => {
        point[`Class ${ct.classNum}`] = ct.data[i]?.avg || 0;
      });
      return point;
    });
  }, [classTrends]);

  // ═══ 3. SUBJECT-WISE TRENDS ═══
  const subjectTrends = useMemo(() => {
    return SUBJECT_IDS.map(subId => {
      const data = EXAM_SEQUENCE.map(exam => {
        const sections = buildClassSections(exam);
        let totalScore = 0, count = 0;
        sections.forEach(cs => {
          const sub = cs.subjects.find(s => s.id === subId);
          if (sub) { totalScore += sub.avgScore; count++; }
        });
        return { exam, avg: count > 0 ? Math.round(totalScore / count) : 0 };
      });
      const values = data.map(d => d.avg);
      const trend = getTrendStatus(values);
      return { id: subId, name: SUBJECT_NAMES[subId], data, ...trend };
    });
  }, []);

  const subjectChartData = useMemo(() => {
    return EXAM_SEQUENCE.map((exam, i) => {
      const point: Record<string, string | number> = { exam };
      subjectTrends.forEach(st => {
        point[st.name] = st.data[i]?.avg || 0;
      });
      return point;
    });
  }, [subjectTrends]);

  const decliningSubjects = subjectTrends.filter(s => s.status === 'declining');

  // ═══ 4. STUDENT BUCKET TRENDS ═══
  const bucketTrends = useMemo(() => {
    return EXAM_SEQUENCE.map(exam => {
      const sections = buildClassSections(exam);
      let strong = 0, average = 0, needsSupport = 0, total = 0;
      sections.forEach(cs => {
        cs.subjects.forEach(sub => {
          const data = getClassSubjectData(cs, sub, exam);
          data.students.forEach(st => {
            total++;
            if (st.status === 'strong') strong++;
            else if (st.status === 'average') average++;
            else needsSupport++;
          });
        });
      });
      return {
        exam,
        Strong: total > 0 ? Math.round((strong / total) * 100) : 0,
        Average: total > 0 ? Math.round((average / total) * 100) : 0,
        'Needs Support': total > 0 ? Math.round((needsSupport / total) * 100) : 0,
      };
    });
  }, []);

  const latestBucket = bucketTrends[bucketTrends.length - 1];
  const firstBucket = bucketTrends[0];
  const supportChange = latestBucket['Needs Support'] - firstBucket['Needs Support'];
  const bucketStatus = getTrendStatus([firstBucket['Needs Support'], latestBucket['Needs Support']]);
  // Invert: if needs support went down, that's improving
  const bucketTrendStatus: TrendStatus = supportChange < -2 ? 'improving' : supportChange > 2 ? 'declining' : 'stable';

  // ═══ 5. TEACHER TRENDS ═══
  const teacherTrends = useMemo(() => {
    return teachers.map(teacher => {
      const examAvgs = EXAM_SEQUENCE.map(exam => {
        const sections = buildClassSections(exam);
        let totalScore = 0, count = 0;
        teacher.assignments.forEach(a => {
          const cs = sections.find(s => s.classNum === a.classNum && s.section === a.section);
          const sub = cs?.subjects.find(s => s.id === a.subjectId);
          if (sub) { totalScore += sub.avgScore; count++; }
        });
        return count > 0 ? Math.round(totalScore / count) : 0;
      });
      const trend = getTrendStatus(examAvgs);
      return { id: teacher.id, name: teacher.name, examAvgs, ...trend, latest: examAvgs[examAvgs.length - 1] };
    });
  }, []);

  const mostImprovedTeacher = [...teacherTrends].sort((a, b) => b.change - a.change)[0];
  const teachersNeedingSupport = teacherTrends.filter(t => t.status === 'declining');

  // ═══ CHART STYLING ═══
  const tooltipStyle = { contentStyle: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' } };

  return (
    <div className="space-y-6">
      {/* ─── SECTION 1: SCHOOL PERFORMANCE TREND ─── */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">School Performance Trend</h2>
                <p className="text-[11px] text-muted-foreground">Overall school average across exams</p>
              </div>
            </div>
            <StatusBadge status={schoolStatus.status} change={schoolStatus.change} />
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={schoolTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="exam" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[40, 90]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))' }} name="School Avg" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            {schoolStatus.status === 'improving' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : schoolStatus.status === 'declining' ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5 text-amber-600" />}
            {schoolStatus.status === 'improving'
              ? `School performance improved by ${schoolStatus.change}% over the last exams`
              : schoolStatus.status === 'declining'
              ? `School performance declined by ${Math.abs(schoolStatus.change)}% — needs attention`
              : 'School performance has remained stable across recent exams'}
          </p>
        </CardContent>
      </Card>

      {/* ─── SECTION 2: CLASS-WISE TRENDS ─── */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Class-wise Trends</h2>
              <p className="text-[11px] text-muted-foreground">Performance trends for each class across exams</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Best Improving</span>
              </div>
              <p className="text-sm font-bold text-foreground">Class {bestImproving.classNum}</p>
              <p className="text-[11px] text-muted-foreground">+{bestImproving.change}% growth</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Declining</span>
              </div>
              <p className="text-sm font-bold text-foreground">Class {mostDeclining.classNum}</p>
              <p className="text-[11px] text-muted-foreground">{mostDeclining.change}% change</p>
            </div>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="exam" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[40, 90]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip {...tooltipStyle} />
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c, i) => (
                  <Line
                    key={c}
                    type="monotone"
                    dataKey={`Class ${c}`}
                    stroke={`hsl(${i * 36}, 60%, 50%)`}
                    strokeWidth={c === bestImproving.classNum || c === mostDeclining.classNum ? 2.5 : 1}
                    strokeOpacity={c === bestImproving.classNum || c === mostDeclining.classNum ? 1 : 0.3}
                    dot={false}
                    name={`Class ${c}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Class trend chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {classTrends.map(ct => (
              <span key={ct.classNum} className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                ct.status === 'improving' ? 'bg-emerald-500/10 text-emerald-600' :
                ct.status === 'declining' ? 'bg-red-500/10 text-red-500' :
                'bg-amber-500/10 text-amber-600'
              )}>
                C{ct.classNum} {ct.change > 0 ? `+${ct.change}` : ct.change}%
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── SECTION 3: SUBJECT-WISE TRENDS ─── */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Subject-wise Trends</h2>
              <p className="text-[11px] text-muted-foreground">Subject performance over time across all classes</p>
            </div>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subjectChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="exam" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[40, 85]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip {...tooltipStyle} />
                {subjectTrends.map(st => (
                  <Line
                    key={st.id}
                    type="monotone"
                    dataKey={st.name}
                    stroke={SUBJECT_COLORS[st.id]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subject status list */}
          <div className="mt-4 space-y-2">
            {subjectTrends.map(st => (
              <div key={st.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[st.id] }} />
                  <span className="text-sm font-medium text-foreground">{st.name}</span>
                </div>
                <StatusBadge status={st.status} change={st.change} />
              </div>
            ))}
          </div>

          {decliningSubjects.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              {decliningSubjects.map(s => s.name).join(', ')} {decliningSubjects.length === 1 ? 'is' : 'are'} declining — may need curriculum review
            </p>
          )}
        </CardContent>
      </Card>

      {/* ─── SECTION 4: STUDENT BUCKET TRENDS ─── */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Student Performance Distribution</h2>
                <p className="text-[11px] text-muted-foreground">How student buckets shift across exams</p>
              </div>
            </div>
            <StatusBadge
              status={bucketTrendStatus}
              change={Math.abs(supportChange)}
            />
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bucketTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="exam" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Strong" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Average" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Needs Support" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            {bucketTrendStatus === 'improving'
              ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Students needing support reduced from {firstBucket['Needs Support']}% to {latestBucket['Needs Support']}%</>
              : bucketTrendStatus === 'declining'
              ? <><AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Students needing support increased from {firstBucket['Needs Support']}% to {latestBucket['Needs Support']}%</>
              : <><Minus className="w-3.5 h-3.5 text-amber-600" /> Student distribution has remained relatively stable</>
            }
          </p>
        </CardContent>
      </Card>

    </div>
  );
};

export default TrendsDashboard;
