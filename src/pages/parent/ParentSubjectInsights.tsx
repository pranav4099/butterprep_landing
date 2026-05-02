import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParent } from '@/contexts/ParentContext';
import { cn } from '@/lib/utils';
import { ExamType } from '@/contexts/ParentContext';
import {
  ArrowLeft, TrendingUp, CheckCircle2, AlertTriangle,
  Lightbulb, Target, BookOpen, ArrowUpRight, ArrowDownRight,
  Star, ChevronRight, Trophy, FileText, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const examTypeLabels: Record<ExamType, { label: string; full: string }> = {
  FA1: { label: 'FA1', full: 'Formative Assessment 1' },
  FA2: { label: 'FA2', full: 'Formative Assessment 2' },
  SA1: { label: 'SA1', full: 'Summative Assessment 1' },
  FA3: { label: 'FA3', full: 'Formative Assessment 3' },
  FA4: { label: 'FA4', full: 'Formative Assessment 4' },
  SA2: { label: 'SA2', full: 'Summative Assessment 2' },
};

const ParentSubjectInsights = () => {
  const { subject } = useParams();
  const decodedSubject = decodeURIComponent(subject || '');
  const navigate = useNavigate();
  const { selectedChild, getExamResults, getSubjectInsight, getProgress } = useParent();
  const [selectedExamType, setSelectedExamType] = useState<ExamType | 'all'>('all');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  if (!selectedChild || !decodedSubject) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Subject not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/parent/dashboard')}>Go back</Button>
      </div>
    );
  }

  const insight = getSubjectInsight(decodedSubject);
  const progress = getProgress().find(p => p.subject === decodedSubject);
  const subjectExams = getExamResults().filter(r => r.subject === decodedSubject)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstName = selectedChild.name.split(' ')[0];

  const examTypeOrder: ExamType[] = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];
  const examsByType = examTypeOrder
    .map(et => {
      const exam = subjectExams.find(e => e.examType === et);
      return exam ? { et, exam } : null;
    })
    .filter(Boolean) as { et: ExamType; exam: typeof subjectExams[0] }[];

  // Selected exam data
  const selectedExam = selectedExamType !== 'all'
    ? subjectExams.find(e => e.examType === selectedExamType)
    : null;

  // Averages (overall)
  const avg = subjectExams.length > 0
    ? Math.round(subjectExams.reduce((s, r) => s + (r.score / r.total) * 100, 0) / subjectExams.length)
    : 0;
  const classAvg = subjectExams.length > 0
    ? Math.round(subjectExams.reduce((s, r) => s + (r.classAverage / r.total) * 100, 0) / subjectExams.length)
    : 0;
  const diff = avg - classAvg;
  const aboveAvg = diff >= 0;

  // Trend data
  const trendData = progress
    ? progress.scores.map(s => ({
        name: s.examName,
        score: s.score,
        total: s.total,
        pct: Math.round((s.score / s.total) * 100),
      }))
    : [];

  const isImproving = trendData.length >= 2 && trendData[trendData.length - 1].pct > trendData[trendData.length - 2].pct;
  const allTopics = insight?.chapterAnalysis?.flatMap(c => c.topics) || insight?.topicAnalysis || [];
  const strongTopics = allTopics.filter(t => t.status === 'strong');
  const weakTopics = allTopics.filter(t => t.status === 'needs-practice');
  const chapters = insight?.chapterAnalysis || [];

  const smartInsight = (() => {
    if (strongTopics.length > 0 && weakTopics.length > 0) {
      return `${firstName} understands ${strongTopics[0].topic.toLowerCase()} well but loses marks in ${weakTopics[0].topic.toLowerCase()}.`;
    }
    if (strongTopics.length > 0) return `${firstName} is doing great across all topics in ${decodedSubject}.`;
    return `${firstName} needs more practice in ${decodedSubject}.`;
  })();

  return (
    <div className="space-y-4">
      <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {/* ───── 1. Subject Summary Card ───── */}
      <Card className="border-0 card-shadow-elevated overflow-hidden rounded-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-success/4" />
        <CardContent className="p-5 relative">
          <p className="text-xs text-muted-foreground tracking-wide">{firstName} · Class {selectedChild.className}-{selectedChild.section}</p>
          <h1 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">{decodedSubject}</h1>

          <div className="flex items-end justify-between mt-4">
            <div>
              <p className={cn("text-4xl font-extrabold leading-none tracking-tight", avg >= 75 ? "text-success" : avg >= 60 ? "text-primary" : "text-warning")}>
                {avg}<span className="text-lg font-normal text-muted-foreground">%</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Average Score</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full",
                aboveAvg ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              )}>
                {aboveAvg ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {aboveAvg ? '+' : ''}{diff}% vs class
              </span>
              {isImproving && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
                  <TrendingUp className="w-3 h-3" /> Improving
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ───── EXAM TYPE NAV BAR ───── */}
      {examsByType.length > 0 && (
        <div className="sticky top-0 z-10 glass-bar -mx-4 px-4 py-2.5 border-b border-border/40">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            <button
              className={cn(
                "flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-all active:scale-95",
                selectedExamType === 'all'
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              onClick={() => { setSelectedExamType('all'); setExpandedChapter(null); }}
            >
              All
            </button>
            {examsByType.map(({ et, exam }) => {
              const pct = Math.round((exam.score / exam.total) * 100);
              const isSA = et.startsWith('SA');
              const isActive = selectedExamType === et;
              return (
                <button
                  key={et}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all active:scale-95",
                    isActive
                      ? "bg-foreground text-background shadow-sm"
                      : isSA
                        ? "bg-[hsl(var(--purple))]/10 text-[hsl(var(--purple))] hover:bg-[hsl(var(--purple))]/20"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                  onClick={() => { setSelectedExamType(et); setExpandedChapter(null); }}
                >
                  {et}
                  <span className={cn(
                    "text-[10px] font-bold",
                    isActive ? "text-background/70" : pct >= 75 ? "text-success" : pct >= 60 ? "text-primary" : "text-warning"
                  )}>
                    {pct}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ───── SELECTED EXAM DETAIL (inline) ───── */}
      {selectedExam && (
        <div className="space-y-4">
          {/* Score Card */}
          <Card className="border-0 card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {examTypeLabels[selectedExam.examType].full}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(selectedExam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-3xl font-extrabold leading-none",
                    (selectedExam.score / selectedExam.total) * 100 >= 75 ? "text-success"
                      : (selectedExam.score / selectedExam.total) * 100 >= 60 ? "text-primary" : "text-warning"
                  )}>
                    {selectedExam.score}<span className="text-sm font-normal text-muted-foreground">/{selectedExam.total}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {Math.round((selectedExam.score / selectedExam.total) * 100)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium",
                  selectedExam.score >= selectedExam.classAverage ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                )}>
                  {selectedExam.score >= selectedExam.classAverage ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {selectedExam.score >= selectedExam.classAverage ? 'Above' : 'Below'} class avg ({Math.round((selectedExam.classAverage / selectedExam.total) * 100)}%)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Feedback */}
          {selectedExam.teacherFeedback && (
            <Card className="border-0 card-shadow bg-[hsl(var(--purple))]/5">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--purple))]/10 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-[hsl(var(--purple))]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[hsl(var(--purple))] uppercase tracking-wide mb-0.5">Teacher Feedback</p>
                  <p className="text-sm text-foreground leading-relaxed">{selectedExam.teacherFeedback}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Marks Breakdown */}
          {selectedExam.marksBreakdown.length > 0 && (
            <Card className="border-0 card-shadow">
              <CardContent className="p-4">
                <h2 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" /> Marks Breakdown
                </h2>
                <div className="space-y-2">
                  {selectedExam.marksBreakdown.map((mb, i) => {
                    const mbPct = Math.round((mb.obtained / mb.total) * 100);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{mb.category}</p>
                          <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", mbPct >= 75 ? "bg-success" : mbPct >= 60 ? "bg-primary" : "bg-warning")}
                              style={{ width: `${mbPct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-foreground flex-shrink-0">
                          {mb.obtained}<span className="text-muted-foreground font-normal">/{mb.total}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reasons Marks Lost */}
          {selectedExam.reasonsMarksLost.length > 0 && (
            <Card className="border-0 card-shadow border-l-4 border-l-warning">
              <CardContent className="p-4">
                <h2 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" /> Where Marks Were Lost
                </h2>
                <div className="space-y-2">
                  {selectedExam.reasonsMarksLost.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
                      <p className="text-sm text-foreground">{r}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights for this exam */}
          {selectedExam.insights.length > 0 && (
            <Card className="border-0 card-shadow bg-primary/5 border-l-4 border-l-primary">
              <CardContent className="p-4">
                <h2 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-primary" /> Insights
                </h2>
                <div className="space-y-2">
                  {selectedExam.insights.map((ins, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm text-foreground leading-relaxed">{ins}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* View Answer Sheet */}
          {selectedExam.answerSheetPages.length > 0 && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate(`/parent/exam/${selectedExam.id}`)}
            >
              <Eye className="w-4 h-4" /> View Answer Sheet & Full Details
            </Button>
          )}
        </div>
      )}

      {/* ───── ALL VIEW: Performance Trend ───── */}
      {selectedExamType === 'all' && (
        <>
          {trendData.length >= 2 && (
            <Card className="border-0 card-shadow">
              <CardContent className="p-4">
                <h2 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" /> Exam Progression
                </h2>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="subjGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip
                        formatter={(v: number, _: string, props: any) => [`${props.payload.score}/${props.payload.total} (${v}%)`, 'Score']}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                      />
                      <Area type="monotone" dataKey="pct" stroke="hsl(var(--primary))" fill="url(#subjGrad)" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {isImproving && (
                  <p className="text-xs text-success mt-2 font-medium">
                    ↑ Consistent improvement in this subject
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Chapter & Topic Analysis */}
          {insight && chapters.length > 0 && (
            <Card className="border-0 card-shadow">
              <CardContent className="p-4">
                <h2 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" /> Chapter & Topic Analysis
                </h2>
                <p className="text-[10px] text-muted-foreground mb-3">
                  {strongTopics.length} strong · {weakTopics.length} needs practice
                </p>
                <div className="space-y-3">
                  {chapters.map((ch, ci) => {
                    const chapterWeak = ch.topics.filter(t => t.status === 'needs-practice');
                    const allStrong = chapterWeak.length === 0;
                    const allWeak = ch.topics.filter(t => t.status === 'strong').length === 0;
                    return (
                      <div key={ci} className={cn(
                        "rounded-xl p-3 border",
                        allStrong ? "border-success/20 bg-success/5" : allWeak ? "border-warning/20 bg-warning/5" : "border-border bg-muted/30"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-foreground">{ch.chapter}</p>
                          {allStrong && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                          {allWeak && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Common Mistakes */}
          {insight && insight.commonMistakes.length > 0 && (
            <Card className="border-0 card-shadow border-l-4 border-l-warning">
              <CardContent className="p-4">
                <h2 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" /> Common Mistakes
                </h2>
                <div className="space-y-2">
                  {insight.commonMistakes.map((m, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
                      <p className="text-sm text-foreground">{m}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Smart Insight */}
          <Card className="border-0 card-shadow bg-[hsl(var(--purple))]/5">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--purple))]/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-[hsl(var(--purple))]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[hsl(var(--purple))] uppercase tracking-wide mb-0.5">Smart Insight</p>
                <p className="text-sm text-foreground leading-relaxed">{smartInsight}</p>
              </div>
            </CardContent>
          </Card>


        </>
      )}
    </div>
  );
};

export default ParentSubjectInsights;