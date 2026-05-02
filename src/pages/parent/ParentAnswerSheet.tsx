import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useParent } from '@/contexts/ParentContext';
import { ArrowLeft } from 'lucide-react';

const ParentAnswerSheet = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { getExamResults } = useParent();
  const results = getExamResults();
  const exam = results.find(r => r.id === examId);

  if (!exam || exam.answerSheetPages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Answer sheet not available.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  const totalPages = exam.answerSheetPages.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-bar border-b border-border/60 px-4 h-14 flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground tracking-tight">{exam.examName}</p>
          <p className="text-[10px] text-muted-foreground">{totalPages} pages</p>
        </div>
        <div className="w-16" />
      </header>

      {/* Scrollable answer sheet — all pages stacked */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div key={pageIndex} className="relative">
              {/* Page indicator */}
              <div className="absolute top-3 right-3 z-10 bg-foreground/70 text-background text-[10px] font-semibold px-2.5 py-1 rounded-full">
                Page {pageIndex + 1} of {totalPages}
              </div>

              {/* Simulated answer sheet page */}
              <div className="bg-card rounded-2xl border border-border/60 card-shadow p-5 min-h-[480px]">
                <div className="text-center mb-5 pb-3 border-b border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Answer Sheet</p>
                  <p className="text-sm font-medium text-foreground mt-1">{exam.examName} — Page {pageIndex + 1}</p>
                </div>
                <div className="space-y-5">
                  {[1, 2, 3].map(q => {
                    const qNum = pageIndex * 3 + q;
                    return (
                      <div key={q} className="border-b border-border/30 pb-4 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-primary bg-primary/8 px-2 py-0.5 rounded-md">Q{qNum}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/10 text-success font-semibold">✓ 4/5</span>
                        </div>
                        <div className="h-20 bg-muted/20 rounded-xl border border-dashed border-border/40 flex items-center justify-center">
                          <p className="text-xs text-muted-foreground/60 italic">Student's handwritten answer</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2 italic leading-relaxed">
                          Teacher note: Good attempt, show full working.
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentAnswerSheet;
