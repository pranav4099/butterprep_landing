import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParent } from '@/contexts/ParentContext';
import { cn } from '@/lib/utils';
import { ExamType } from '@/contexts/ParentContext';
import {
  ArrowLeft, FileText, ChevronRight, ArrowUpRight, ArrowDownRight,
  Trophy, AlertTriangle
} from 'lucide-react';

const examTypeLabels: Record<ExamType, { label: string; full: string }> = {
  FA1: { label: 'FA1', full: 'Formative Assessment 1' },
  FA2: { label: 'FA2', full: 'Formative Assessment 2' },
  SA1: { label: 'SA1', full: 'Summative Assessment 1' },
  FA3: { label: 'FA3', full: 'Formative Assessment 3' },
  FA4: { label: 'FA4', full: 'Formative Assessment 4' },
  SA2: { label: 'SA2', full: 'Summative Assessment 2' },
};

const ParentExamTypeSubjects = () => {
  const { examType } = useParams();
  const navigate = useNavigate();
  const { selectedChild, getExamResults } = useParent();
  const results = getExamResults();

  const et = examType as ExamType;
  const exams = results.filter(r => r.examType === et);

  if (!selectedChild || !examTypeLabels[et]) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Exam type not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/parent/exams')}>Go back</Button>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" onClick={() => navigate('/parent/exams')}>
          <ArrowLeft className="w-4 h-4" /> Back to Exams
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results available for {examTypeLabels[et].full} yet.</p>
        </div>
      </div>
    );
  }

  const overallAvg = Math.round(exams.reduce((s, r) => s + (r.score / r.total) * 100, 0) / exams.length);
  const aboveAvgCount = exams.filter(r => r.score >= r.classAverage).length;
  const bestSubject = exams.reduce((best, e) => (e.score / e.total) > (best.score / best.total) ? e : best, exams[0]);
  const weakSubjects = exams.filter(e => e.score < e.classAverage);
  const isSA = et.startsWith('SA');

  return (
    <div className="space-y-5">
      <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" onClick={() => navigate('/parent/exams')}>
        <ArrowLeft className="w-4 h-4" /> Back to Exams
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">{examTypeLabels[et].full}</h1>
          {isSA && <span className="text-xs bg-[hsl(var(--purple))]/10 text-[hsl(var(--purple))] px-2 py-0.5 rounded-full font-medium">Major Exam</span>}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedChild.name} — Class {selectedChild.className}-{selectedChild.section}
        </p>
      </div>

      {/* Overall Summary Card */}
      <Card className="border-0 card-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Overall Average</p>
              <p className={cn("text-3xl font-bold", overallAvg >= 75 ? "text-success" : overallAvg >= 60 ? "text-primary" : "text-warning")}>
                {overallAvg}%
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{exams.length} subjects</p>
              <p>{aboveAvgCount} above class avg</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-success" />
              Best: {bestSubject.subject}
            </span>
            {weakSubjects.length > 0 && (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                Needs work: {weakSubjects.map(e => e.subject).join(', ')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subject Cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Subjects</h2>
        <div className="space-y-2.5">
          {exams.map(exam => {
            const pct = Math.round((exam.score / exam.total) * 100);
            const aboveAvg = exam.score >= exam.classAverage;
            return (
              <Card
                key={exam.id}
                className="border-0 card-shadow cursor-pointer hover:shadow-md transition-all hover:scale-[1.005] active:scale-[0.995]"
                onClick={() => navigate(`/parent/exam/${exam.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                    pct >= 75 ? "bg-success/10" : pct >= 60 ? "bg-primary/10" : "bg-warning/10"
                  )}>
                    <FileText className={cn(
                      "w-5 h-5",
                      pct >= 75 ? "text-success" : pct >= 60 ? "text-primary" : "text-warning"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{exam.subject}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("flex items-center gap-0.5 text-xs", aboveAvg ? "text-success" : "text-warning")}>
                        {aboveAvg ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {aboveAvg ? 'Above average' : 'Below average'}
                      </span>
                      <span className="text-xs text-muted-foreground">• Class avg: {Math.round((exam.classAverage / exam.total) * 100)}%</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 mr-1">
                    <p className="text-lg font-bold text-foreground">
                      {exam.score}<span className="text-xs text-muted-foreground font-normal">/{exam.total}</span>
                    </p>
                    <p className={cn("text-xs font-medium", pct >= 75 ? "text-success" : pct >= 60 ? "text-primary" : "text-warning")}>
                      {pct}%
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ParentExamTypeSubjects;
