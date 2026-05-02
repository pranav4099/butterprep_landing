import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useParent } from '@/contexts/ParentContext';
import { cn } from '@/lib/utils';
import { ExamType, ExamResult } from '@/contexts/ParentContext';
import {
  BookOpen, ChevronRight, Trophy, AlertTriangle,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const examTypeLabels: Record<ExamType, { label: string; full: string }> = {
  FA1: { label: 'FA1', full: 'Formative Assessment 1' },
  FA2: { label: 'FA2', full: 'Formative Assessment 2' },
  SA1: { label: 'SA1', full: 'Summative Assessment 1' },
  FA3: { label: 'FA3', full: 'Formative Assessment 3' },
  FA4: { label: 'FA4', full: 'Formative Assessment 4' },
  SA2: { label: 'SA2', full: 'Summative Assessment 2' },
};

const ParentExamHistory = () => {
  const navigate = useNavigate();
  const { selectedChild, getExamResults } = useParent();
  const results = getExamResults();

  if (!selectedChild) return null;

  const groupedByType: Record<ExamType, ExamResult[]> = {} as any;
  (['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'] as ExamType[]).forEach(et => { groupedByType[et] = []; });
  results.forEach(r => { if (groupedByType[r.examType]) groupedByType[r.examType].push(r); });

  const handleCardClick = (et: ExamType) => {
    const exams = groupedByType[et];
    if (exams.length > 0) {
      navigate(`/parent/exam/${exams[0].id}`);
    }
  };

  const renderCard = (et: ExamType) => {
    const exams = groupedByType[et];
    const isCompleted = exams.length > 0;
    const isSA = et.startsWith('SA');

    if (!isCompleted) {
      return (
        <Card key={et} className="border-0 card-shadow rounded-xl opacity-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{examTypeLabels[et].label}</p>
                <p className="text-[11px] text-muted-foreground">{examTypeLabels[et].full}</p>
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">Upcoming</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    const avg = Math.round(exams.reduce((s, r) => s + (r.score / r.total) * 100, 0) / exams.length);
    const aboveAvgCount = exams.filter(r => r.score >= r.classAverage).length;
    const bestSubject = exams.reduce((best, e) => (e.score / e.total) > (best.score / best.total) ? e : best, exams[0]);
    const worstSubject = exams.reduce((worst, e) => (e.score / e.total) < (worst.score / worst.total) ? e : worst, exams[0]);

    return (
      <Card
        key={et}
        className="border-0 card-shadow rounded-xl overflow-hidden cursor-pointer hover:card-shadow-elevated transition-shadow tap-target"
        onClick={() => handleCardClick(et)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              isSA ? "bg-[hsl(var(--purple))]/10" : "bg-primary/10"
            )}>
              <span className={cn("text-xs font-bold", isSA ? "text-[hsl(var(--purple))]" : "text-primary")}>{et}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{examTypeLabels[et].full}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{exams.length} subjects · {aboveAvgCount} above avg</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <p className={cn("text-xl font-bold tracking-tight", avg >= 75 ? "text-success" : avg >= 60 ? "text-primary" : "text-warning")}>
                {avg}%
              </p>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
            </div>
          </div>

          {/* Subject score pills */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {exams.map(exam => {
              const ePct = Math.round((exam.score / exam.total) * 100);
              return (
                <div key={exam.id} className={cn(
                  "flex-shrink-0 px-2.5 py-1.5 rounded-lg border",
                  ePct >= 75 ? "bg-success/5 border-success/15" : ePct >= 60 ? "bg-primary/5 border-primary/15" : "bg-warning/5 border-warning/15"
                )}>
                  <p className="text-[11px] font-medium text-foreground">{exam.subject}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={cn("text-xs font-bold", ePct >= 75 ? "text-success" : ePct >= 60 ? "text-primary" : "text-warning")}>
                      {ePct}%
                    </span>
                    {exam.score >= exam.classAverage
                      ? <ArrowUpRight className="w-3 h-3 text-success" />
                      : <ArrowDownRight className="w-3 h-3 text-warning" />
                    }
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="inline-flex items-center gap-1 text-[10px] bg-success/8 text-success px-2 py-0.5 rounded-full font-medium">
              <Trophy className="w-3 h-3" /> Best: {bestSubject.subject}
            </span>
            {exams.length > 1 && worstSubject.id !== bestSubject.id && (worstSubject.score / worstSubject.total) < 0.75 && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-warning/8 text-warning px-2 py-0.5 rounded-full font-medium">
                <AlertTriangle className="w-3 h-3" /> Focus: {worstSubject.subject}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Exam History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {selectedChild.name} · Class {selectedChild.className}-{selectedChild.section} · 2025–26
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Term 1</p>
          {(['FA1', 'FA2', 'SA1'] as ExamType[]).map(et => renderCard(et))}
        </div>
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Term 2</p>
          {(['FA3', 'FA4', 'SA2'] as ExamType[]).map(et => renderCard(et))}
        </div>
      </div>
    </div>
  );
};

export default ParentExamHistory;
