import React, { useState, useRef, useEffect } from 'react';
import ConfirmModal from '@/components/enrollment/ConfirmModal';
import ZoomableContainer from '@/components/ZoomableContainer';
import answerSheetImage from '@/assets/answer-sheet-sample.png';
import { useNavigate, useParams } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, AlertTriangle, CheckCircle2, X, FileText, Sparkles, PenLine, BookOpen, ScanSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface Question {
  qNo: number;
  maxMarks: number;
  aiSuggested: number;
  teacherMarks: number | null;
  feedback: string[];
}

interface Paper {
  id: string;
  studentName: string;
  rollNo: string;
  questions: Question[];
}

const studentNames = [
  'Aarav Kumar', 'Priya Sharma', 'Arjun Reddy', 'Ananya Patel', 'Rohit Singh',
  'Sneha Gupta', 'Vikram Mehta', 'Kavya Nair', 'Raj Malhotra', 'Ishita Joshi',
  'Aditya Verma', 'Neha Kapoor', 'Siddharth Rao', 'Pooja Desai', 'Karan Bajaj',
  'Divya Iyer', 'Manish Tiwari', 'Riya Saxena', 'Amit Chauhan', 'Shruti Agarwal',
  'Rahul Bhatia', 'Nisha Pandey', 'Vivek Menon', 'Ankita Das', 'Suresh Pillai',
  'Meera Choudhary', 'Nikhil Kulkarni', 'Tanvi Shetty', 'Abhishek Jain', 'Simran Kaur'
];

const generateQuestions = (prefillMarks: boolean = false): Question[] => {
  const feedbackOptions = [
    ['Correct answer', 'Well explained'],
    ['Partially correct', 'Missing key points'],
    ['Good attempt', 'Minor errors'],
    ['Excellent response', 'Comprehensive'],
    ['Needs improvement', 'Incomplete answer'],
    ['Perfect', 'Clear explanation'],
    ['Missing conclusion', 'Good start'],
    ['Diagram missing', 'Calculation error'],
  ];
  
  const questions: Question[] = Array.from({ length: 20 }, (_, i) => {
    const maxMarks = Math.floor(Math.random() * 20) + 1;
    return {
      qNo: i + 1,
      maxMarks,
      aiSuggested: Math.floor(Math.random() * (maxMarks + 1)),
      teacherMarks: null,
      feedback: feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)],
    };
  });

  if (prefillMarks) {
    return questions.map(q => ({
      ...q,
      teacherMarks: Math.floor(Math.random() * (q.maxMarks + 1)),
    }));
  }

  return questions;
};

const createMockPapers = (examId: string): Paper[] => {
  const prefill = examId === '3';
  return studentNames.map((name, index) => ({
    id: String(index + 1),
    studentName: name,
    rollNo: String(index + 1).padStart(2, '0'),
    questions: generateQuestions(prefill),
  }));
};

