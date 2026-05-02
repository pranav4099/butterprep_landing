import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Minus, Users, BookOpen, Building,
  AlertTriangle, Lightbulb, BarChart3, ChevronDown, ChevronRight,
  Award, Zap, GraduationCap,
  LineChart as LineChartIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { buildClassSections, allStudents, getClassSubjectData } from '@/data/teacherInsightsData';
import type { ClassSection } from '@/data/teacherInsightsData';
import { teachers } from '@/data/teacherData';
import TeacherPerformanceOverview from '@/components/insights/TeacherPerformanceOverview';

interface Props {
  selectedExamType: string;
  onExamTypeChange: (examType: string) => void;
}

const EXAM_SEQUENCE = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];
const exams = [
  { id: 'FA1', name: 'FA1 (Formative Assessment 1)' },
  { id: 'FA2', name: 'FA2 (Formative Assessment 2)' },
  { id: 'SA1', name: 'SA1 (Summative Assessment 1)' },
  { id: 'FA3', name: 'FA3 (Formative Assessment 3)' },
  { id: 'FA4', name: 'FA4 (Formative Assessment 4)' },
  { id: 'SA2', name: 'SA2 (Summative Assessment 2)' },
];

const SchoolWideDashboard = ({ selectedExamType, onExamTypeChange }: Props) => {
  const navigate = useNavigate();
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [expandedRiskClass, setExpandedRiskClass] = useState<string | null>(null);
  const selectedExam = exams.find(e => e.id === selectedExamType) || exams[0];

  const examSections = useMemo(() => buildClassSections(selectedExamType), [selectedExamType]);
  const prevExamIdx = EXAM_SEQUENCE.indexOf(selectedExamType) - 1;
  const prevExamType = prevExamIdx >= 0 ? EXAM_SEQUENCE[prevExamIdx] : null;
  const prevSections = useMemo(() => prevExamType ? buildClassSections(prevExamType) : null, [prevExamType]);

  // ═══ 1. SCHOOL OVERVIEW ═══
  const schoolOverview = useMemo(() => {
    const allSectionAvgs = examSections.map(s => s.avgScore);
    const schoolAvg = Math.round(allSectionAvgs.reduce((a, b) => a + b, 0) / allSectionAvgs.length);

    const prevAvg = prevSections
      ? Math.round(prevSections.map(s => s.avgScore).reduce((a, b) => a + b, 0) / prevSections.length)
      : null;
    const improvement = prevAvg !== null ? schoolAvg - prevAvg : null;

    // Subject averages across all sections
    const subjectMap: Record<string, number[]> = {};
    examSections.forEach(cs => {
      cs.subjects.forEach(sub => {
        if (!subjectMap[sub.name]) subjectMap[sub.name] = [];
        subjectMap[sub.name].push(sub.avgScore);
      });
    });
    const subjectAvgs = Object.entries(subjectMap).map(([name, scores]) => ({
      name,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    })).sort((a, b) => b.avg - a.avg);

    const strongestSubject = subjectAvgs[0];
    const weakestSubject = subjectAvgs[subjectAvgs.length - 1];

    // Student counts
    const totalStudents = allStudents.length;
    const improving = allStudents.filter(s => s.trendDirection === 'up').length;
    const declining = allStudents.filter(s => s.trendDirection === 'down').length;
    const atRisk = allStudents.filter(s => s.score < 50).length;

    return { schoolAvg, improvement, strongestSubject, weakestSubject, totalStudents, improving, declining, atRisk, subjectAvgs };
  }, [examSections, prevSections]);

  // ═══ 2. CLASS-WISE PERFORMANCE ═══
  const classPerformance = useMemo(() => {
    // Group by class number and average across sections
    const classMap: Record<number, { scores: number[]; sections: ClassSection[] }> = {};
    examSections.forEach(cs => {
      if (!classMap[cs.classNum]) classMap[cs.classNum] = { scores: [], sections: [] };
      classMap[cs.classNum].scores.push(cs.avgScore);
      classMap[cs.classNum].sections.push(cs);
    });

    const prevClassMap: Record<number, number[]> = {};
    if (prevSections) {
      prevSections.forEach(cs => {
        if (!prevClassMap[cs.classNum]) prevClassMap[cs.classNum] = [];
        prevClassMap[cs.classNum].push(cs.avgScore);
      });
    }

    const classes = Object.entries(classMap).map(([num, { scores }]) => {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const prevScores = prevClassMap[Number(num)];
      const prevAvg = prevScores ? Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length) : null;
      const trend: 'up' | 'down' | 'stable' = prevAvg !== null
        ? avg > prevAvg ? 'up' : avg < prevAvg ? 'down' : 'stable'
        : 'stable';
      return { classNum: Number(num), avg, prevAvg, trend, change: prevAvg !== null ? avg - prevAvg : 0 };
    }).sort((a, b) => a.classNum - b.classNum);

    const strongest = [...classes].sort((a, b) => b.avg - a.avg)[0];
    const weakest = [...classes].sort((a, b) => a.avg - b.avg)[0];

    return { classes, strongest, weakest };
  }, [examSections, prevSections]);

  // ═══ 3. SUBJECT-WISE PERFORMANCE ═══
  const subjectPerformance = useMemo(() => {
    const subjectMap: Record<string, { scores: number[]; id: string }> = {};
    examSections.forEach(cs => {
      cs.subjects.forEach(sub => {
        if (!subjectMap[sub.name]) subjectMap[sub.name] = { scores: [], id: sub.id };
        subjectMap[sub.name].scores.push(sub.avgScore);
      });
    });

    const prevSubjectMap: Record<string, number[]> = {};
    if (prevSections) {
      prevSections.forEach(cs => {
        cs.subjects.forEach(sub => {
          if (!prevSubjectMap[sub.name]) prevSubjectMap[sub.name] = [];
          prevSubjectMap[sub.name].push(sub.avgScore);
        });
      });
    }

    return Object.entries(subjectMap).map(([name, { scores, id }]) => {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const prevScores = prevSubjectMap[name];
      const prevAvg = prevScores ? Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length) : null;
      const change = prevAvg !== null ? avg - prevAvg : 0;
      const status: 'strong' | 'average' | 'weak' = avg >= 70 ? 'strong' : avg >= 55 ? 'average' : 'weak';
      return { name, id, avg, prevAvg, change, status };
    }).sort((a, b) => b.avg - a.avg);
  }, [examSections, prevSections]);

  // ═══ 4. STUDENT PERFORMANCE BUCKETS ═══
  const studentBuckets = useMemo(() => {
    const totalStudents = 100;
    const strong = 38;   // 70%+
    const average = 40;  // 55-69%
    const needsSupport = 22; // <55%
    return { totalStudents, strong, average, needsSupport };
  }, []);

  // ═══ 5. LEARNING PATTERNS ═══
  const learningPatterns = useMemo(() => {
    // Collect all topic scores across students
    const topicMap: Record<string, number[]> = {};
    allStudents.forEach(s => {
      s.topicScores.forEach(t => {
        if (!topicMap[t.topic]) topicMap[t.topic] = [];
        topicMap[t.topic].push(t.score);
      });
    });

    const topicAvgs = Object.entries(topicMap).map(([topic, scores]) => ({
      topic,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length,
    }));

    const weakTopics = topicAvgs.filter(t => t.avg < 55).sort((a, b) => a.avg - b.avg).slice(0, 5);
    const strongTopics = topicAvgs.filter(t => t.avg >= 70).sort((a, b) => b.avg - a.avg).slice(0, 5);

    // Subjects needing intervention (below 55 avg)
    const interventionSubjects = subjectPerformance.filter(s => s.avg < 60);

    return { weakTopics, strongTopics, interventionSubjects };
  }, [subjectPerformance]);

  // ═══ 6. PERFORMANCE TRENDS ═══
  const performanceTrends = useMemo(() => {
    const currentIdx = EXAM_SEQUENCE.indexOf(selectedExamType);
    const examsToShow = EXAM_SEQUENCE.slice(0, currentIdx + 1);

    return examsToShow.map(exam => {
      const sections = buildClassSections(exam);
      const schoolAvg = Math.round(sections.map(s => s.avgScore).reduce((a, b) => a + b, 0) / sections.length);

      // Subject averages
      const subjectMap: Record<string, number[]> = {};
      sections.forEach(cs => {
        cs.subjects.forEach(sub => {
          if (!subjectMap[sub.name]) subjectMap[sub.name] = [];
          subjectMap[sub.name].push(sub.avgScore);
        });
      });
      const subjectAvgs: Record<string, number> = {};
      Object.entries(subjectMap).forEach(([name, scores]) => {
        subjectAvgs[name] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      });

      return { exam, schoolAvg, ...subjectAvgs };
    });
  }, [selectedExamType]);

  const trendSubjects = useMemo(() => {
    if (performanceTrends.length === 0) return [];
    return Object.keys(performanceTrends[0]).filter(k => k !== 'exam' && k !== 'schoolAvg');
  }, [performanceTrends]);

  const TREND_COLORS = [
    'hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))',
    'hsl(var(--destructive))', 'hsl(var(--purple))', 'hsl(210, 70%, 50%)',
  ];

  return (
    <div className="space-y-6">
      {/* Exam Type Dropdown */}
      <div className="relative">
        <button
          onClick={() => setExamDropdownOpen(!examDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors w-full"
        >
          <span className="text-sm font-medium text-foreground flex-1 text-left truncate">
            {selectedExam.name}
          </span>
          <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform shrink-0", examDropdownOpen && "rotate-180")} />
        </button>
        {examDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => { onExamTypeChange(exam.id); setExamDropdownOpen(false); }}
                className={cn("w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors", selectedExamType === exam.id && "bg-primary/10 text-primary")}
              >
                {exam.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═══════ SECTION 1: SCHOOL OVERVIEW ═══════ */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/2 rounded-2xl p-5 border border-primary/10 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Building className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">School Overview</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">High-level snapshot of school performance</p>

        {/* Hero stat */}
        <div className="mb-5">
          <p className={cn(
            "text-5xl font-extrabold tracking-tight leading-none",
            schoolOverview.schoolAvg >= 70 ? "text-success" : schoolOverview.schoolAvg >= 55 ? "text-primary" : "text-warning"
          )}>
            {schoolOverview.schoolAvg}<span className="text-xl font-normal text-muted-foreground">%</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">School Average</p>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Strongest Subject', value: schoolOverview.strongestSubject?.name || '–', sub: `${schoolOverview.strongestSubject?.avg}% avg`, icon: Award, color: 'success' },
            { label: 'Weakest Subject', value: schoolOverview.weakestSubject?.name || '–', sub: `${schoolOverview.weakestSubject?.avg}% avg`, icon: AlertTriangle, color: 'destructive' },
            { label: 'Total Students', value: String(schoolOverview.totalStudents), sub: `${schoolOverview.improving} improving`, icon: Users, color: 'primary' },
            { label: 'Needs Support', value: String(studentBuckets.needsSupport), sub: `of ${studentBuckets.totalStudents} students`, icon: AlertTriangle, color: 'destructive' },
          ].map((metric) => (
            <Card key={metric.label} className="border-0 shadow-sm">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", `bg-${metric.color}/10`)}>
                    <metric.icon className={cn("w-3.5 h-3.5", `text-${metric.color}`)} />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{metric.label}</p>
                </div>
                <p className="text-lg font-bold text-foreground leading-none">{metric.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{metric.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ═══════ SECTION 2: CLASS-WISE PERFORMANCE ═══════ */}
      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Class-wise Performance</h3>
                <p className="text-[10px] text-muted-foreground">Tap a class to see subject breakdown</p>
              </div>
            </div>
            <div className="flex gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-success font-medium">
                <Award className="w-3 h-3" /> Best: Class {classPerformance.strongest?.classNum} ({classPerformance.strongest?.avg}%)
              </span>
              <span className="flex items-center gap-1.5 text-destructive font-medium">
                <AlertTriangle className="w-3 h-3" /> Weakest: Class {classPerformance.weakest?.classNum} ({classPerformance.weakest?.avg}%)
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={classPerformance.classes.map(c => ({ name: `Class ${c.classNum}`, score: c.avg, classNum: c.classNum }))}
              barGap={4}
              onClick={(data) => {
                if (data?.activePayload?.[0]?.payload?.classNum) {
                  navigate(`/insights/class/${data.activePayload[0].payload.classNum}`);
                }
              }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(var(--border))' }}
                formatter={(v: number) => [`${v}%`, 'Avg Score']}
              />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg Score" cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>

          <p className="text-[10px] text-center text-muted-foreground mt-2">Click on a bar to drill into that class</p>
        </CardContent>
      </Card>


      {/* ═══════ SECTION 4: STUDENT PERFORMANCE BUCKETS ═══════ */}
      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Student Performance Buckets</h3>
              <p className="text-[10px] text-muted-foreground">{studentBuckets.totalStudents} students across all classes</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Strong', desc: 'Scoring 70%+', count: studentBuckets.strong, emoji: '🟢', color: 'success', pct: Math.round((studentBuckets.strong / studentBuckets.totalStudents) * 100), bucket: 'strong' },
              { label: 'Average', desc: 'Scoring 55–69%', count: studentBuckets.average, emoji: '🟡', color: 'warning', pct: Math.round((studentBuckets.average / studentBuckets.totalStudents) * 100), bucket: 'average' },
              { label: 'Needs Support', desc: 'Scoring below 55%', count: studentBuckets.needsSupport, emoji: '🔴', color: 'destructive', pct: Math.round((studentBuckets.needsSupport / studentBuckets.totalStudents) * 100), bucket: 'needs-support' },
            ].map(item => (
              <div
                key={item.label}
                className={cn("p-3.5 rounded-xl text-center border cursor-pointer hover:shadow-lg transition-all", `bg-${item.color}/5 border-${item.color}/10`)}
                onClick={() => navigate(`/insights/bucket/${item.bucket}`)}
              >
                <span className="text-lg">{item.emoji}</span>
                <p className={cn("text-2xl font-bold leading-none mt-1", `text-${item.color}`)}>{item.count}</p>
                <p className="text-xs font-semibold text-foreground mt-1">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                <p className={cn("text-[10px] font-bold mt-1", `text-${item.color}`)}>{item.pct}% of school</p>
              </div>
            ))}
          </div>

          {/* Visual distribution bar */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Distribution</p>
            <div className="h-4 rounded-full overflow-hidden flex">
              <div className="bg-success h-full transition-all" style={{ width: `${(studentBuckets.strong / studentBuckets.totalStudents) * 100}%` }} />
              <div className="bg-warning h-full transition-all" style={{ width: `${(studentBuckets.average / studentBuckets.totalStudents) * 100}%` }} />
              <div className="bg-destructive h-full transition-all" style={{ width: `${(studentBuckets.needsSupport / studentBuckets.totalStudents) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] text-success font-medium">Strong ({studentBuckets.strong})</span>
              <span className="text-[9px] text-warning font-medium">Average ({studentBuckets.average})</span>
              <span className="text-[9px] text-destructive font-medium">Needs Support ({studentBuckets.needsSupport})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════ SECTION 5: TEACHER PERFORMANCE ═══════ */}
      <TeacherPerformanceOverview selectedExamType={selectedExamType} />

      <p className="text-[10px] text-center text-muted-foreground/60 pb-2">
        Insights are derived from exam data reviewed by teachers. Data is assistive — management decisions remain in control.
      </p>
    </div>
  );
};

export default SchoolWideDashboard;
