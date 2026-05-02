import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus,
  Target, MessageSquare, CheckCircle2, Sparkles, BookOpen, Flame,
  ChevronRight, ChevronDown, ChevronLeft, Star, AlertTriangle, BarChart3, Lightbulb,
  Zap, Shield
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { StudentRecord } from '@/data/teacherInsightsData';
import { getStudentAllSubjects, type SubjectStudentData, type StudentChapterPerformance } from '@/data/teacherInsightsData';

interface Props {
  student: StudentRecord;
  onBack: () => void;
}

const feedbackOptions = [
  { label: 'Good understanding', icon: '👍', color: 'success' },
  { label: 'Needs practice', icon: '📝', color: 'warning' },
  { label: 'Incomplete answers', icon: '⚠️', color: 'destructive' },
  { label: 'Improving steadily', icon: '📈', color: 'primary' },
];

const subjectEmojis: Record<string, string> = {
  math: '📐', science: '🔬', english: '📖', hindi: '🔤', kannada: '🅕', social: '🌍',
};

const examTypes = [
  { id: 'FA1', label: 'FA1', name: 'FA1 (Formative Assessment 1)' },
  { id: 'FA2', label: 'FA2', name: 'FA2 (Formative Assessment 2)' },
  { id: 'SA1', label: 'SA1', name: 'SA1 (Summative Assessment 1)' },
  { id: 'FA3', label: 'FA3', name: 'FA3 (Formative Assessment 3)' },
  { id: 'FA4', label: 'FA4', name: 'FA4 (Formative Assessment 4)' },
  { id: 'SA2', label: 'SA2', name: 'SA2 (Summative Assessment 2)' },
];

