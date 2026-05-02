import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePapers } from '@/hooks/usePapers';
import { cn } from '@/lib/utils';
import { computeSectionAnswerableMarks } from '@/types/questionPaper';

const PaperPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPaper } = usePapers();
  const paper = getPaper(id || '');

  if (!paper) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Paper not found.</p>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const { details, sections } = paper;

  let qCounter = 1;

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Toolbar — hidden in print */}
      <div className="print:hidden flex items-center justify-between px-6 py-3 bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h2 className="text-sm font-semibold">{details.subject} — {details.examName}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground" onClick={handlePrint}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* A4 Paper */}
      <div className="max-w-[210mm] mx-auto my-8 print:my-0 print:max-w-none">
        <div className="bg-white shadow-lg print:shadow-none p-[20mm] min-h-[297mm] font-serif text-[12pt] leading-[1.6] print:p-[15mm]">

          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            {details.logoUrl && (
              <img src={details.logoUrl} alt="Logo" className="w-16 h-16 object-contain mx-auto mb-2" />
            )}
            <h1 className="text-[14pt] font-bold uppercase tracking-wide">{details.institutionName}</h1>
            <h2 className="text-[16pt] font-bold mt-1">{details.subject}</h2>
            <p className="text-[11pt] mt-0.5">{details.className} — {details.examName}</p>
            <div className="flex justify-between text-[10pt] mt-3 px-8">
              <span>Date: {details.date}</span>
              <span>Duration: {details.duration}</span>
              <span>Maximum Marks: {details.targetMarks}</span>
            </div>
          </div>

          {/* Instructions */}
          {details.instructions && (
            <div className="mb-6 text-[10pt]">
              <p className="font-bold mb-1">General Instructions:</p>
              {details.instructions.split('\n').map((line, i) => (
                <p key={i} className="ml-4">{line}</p>
              ))}
            </div>
          )}

          {/* Sections */}
          {sections.map(section => {
            const sectionMarks = computeSectionAnswerableMarks(section);
            return (
              <div key={section.id} className="mb-6 break-inside-avoid-page">
                <div className="font-bold text-[13pt] border-b border-black/30 pb-1 mb-3 flex justify-between">
                  <span>
                    {section.labelStyle === 'roman' ? 'Section' : 'Part'} {section.label} — {section.title}
                  </span>
                  <span className="text-[10pt] font-normal text-gray-600">
                    [{sectionMarks} Marks]
                    {section.answerRule === 'any-k' && ` (Attempt any ${section.answerAnyK})`}
                  </span>
                </div>

                {section.instructions && (
                  <p className="text-[10pt] italic mb-2 ml-2">{section.instructions}</p>
                )}

                {section.questions.map(q => {
                  const num = qCounter++;
                  const qMarks = q.subparts.length > 0
                    ? q.subparts.reduce((s, sp) => s + sp.marks, 0)
                    : q.marks;

                  return (
                    <div key={q.id} className="mb-3 break-inside-avoid">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <span className="font-semibold">{num}. </span>
                          <span>{q.text}</span>
                        </div>
                        <span className="text-[10pt] text-gray-500 ml-4 whitespace-nowrap">[{qMarks}]</span>
                      </div>

                      {/* MCQ */}
                      {q.type === 'mcq' && q.options && (
                        <div className="ml-6 mt-1 grid grid-cols-2 gap-x-6 gap-y-0.5 text-[11pt]">
                          {q.options.map((opt, i) => (
                            <span key={i}>({String.fromCharCode(97 + i)}) {opt}</span>
                          ))}
                        </div>
                      )}

                      {/* Match */}
                      {q.type === 'match' && q.matchPairs && (
                        <div className="ml-6 mt-1">
                          <table className="border-collapse text-[11pt]">
                            <thead>
                              <tr>
                                <th className="border border-black/30 px-3 py-1 text-left">Column A</th>
                                <th className="border border-black/30 px-3 py-1 text-left">Column B</th>
                              </tr>
                            </thead>
                            <tbody>
                              {q.matchPairs.map((p, i) => (
                                <tr key={i}>
                                  <td className="border border-black/30 px-3 py-1">{i + 1}. {p.left}</td>
                                  <td className="border border-black/30 px-3 py-1">{String.fromCharCode(97 + i)}. {p.right}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Table */}
                      {q.tableData && (
                        <div className="ml-6 mt-2">
                          <table className="border-collapse text-[11pt]">
                            <tbody>
                              {q.tableData.map((row, ri) => (
                                <tr key={ri}>
                                  {row.map((cell, ci) => (
                                    <td key={ci} className={cn(
                                      'border border-black/30 px-3 py-1',
                                      cell.isHeader && 'font-bold bg-gray-100'
                                    )}>
                                      {cell.value}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Image */}
                      {q.imageUrl && (
                        <div className="ml-6 mt-2">
                          <img src={q.imageUrl} alt="Question figure" className="max-w-[300px] max-h-[200px] object-contain" />
                        </div>
                      )}

                      {/* Subparts */}
                      {q.subparts.length > 0 && (
                        <div className="ml-6 mt-1 space-y-0.5">
                          {q.subparts.map(sp => (
                            <div key={sp.id} className="flex justify-between">
                              <span><span className="font-medium">{sp.label}</span> {sp.text}</span>
                              <span className="text-[10pt] text-gray-500 ml-4">[{sp.marks}]</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* OR */}
                      {q.hasOr && q.orQuestion && (
                        <div className="mt-2 ml-6">
                          <p className="text-center font-bold text-[11pt]">OR</p>
                          <div className="flex justify-between mt-0.5">
                            <span>{q.orQuestion.text}</span>
                            <span className="text-[10pt] text-gray-500 ml-4">[{q.orQuestion.marks}]</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Footer line */}
          <div className="text-center text-[10pt] mt-8 pt-4 border-t border-black/20">
            — End of Paper —
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperPreview;
