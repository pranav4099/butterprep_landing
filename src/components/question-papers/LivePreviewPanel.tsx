import React from 'react';
import { Download, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaperDetails, Section, SubpartStyle } from '@/types/questionPaper';

interface Props {
  details: PaperDetails;
  sections: Section[];
  subpartStyle: SubpartStyle;
}

const LivePreviewPanel: React.FC<Props> = ({ details, sections }) => {
  

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</h3>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Download className="w-3 h-3 mr-1" />PDF
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <FileJson className="w-3 h-3 mr-1" />Map
          </Button>
        </div>
      </div>

      {/* Paper */}
      <div className="bg-white rounded-lg shadow-md border border-border p-8 font-serif text-sm leading-relaxed min-h-[600px]">
        {/* Header */}
        <div className="text-center mb-5 pb-3 border-b-2 border-foreground">
          {details.logoUrl && (
            <img src={details.logoUrl} alt="Logo" className="w-12 h-12 object-contain mx-auto mb-1 rounded" />
          )}
          <p className="text-xs font-bold text-foreground">{details.institutionName || 'Institution Name'}</p>
          <h1 className="text-base font-bold text-foreground mt-0.5">{details.subject || 'Subject'}</h1>
          <p className="text-xs text-muted-foreground">{details.className || 'Class'} — {details.examName || 'Exam'}</p>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-4">
            <span>Date: {details.date || '___________'}</span>
            <span>Duration: {details.duration}</span>
            <span>Max Marks: {details.targetMarks}</span>
          </div>
        </div>

        {/* Instructions */}
        {details.instructions && (
          <div className="mb-5">
            <p className="text-[10px] font-bold text-foreground mb-0.5">General Instructions:</p>
            {details.instructions.split('\n').map((line, i) => (
              <p key={i} className="text-[10px] text-muted-foreground leading-relaxed">{i + 1}. {line}</p>
            ))}
          </div>
        )}

        {/* Sections */}
        {sections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xs text-muted-foreground">Add sections and questions to see the preview</p>
          </div>
        ) : (
          sections.map(section => {
            const sectionMarks = section.questions.reduce((sum, q) =>
              sum + (q.subparts.length > 0 ? q.subparts.reduce((s, sp) => s + sp.marks, 0) : q.marks), 0);

            const marksLabel = section.marksPerQuestion
              ? section.answerRule === 'any-k' && section.answerAnyK
                ? `[Answer any ${section.answerAnyK}] (${section.answerAnyK}×${section.marksPerQuestion}=${section.answerAnyK * section.marksPerQuestion})`
                : `(${section.questions.length}×${section.marksPerQuestion}=${section.questions.length * section.marksPerQuestion})`
              : sectionMarks > 0 ? `[${sectionMarks}M]` : '';

            return (
              <div key={section.id} className="mb-5">
                <div className="flex items-baseline justify-between mb-2 border-b border-muted pb-1">
                  <h2 className="font-bold text-foreground text-xs">
                    {section.labelStyle === 'roman' ? 'Section' : 'Part'} {section.label}
                    {section.title && ` — ${section.title}`}
                  </h2>
                  <span className="text-[10px] text-muted-foreground">{marksLabel}</span>
                </div>

                {section.questions.map((q, qIdx) => {
                  const qNum = qIdx + 1;
                  return (
                    <div key={q.id} className="mb-2.5 pl-1">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <span className="font-medium text-foreground text-xs">Q{qNum}. </span>
                          <span className="text-xs text-foreground">{q.text || '___________'}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground ml-3 whitespace-nowrap">[{q.marks}]</span>
                      </div>

                      {/* MCQ */}
                      {q.type === 'mcq' && q.options && q.options.some(o => o) && (
                        <div className="pl-5 mt-0.5 grid grid-cols-2 gap-x-3 text-[10px] text-muted-foreground">
                          {q.options.map((opt, i) => (
                            <span key={i}>({String.fromCharCode(97 + i)}) {opt || '___'}</span>
                          ))}
                        </div>
                      )}

                      {/* Match */}
                      {q.type === 'match' && q.matchPairs && q.matchPairs.some(p => p.left || p.right) && (
                        <div className="pl-5 mt-1">
                          <div className="grid grid-cols-2 gap-x-4 text-[10px] border border-border rounded p-1.5">
                            <span className="font-medium text-foreground">Column A</span>
                            <span className="font-medium text-foreground">Column B</span>
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
                        <div className="pl-5 mt-0.5 space-y-0.5">
                          {q.subparts.map(sp => (
                            <div key={sp.id} className="flex justify-between text-[10px]">
                              <span><span className="font-medium text-purple">{sp.label}</span> {sp.text || '___'}</span>
                              <span className="text-muted-foreground">[{sp.marks}]</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* OR */}
                      {q.hasOr && q.orQuestion?.text && (
                        <div className="mt-1.5 pl-5">
                          <p className="text-[10px] font-bold text-center text-warning">OR</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-foreground">{q.orQuestion.text}</span>
                            <span className="text-[10px] text-muted-foreground">[{q.marks}]</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {section.questions.length === 0 && (
                  <p className="text-[10px] text-muted-foreground/50 italic pl-1">No questions yet</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LivePreviewPanel;
