import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, BookOpen, Eye, CheckCircle2, Lock, Zap, Mic, FlaskConical, Clock, Users, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ConfirmModal from '@/components/enrollment/ConfirmModal';
import { toast } from '@/hooks/use-toast';
import { mockQuickAssessments, masterExams, mockStudents, mockScores } from '@/data/quickAssessmentData';

interface ExamAssignment {
  id: string;
  className: string;
  section: string;
  subject: string;
  totalPapers: number;
  reviewed: number;
  date: string;
  totalMarks: number;
}

const assignments: ExamAssignment[] = [
  { id: '1', className: 'Class 10', section: 'A', subject: 'Mathematics', totalPapers: 35, reviewed: 12, date: 'Dec 15, 2025', totalMarks: 20 },
  { id: '2', className: 'Class 10', section: 'B', subject: 'Mathematics', totalPapers: 38, reviewed: 0, date: 'Dec 15, 2025', totalMarks: 20 },
  { id: '3', className: 'Class 9', section: 'A', subject: 'Mathematics', totalPapers: 32, reviewed: 32, date: 'Nov 20, 2025', totalMarks: 20 },
];

const TeacherReview = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'direct' ? 'direct' : 'written';

  const [finalizedExams, setFinalizedExams] = useState<Set<string>>(new Set());
  const [finalizeTarget, setFinalizeTarget] = useState<ExamAssignment | null>(null);

  const totalPapers = assignments.reduce((sum, a) => sum + a.totalPapers, 0);
  const totalReviewed = assignments.reduce((sum, a) => sum + a.reviewed, 0);
  const totalPending = totalPapers - totalReviewed;

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={() => navigate('/teacher/dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Review Papers</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Review answer papers or grade assessments</p>
      </div>

      {/* Tabs - matching Learning Patterns style */}
      <div className="flex bg-muted/50 rounded-2xl p-1 gap-1 border border-border/40">
        {[
          { key: 'written', icon: FileText, label: 'Written Papers' },
          { key: 'direct', icon: Zap, label: 'Direct Grading' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 tap-target",
              activeTab === key
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'written' ? (
        /* Written Papers Tab */
        <div className="space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <Card className="border-0 card-shadow rounded-2xl">
              <CardContent className="p-3 md:p-4">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Assigned</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">{totalPapers}</p>
              </CardContent>
            </Card>
            <Card className="border-0 card-shadow rounded-2xl">
              <CardContent className="p-3 md:p-4">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Reviewed</p>
                <p className="text-xl md:text-2xl font-bold text-success">{totalReviewed}</p>
              </CardContent>
            </Card>
            <Card className="border-0 card-shadow rounded-2xl">
              <CardContent className="p-3 md:p-4">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Pending</p>
                <p className="text-xl md:text-2xl font-bold text-warning">{totalPending}</p>
              </CardContent>
            </Card>
          </div>

          {assignments.map((exam) => {
            const progress = Math.round((exam.reviewed / exam.totalPapers) * 100);
            const isComplete = exam.reviewed === exam.totalPapers;
            const isFinalized = finalizedExams.has(exam.id);

            return (
              <Card key={exam.id} className="border-0 card-shadow rounded-2xl">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm md:text-base font-bold text-foreground">{exam.className}-{exam.section}</span>
                        <span className="text-sm md:text-base font-semibold text-primary">{exam.subject}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2.5">
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{exam.totalPapers} papers</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{exam.date}</span>
                        <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">{exam.totalMarks} marks</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{exam.reviewed}/{exam.totalPapers}</span>
                          <span className={cn("font-medium", isFinalized ? "text-success" : isComplete ? "text-success" : progress > 0 ? "text-primary" : "text-muted-foreground")}>
                            {isFinalized ? 'Finalized' : `${progress}%`}
                          </span>
                        </div>
                        <Progress value={progress} className={cn("h-1", (isComplete || isFinalized) && "[&>div]:bg-success")} />
                      </div>
                    </div>

                    {/* Right: Actions centered vertically */}
                    <div className="flex items-center self-center gap-2 shrink-0">
                      {isFinalized ? (
                        <Badge className="bg-success/10 text-success border-success/20 gap-1 text-xs"><Lock className="w-3 h-3" />Finalized</Badge>
                      ) : isComplete ? (
                        <>
                          <Button size="sm" className="gap-1.5 text-xs h-8 bg-success hover:bg-success/90 text-success-foreground rounded-xl" onClick={() => navigate(`/teacher/review/${exam.id}`)}><Eye className="w-3.5 h-3.5" />Reviewed</Button>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 border-primary text-primary hover:bg-primary/10 rounded-xl" onClick={() => setFinalizeTarget(exam)}><CheckCircle2 className="w-3.5 h-3.5" />Finalize</Button>
                        </>
                      ) : (
                        <Button size="sm" className="gap-1.5 text-xs h-8 rounded-xl" onClick={() => navigate(`/teacher/review/${exam.id}`)}><FileText className="w-3.5 h-3.5" />Review Papers</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Direct Grading Tab */
        <div className="space-y-3">
          {/* Summary stats */}
          {mockQuickAssessments.length > 0 && (
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <Card className="border-0 card-shadow rounded-2xl">
                <CardContent className="p-3 md:p-4">
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Total</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{mockQuickAssessments.length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 card-shadow rounded-2xl">
                <CardContent className="p-3 md:p-4">
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Oral</p>
                  <p className="text-xl md:text-2xl font-bold text-primary">{mockQuickAssessments.filter(a => a.assessment_type === 'oral').length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 card-shadow rounded-2xl">
                <CardContent className="p-3 md:p-4">
                  <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Practical</p>
                  <p className="text-xl md:text-2xl font-bold text-warning">{mockQuickAssessments.filter(a => a.assessment_type === 'practical').length}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {mockQuickAssessments.length === 0 ? (
            <Card className="border-0 card-shadow rounded-2xl">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No quick assessments yet</h3>
                <p className="text-xs text-muted-foreground mb-4 max-w-xs">Create an oral or practical assessment linked to a master exam to begin grading.</p>
                <Button size="sm" className="gap-2 rounded-xl" onClick={() => navigate('/teacher/quick-assessment/create')}>
                  <Plus className="w-4 h-4" /> Create Quick Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            mockQuickAssessments.map(assessment => {
              const exam = masterExams.find(e => e.id === assessment.master_exam_id);
              const students = mockStudents.filter(s => s.class_id === assessment.class_id);
              const scores = mockScores.filter(sc => sc.quick_assessment_id === assessment.id);
              const gradedCount = scores.filter(sc => sc.absent || sc.marks_obtained != null).length;
              const progressPct = students.length > 0 ? Math.round((gradedCount / students.length) * 100) : 0;
              const isFinalized = assessment.status === 'finalized';

              const actionLabel = isFinalized ? 'View'
                : gradedCount > 0 ? 'Continue' : 'Start';

              const isOral = assessment.assessment_type === 'oral';

              return (
                <Card key={assessment.id} className="border-0 card-shadow rounded-2xl hover:shadow-lg transition-all">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3">
                        {/* Left: Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm md:text-base font-bold text-foreground">{assessment.className}-{assessment.section}</span>
                            <span className="text-sm md:text-base font-semibold text-primary">{assessment.subject}</span>
                            {isFinalized && <Badge className="bg-success/10 text-success border-success/20 gap-1 text-[10px]"><Lock className="w-2.5 h-2.5" />Finalized</Badge>}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="secondary" className={cn("border-0 text-[10px] capitalize", isOral ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning")}>
                              {isOral ? 'Oral' : 'Practical'}
                            </Badge>
                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">{exam?.exam_name}</Badge>
                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">{assessment.total_marks} marks</Badge>
                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px] gap-1"><Clock className="w-2.5 h-2.5" />{assessment.updated_at}</Badge>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" /> {gradedCount}/{students.length} graded
                              </span>
                              <span className={cn("font-medium",
                                isFinalized ? "text-success" : progressPct === 100 ? "text-success" : progressPct > 0 ? "text-primary" : "text-muted-foreground"
                              )}>
                                {progressPct}%
                              </span>
                            </div>
                            <Progress value={progressPct} className={cn("h-1", (progressPct === 100 || isFinalized) && "[&>div]:bg-success")} />
                          </div>
                        </div>

                        {/* Right: Action centered vertically */}
                        <div className="flex items-center self-center shrink-0">
                          <Button size="sm" variant={isFinalized ? 'outline' : 'default'} className="gap-1 text-xs h-7 md:h-8 px-3 rounded-xl"
                            onClick={() => navigate(`/teacher/direct-grading/${assessment.id}`)}>
                            {isFinalized ? <Eye className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                            {actionLabel}
                          </Button>
                        </div>
                      </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      <ConfirmModal
        open={!!finalizeTarget}
        onOpenChange={(open) => { if (!open) setFinalizeTarget(null); }}
        title="Finalize Papers?"
        description={`Please finalize the papers for ${finalizeTarget?.className}-${finalizeTarget?.section} ${finalizeTarget?.subject} only when all the changes have been made. Once finalized, marks cannot be edited.`}
        confirmLabel="Finalize"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (finalizeTarget) {
            setFinalizedExams(prev => new Set(prev).add(finalizeTarget.id));
            toast({ title: 'Papers Finalized', description: `${finalizeTarget.className}-${finalizeTarget.section} ${finalizeTarget.subject} papers have been finalized successfully.` });
            setFinalizeTarget(null);
          }
        }}
      />
    </div>
  );
};

export default TeacherReview;