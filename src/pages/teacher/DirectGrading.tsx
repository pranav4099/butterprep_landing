import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Users, Lock, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import ConfirmModal from '@/components/enrollment/ConfirmModal';
import { mockQuickAssessments, mockStudents, mockScores, masterExams } from '@/data/quickAssessmentData';
import type { QuickAssessment } from '@/data/quickAssessmentData';

type DirectGradingLocationState = {
  createdAssessment?: QuickAssessment;
};

const DirectGrading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { assessmentId } = useParams<{ assessmentId: string }>();

  const createdAssessment = (location.state as DirectGradingLocationState | null)?.createdAssessment;
  const assessment = mockQuickAssessments.find(a => a.id === assessmentId)
    ?? (createdAssessment?.id === assessmentId ? createdAssessment : undefined);
  const exam = masterExams.find(e => e.id === assessment?.master_exam_id);
  const students = mockStudents.filter(s => s.class_id === assessment?.class_id);

  const [scores, setScores] = useState<Record<string, { marks: string }>>(() => {
    const initial: Record<string, { marks: string }> = {};
    students.forEach(st => {
      const existing = mockScores.find(sc => sc.quick_assessment_id === assessmentId && sc.student_id === st.id);
      initial[st.id] = {
        marks: existing?.marks_obtained != null ? String(existing.marks_obtained) : '',
      };
    });
    return initial;
  });

  const [showFinalize, setShowFinalize] = useState(false);
  const [status, setStatus] = useState(assessment?.status || 'active');
  const isFinalized = status === 'finalized';

  const [marksPopupStudentId, setMarksPopupStudentId] = useState<string | null>(null);
  const [popupSelectedMarks, setPopupSelectedMarks] = useState<number>(0);

  const gradedCount = useMemo(() => {
    return Object.values(scores).filter(s => s.marks !== '' && s.marks !== undefined).length;
  }, [scores]);

  const progressPct = students.length > 0 ? Math.round((gradedCount / students.length) * 100) : 0;

  const updateScore = (studentId: string, value: string) => {
    if (isFinalized) return;
    setScores(prev => ({
      ...prev,
      [studentId]: { marks: value },
    }));
  };

  const openMarksPopup = (studentId: string) => {
    if (isFinalized) return;
    const current = scores[studentId]?.marks;
    setPopupSelectedMarks(current !== '' ? Number(current) : 0);
    setMarksPopupStudentId(studentId);
  };

  const handlePopupMarkSelect = (mark: number) => {
    setPopupSelectedMarks(mark);
  };

  const handlePopupFractionalMark = (inc: number) => {
    setPopupSelectedMarks(prev => {
      const base = Math.floor(prev);
      return Math.min(base + inc, assessment?.total_marks ?? 0);
    });
  };

  const handlePopupConfirm = () => {
    if (marksPopupStudentId) {
      updateScore(marksPopupStudentId, String(popupSelectedMarks));
    }
    setMarksPopupStudentId(null);
  };

  const handleFinalize = () => {
    setStatus('finalized');
    setShowFinalize(false);
    toast({ title: 'Assessment Finalized', description: `Marks have been finalized.` });
  };

  const popupStudent = marksPopupStudentId ? students.find(s => s.id === marksPopupStudentId) : null;
  const maxMarks = assessment?.total_marks ?? 0;
  const gridCols = maxMarks <= 5 ? "grid-cols-3" : maxMarks <= 10 ? "grid-cols-4" : "grid-cols-7";
  const btnSize = maxMarks <= 5 ? "py-3 text-base" : maxMarks <= 10 ? "py-2.5 text-sm" : "py-1.5 text-xs";

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">Assessment not found.</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate('/teacher/review?tab=direct')}>Back to Review</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={() => navigate('/teacher/review?tab=direct')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Review Papers</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-foreground tracking-tight">{assessment.className}-{assessment.section}</h1>
          <span className="text-xl font-semibold text-primary">{assessment.subject}</span>
          {isFinalized && (
            <Badge className="bg-success/10 text-success border-success/20 gap-1 text-[10px]">
              <Lock className="w-3 h-3" /> Finalized
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <Badge variant="secondary" className={cn("capitalize border-0 text-[10px]", assessment.assessment_type === 'oral' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning')}>
            {assessment.assessment_type}
          </Badge>
          <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">{exam?.exam_name}</Badge>
        </div>
      </div>

      {/* Info + Progress Card */}
      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[10px]">{assessment.className}-{assessment.section}</Badge>
            <Badge variant="secondary" className="bg-muted text-foreground border-0 text-[10px]">{assessment.subject}</Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">{assessment.total_marks} marks</Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px] gap-1">
              <Users className="w-3 h-3" /> {students.length} students
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{gradedCount} of {students.length} graded</span>
              <span className="font-medium text-foreground">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className={cn("h-1.5", progressPct === 100 && "[&>div]:bg-success")} />
          </div>
        </CardContent>
      </Card>

      {/* Student Roster */}
      <Card className="border-0 card-shadow rounded-2xl overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-[60px_1fr_120px_80px] gap-3 px-5 py-3 bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Roll</span>
          <span>Student Name</span>
          <span>Marks</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-border">
          {students.map(student => {
            const score = scores[student.id] || { marks: '' };
            const isGraded = score.marks !== '' && score.marks !== undefined;
            const marksNum = Number(score.marks);
            const marksError = score.marks !== '' && (marksNum < 0 || marksNum > assessment.total_marks);

            return (
              <div key={student.id}>
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-[60px_1fr_120px_80px] gap-3 px-5 py-3 items-center hover:bg-muted/20 transition-colors">
                  <span className="text-sm text-muted-foreground font-medium">{student.roll_no}</span>
                  <span className="text-sm font-medium text-foreground">{student.name}</span>
                  <button
                    onClick={() => openMarksPopup(student.id)}
                    disabled={isFinalized}
                    className={cn(
                      "h-9 px-3 rounded-xl border text-sm font-medium text-left transition-colors",
                      isFinalized && "cursor-default",
                      !isFinalized && "hover:border-primary/50 cursor-pointer",
                      score.marks !== '' ? "border-primary/30 bg-primary/5 text-foreground" : "border-border bg-card text-muted-foreground",
                      marksError && "border-destructive bg-destructive/5"
                    )}
                  >
                    {score.marks !== '' ? `${score.marks} / ${assessment.total_marks}` : `/ ${assessment.total_marks}`}
                  </button>
                  <div>
                    {isGraded ? (
                      <span className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Graded</span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span>
                    )}
                  </div>
                </div>

                {/* Mobile card */}
                <div className="md:hidden p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-6">{student.roll_no}</span>
                      <p className="text-sm font-medium text-foreground">{student.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isGraded ? (
                        <button
                          onClick={() => openMarksPopup(student.id)}
                          disabled={isFinalized}
                          className="px-3 py-1.5 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-semibold"
                        >
                          {score.marks}/{assessment.total_marks}
                        </button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openMarksPopup(student.id)}
                          disabled={isFinalized}
                          className="h-8 px-4 text-xs font-semibold gap-1.5 rounded-xl"
                        >
                          Grade
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Footer Actions */}
      {!isFinalized && (
        <div className="flex items-center justify-end pb-6">
          <Button
            onClick={() => setShowFinalize(true)}
            className="gap-2 rounded-xl"
            disabled={gradedCount === 0}
          >
            <CheckCircle2 className="w-4 h-4" /> Finalize Assessment
          </Button>
        </div>
      )}

      {/* Marks Popup */}
      {marksPopupStudentId && popupStudent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMarksPopupStudentId(null)} />
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm border border-border shadow-xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 fade-in duration-200">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{popupStudent.name}</p>
                <p className="text-xs text-muted-foreground">Roll {popupStudent.roll_no}</p>
              </div>
              <button onClick={() => setMarksPopupStudentId(null)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-3">
              <div className={cn("grid gap-1.5", gridCols)}>
                {Array.from({ length: maxMarks + 1 }, (_, i) => i).map((mark) => (
                  <button
                    key={mark}
                    onClick={() => handlePopupMarkSelect(mark)}
                    className={cn(
                      "rounded-xl font-bold transition-all active:scale-95",
                      btnSize,
                      popupSelectedMarks === mark || (popupSelectedMarks % 1 !== 0 && Math.floor(popupSelectedMarks) === mark)
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {mark}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[0.25, 0.5, 0.75].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => handlePopupFractionalMark(inc)}
                    className="px-3 py-1.5 rounded-xl border border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 transition-colors active:scale-95"
                  >
                    +{inc}
                  </button>
                ))}
              </div>

              <div className="bg-primary/5 rounded-2xl p-3 border border-primary/20">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Selected</label>
                  <p className="text-xl font-bold text-foreground">
                    {popupSelectedMarks} <span className="text-sm text-muted-foreground font-normal">/ {maxMarks}</span>
                  </p>
                </div>
              </div>

              <Button className="w-full h-11 text-sm font-semibold gap-2 rounded-xl" onClick={handlePopupConfirm}>
                <CheckCircle2 className="w-4 h-4" /> Confirm Marks
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showFinalize}
        onOpenChange={setShowFinalize}
        title="Finalize Assessment?"
        description="Are you sure you want to finalize this assessment? Finalized marks will be used for reporting and may be locked from editing."
        confirmLabel="Finalize"
        cancelLabel="Cancel"
        onConfirm={handleFinalize}
      />
    </div>
  );
};

export default DirectGrading;