const TeacherPaperReview = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [currentPaperIndex, setCurrentPaperIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [papers, setPapers] = useState<Paper[]>(() => createMockPapers(examId || '1'));
  const [showSummary, setShowSummary] = useState(false);
  const [showBatchSummary, setShowBatchSummary] = useState(false);
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [showUnreviewedWarning, setShowUnreviewedWarning] = useState(false);
  const [unreviewedQuestions, setUnreviewedQuestions] = useState<number[]>([]);
  const [mobilePanel, setMobilePanel] = useState<'sheet' | 'marks'>('marks');
  const [isLandscape, setIsLandscape] = useState(false);
  const [mobileMarkingExpanded, setMobileMarkingExpanded] = useState(true);
  const [rescanRequested, setRescanRequested] = useState<Set<string>>(new Set());
  const activeQuestionRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active question pill into view
  useEffect(() => {
    activeQuestionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentQuestionIndex]);

  // Detect landscape orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth < 1024);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    const mql = window.matchMedia('(orientation: landscape)');
    mql.addEventListener('change', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      mql.removeEventListener('change', checkOrientation);
    };
  }, []);

  // Use split layout if desktop OR mobile landscape
  const useSplitLayout = !isMobile || isLandscape;

  // Swipe handling for question paper
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (swipeDistance > 50) {
      setShowQuestionPaper(false);
    }
  };

  const currentPaper = papers[currentPaperIndex];
  const currentQuestion = currentPaper?.questions[currentQuestionIndex];
  const totalPapers = papers.length;
  const reviewedPapers = papers.filter(p => 
    p.questions.every(q => q.teacherMarks !== null)
  ).length;

  const progress = ((currentPaperIndex) / totalPapers) * 100;

  const getPaperSummary = () => {
    const totalMaxMarks = currentPaper?.questions.reduce((sum, q) => sum + q.maxMarks, 0) || 0;
    const totalAwardedMarks = currentPaper?.questions.reduce((sum, q) => sum + (q.teacherMarks ?? q.aiSuggested), 0) || 0;
    const totalAiSuggested = currentPaper?.questions.reduce((sum, q) => sum + q.aiSuggested, 0) || 0;
    return { totalMaxMarks, totalAwardedMarks, totalAiSuggested };
  };

  const getBatchSummary = () => {
    const maxMarksPerPaper = papers[0]?.questions.reduce((sum, q) => sum + q.maxMarks, 0) || 0;
    const totalMaxMarks = maxMarksPerPaper * papers.length;
    
    const paperScores = papers.map(p => {
      const scored = p.questions.reduce((sum, q) => sum + (q.teacherMarks ?? q.aiSuggested), 0);
      const percentage = (scored / maxMarksPerPaper) * 100;
      return { student: p.studentName, rollNo: p.rollNo, scored, percentage };
    });

    const totalAwarded = paperScores.reduce((sum, p) => sum + p.scored, 0);
    const classAverage = totalAwarded / papers.length;
    const classPercentage = (classAverage / maxMarksPerPaper) * 100;
    
    const highest = Math.max(...paperScores.map(p => p.scored));
    const lowest = Math.min(...paperScores.map(p => p.scored));
    
    const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    paperScores.forEach(p => {
      if (p.percentage >= 90) grades.A++;
      else if (p.percentage >= 75) grades.B++;
      else if (p.percentage >= 60) grades.C++;
      else if (p.percentage >= 40) grades.D++;
      else grades.F++;
    });

    return { 
      totalPapers: papers.length, 
      maxMarksPerPaper, 
      classAverage, 
      classPercentage, 
      highest, 
      lowest, 
      grades, 
      paperScores 
    };
  };

  const handleMarkSelect = (marks: number) => {
    setPapers(prev => {
      const updated = [...prev];
      updated[currentPaperIndex].questions[currentQuestionIndex].teacherMarks = marks;
      return updated;
    });
  };

  const handleFractionalMark = (fraction: number) => {
    const current = currentQuestion.teacherMarks ?? currentQuestion.aiSuggested;
    const wholepart = Math.floor(current);
    const newMarks = Math.min(currentQuestion.maxMarks, wholepart + fraction);
    handleMarkSelect(newMarks);
  };

  const goToNextQuestion = () => {
    if (currentQuestion.teacherMarks === null) {
      handleMarkSelect(selectedMarks);
    }
    
    if (currentQuestionIndex === currentPaper.questions.length - 1) {
      const unreviewed = currentPaper.questions
        .filter((q, idx) => idx !== currentQuestionIndex && q.teacherMarks === null)
        .map(q => q.qNo);
      
      if (unreviewed.length > 0) {
        setUnreviewedQuestions(unreviewed);
        setShowUnreviewedWarning(true);
      } else {
        setShowSummary(true);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleConfirmAndSave = () => {
    setShowSummary(false);
    
    if (currentPaperIndex === papers.length - 1) {
      setShowBatchSummary(true);
    } else {
      toast({
        title: "Paper Saved Successfully",
        description: `${currentPaper?.studentName}'s paper has been saved.`,
        duration: 2000,
      });
      setCurrentPaperIndex(currentPaperIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handleConfirmBatch = () => {
    setShowBatchSummary(false);
    toast({
      title: "Batch Review Complete",
      description: `All ${papers.length} papers have been saved successfully.`,
      duration: 2000,
    });
    navigate('/teacher/review');
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentPaperIndex > 0) {
      setCurrentPaperIndex(currentPaperIndex - 1);
      setCurrentQuestionIndex(papers[currentPaperIndex - 1].questions.length - 1);
    }
  };

  const [selectedDeductions, setSelectedDeductions] = useState<string[]>([]);

  // Reset deductions when question or paper changes
  useEffect(() => {
    setSelectedDeductions([]);
  }, [currentQuestionIndex, currentPaperIndex]);

  const selectedMarks = currentQuestion?.teacherMarks ?? currentQuestion?.aiSuggested ?? 0;
  const summary = getPaperSummary();

  const [rescanConfirmOpen, setRescanConfirmOpen] = useState(false);

  const handleToggleRescan = () => {
    setRescanConfirmOpen(true);
  };

  const confirmToggleRescan = () => {
    const paperId = currentPaper.id;
    setRescanRequested(prev => {
      const next = new Set(prev);
      if (next.has(paperId)) {
        next.delete(paperId);
        toast({ title: "Re-scan Request Cancelled", description: `Cancelled re-scan for ${currentPaper.studentName}.`, duration: 2000 });
      } else {
        next.add(paperId);
        toast({ title: "Re-scan Requested", description: `Re-scan request sent for ${currentPaper.studentName}'s paper.`, duration: 2000 });
      }
      return next;
    });
    setRescanConfirmOpen(false);
  };

  const isRescanRequested = rescanRequested.has(currentPaper?.id);

  // Answer Sheet content (reused in both layouts)
  const AnswerSheetContent = () => (
    <ZoomableContainer className="min-h-full">
      <div className="p-2 md:p-6 space-y-3 md:space-y-4">
        {[1, 2, 3, 4, 5].map((page) => (
          <div key={page} className="max-w-2xl mx-auto relative">
            <span className="absolute top-2 right-3 bg-background/80 backdrop-blur-sm text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-full">
              Page {page} of 5
            </span>
            <img
              src={answerSheetImage}
              alt={`Student answer sheet page ${page}`}
              className="w-full h-auto rounded-lg shadow-sm border border-border"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </ZoomableContainer>
  );

  // Marking panel content (reused in both layouts)
  const MarkingContent = () => (
    <div className="flex-1 overflow-y-auto p-3 md:p-5 pb-20 md:pb-24">

      <Collapsible defaultOpen={false} className="mb-3 md:mb-4">
        <CollapsibleTrigger className="w-full flex items-center justify-between bg-purple/10 border border-purple/20 rounded-xl px-3 md:px-4 py-2.5 hover:bg-purple/15 transition-colors group">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple" />
            <span className="text-xs font-semibold text-purple uppercase tracking-wide">AI Analysis</span>
          </div>
          <ChevronDown className="w-4 h-4 text-purple transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-3">
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 md:p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs font-semibold text-warning uppercase tracking-wide">Feedback</span>
            </div>
            <ul className="space-y-1">
              {currentQuestion?.feedback.map((f, idx) => (
                <li key={idx} className="text-sm text-foreground flex gap-2">
                  <span className="text-warning">•</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Marks Selection */}
      <div className="mb-3 md:mb-4">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
          Award Marks
        </label>
        <div className={cn(
          "grid gap-1.5 md:gap-2",
          (currentQuestion?.maxMarks ?? 0) <= 5 ? "grid-cols-3 md:grid-cols-3" :
          (currentQuestion?.maxMarks ?? 0) <= 10 ? "grid-cols-4 md:grid-cols-4" :
          "grid-cols-7 md:grid-cols-7"
        )}>
          {Array.from({ length: currentQuestion?.maxMarks + 1 }, (_, i) => i).map((mark) => (
            <button
              key={mark}
              onClick={() => handleMarkSelect(mark)}
              className={cn(
                "rounded-xl font-semibold transition-all",
                (currentQuestion?.maxMarks ?? 0) <= 5 ? "py-3 md:py-4 text-base md:text-lg" :
                (currentQuestion?.maxMarks ?? 0) <= 10 ? "py-2.5 md:py-3 text-sm md:text-base" :
                "py-2 md:py-2.5 text-xs md:text-sm",
                selectedMarks === mark || (selectedMarks % 1 !== 0 && Math.floor(selectedMarks) === mark)
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              {mark}
            </button>
          ))}
        </div>
      </div>

      {/* Fractional Marks */}
      <div className="mb-3 md:mb-4">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
          Fractional
        </label>
        <div className="grid grid-cols-3 gap-1.5 md:gap-2">
          {[0.25, 0.5, 0.75].map((inc) => (
            <button
              key={inc}
              onClick={() => handleFractionalMark(inc)}
              className="py-2 rounded-xl border-2 border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
            >
              +{inc}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Marks Display */}
      <div className="bg-primary/5 rounded-xl p-3 md:p-3.5 border border-primary/20 mb-3 md:mb-4">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-0.5">
          Selected
        </label>
        <p className="text-xl md:text-2xl font-bold text-foreground">
          {selectedMarks} <span className="text-sm md:text-base text-muted-foreground font-normal">/ {currentQuestion?.maxMarks}</span>
        </p>
      </div>

      {/* Reason for Deduction */}
      {selectedMarks < (currentQuestion?.maxMarks ?? 0) && (
        <div className="mt-3 md:mt-4 bg-destructive/10 border border-destructive/30 rounded-xl p-3 md:p-3.5">
          <label className="text-xs font-bold text-destructive uppercase tracking-wide block mb-2.5">
            Reason for Deduction
          </label>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {['Incomplete answer', 'Conceptual error', 'Calculation mistake', 'Missing steps', 'Diagram missing', 'Off-topic response'].map((reason) => {
              const isSelected = selectedDeductions.includes(reason);
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    setSelectedDeductions(prev =>
                      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
                    );
                  }}
                  className={cn(
                    "px-2.5 md:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95",
                    isSelected
                      ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
                      : "bg-card text-foreground border-border hover:border-destructive/50 hover:bg-destructive/5"
                  )}
                >
                  {reason}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-2 md:px-3 py-2 gap-2">
          {/* Left: Back Button */}
          <button
            onClick={() => navigate('/teacher/review')}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>

          {/* Center: Question Pills */}
          <div className="flex items-center gap-1 md:gap-1.5 flex-1 justify-center px-1 md:px-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="w-6 md:w-7 h-6 md:h-7 flex-shrink-0 flex items-center justify-center hover:bg-muted rounded-lg disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 md:w-4 h-3.5 md:h-4" />
            </button>
            
            {currentPaper?.questions.map((q, idx) => {
              const isActive = currentQuestionIndex === idx;
              const isReviewed = q.teacherMarks !== null;
              const isUnreviewedWarning = unreviewedQuestions.includes(q.qNo);
              return (
                <button
                  key={`q-${q.qNo}-${currentPaperIndex}`}
                  ref={isActive ? activeQuestionRef : undefined}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setShowUnreviewedWarning(false);
                    setUnreviewedQuestions([]);
                  }}
                  className={cn(
                    "w-7 h-7 md:w-8 md:h-8 flex-shrink-0 rounded-lg text-xs md:text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : isUnreviewedWarning
                      ? "bg-warning/20 text-warning ring-2 ring-warning animate-pulse"
                      : isReviewed
                      ? "bg-success/20 text-success"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {q.qNo}
                </button>
              );
            })}
            
            <button
              onClick={() => currentQuestionIndex < currentPaper.questions.length - 1 && setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === currentPaper?.questions.length - 1}
              className="w-6 md:w-7 h-6 md:h-7 flex-shrink-0 flex items-center justify-center hover:bg-muted rounded-lg disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 md:w-4 h-3.5 md:h-4" />
            </button>
          </div>

          {/* Right: Student Dropdown & Score */}
          <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            {(() => {
              const isCurrentPaperReviewed = currentPaper?.questions.every(q => q.teacherMarks !== null);
              const totalAwarded = currentPaper?.questions.reduce((sum, q) => sum + (q.teacherMarks ?? q.aiSuggested), 0) || 0;
              const totalMax = currentPaper?.questions.reduce((sum, q) => sum + q.maxMarks, 0) || 0;
              return (
                <>
                  <Select
                    value={currentPaperIndex.toString()}
                    open={studentDropdownOpen}
                    onOpenChange={setStudentDropdownOpen}
                    onValueChange={(value) => {
                      setCurrentPaperIndex(parseInt(value));
                      setCurrentQuestionIndex(0);
                    }}
                  >
                    <SelectTrigger className={cn(
                      "w-auto font-semibold transition-colors",
                      isMobile && !isLandscape ? "min-w-[80px] max-w-[120px] text-xs px-2 py-1 h-8" : "min-w-[180px]",
                      isCurrentPaperReviewed
                        ? "bg-success/20 border-success/50 text-success hover:bg-success/30"
                        : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                    )}>
                      <SelectValue>
                        <span className="flex items-center gap-1 md:gap-2">
                          <span className={cn(
                            "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full font-bold",
                            isCurrentPaperReviewed
                              ? "bg-success text-success-foreground"
                              : "bg-primary text-primary-foreground"
                          )}>
                            {currentPaperIndex + 1}/{totalPapers}
                          </span>
                          <span className="truncate max-w-[50px] md:max-w-[100px] hidden sm:inline">{currentPaper?.studentName}</span>
                          {isCurrentPaperReviewed && <CheckCircle2 className="w-3.5 h-3.5 text-success hidden sm:block" />}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {papers.map((paper, idx) => {
                        const isPaperReviewed = paper.questions.every(q => q.teacherMarks !== null);
                        return (
                          <SelectItem key={paper.id} value={idx.toString()}>
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-6">#{paper.rollNo}</span>
                              <span className={isPaperReviewed ? "text-success font-medium" : ""}>{paper.studentName}</span>
                              {isPaperReviewed && <CheckCircle2 className="w-3.5 h-3.5 text-success ml-auto" />}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </>
              );
            })()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-row min-h-0 relative">
        {/* Split layout: desktop OR mobile landscape */}
        {useSplitLayout ? (
          <>
            {/* Left Panel - Answer Sheet */}
            <div className={cn("relative bg-muted/20 border-r border-border overflow-auto", isLandscape ? "w-1/2" : "w-3/5")}>
              <button 
                onClick={() => setShowQuestionPaper(true)}
                className="fixed left-0 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-1.5 py-3 rounded-r-lg text-[10px] font-bold cursor-pointer hover:bg-primary/90 transition-all hover:scale-105 z-20 shadow-lg"
              >
                <span className="writing-mode-vertical">QP</span>
                <ChevronRight className="w-3 h-3 mt-1" />
              </button>
              <AnswerSheetContent />
            </div>

            {/* Right Panel - Marking Interface */}
            <div className={cn("flex flex-col bg-background overflow-hidden", isLandscape ? "w-1/2" : "w-2/5")}>
              <MarkingContent />
              {/* Fixed Navigation Footer */}
              <div className="flex-shrink-0 bg-card border-t border-border p-3 space-y-2">
                <button
                  onClick={handleToggleRescan}
                  className={cn(
                    "w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    isRescanRequested
                      ? "bg-success/15 text-success border border-success/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      : "bg-muted text-muted-foreground border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  )}
                >
                  <ScanSearch className="w-3.5 h-3.5" />
                  {isRescanRequested ? 'Re-scan Requested — tap to cancel' : 'Request Re-scan'}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="default" onClick={goToPreviousQuestion} disabled={currentPaperIndex === 0 && currentQuestionIndex === 0} className="h-11">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button size="default" onClick={goToNextQuestion} className="h-11">
                    {currentQuestionIndex === currentPaper?.questions.length - 1 ? 'Finish' : 'Save & Next'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Mobile: Full-screen answer sheet with bottom overlay for grading */}
            <div className="flex-1 relative bg-muted/20 overflow-auto pb-16">
              <button 
                onClick={() => setShowQuestionPaper(true)}
                className="fixed left-0 top-1/3 -translate-y-1/2 bg-primary text-primary-foreground px-1.5 py-3 rounded-r-lg text-[10px] font-bold cursor-pointer hover:bg-primary/90 transition-all z-20 shadow-lg"
              >
                <span className="writing-mode-vertical">QP</span>
                <ChevronRight className="w-3 h-3 mt-1" />
              </button>
              <AnswerSheetContent />
            </div>

            {/* Bottom Grading Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-40 bg-card border-t border-border rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex flex-col">
              {/* Drag handle — tap to expand/collapse */}
              <button
                onClick={() => setMobileMarkingExpanded(!mobileMarkingExpanded)}
                className="flex-shrink-0 w-full flex flex-col items-center pt-2 pb-1 cursor-pointer"
              >
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </button>

              {/* Expanded content (question info, AI analysis, deductions) */}
              {mobileMarkingExpanded && (
                <div className="max-h-[40vh] overflow-y-auto px-3 pt-1 pb-1">
                  {/* Question label + AI badge — collapsible with feedback */}
                  <Collapsible defaultOpen={false} className="mb-2">
                    <CollapsibleTrigger className="w-full flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 hover:bg-primary/15 transition-colors group">
                      <span className="text-xs font-bold text-primary uppercase">Question {currentQuestion?.qNo}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                          AI: {currentQuestion?.aiSuggested}/{currentQuestion?.maxMarks}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-primary transition-transform group-data-[state=open]:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3 h-3 text-purple" />
                          <span className="text-[10px] font-semibold text-purple uppercase tracking-wide">AI Feedback</span>
                        </div>
                        <ul className="space-y-0.5">
                          {currentQuestion?.feedback.map((f, idx) => (
                            <li key={idx} className="text-xs text-foreground flex gap-1.5">
                              <span className="text-warning">•</span>{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Mark buttons */}
                  <div className="mb-2">
                    <div className={cn(
                      "grid gap-1.5",
                      (currentQuestion?.maxMarks ?? 0) <= 5 ? "grid-cols-3" :
                      (currentQuestion?.maxMarks ?? 0) <= 10 ? "grid-cols-4" :
                      "grid-cols-7"
                    )}>
                      {Array.from({ length: (currentQuestion?.maxMarks ?? 0) + 1 }, (_, i) => i).map((mark) => (
                        <button
                          key={mark}
                          onClick={() => handleMarkSelect(mark)}
                          className={cn(
                            "rounded-xl font-bold transition-all active:scale-95",
                            (currentQuestion?.maxMarks ?? 0) <= 5 ? "py-3 text-base" :
                            (currentQuestion?.maxMarks ?? 0) <= 10 ? "py-2.5 text-sm" :
                            "py-1.5 text-xs",
                            selectedMarks === mark || (selectedMarks % 1 !== 0 && Math.floor(selectedMarks) === mark)
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {mark}
                        </button>
                      ))}
                    </div>
                    {/* Fractional marks */}
                    <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                      {[0.25, 0.5, 0.75].map((inc) => (
                        <button
                          key={inc}
                          onClick={() => handleFractionalMark(inc)}
                          className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 transition-colors"
                        >
                          +{inc}
                        </button>
                      ))}
                    </div>
                    {/* Selected Marks Display */}
                    <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/20 mt-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Selected</label>
                        <p className="text-lg font-bold text-foreground">
                          {selectedMarks} <span className="text-xs text-muted-foreground font-normal">/ {currentQuestion?.maxMarks}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deduction reasons — last */}
                  <div className={cn(selectedMarks >= (currentQuestion?.maxMarks ?? 0) && "opacity-30 pointer-events-none")}>
                    <div className="mb-1">
                      <label className="text-[10px] font-bold text-destructive uppercase tracking-wide block mb-1.5">Deduction Reason</label>
                      <div className="flex flex-wrap gap-1">
                        {['Incomplete', 'Concept error', 'Calc mistake', 'Missing steps', 'No diagram', 'Off-topic'].map((reason) => {
                          const isSelected = selectedDeductions.includes(reason);
                          return (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => setSelectedDeductions(prev => prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason])}
                              className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-semibold border transition-all active:scale-95",
                                isSelected
                                  ? "bg-destructive text-destructive-foreground border-destructive"
                                  : "bg-card text-foreground border-border"
                              )}
                            >
                              {reason}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav footer */}
              <div className="flex-shrink-0 border-t border-border p-2.5 mt-1 space-y-1.5">
                <button
                  onClick={handleToggleRescan}
                  className={cn(
                    "w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors",
                    isRescanRequested
                      ? "bg-success/15 text-success border border-success/30"
                      : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  <ScanSearch className="w-3 h-3" />
                  {isRescanRequested ? 'Re-scan Requested — tap to cancel' : 'Request Re-scan'}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={goToPreviousQuestion} disabled={currentPaperIndex === 0 && currentQuestionIndex === 0} className="h-9">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Prev
                  </Button>
                  <Button size="sm" onClick={goToNextQuestion} className="h-9">
                    {currentQuestionIndex === currentPaper?.questions.length - 1 ? 'Finish' : 'Save & Next'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className={cn("max-w-xl", isMobile && !isLandscape && "max-w-[95vw] p-4")}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Review Summary
            </DialogTitle>
          </DialogHeader>
          
          <div className={cn("flex gap-6 py-4", isMobile && "flex-col gap-4 py-3")}>
            {/* Student Info & Marks */}
            <div className={cn("w-2/5 space-y-3", isMobile && "w-full")}>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-semibold text-foreground">{currentPaper?.studentName}</p>
                <p className="text-xs text-muted-foreground">Roll No. {currentPaper?.rollNo}</p>
              </div>
              <div className={cn("space-y-3", isMobile && "grid grid-cols-2 gap-3 space-y-0")}>
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Marks</p>
                  <p className="text-2xl font-bold text-primary">
                    {summary.totalAwardedMarks} <span className="text-sm font-normal text-muted-foreground">/ {summary.totalMaxMarks}</span>
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">AI Suggested</p>
                  <p className="text-2xl font-bold text-foreground">
                    {summary.totalAiSuggested} <span className="text-sm font-normal text-muted-foreground">/ {summary.totalMaxMarks}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Question Breakdown */}
            <div className="flex-1 flex flex-col min-h-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Question Breakdown</p>
              <div className={cn("flex-1 overflow-y-auto max-h-52 space-y-1.5 pr-2", isMobile && "max-h-40")}>
                {currentPaper?.questions.map((q) => (
                  <div key={q.qNo} className="flex items-center justify-between text-sm bg-muted/30 rounded px-3 py-1.5">
                    <span className="text-muted-foreground">Q{q.qNo}</span>
                    <span className="font-medium">
                      {q.teacherMarks ?? q.aiSuggested} / {q.maxMarks}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSummary(false)}>
              <X className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button onClick={handleConfirmAndSave}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Summary Dialog */}
      <Dialog open={showBatchSummary} onOpenChange={setShowBatchSummary}>
        <DialogContent className={cn("max-w-3xl max-h-[90vh] overflow-hidden", isMobile && !isLandscape && "max-w-[95vw] p-4")}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Batch Review Complete
            </DialogTitle>
          </DialogHeader>
          
          {(() => {
            const batch = getBatchSummary();
            return (
              <div className={cn("flex gap-6 py-4", isMobile && "flex-col gap-4 py-3")}>
                {/* Summary Stats */}
                <div className={cn("w-1/3 space-y-4", isMobile && "w-full space-y-3")}>
                  <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">All Papers Reviewed</p>
                    <p className="text-3xl font-bold text-success">{batch.totalPapers}</p>
                    <p className="text-xs text-muted-foreground">Papers</p>
                  </div>

                  <div className={cn("space-y-3", isMobile && "grid grid-cols-3 gap-2 space-y-0")}>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 md:p-4 text-center">
                      <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide mb-1">Average</p>
                      <p className="text-lg md:text-2xl font-bold text-primary">{batch.classAverage.toFixed(1)}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">/ {batch.maxMarksPerPaper}</p>
                    </div>
                    <div className="bg-success/10 border border-success/20 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Highest</p>
                      <p className="text-lg font-bold text-success">{batch.highest}</p>
                    </div>
                    <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Lowest</p>
                      <p className="text-lg font-bold text-warning">{batch.lowest}</p>
                    </div>
                  </div>
                </div>

                {/* Student Results */}
                <div className="flex-1 flex flex-col min-h-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Student Results</p>
                  <div className={cn("flex-1 overflow-y-auto max-h-[320px] space-y-1.5 pr-2", isMobile && "max-h-[200px]")}>
                    {batch.paperScores.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-6">#{p.rollNo}</span>
                          <span className="font-medium truncate max-w-[120px] md:max-w-none">{p.student}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{p.scored}/{batch.maxMarksPerPaper}</span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            p.percentage >= 75 ? "bg-success/20 text-success" :
                            p.percentage >= 50 ? "bg-primary/20 text-primary" :
                            p.percentage >= 35 ? "bg-warning/20 text-warning" :
                            "bg-destructive/20 text-destructive"
                          )}>
                            {p.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="bg-warning/10 border border-warning/30 rounded-lg px-3 py-2 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-warning">
              Once you confirm and submit, the marks cannot be changed.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setShowBatchSummary(false);
              setTimeout(() => setStudentDropdownOpen(true), 100);
            }}>
              <X className="w-4 h-4 mr-1" />
              Review Again
            </Button>
            <Button onClick={handleConfirmBatch} className="bg-success hover:bg-success/90">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Confirm & Submit All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unreviewed Questions Warning Dialog */}
      <Dialog open={showUnreviewedWarning} onOpenChange={setShowUnreviewedWarning}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Incomplete Review
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              The following questions have not been reviewed:
            </p>
            <div className="flex flex-wrap gap-2">
              {unreviewedQuestions.map((qNo) => (
                <span
                  key={qNo}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-warning/20 text-warning font-semibold text-sm"
                >
                  {qNo}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Please review all questions before finishing.
            </p>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowUnreviewedWarning(false);
                const firstUnreviewed = currentPaper?.questions.findIndex(q => unreviewedQuestions.includes(q.qNo));
                if (firstUnreviewed !== undefined && firstUnreviewed >= 0) {
                  setCurrentQuestionIndex(firstUnreviewed);
                }
                setUnreviewedQuestions([]);
              }}
            >
              Go to Unreviewed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Paper Sheet */}
      <Sheet open={showQuestionPaper} onOpenChange={setShowQuestionPaper}>
        <SheetContent 
          side="left" 
          className={cn("p-0 overflow-hidden", isMobile ? "w-[92vw]" : "w-[60vw] max-w-2xl")}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-full flex flex-col">
            <SheetHeader className="p-4 border-b border-border bg-card flex-shrink-0">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Question Paper
                </SheetTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Swipe left to close</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-3 bg-muted/30">
              <div className="space-y-3">
                {[1, 2, 3, 4].map((pageNum) => (
                  <div key={pageNum} className="relative">
                    <img
                      src={`https://placehold.co/600x850/ffffff/333333?text=Question+Paper%0APage+${pageNum}`}
                      alt={`Question Paper Page ${pageNum}`}
                      className="w-full rounded-lg border border-border shadow-sm"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {pageNum} / 4
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={rescanConfirmOpen}
        onOpenChange={setRescanConfirmOpen}
        title={isRescanRequested ? "Cancel Re-scan Request?" : "Request Re-scan?"}
        description={
          isRescanRequested
            ? `Are you sure you want to cancel the re-scan request for ${currentPaper?.studentName}'s paper?`
            : `Are you sure you want to request a re-scan for ${currentPaper?.studentName}'s paper? This will flag the paper for re-scanning.`
        }
        confirmLabel={isRescanRequested ? "Yes, Cancel" : "Yes, Request Re-scan"}
        cancelLabel="Go Back"
        variant={isRescanRequested ? "destructive" : "default"}
        onConfirm={confirmToggleRescan}
      />
    </div>
  );
};

export default TeacherPaperReview;
