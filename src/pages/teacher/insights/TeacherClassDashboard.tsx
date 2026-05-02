import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Flame, BookOpen, Lightbulb,
  ChevronDown, ChevronRight, Sparkles, CheckCircle2,
  Users, Trophy, AlertTriangle, TrendingUp, TrendingDown,
  Target, Zap, BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ClassSubjectData, ChapterPerformance, TopicPerformance } from '@/data/teacherInsightsData';
import TeacherStudentView from './TeacherStudentView';

interface Props {
  data: ClassSubjectData;
  onBack: () => void;
  embedded?: boolean;
}

const statusConfig = {
  'strong': { label: 'Strong', color: 'text-success', bg: 'bg-success/10', border: 'border-success', icon: '✅' },
  'average': { label: 'Average', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning', icon: '⚠️' },
  'needs-attention': { label: 'Needs Attention', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive', icon: '🔴' },
  'weak': { label: 'Weak', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive', icon: '❌' },
  'needs-support': { label: 'Needs Support', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive', icon: '🔴' },
};

const TeacherClassDashboard = ({ data, onBack, embedded }: Props) => {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeBucket, setActiveBucket] = useState<'strong' | 'average' | 'needs-support' | null>(null);

  const needsSupport = data.students.filter(s => s.status === 'needs-support');
  const average = data.students.filter(s => s.status === 'average');
  const strong = data.students.filter(s => s.status === 'strong');
  const totalStudents = data.students.length;

  // Derived insights from chapters & topics
  const allTopics = useMemo(() => {
    return data.chapters.flatMap(ch =>
      ch.topics.map(t => ({ ...t, chapterName: ch.name, chapterId: ch.id }))
    );
  }, [data.chapters]);

  const strongTopics = useMemo(() => allTopics.filter(t => t.status === 'strong').sort((a, b) => b.score - a.score), [allTopics]);
  const weakTopics = useMemo(() => allTopics.filter(t => t.status === 'weak').sort((a, b) => a.score - b.score), [allTopics]);
  const avgTopics = useMemo(() => allTopics.filter(t => t.status === 'average'), [allTopics]);

  const strongestChapter = useMemo(() => [...data.chapters].sort((a, b) => b.avgScore - a.avgScore)[0], [data.chapters]);
  const weakestChapter = useMemo(() => [...data.chapters].sort((a, b) => a.avgScore - b.avgScore)[0], [data.chapters]);

  // Performance spread
  const highestScore = Math.max(...data.students.map(s => s.score));
  const lowestScore = Math.min(...data.students.map(s => s.score));
  const scoreSpread = highestScore - lowestScore;

  // AI summary
  const aiSummary = useMemo(() => {
    const parts: string[] = [];
    if (weakTopics.length > 0) {
      parts.push(`"${weakTopics[0].name}" in ${weakTopics[0].chapterName} is the weakest area at ${weakTopics[0].score}%`);
    }
    if (strongTopics.length > 0) {
      parts.push(`"${strongTopics[0].name}" is the class strength at ${strongTopics[0].score}%`);
    }
    if (needsSupport.length > 0) {
      parts.push(`${needsSupport.length} students need immediate support`);
    }
    if (scoreSpread > 40) {
      parts.push(`There's a ${scoreSpread}-point gap between the highest and lowest scorer — consider differentiated instruction`);
    }
    return parts.join('. ') + '.';
  }, [weakTopics, strongTopics, needsSupport, scoreSpread]);

  const selectedStudent = data.students.find(s => s.id === selectedStudentId);
  if (selectedStudent) {
    return (
      <TeacherStudentView
        student={selectedStudent}
        onBack={() => setSelectedStudentId(null)}
      />
    );
  }

  // Bucket list view
  if (activeBucket) {
    const bucketStudents = activeBucket === 'strong' ? strong : activeBucket === 'average' ? average : needsSupport;
    const bucketLabel = activeBucket === 'strong' ? 'Strong' : activeBucket === 'average' ? 'Average' : 'Needs Support';
    const bucketColor = activeBucket === 'strong' ? 'success' : activeBucket === 'average' ? 'warning' : 'destructive';
    const bucketEmoji = activeBucket === 'strong' ? '🟢' : activeBucket === 'average' ? '🟡' : '🔴';

    return (
      <div className="space-y-4">
        <button onClick={() => setActiveBucket(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors tap-target">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <Card className="border-0 card-shadow-elevated rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-transparent" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{data.className} · {data.subject}</p>
                <h2 className="text-lg font-bold text-foreground tracking-tight mt-0.5">{bucketEmoji} {bucketLabel} Students</h2>
              </div>
              <div className={cn("text-3xl font-extrabold", `text-${bucketColor}`)}>
                {bucketStudents.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {bucketStudents.map((s) => (
            <Card
              key={s.id}
              className="border-0 card-shadow rounded-xl cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
              onClick={() => setSelectedStudentId(s.id)}
            >
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold", `bg-${bucketColor}/10 text-${bucketColor}`)}>
                    {s.score}%
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">Roll #{s.rollNo}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const config = statusConfig[data.classStatus];

  return (
    <div className="space-y-4">
      {/* Back */}
      {!embedded && (
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors tap-target">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      )}

      {/* ═══════ 1. HERO SUMMARY ═══════ */}
      <Card className="border-0 card-shadow-elevated rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-success/4" />
        <CardContent className="p-5 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{data.className}</p>
              <h2 className="text-lg font-bold text-foreground tracking-tight mt-0.5">{data.subject}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold", config.bg, config.color)}>
                  {config.icon} {config.label}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  <Users className="w-3 h-3" /> {data.totalStudents}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-4xl font-extrabold leading-none tracking-tight",
                data.avgScore >= 75 ? "text-success" : data.avgScore >= 55 ? "text-primary" : "text-warning"
              )}>
                {data.avgScore}<span className="text-lg font-normal text-muted-foreground">%</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Class Average</p>
            </div>
          </div>

          {/* Student buckets */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: 'Strong', count: strong.length, color: 'success', emoji: '🟢', key: 'strong' as const },
              { label: 'Average', count: average.length, color: 'warning', emoji: '🟡', key: 'average' as const },
              { label: 'Support', count: needsSupport.length, color: 'destructive', emoji: '🔴', key: 'needs-support' as const },
            ].map(({ label, count, color, emoji, key }) => (
              <button
                key={label}
                onClick={() => setActiveBucket(key)}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl transition-all tap-target text-left",
                  `bg-${color}/5 border border-${color}/10 hover:bg-${color}/8`
                )}
              >
                <span className="text-base">{emoji}</span>
                <div>
                  <p className={cn("text-lg font-bold leading-none", `text-${color}`)}>{count}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══════ 2. AI INSIGHT ═══════ */}
      <Card className="border-0 card-shadow rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[hsl(var(--purple))]/5 to-[hsl(var(--purple))]/2">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--purple))]/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[hsl(var(--purple))]" />
            </div>
            <div className="pt-0.5">
              <p className="text-[10px] font-bold text-[hsl(var(--purple))] uppercase tracking-widest mb-1">AI Summary</p>
              <p className="text-[13px] text-foreground leading-relaxed">{aiSummary}</p>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* ═══════ 3. WHAT MATTERS MOST ═══════ */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Biggest strength */}
        {strongestChapter && (
          <Card className="border-0 card-shadow rounded-xl border-l-[3px] border-l-success">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Trophy className="w-4 h-4 text-success" />
                <p className="text-[10px] font-bold text-success uppercase tracking-widest">Class Strength</p>
              </div>
              <p className="text-[13px] text-foreground leading-relaxed">
                <span className="font-bold">{strongestChapter.name}</span> — {strongestChapter.avgScore}% avg
              </p>
            </CardContent>
          </Card>
        )}

        {/* Biggest concern */}
        {weakestChapter && (
          <Card className="border-0 card-shadow rounded-xl border-l-[3px] border-l-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Biggest Concern</p>
              </div>
              <p className="text-[13px] text-foreground leading-relaxed">
                <span className="font-bold">{weakestChapter.name}</span> — {weakestChapter.avgScore}% avg
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══════ CHAPTER DEEP DIVE ═══════ */}
      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Chapter Deep Dive</h3>
              <p className="text-[10px] text-muted-foreground">Expand for topic-level analysis</p>
            </div>
          </div>

          <div className="space-y-2">
            {[...data.chapters].sort((a, b) => a.avgScore - b.avgScore).map((ch) => {
              const chConfig = ch.status === 'strong' ? statusConfig.strong :
                              ch.status === 'average' ? statusConfig.average : statusConfig.weak;
              const isExpanded = expandedChapter === ch.id;
              const weakCount = ch.topics.filter(t => t.status === 'weak').length;
              const strongCount = ch.topics.filter(t => t.status === 'strong').length;

              return (
                <div key={ch.id} className={cn(
                  "rounded-xl border overflow-hidden transition-all",
                  isExpanded ? "border-primary/20 shadow-sm" : "border-border/50"
                )}>
                  <button
                    onClick={() => setExpandedChapter(isExpanded ? null : ch.id)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors tap-target"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold", chConfig.bg, chConfig.color)}>
                        {ch.avgScore}%
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-sm text-foreground block">{ch.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {weakCount > 0 && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-destructive/8 text-destructive">
                              {weakCount} weak
                            </span>
                          )}
                          {strongCount > 0 && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-success/8 text-success">
                              {strongCount} strong
                            </span>
                          )}
                          <span className="text-[9px] text-muted-foreground">{ch.topics.length} topics</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      }
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3 bg-muted/20">
                      {/* Chapter insight */}
                      <div className="p-2.5 rounded-lg bg-[hsl(var(--purple))]/5 border border-[hsl(var(--purple))]/10">
                        <p className="text-[11px] text-foreground leading-relaxed">
                          {ch.status === 'weak'
                            ? `⚠️ This chapter needs focused revision. ${weakCount} out of ${ch.topics.length} topics are weak. Consider re-teaching with different approaches.`
                            : ch.status === 'strong'
                            ? `✅ Strong performance here! ${strongCount} out of ${ch.topics.length} topics are well understood. Use this as a confidence booster.`
                            : `📊 Mixed performance — ${strongCount} strong, ${weakCount} weak. Target the weak topics specifically.`}
                        </p>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>


      <p className="text-[10px] text-center text-muted-foreground/60 pb-2">
        AI insights are assistive. Teachers remain in full control.
      </p>
    </div>
  );
};

export default TeacherClassDashboard;
