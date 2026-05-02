import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParent } from '@/contexts/ParentContext';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Lightbulb, AlertTriangle, MessageSquare,
  ArrowUpRight, ArrowDownRight, Eye, BarChart3, Trophy,
  Target, TrendingUp, CheckCircle2, XCircle, Star,
  ChevronDown, BookOpen
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const ParentExamDetail = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { getExamResults, selectedChild, getSubjectInsight, getProgress } = useParent();
  const results = getExamResults();
  const currentExam = results.find(r => r.id === examId) || results.find(r => r.examType === examId);

  // Get all sibling exams (same exam type)
  const siblingExams = currentExam
    ? results.filter(r => r.examType === currentExam.examType)
    : results.filter(r => r.examType === examId);

  const [activeExamId, setActiveExamId] = useState(examId || '');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (examId) setActiveExamId(examId);
  }, [examId]);

  const exam = results.find(r => r.id === activeExamId) || currentExam;

  if (!exam || !selectedChild) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Exam not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/parent/exams')}>Go back</Button>
      </div>
    );
  }

  const aboveAvg = exam.score >= exam.classAverage;
  const pct = Math.round((exam.score / exam.total) * 100);
  const classAvgPct = Math.round((exam.classAverage / exam.total) * 100);
  const firstName = selectedChild.name.split(' ')[0];
  const diff = exam.score - exam.classAverage;

  const getGrade = (p: number) => {
    if (p >= 90) return { grade: 'A+', color: 'text-success', bg: 'bg-success/10' };
    if (p >= 75) return { grade: 'A', color: 'text-success', bg: 'bg-success/10' };
    if (p >= 60) return { grade: 'B', color: 'text-primary', bg: 'bg-primary/10' };
    if (p >= 45) return { grade: 'C', color: 'text-warning', bg: 'bg-warning/10' };
    return { grade: 'D', color: 'text-destructive', bg: 'bg-destructive/10' };
  };
  const gradeInfo = getGrade(pct);

  const sortedBreakdown = [...exam.marksBreakdown].sort((a, b) => (b.obtained / b.total) - (a.obtained / a.total));
  const bestCategory = sortedBreakdown[0];
  const weakestCategory = sortedBreakdown[sortedBreakdown.length - 1];
  const keyInsight = exam.insights.length > 0 ? exam.insights[0] : null;

  const insight = getSubjectInsight(exam.subject);
  const progress = getProgress().find(p => p.subject === exam.subject);
  const allTopics = insight?.chapterAnalysis?.flatMap(c => c.topics) || insight?.topicAnalysis || [];
  const strongTopics = allTopics.filter(t => t.status === 'strong');
  const weakTopics = allTopics.filter(t => t.status === 'needs-practice');
  const chapters = insight?.chapterAnalysis || [];

  const trendData = progress
    ? progress.scores.map(s => ({
        name: s.examName,
        score: s.score,
        total: s.total,
        pct: Math.round((s.score / s.total) * 100),
      }))
    : [];
  const isImproving = trendData.length >= 2 && trendData[trendData.length - 1].pct > trendData[trendData.length - 2].pct;

  const smartInsight = (() => {
    if (strongTopics.length > 0 && weakTopics.length > 0) {
      return `${firstName} understands ${strongTopics[0].topic.toLowerCase()} well but loses marks in ${weakTopics[0].topic.toLowerCase()}.`;
    }
    if (strongTopics.length > 0) return `${firstName} is doing great across all topics in ${exam.subject}.`;
    return `${firstName} needs more practice in ${exam.subject}.`;
  })();

  const handleSubjectSwitch = (id: string) => {
    setActiveExamId(id);
    setExpandedChapter(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      {/* Header with back + exam type */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground -ml-2" onClick={() => navigate('/parent/exams')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">{exam.examType} Results</h1>
          <p className="text-xs text-muted-foreground">
            {new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ───── Subject Switcher Tabs ───── */}
      {siblingExams.length > 1 && (
          <div ref={tabsRef} className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {siblingExams.map(se => {
            const sePct = Math.round((se.score / se.total) * 100);
            const isActive = se.id === activeExamId;
            const seAbove = se.score >= se.classAverage;
            return (
              <button
                key={se.id}
                onClick={() => handleSubjectSwitch(se.id)}
                className={cn(
                  "flex-shrink-0 px-4 py-2.5 rounded-xl text-left transition-all border-2",
                  isActive
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-card border-transparent hover:bg-muted/50"
                )}
              >
                <p className={cn("text-sm font-semibold", isActive ? "text-primary" : "text-foreground")}>{se.subject}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn("text-xs font-bold", sePct >= 75 ? "text-success" : sePct >= 60 ? "text-primary" : "text-warning")}>
                    {se.score}/{se.total}
                  </span>
                  <span className={cn("text-[10px]", seAbove ? "text-success" : "text-warning")}>
                    {seAbove ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ───── 1. Exam Summary ───── */}
      <Card className="border-0 card-shadow-elevated overflow-hidden rounded-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-success/4" />
        <CardContent className="p-5 relative">
          <p className="text-lg font-bold text-foreground">{exam.subject}</p>

          <div className="flex items-end justify-between mt-3">
            <div className="flex items-end gap-3">
              <p className={cn("text-4xl font-extrabold leading-none", gradeInfo.color)}>
                {exam.score}<span className="text-lg text-muted-foreground font-normal">/{exam.total}</span>
              </p>
              <span className={cn("px-2.5 py-1 rounded-lg text-sm font-bold mb-0.5", gradeInfo.bg, gradeInfo.color)}>
                {gradeInfo.grade}
              </span>
            </div>
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              aboveAvg ? "text-success" : "text-warning"
            )}>
              {aboveAvg ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(diff)} marks {aboveAvg ? 'above' : 'below'} avg
            </span>
          </div>

          {/* Comparison bars */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">{firstName}</span>
              <div className="flex-1 h-2.5 bg-muted/50 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", pct >= 75 ? "bg-success" : pct >= 60 ? "bg-primary" : "bg-warning")} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-foreground w-10 text-right">{pct}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">Class</span>
              <div className="flex-1 h-2.5 bg-muted/50 rounded-full overflow-hidden">
                <div className="h-full bg-muted-foreground/25 rounded-full" style={{ width: `${classAvgPct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">{classAvgPct}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ───── 2. Chapter & Topic Analysis ───── */}
      {insight && chapters.length > 0 && (
        <Card className="border-0 card-shadow">
          <CardContent className="p-4">
            <h2 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-primary" /> Chapter & Topic Analysis
            </h2>
            <p className="text-[10px] text-muted-foreground mb-3">
              {strongTopics.length} strong · {weakTopics.length} needs practice — tap a chapter for details
            </p>
            <div className="space-y-2">
              {chapters.map((ch, ci) => {
                const chapterWeak = ch.topics.filter(t => t.status === 'needs-practice');
                const allStrong = chapterWeak.length === 0;
                const allWeak = ch.topics.filter(t => t.status === 'strong').length === 0;
                const isExpanded = expandedChapter === ci;
                const chPct = ch.score && ch.total ? Math.round((ch.score / ch.total) * 100) : null;
                return (
                  <div key={ci} className={cn(
                    "rounded-xl border overflow-hidden transition-all",
                    allStrong ? "border-success/20" : allWeak ? "border-warning/20" : "border-border"
                  )}>
                    {/* Chapter header - clickable */}
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 p-3 text-left transition-colors",
                        isExpanded
                          ? (allStrong ? "bg-success/10" : allWeak ? "bg-warning/10" : "bg-muted/50")
                          : (allStrong ? "bg-success/5 hover:bg-success/10" : allWeak ? "bg-warning/5 hover:bg-warning/10" : "bg-muted/30 hover:bg-muted/50")
                      )}
                      onClick={() => setExpandedChapter(isExpanded ? null : ci)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{ch.chapter}</p>
                        {chPct !== null && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                              <div
                                className={cn("h-full rounded-full", chPct >= 80 ? "bg-success" : chPct >= 60 ? "bg-primary" : "bg-warning")}
                                style={{ width: `${chPct}%` }}
                              />
                            </div>
                            <span className={cn("text-[10px] font-bold", chPct >= 80 ? "text-success" : chPct >= 60 ? "text-primary" : "text-warning")}>
                              {ch.score}/{ch.total}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {allStrong && <CheckCircle2 className="w-4 h-4 text-success" />}
                        {allWeak && <AlertTriangle className="w-4 h-4 text-warning" />}
                        {!allStrong && !allWeak && (
                          <span className="text-[10px] text-muted-foreground">{ch.topics.filter(t => t.status === 'strong').length}/{ch.topics.length}</span>
                        )}
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                      </div>
                    </button>

                    {/* Expanded topic details */}
                    {isExpanded && (
                      <div className="border-t border-border/50 bg-background p-3 space-y-3">
                        {/* Positives */}
                        {ch.positives && ch.positives.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-success uppercase tracking-wide mb-1.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> What went well
                            </p>
                            <div className="space-y-1.5">
                              {ch.positives.map((p, pi) => (
                                <div key={pi} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                                  <p className="text-xs text-foreground leading-relaxed">{p}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Deductions */}
                        {ch.deductions && ch.deductions.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-warning uppercase tracking-wide mb-1.5 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Where marks were lost
                            </p>
                            <div className="space-y-1.5">
                              {ch.deductions.map((d, di) => (
                                <div key={di} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                                  <p className="text-xs text-foreground leading-relaxed">{d}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* No feedback available */}
                        {(!ch.positives || ch.positives.length === 0) && (!ch.deductions || ch.deductions.length === 0) && (
                          <p className="text-xs text-muted-foreground italic">No detailed feedback available</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}


      {/* ───── 10. View Answer Sheet ───── */}
      {exam.answerSheetPages.length > 0 && (
        <Button className="w-full h-12 text-sm font-semibold" onClick={() => navigate(`/parent/answer-sheet/${exam.id}`)}>
          <Eye className="w-4 h-4 mr-2" /> View Answer Sheet
        </Button>
      )}
    </div>
  );
};

export default ParentExamDetail;