const TeacherStudentView = ({ student, onBack }: Props) => {
  const { selectedExamType, setSelectedExamType } = useAuth();
  const selectedExamLabel = (examTypes.find(e => e.id === selectedExamType) || examTypes[0]).name;
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string>('overview');
  const tabsRef = useRef<HTMLDivElement>(null);

  const allSubjects = useMemo(() => getStudentAllSubjects(student.id, selectedExamType), [student.id, selectedExamType]);

  // Overall stats
  const overallAvg = useMemo(() => {
    if (allSubjects.length === 0) return 0;
    return Math.round(allSubjects.reduce((s, sub) => s + sub.score, 0) / allSubjects.length);
  }, [allSubjects]);

  const strongSubjects = allSubjects.filter(s => s.status === 'strong');
  const weakSubjects = allSubjects.filter(s => s.status === 'needs-support');
  const bestSubject = allSubjects.reduce((best, s) => s.score > best.score ? s : best, allSubjects[0]);
  const worstSubject = allSubjects.reduce((worst, s) => s.score < worst.score ? s : worst, allSubjects[0]);

  // Active subject data
  const activeData = activeSubject !== 'overview' ? allSubjects.find(s => s.subjectId === activeSubject) : null;

  const statusConfig = {
    'strong': { label: 'Strong', color: 'text-success', bg: 'bg-success/10', border: 'border-success' },
    'average': { label: 'Average', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning' },
    'needs-support': { label: 'Needs Support', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive' },
  };

  const config = statusConfig[student.status];
  const TrendIcon = student.trendDirection === 'up' ? TrendingUp :
                     student.trendDirection === 'down' ? TrendingDown : Minus;
  const trendLabel = student.trendDirection === 'up' ? 'Improving' :
                     student.trendDirection === 'down' ? 'Declining' : 'Stable';

  const handleFeedback = (label: string) => {
    setSelectedFeedback(label);
    toast({
      title: 'Feedback saved',
      description: `"${label}" recorded for ${student.name}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors tap-target">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Students</span>
      </button>

      {/* ───── EXAM TYPE DROPDOWN ───── */}
      <div className="relative">
        <button
          onClick={() => setExamDropdownOpen(!examDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors w-full"
        >
          <span className="text-sm font-medium text-foreground flex-1 text-left truncate">
            {selectedExamLabel}
          </span>
          <ChevronDown className={cn(
            "w-5 h-5 text-muted-foreground transition-transform shrink-0",
            examDropdownOpen && "rotate-180"
          )} />
        </button>
        
        {examDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {examTypes.map((exam) => (
              <button
                key={exam.id}
                onClick={() => { setSelectedExamType(exam.id); setExamDropdownOpen(false); }}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors",
                  selectedExamType === exam.id && "bg-primary/10 text-primary"
                )}
              >
                {exam.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ───── 1. HERO STUDENT CARD ───── */}
      <Card className="border-0 card-shadow-elevated rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-success/4" />
        <CardContent className="p-5 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Roll #{student.rollNo}</p>
              <h2 className="text-lg font-bold text-foreground tracking-tight mt-0.5">{student.name}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold",
                  config.bg, config.color
                )}>
                  {config.label}
                </span>
                <span className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full",
                  student.trendDirection === 'up' ? "bg-success/10 text-success" :
                  student.trendDirection === 'down' ? "bg-destructive/10 text-destructive" :
                  "bg-muted text-muted-foreground"
                )}>
                  <TrendIcon className="w-3 h-3" /> {trendLabel}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-4xl font-extrabold leading-none tracking-tight",
                overallAvg >= 75 ? "text-success" : overallAvg >= 50 ? "text-primary" : "text-warning"
              )}>
                {overallAvg}<span className="text-lg font-normal text-muted-foreground">%</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Overall Average</p>
            </div>
          </div>

          {/* Best / Weakest subject */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {bestSubject && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-success/5 border border-success/10">
                <span className="text-base">⭐</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">Best Subject</p>
                  <p className="text-xs font-bold text-success truncate">{bestSubject.subjectName} · {bestSubject.score}%</p>
                </div>
              </div>
            )}
            {worstSubject && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/5 border border-destructive/10">
                <span className="text-base">🔻</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">Needs Focus</p>
                  <p className="text-xs font-bold text-destructive truncate">{worstSubject.subjectName} · {worstSubject.score}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Key stats row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-success/8 text-success">
              <CheckCircle2 className="w-3 h-3" /> {strongSubjects.length} Strong
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-destructive/8 text-destructive">
              <AlertTriangle className="w-3 h-3" /> {weakSubjects.length} Needs Help
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-primary/8 text-primary">
              <BookOpen className="w-3 h-3" /> {allSubjects.length} Subjects
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ───── 2. SUBJECT SWITCHER ───── */}
      <div className="sticky top-0 z-10 glass-bar py-1.5 -mx-1 px-1">
        <div ref={tabsRef} className="flex gap-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveSubject('overview')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shrink-0",
              activeSubject === 'overview'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            )}
          >
            📊 Overview
          </button>
          {allSubjects.map(sub => {
            const isActive = activeSubject === sub.subjectId;
            return (
              <button
                key={sub.subjectId}
                onClick={() => setActiveSubject(sub.subjectId)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {subjectEmojis[sub.subjectId] || '📚'} {sub.subjectName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {activeSubject === 'overview' && (
        <>
          {/* ───── AI INSIGHT ───── */}
          <Card className="border-0 card-shadow rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[hsl(var(--purple))]/5 to-[hsl(var(--purple))]/2">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--purple))]/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[hsl(var(--purple))]" />
                </div>
                <div className="pt-0.5">
                  <p className="text-[10px] font-bold text-[hsl(var(--purple))] uppercase tracking-widest mb-1">Learning Pattern</p>
                  <p className="text-[13px] text-foreground leading-relaxed">{student.learningPattern}</p>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* ───── SUBJECT SNAPSHOT ───── */}
          <Card className="border-0 card-shadow rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Subject Performance</h3>
                  <p className="text-[10px] text-muted-foreground">Tap a subject for detailed analysis</p>
                </div>
              </div>
              <div className="space-y-1">
                {[...allSubjects].sort((a, b) => b.score - a.score).map(sub => {
                  const color = sub.score >= 75 ? 'success' : sub.score >= 50 ? 'warning' : 'destructive';
                  return (
                    <button
                      key={sub.subjectId}
                      onClick={() => setActiveSubject(sub.subjectId)}
                      className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-muted/40 rounded-xl transition-colors px-2 -mx-2 tap-target"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
                        `bg-${color}/10 text-${color}`
                      )}>
                        {sub.score}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{sub.subjectName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Progress
                            value={sub.score}
                            className={cn(
                              "h-1.5 flex-1 max-w-[120px]",
                              color === 'success' && "[&>div]:bg-success",
                              color === 'warning' && "[&>div]:bg-warning",
                              color === 'destructive' && "[&>div]:bg-destructive"
                            )}
                          />
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-md", `bg-${color}/8 text-${color}`)}>
                            {sub.status === 'needs-support' ? 'Needs Support' : sub.status === 'strong' ? 'Strong' : 'Average'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ───── PROGRESS TREND ───── */}
          <Card className="border-0 card-shadow rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Progress Trend</h3>
                  <p className="text-[10px] text-muted-foreground">Last {student.trend.length} assessments</p>
                </div>
              </div>

              {(() => {
                const trend = student.trend;
                const w = 300;
                const h = 100;
                const padX = 30;
                const padY = 16;
                const stepX = trend.length > 1 ? (w - padX * 2) / (trend.length - 1) : 0;
                const minScore = Math.min(...trend) - 5;
                const maxScore = Math.max(...trend) + 5;
                const range = maxScore - minScore || 1;
                const points = trend.map((s, i) => ({
                  x: padX + i * stepX,
                  y: padY + (1 - (s - minScore) / range) * (h - padY * 2),
                  score: s,
                }));
                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                const areaPath = `${linePath} L${points[points.length - 1].x},${h - padY} L${points[0].x},${h - padY} Z`;
                const latestScore = trend[trend.length - 1];
                const latestColor = latestScore >= 75 ? 'hsl(var(--success))' : latestScore >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--warning))';

                return (
                  <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[120px]" preserveAspectRatio="xMidYMid meet">
                    {[25, 50, 75].map(v => {
                      if (v < minScore || v > maxScore) return null;
                      const y = padY + (1 - (v - minScore) / range) * (h - padY * 2);
                      return (
                        <g key={v}>
                          <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 3" />
                          <text x={padX - 4} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize="8">{v}</text>
                        </g>
                      );
                    })}
                    <path d={areaPath} fill={latestColor} opacity="0.08" />
                    <path d={linePath} fill="none" stroke={latestColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => {
                      const isLatest = i === trend.length - 1;
                      return (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r={isLatest ? 5 : 3.5} fill={isLatest ? latestColor : 'hsl(var(--muted))'} stroke="hsl(var(--card))" strokeWidth="2" />
                          <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="9" fontWeight="700" className={isLatest ? '' : 'fill-muted-foreground'} fill={isLatest ? latestColor : undefined}>
                            {p.score}%
                          </text>
                          <text x={p.x} y={h - 2} textAnchor="middle" fontSize="8" className="fill-muted-foreground">
                            {i === 0 ? 'Prev' : isLatest ? 'Latest' : `T${i + 1}`}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}

              <div className={cn(
                "text-center text-[11px] font-medium px-3 py-1.5 rounded-full mx-auto w-fit",
                student.trendDirection === 'up' ? "bg-success/10 text-success" :
                student.trendDirection === 'down' ? "bg-destructive/10 text-destructive" :
                "bg-muted text-muted-foreground"
              )}>
                {student.trendDirection === 'up' && "📈 Improving — keep encouraging this trajectory"}
                {student.trendDirection === 'down' && "📉 Declining — needs immediate attention"}
                {student.trendDirection === 'stable' && "➡️ Plateaued — try a different approach"}
              </div>
            </CardContent>
          </Card>

        </>
      )}

      {/* ═══════════ SUBJECT DETAIL TAB ═══════════ */}
      {activeData && (
        <SubjectDetailView data={activeData} studentName={student.name} />
      )}

      <p className="text-[10px] text-center text-muted-foreground/60 pb-2">
        AI insights are assistive. Teachers remain in full control.
      </p>
    </div>
  );
};

// ───── SUBJECT DETAIL VIEW ─────
const SubjectDetailView = ({ data, studentName }: { data: SubjectStudentData; studentName: string }) => {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const sortedTopics = [...data.topicScores].sort((a, b) => a.score - b.score);
  const weakestTopic = sortedTopics[0];
  const strongestTopic = sortedTopics[sortedTopics.length - 1];

  // All topics from chapters for heatmap
  const allChapterTopics = useMemo(() => {
    return data.chapters.flatMap(ch =>
      ch.topics.map(t => ({ ...t, chapterName: ch.name }))
    );
  }, [data.chapters]);
  const sortedAllTopics = [...allChapterTopics].sort((a, b) => a.score - b.score);

  // Strength & concern chapters
  const strongChapters = data.chapters.filter(ch => ch.status === 'strong');
  const weakChapters = data.chapters.filter(ch => ch.status === 'weak');
  const avgChapters = data.chapters.filter(ch => ch.status === 'average');

  // AI Summary
  const aiSummary = useMemo(() => {
    const weakTopics = sortedAllTopics.filter(t => t.score < 55);
    const strongTopicsList = sortedAllTopics.filter(t => t.score >= 75);
    const scoreSpread = sortedAllTopics.length > 1
      ? sortedAllTopics[sortedAllTopics.length - 1].score - sortedAllTopics[0].score
      : 0;

    let summary = `${studentName} scores ${data.score}% overall in ${data.subjectName}. `;

    if (weakTopics.length > 0) {
      summary += `"${weakTopics[0].name}" in ${weakTopics[0].chapterName} is the weakest area at ${weakTopics[0].score}%. `;
    }
    if (strongTopicsList.length > 0) {
      summary += `Strongest in "${strongTopicsList[strongTopicsList.length - 1].name}" at ${strongTopicsList[strongTopicsList.length - 1].score}%. `;
    }
    if (scoreSpread > 30) {
      summary += `There's a ${scoreSpread}-point gap between strongest and weakest topics — focus on bridging this inconsistency.`;
    } else if (data.status === 'strong') {
      summary += `Performance is consistent across topics — ready for advanced challenges.`;
    } else {
      summary += `Needs structured practice to strengthen foundational gaps.`;
    }
    return summary;
  }, [data, studentName, sortedAllTopics]);

  const statusConfig = {
    'strong': { label: 'Strong', color: 'text-success', bg: 'bg-success/10' },
    'average': { label: 'Average', color: 'text-warning', bg: 'bg-warning/10' },
    'needs-support': { label: 'Needs Support', color: 'text-destructive', bg: 'bg-destructive/10' },
  };
  const config = statusConfig[data.status];
  const TrendIcon = data.trendDirection === 'up' ? TrendingUp : data.trendDirection === 'down' ? TrendingDown : Minus;
  const trendLabel = data.trendDirection === 'up' ? 'Improving' : data.trendDirection === 'down' ? 'Declining' : 'Stable';

  return (
    <>
      {/* ───── 1. Subject Score Hero ───── */}
      <Card className="border-0 card-shadow-elevated rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-success/4" />
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{data.subjectName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", config.bg, config.color)}>
                  {config.label}
                </span>
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                  data.trendDirection === 'up' ? "bg-success/10 text-success" :
                  data.trendDirection === 'down' ? "bg-destructive/10 text-destructive" :
                  "bg-muted text-muted-foreground"
                )}>
                  <TrendIcon className="w-3 h-3" /> {trendLabel}
                </span>
              </div>
            </div>
            <p className={cn(
              "text-3xl font-extrabold leading-none tracking-tight",
              data.score >= 75 ? "text-success" : data.score >= 50 ? "text-primary" : "text-warning"
            )}>
              {data.score}<span className="text-sm font-normal text-muted-foreground">%</span>
            </p>
          </div>


          {/* Best / Weakest */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-success/5 border border-success/10">
              <span className="text-sm">⭐</span>
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground">Strongest</p>
                <p className="text-[11px] font-bold text-success truncate">{strongestTopic?.topic} · {strongestTopic?.score}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-destructive/5 border border-destructive/10">
              <span className="text-sm">🔻</span>
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground">Weakest</p>
                <p className="text-[11px] font-bold text-destructive truncate">{weakestTopic?.topic} · {weakestTopic?.score}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ───── 2. AI Insight ───── */}
      <Card className="border-0 card-shadow rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[hsl(var(--purple))]/5 to-[hsl(var(--purple))]/2">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--purple))]/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[hsl(var(--purple))]" />
            </div>
            <div className="pt-0.5">
              <p className="text-[10px] font-bold text-[hsl(var(--purple))] uppercase tracking-widest mb-1">AI Analysis</p>
              <p className="text-[13px] text-foreground leading-relaxed">{aiSummary}</p>
            </div>
          </CardContent>
        </div>
      </Card>


      {/* ───── 3. Chapter Deep Dive (with topics inside) ───── */}
      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Chapter-wise Breakdown</h3>
              <p className="text-[10px] text-muted-foreground">Tap to expand topic details</p>
            </div>
          </div>
          <div className="space-y-2">
            {data.chapters.map(ch => {
              const isExpanded = expandedChapter === ch.id;
              const color = ch.status === 'strong' ? 'success' : ch.status === 'average' ? 'warning' : 'destructive';
              return (
                <div key={ch.id}>
                  <button
                    onClick={() => setExpandedChapter(isExpanded ? null : ch.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all tap-target text-left",
                      isExpanded ? "bg-primary/5 border border-primary/15" : "bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
                      `bg-${color}/10 text-${color}`
                    )}>
                      {ch.score}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{ch.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Progress
                          value={ch.score}
                          className={cn(
                            "h-1.5 flex-1 max-w-[120px]",
                            color === 'success' && "[&>div]:bg-success",
                            color === 'warning' && "[&>div]:bg-warning",
                            color === 'destructive' && "[&>div]:bg-destructive"
                          )}
                        />
                        <span className={cn("text-[10px] font-medium", `text-${color}`)}>
                          {ch.status === 'strong' ? 'Strong' : ch.status === 'average' ? 'Average' : 'Weak'}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform shrink-0",
                      isExpanded && "rotate-180"
                    )} />
                  </button>

                  {isExpanded && (
                    <div className="mt-1.5 ml-4 pl-4 border-l-2 border-primary/15 space-y-3 pb-2">
                      {/* AI comment */}
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[hsl(var(--purple))]/5">
                        <Lightbulb className="w-3.5 h-3.5 text-[hsl(var(--purple))] shrink-0 mt-0.5" />
                        <p className="text-[11px] text-foreground leading-relaxed">{ch.aiComment}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ───── 6. Progress Trend ───── */}
      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Progress in {data.subjectName}</h3>
          </div>
          {(() => {
            const trend = data.trend;
            const w = 300;
            const h = 100;
            const padX = 30;
            const padY = 16;
            const stepX = trend.length > 1 ? (w - padX * 2) / (trend.length - 1) : 0;
            const minScore = Math.min(...trend) - 5;
            const maxScore = Math.max(...trend) + 5;
            const range = maxScore - minScore || 1;
            const points = trend.map((s, i) => ({
              x: padX + i * stepX,
              y: padY + (1 - (s - minScore) / range) * (h - padY * 2),
              score: s,
            }));
            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const areaPath = `${linePath} L${points[points.length - 1].x},${h - padY} L${points[0].x},${h - padY} Z`;
            const latestColor = trend[trend.length - 1] >= 75 ? 'hsl(var(--success))' : trend[trend.length - 1] >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--warning))';

            return (
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[120px]" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                {[25, 50, 75].map(v => {
                  if (v < minScore || v > maxScore) return null;
                  const y = padY + (1 - (v - minScore) / range) * (h - padY * 2);
                  return (
                    <g key={v}>
                      <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 3" />
                      <text x={padX - 4} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize="8">{v}</text>
                    </g>
                  );
                })}
                {/* Area fill */}
                <path d={areaPath} fill={latestColor} opacity="0.08" />
                {/* Line */}
                <path d={linePath} fill="none" stroke={latestColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Data points */}
                {points.map((p, i) => {
                  const isLatest = i === trend.length - 1;
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={isLatest ? 5 : 3.5} fill={isLatest ? latestColor : 'hsl(var(--muted))'} stroke="hsl(var(--card))" strokeWidth="2" />
                      <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="9" fontWeight="700" className={isLatest ? '' : 'fill-muted-foreground'} fill={isLatest ? latestColor : undefined}>
                        {p.score}%
                      </text>
                      <text x={p.x} y={h - 2} textAnchor="middle" fontSize="8" className="fill-muted-foreground">
                        {i === 0 ? 'Prev' : isLatest ? 'Latest' : `T${i + 1}`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            );
          })()}
          <div className={cn(
            "text-center text-[11px] font-medium px-3 py-1.5 rounded-full mx-auto w-fit mt-3",
            data.trendDirection === 'up' ? "bg-success/10 text-success" :
            data.trendDirection === 'down' ? "bg-destructive/10 text-destructive" :
            "bg-muted text-muted-foreground"
          )}>
            {data.trendDirection === 'up' && "📈 Improving — keep this momentum going"}
            {data.trendDirection === 'down' && "📉 Declining — needs focused intervention"}
            {data.trendDirection === 'stable' && "➡️ Plateaued — needs a different approach"}
          </div>
        </CardContent>
      </Card>


    </>
  );
};

export default TeacherStudentView;
