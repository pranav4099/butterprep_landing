import React, { useMemo, useState } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Users, Award, AlertTriangle,
  ChevronRight, ChevronDown, ChevronUp, GraduationCap, BookOpen,
  ArrowLeft, Scale, Sparkles, ShieldCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { buildClassSections, getClassSubjectData } from '@/data/teacherInsightsData';
import type { ClassSection } from '@/data/teacherInsightsData';
import { teachers } from '@/data/teacherData';
import type { TeacherProfile } from '@/data/teacherData';

const EXAM_SEQUENCE = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];

interface ClassDetail {
  label: string;
  classNum: number;
  sectionLetter: string;
  subjectName: string;
  score: number;
  prevScore: number | null;
  change: number;
}

interface TeacherMetrics {
  teacher: TeacherProfile;
  avgScore: number;
  prevAvgScore: number | null;
  trend: 'up' | 'down' | 'stable';
  change: number;
  classesHandled: string;
  subjectsLabel: string;
  needsSupportCount: number;
  weakAreas: string[];
  classDetails: ClassDetail[];
}

interface Props {
  selectedExamType: string;
}

type SortMode = 'best' | 'improved' | 'needs-support';

const TeacherPerformanceInsights = ({ selectedExamType }: Props) => {
  const [sortMode, setSortMode] = useState<SortMode>('best');
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'performance-list' | 'subject-comparison'>('overview');

  const prevExamIdx = EXAM_SEQUENCE.indexOf(selectedExamType) - 1;
  const prevExamType = prevExamIdx >= 0 ? EXAM_SEQUENCE[prevExamIdx] : null;

  const currentSections = useMemo(() => buildClassSections(selectedExamType), [selectedExamType]);
  const prevSections = useMemo(() => prevExamType ? buildClassSections(prevExamType) : null, [prevExamType]);

  const teacherMetrics: TeacherMetrics[] = useMemo(() => {
    return teachers.map(teacher => {
      const scores: number[] = [];
      const prevScoresArr: number[] = [];
      let needsSupport = 0;
      const weakAreaSet = new Set<string>();
      const classDetails: ClassDetail[] = [];

      teacher.assignments.forEach(a => {
        const cs = currentSections.find(s => s.classNum === a.classNum && s.section === a.section);
        if (!cs) return;
        const sub = cs.subjects.find(s => s.id === a.subjectId);
        if (!sub) return;

        scores.push(sub.avgScore);

        // Count students needing support
        const subData = getClassSubjectData(cs, sub, selectedExamType);
        needsSupport += subData.students.filter(s => s.status === 'needs-support').length;

        // Weak chapters
        subData.chapters.filter(ch => ch.avgScore < 55).forEach(ch => weakAreaSet.add(ch.name));

        // Previous exam score
        let prevScore: number | null = null;
        if (prevSections) {
          const pcs = prevSections.find(s => s.classNum === a.classNum && s.section === a.section);
          const psub = pcs?.subjects.find(s => s.id === a.subjectId);
          if (psub) {
            prevScoresArr.push(psub.avgScore);
            prevScore = psub.avgScore;
          }
        }

        classDetails.push({
          label: `Class ${a.classNum}-${a.section}`,
          classNum: a.classNum,
          sectionLetter: a.section,
          subjectName: a.subjectName,
          score: sub.avgScore,
          prevScore,
          change: prevScore !== null ? sub.avgScore - prevScore : 0,
        });
      });

      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const prevAvgScore = prevScoresArr.length > 0 ? Math.round(prevScoresArr.reduce((a, b) => a + b, 0) / prevScoresArr.length) : null;
      const change = prevAvgScore !== null ? avgScore - prevAvgScore : 0;
      const trend: 'up' | 'down' | 'stable' = change > 2 ? 'up' : change < -2 ? 'down' : 'stable';

      const subjectsLabel = teacher.subjects.map(s => s.name).join(', ');

      return {
        teacher,
        avgScore,
        prevAvgScore,
        trend,
        change,
        classesHandled: `${teacher.assignments.length} classes`,
        subjectsLabel,
        needsSupportCount: needsSupport,
        weakAreas: Array.from(weakAreaSet).slice(0, 2),
        classDetails: classDetails.sort((a, b) => a.classNum - b.classNum || a.sectionLetter.localeCompare(b.sectionLetter)),
      };
    });
  }, [currentSections, prevSections, selectedExamType]);

  const sortedTeachers = useMemo(() => {
    const sorted = [...teacherMetrics];
    sorted.sort((a, b) => b.avgScore - a.avgScore);
    return sorted;
  }, [teacherMetrics]);

  // Overview stats
  const overview = useMemo(() => {
    const needsSupport = teacherMetrics.filter(t => t.avgScore < 55).length;
    const topTeacher = [...teacherMetrics].sort((a, b) => b.avgScore - a.avgScore)[0];
    return { total: teachers.length, needsSupport, topTeacher };
  }, [teacherMetrics]);

  // Subject comparison — a multi-subject teacher appears under each subject they teach
  const subjectComparison = useMemo(() => {
    const subjectMap: Record<string, { teacherId: string; teacherName: string; avgScore: number }[]> = {};

    teacherMetrics.forEach(tm => {
      // Group assignments by subject for this teacher
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
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        if (!subjectMap[subName]) subjectMap[subName] = [];
        subjectMap[subName].push({ teacherId: tm.teacher.id, teacherName: tm.teacher.name, avgScore: avg });
      });
    });

    return Object.entries(subjectMap)
      .map(([subject, tms]) => ({
        subject,
        teachers: tms.sort((a, b) => b.avgScore - a.avgScore),
      }))
      .sort((a, b) => a.subject.localeCompare(b.subject));
  }, [teacherMetrics, currentSections]);

  // Class improvement data
  const classImprovements = useMemo(() => {
    if (!prevSections) return [];
    return teacherMetrics
      .flatMap(tm => tm.classDetails.filter(cd => cd.prevScore !== null).map(cd => ({
        ...cd,
        teacherName: tm.teacher.name,
      })))
      .sort((a, b) => b.change - a.change);
  }, [teacherMetrics, prevSections]);

  // ═══ GRADING FAIRNESS — gap between teacher-given marks vs AI-suggested marks ═══
  const gradingFairness = useMemo(() => {
    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
      return Math.abs(h);
    };

    const rows = teacherMetrics.map(tm => {
      const seed = hash(tm.teacher.id + selectedExamType);
      const teacherAvg = tm.avgScore;
      const rawGap = ((seed % 21) - 8); // -8 .. +12
      const aiAvg = Math.max(0, Math.min(100, teacherAvg - rawGap));
      const gap = teacherAvg - aiAvg;
      const absGap = Math.abs(gap);
      const severity: 'fair' | 'minor' | 'review' =
        absGap <= 3 ? 'fair' : absGap <= 7 ? 'minor' : 'review';
      const flaggedPct = Math.min(60, Math.round((seed % 35) + absGap * 1.2));
      return {
        teacher: tm.teacher,
        subjectsLabel: tm.subjectsLabel,
        teacherAvg,
        aiAvg,
        gap,
        absGap,
        severity,
        flaggedPct,
        direction: gap > 0 ? 'lenient' : gap < 0 ? 'strict' : 'aligned',
      };
    });

    const reviewCount = rows.filter(r => r.severity === 'review').length;
    const minorCount = rows.filter(r => r.severity === 'minor').length;
    const fairCount = rows.filter(r => r.severity === 'fair').length;
    const avgAbsGap = rows.length > 0
      ? Math.round((rows.reduce((s, r) => s + r.absGap, 0) / rows.length) * 10) / 10
      : 0;

    return {
      rows: rows.sort((a, b) => b.absGap - a.absGap),
      reviewCount,
      minorCount,
      fairCount,
      avgAbsGap,
    };
  }, [teacherMetrics, selectedExamType]);

  const TrendIcon = ({ trend, size = 'sm' }: { trend: 'up' | 'down' | 'stable'; size?: 'sm' | 'md' }) => {
    const cls = size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
    if (trend === 'up') return <TrendingUp className={cn(cls, 'text-success')} />;
    if (trend === 'down') return <TrendingDown className={cn(cls, 'text-destructive')} />;
    return <Minus className={cn(cls, 'text-muted-foreground')} />;
  };

  // Detail view for a specific teacher
  const selectedTeacher = selectedTeacherId ? teacherMetrics.find(tm => tm.teacher.id === selectedTeacherId) : null;
  if (selectedTeacher) {
    const tm = selectedTeacher;
    // Group class details by subject for multi-subject teachers
    const subjectGroups = new Map<string, ClassDetail[]>();
    tm.classDetails.forEach(cd => {
      if (!subjectGroups.has(cd.subjectName)) subjectGroups.set(cd.subjectName, []);
      subjectGroups.get(cd.subjectName)!.push(cd);
    });

    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedTeacherId(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Teacher Insights</span>
        </button>

        {/* Teacher Hero */}
        <Card className="border-0 card-shadow-elevated rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-transparent" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{tm.subjectsLabel}</p>
                <h2 className="text-lg font-bold text-foreground tracking-tight mt-0.5">{tm.teacher.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{tm.classesHandled}</p>
              </div>
              <div className="text-right space-y-1">
                <p className={cn(
                  "text-4xl font-extrabold leading-none tracking-tight",
                  tm.avgScore >= 70 ? "text-success" : tm.avgScore >= 55 ? "text-primary" : "text-warning"
                )}>
                  {tm.avgScore}<span className="text-lg font-normal text-muted-foreground">%</span>
                </p>
                <p className="text-[10px] text-muted-foreground">Avg Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class-wise Breakdown grouped by subject */}
        {Array.from(subjectGroups.entries()).map(([subName, details]) => (
          <Card key={subName} className="border-0 card-shadow rounded-2xl">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">{subName}</h3>
              <div className="space-y-2">
                {details.map(cd => {
                  const barColor = cd.score >= 70 ? 'bg-success' : cd.score >= 55 ? 'bg-warning' : 'bg-destructive';
                  return (
                    <div key={`${cd.label}-${cd.subjectName}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20">
                      <span className="text-xs font-bold text-foreground w-20">{cd.label}</span>
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${cd.score}%` }} />
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs font-bold w-10 text-right",
                        cd.score >= 70 ? 'text-success' : cd.score >= 55 ? 'text-warning' : 'text-destructive'
                      )}>
                        {cd.score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Performance List view
  if (activeView === 'performance-list') {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Teacher Performance</span>
        </button>

        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Teacher Performance List</h3>
                <p className="text-[10px] text-muted-foreground">Tap a teacher to see class-level details</p>
              </div>
            </div>

            <div className="space-y-2">
              {sortedTeachers.map(tm => (
                <div key={tm.teacher.id}>
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedTeacherId(tm.teacher.id)}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0",
                      tm.avgScore >= 70 ? 'bg-success/10 text-success' :
                      tm.avgScore >= 55 ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    )}>
                      {tm.avgScore}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{tm.teacher.name}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {tm.subjectsLabel} · {tm.classesHandled}
                        {tm.needsSupportCount > 0 && (
                          <span className="text-destructive font-medium"> · {tm.needsSupportCount} students need support</span>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    );
  }

  // Subject-wise Comparison view
  if (activeView === 'subject-comparison') {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Teacher Performance</span>
        </button>

        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Subject-wise Teacher Comparison</h3>
                <p className="text-[10px] text-muted-foreground">Compare teachers teaching the same subject</p>
              </div>
            </div>

            <div className="space-y-4">
              {subjectComparison.map(sc => (
                <div key={sc.subject}>
                  <p className="text-xs font-bold text-foreground mb-2">{sc.subject}</p>
                  <div className="space-y-1.5">
                    {sc.teachers.map((tm, idx) => {
                      const isTop = idx === 0;
                      const barColor = tm.avgScore >= 70 ? 'bg-success' : tm.avgScore >= 55 ? 'bg-warning' : 'bg-destructive';
                      return (
                        <div key={tm.teacherId} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/20">
                          {isTop && <Award className="w-3.5 h-3.5 text-success shrink-0" />}
                          {!isTop && <div className="w-3.5" />}
                          <span className="text-xs font-medium text-foreground flex-1 truncate">{tm.teacherName}</span>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", barColor)} style={{ width: `${tm.avgScore}%` }} />
                          </div>
                          <span className={cn(
                            "text-xs font-bold w-10 text-right",
                            tm.avgScore >= 70 ? 'text-success' : tm.avgScore >= 55 ? 'text-warning' : 'text-destructive'
                          )}>
                            {tm.avgScore}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Overview (default)
  return (
    <div className="space-y-5">
      {/* ═══ Teacher Performance Overview ═══ */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/2 rounded-2xl p-5 border border-primary/10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Teacher Performance</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total</p>
              </div>
              <p className="text-lg font-bold text-foreground leading-none">{overview.total}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Teachers</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-success" />
                </div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Top Teacher</p>
              </div>
              <p className="text-sm font-bold text-foreground leading-tight truncate">{overview.topTeacher?.teacher.name || '–'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{overview.topTeacher?.avgScore}% avg</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ Navigation Cards ═══ */}
      <div className="grid grid-cols-1 gap-3">
        <Card
          className="border-0 card-shadow rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveView('performance-list')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Teacher Performance List</h3>
                <p className="text-[10px] text-muted-foreground">View all teachers ranked by performance</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card
          className="border-0 card-shadow rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveView('subject-comparison')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Subject-wise Comparison</h3>
                <p className="text-[10px] text-muted-foreground">Compare teachers teaching the same subject</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* ═══ GRADING FAIRNESS ═══ */}
      <GradingFairnessSection
        rows={gradingFairness.rows}
        reviewCount={gradingFairness.reviewCount}
        minorCount={gradingFairness.minorCount}
        fairCount={gradingFairness.fairCount}
        avgAbsGap={gradingFairness.avgAbsGap}
        onTeacherClick={(id) => setSelectedTeacherId(id)}
      />
    </div>
  );
};

// ════════════════════════════════════════
// Grading Fairness — exported for reuse
// ════════════════════════════════════════
interface FairnessRow {
  teacher: TeacherProfile;
  subjectsLabel: string;
  teacherAvg: number;
  aiAvg: number;
  gap: number;
  absGap: number;
  severity: 'fair' | 'minor' | 'review';
  flaggedPct: number;
  direction: string;
}

export const GradingFairnessSection = ({
  rows, reviewCount, minorCount, fairCount, avgAbsGap, onTeacherClick,
}: {
  rows: FairnessRow[];
  reviewCount: number;
  minorCount: number;
  fairCount: number;
  avgAbsGap: number;
  onTeacherClick?: (teacherId: string) => void;
}) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rows : rows.slice(0, 5);

  const sevConfig = {
    fair: { label: 'Fair', color: 'success', icon: ShieldCheck, badge: '✓' },
    minor: { label: 'Minor Variance', color: 'warning', icon: Scale, badge: '~' },
    review: { label: 'Needs Review', color: 'destructive', icon: AlertTriangle, badge: '!' },
  } as const;

  return (
    <Card className="border-0 card-shadow rounded-2xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[hsl(var(--purple))]/10 flex items-center justify-center">
            <Scale className="w-4 h-4 text-[hsl(var(--purple))]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Grading Fairness</h3>
            <p className="text-[10px] text-muted-foreground">Teacher-given marks vs AI-suggested marks</p>
          </div>
        </div>

        {/* AI explainer pill */}
        <div className="flex items-start gap-2 mt-3 mb-4 p-2.5 rounded-lg bg-[hsl(var(--purple))]/5 border border-[hsl(var(--purple))]/10">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--purple))] mt-0.5 shrink-0" />
          <p className="text-[11px] text-foreground leading-relaxed">
            AI re-evaluates every paper. Large gaps may indicate lenient or strict grading patterns worth reviewing.
          </p>
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Avg Gap', value: `${avgAbsGap}`, sub: 'marks', color: 'primary' },
            { label: 'Fair', value: String(fairCount), sub: '≤3 marks', color: 'success' },
            { label: 'Minor', value: String(minorCount), sub: '4–7 marks', color: 'warning' },
            { label: 'Review', value: String(reviewCount), sub: '>7 marks', color: 'destructive' },
          ].map(s => (
            <div key={s.label} className={cn('p-2.5 rounded-xl text-center border', `bg-${s.color}/5 border-${s.color}/10`)}>
              <p className={cn('text-lg font-bold leading-none', `text-${s.color}`)}>{s.value}</p>
              <p className="text-[10px] font-semibold text-foreground mt-1">{s.label}</p>
              <p className="text-[9px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Teacher fairness list */}
        <div className="space-y-2">
          {visible.map(r => {
            const cfg = sevConfig[r.severity];
            const dirLabel = r.direction === 'lenient' ? 'Lenient' : r.direction === 'strict' ? 'Strict' : 'Aligned';
            const dirColor = r.direction === 'lenient' ? 'warning' : r.direction === 'strict' ? 'primary' : 'success';
            return (
              <div
                key={r.teacher.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors cursor-pointer',
                  r.severity === 'review' ? 'border-destructive/30' : 'border-border/60'
                )}
                onClick={() => onTeacherClick?.(r.teacher.id)}
              >
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', `bg-${cfg.color}/10`)}>
                  <cfg.icon className={cn('w-4 h-4', `text-${cfg.color}`)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{r.teacher.name}</p>
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider', `bg-${dirColor}/10 text-${dirColor}`)}>
                      {dirLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {r.subjectsLabel} · {r.flaggedPct}% papers flagged
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-foreground">{r.teacherAvg}</span>
                    <span className="text-[10px] text-muted-foreground">vs</span>
                    <span className="text-xs font-bold text-[hsl(var(--purple))]">{r.aiAvg}</span>
                  </div>
                  <p className={cn('text-[10px] font-bold mt-0.5', `text-${cfg.color}`)}>
                    {r.gap > 0 ? '+' : ''}{r.gap} gap
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {rows.length > 5 && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="mt-3 w-full text-center text-xs font-semibold text-primary hover:underline"
          >
            {showAll ? 'Show less' : `Show all ${rows.length} teachers`}
          </button>
        )}

        <p className="text-[10px] text-muted-foreground/70 mt-3 text-center">
          Teacher avg vs AI-suggested avg (out of 100). Click a teacher for class-level breakdown.
        </p>
      </CardContent>
    </Card>
  );
};

export default TeacherPerformanceInsights;
