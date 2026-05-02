import React from 'react';
import { X, Download, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { PaperDetails, Section, SubpartStyle } from '@/types/questionPaper';
import { questionTypeLabels } from '@/types/questionPaper';

interface Props {
  open: boolean;
  onClose: () => void;
  details: PaperDetails;
  sections: Section[];
  subpartStyle: SubpartStyle;
}

const PaperPreviewDrawer: React.FC<Props> = ({ open, onClose, details, sections, subpartStyle }) => {
  let questionCounter = 0;

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] overflow-y-auto bg-white p-0">
        <SheetHeader className="p-4 border-b border-border sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground">Paper Preview</SheetTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1.5" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <FileJson className="w-4 h-4 mr-1.5" />
                Question Map
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="p-8 font-serif text-sm leading-relaxed">
          {/* Paper Header */}
          <div className="text-center mb-6 border-b-2 border-foreground pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ButterPrep</p>
            <h1 className="text-lg font-bold text-foreground">{details.subject || 'Subject'}</h1>
            <p className="text-sm text-muted-foreground">{details.className || 'Class'} — {details.examName || 'Exam'}</p>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Date: {details.date || '___________'}</span>
              <span>Duration: {details.duration}</span>
              <span>Max Marks: {details.targetMarks}</span>
            </div>
          </div>

          {/* Instructions */}
          {details.instructions && (
            <div className="mb-6">
              <p className="text-xs font-bold text-foreground mb-1">General Instructions:</p>
              {details.instructions.split('\n').map((line, i) => (
                <p key={i} className="text-xs text-muted-foreground">{i + 1}. {line}</p>
              ))}
            </div>
          )}

          {/* Sections & Questions */}
          {sections.map(section => {
            const marksDisplay = section.marksPerQuestion && section.totalQuestions
              ? section.answerRule === 'any-k' && section.answerAnyK
                ? `(Answer any ${section.answerAnyK}) (${section.answerAnyK}×${section.marksPerQuestion}=${section.answerAnyK * section.marksPerQuestion})`
                : `(${section.questions.length || section.totalQuestions}×${section.marksPerQuestion}=${(section.questions.length || section.totalQuestions) * section.marksPerQuestion})`
              : '';

            return (
              <div key={section.id} className="mb-6">
                <div className="flex items-baseline justify-between mb-3 border-b border-muted pb-1">
                  <h2 className="font-bold text-foreground text-sm">
                    {section.labelStyle === 'roman' ? 'Section' : 'Part'} {section.label}
                    {section.title && ` — ${section.title}`}
                  </h2>
                  {marksDisplay && (
                    <span className="text-xs text-muted-foreground font-medium">{marksDisplay}</span>
                  )}
                </div>

                {section.questions.map((q) => {
                  questionCounter++;
                  return (
                    <div key={q.id} className="mb-3 pl-2">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <span className="font-medium text-foreground">Q{questionCounter}. </span>
                          <span className="text-foreground">{q.text || '___________'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-4 whitespace-nowrap">[{q.marks}M]</span>
                      </div>

                      {/* MCQ options */}
                      {q.type === 'mcq' && q.options && (
                        <div className="pl-6 mt-1 grid grid-cols-2 gap-x-4 text-xs">
                          {q.options.map((opt, i) => (
                            <span key={i} className="text-muted-foreground">
                              ({String.fromCharCode(97 + i)}) {opt || '___________'}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Match pairs */}
                      {q.type === 'match' && q.matchPairs && (
                        <div className="pl-6 mt-1">
                          <div className="grid grid-cols-2 gap-4 text-xs border border-border rounded p-2">
                            <div className="font-medium text-foreground">Column A</div>
                            <div className="font-medium text-foreground">Column B</div>
                            {q.matchPairs.map((pair, i) => (
                              <React.Fragment key={i}>
                                <span className="text-muted-foreground">{i + 1}. {pair.left || '___'}</span>
                                <span className="text-muted-foreground">{String.fromCharCode(97 + i)}. {pair.right || '___'}</span>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Subparts */}
                      {q.subparts.length > 0 && (
                        <div className="pl-6 mt-1 space-y-0.5">
                          {q.subparts.map(sp => (
                            <div key={sp.id} className="flex justify-between text-xs">
                              <span className="text-foreground">
                                <span className="font-medium text-purple">{sp.label}</span> {sp.text || '___________'}
                              </span>
                              <span className="text-muted-foreground">[{sp.marks}M]</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* OR question */}
                      {q.hasOr && q.orQuestion && (
                        <div className="mt-2 pl-6">
                          <p className="text-xs font-bold text-center text-warning mb-1">OR</p>
                          <div className="flex justify-between">
                            <span className="text-foreground text-xs">{q.orQuestion.text || '___________'}</span>
                            <span className="text-xs text-muted-foreground">[{q.marks}M]</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {sections.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Add sections and questions to see the preview</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaperPreviewDrawer;
