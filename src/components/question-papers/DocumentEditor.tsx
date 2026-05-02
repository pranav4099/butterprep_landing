import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { Plus, Trash2, Upload, X, MoreHorizontal, ImagePlus, TableProperties, Sparkles, Type, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { PaperDetails, Section, SectionLabelStyle, SubpartStyle, AnswerRule, Question, QuestionType } from '@/types/questionPaper';
import { sectionLabels, questionTypeLabels } from '@/types/questionPaper';
import AcademicToolbar from './AcademicToolbar';

interface Props {
  details: PaperDetails;
  setDetails: React.Dispatch<React.SetStateAction<PaperDetails>>;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  subpartStyle: SubpartStyle;
  setSubpartStyle: React.Dispatch<React.SetStateAction<SubpartStyle>>;
  readOnly?: boolean;
}

const questionTypes: QuestionType[] = [
  'mcq', 'true-false', 'fill-blank', 'match', 'table', 'diagram', 'short-answer', 'long-answer', 'case-study',
];

const questionTypeIcons: Record<QuestionType, string> = {
  'mcq': '🔘', 'true-false': '✓✗', 'fill-blank': '___', 'match': '↔️',
  'table': '📊', 'diagram': '🖼️', 'short-answer': '✏️', 'long-answer': '📝', 'case-study': '📖',
};

// Inline editable text
const EditableText: React.FC<{
  value: string; onChange: (v: string) => void; placeholder: string; className?: string; multiline?: boolean;
  onFocus?: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement>;
}> = ({ value, onChange, placeholder, className = '', multiline = false, onFocus, inputRef }) => {
  const [editing, setEditing] = useState(false);

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value} onChange={e => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          onFocus={onFocus}
          autoFocus
          placeholder={placeholder} className={cn('w-full bg-primary/5 border border-primary/20 rounded px-2 py-1 outline-none resize-none', className)} rows={3} />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={value} onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onFocus={onFocus}
        onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} autoFocus placeholder={placeholder}
        className={cn('w-full bg-primary/5 border border-primary/20 rounded px-2 py-0.5 outline-none', className)} />
    );
  }

  return (
    <span onClick={() => { setEditing(true); onFocus?.(); }}
      className={cn('cursor-text rounded px-1 -mx-1 hover:bg-primary/5 transition-colors inline-block min-w-[60px]', !value && 'text-muted-foreground/50 italic', className)}>
      {value || placeholder}
    </span>
  );
};

// Inline editable number
const EditableNumber: React.FC<{
  value: number; onChange: (v: number) => void; className?: string; min?: number;
}> = ({ value, onChange, className = '', min = 0 }) => {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input type="number" value={value} onChange={e => onChange(Math.max(min, parseInt(e.target.value) || 0))}
        onBlur={() => setEditing(false)} onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        autoFocus min={min} className={cn('w-14 bg-primary/5 border border-primary/20 rounded px-1 py-0.5 outline-none text-center', className)} />
    );
  }

  return (
    <span onClick={() => setEditing(true)} className={cn('cursor-text rounded px-1 hover:bg-primary/5 transition-colors', className)}>
      {value}
    </span>
  );
};

const DocumentEditor: React.FC<Props> = ({ details, setDetails, sections, setSections, subpartStyle, setSubpartStyle, readOnly = false }) => {
  const [hoveredQuestion, setHoveredQuestion] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [focusedQuestion, setFocusedQuestion] = useState<{ sectionId: string; questionId: string } | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const activeInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  const GAP_PX = 24;

  // Convert 297mm to pixels
  const getPageHeightPx = useCallback(() => {
    const testEl = document.createElement('div');
    testEl.style.height = '297mm';
    testEl.style.position = 'absolute';
    testEl.style.visibility = 'hidden';
    document.body.appendChild(testEl);
    const px = testEl.offsetHeight;
    document.body.removeChild(testEl);
    return px;
  }, []);

  // Reflow: push elements that cross page boundaries to the next page
  useLayoutEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;

    const pageH = getPageHeightPx();
    const stride = pageH + GAP_PX;
    const items = Array.from(paper.querySelectorAll<HTMLElement>('[data-page-item]'));

    items.forEach((el) => {
      el.style.marginTop = '0px';
    });

    void paper.offsetHeight;

    items.forEach((el) => {
      const paperRect = paper.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const top = elRect.top - paperRect.top;
      const height = elRect.height;
      const pageIndex = Math.floor(top / stride);
      const pageStart = pageIndex * stride;
      const pageEnd = pageStart + pageH;

      if (top >= pageStart && top + height > pageEnd) {
        const push = pageEnd + GAP_PX - top;
        el.style.marginTop = `${Math.max(push, 0)}px`;
      }
    });
  }, [sections, details, getPageHeightPx]);

  const updateDetail = (field: keyof PaperDetails, value: string | number) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const addSection = (type: QuestionType = 'short-answer') => {
    const idx = sections.length;
    const style: SectionLabelStyle = sections[0]?.labelStyle || 'roman';
    const label = sectionLabels[style][idx] || `${idx + 1}`;
    const newSection: Section = {
      id: crypto.randomUUID(), label, title: questionTypeLabels[type], labelStyle: style,
      answerRule: 'all', totalQuestions: 0, totalMarks: 0, questions: [],
      marksPerQuestion: type === 'mcq' || type === 'true-false' || type === 'fill-blank' ? 1 : type === 'short-answer' ? 2 : type === 'long-answer' ? 5 : 3,
    };
    (newSection as any).questionType = type;
    setSections(prev => [...prev, newSection]);
    setFocusedSection(newSection.id);
  };

  const updateSection = (id: string, field: string, value: any) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const getSectionType = (section: Section): QuestionType => {
    return (section as any).questionType || 'short-answer';
  };

  const addQuestion = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const type = getSectionType(section);
    const newQ: Question = {
      id: crypto.randomUUID(), internalId: crypto.randomUUID(), displayNumber: 0,
      type, text: '', marks: section.marksPerQuestion || 1,
      subparts: [], hasOr: false,
      options: type === 'mcq' ? ['', '', '', ''] : undefined,
      matchPairs: type === 'match' ? [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }] : undefined,
    };
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, questions: [...s.questions, newQ] } : s
    ));
  };

  const updateQuestion = (sectionId: string, questionId: string, field: string, value: any) => {
    setSections(prev => prev.map(s =>
      s.id !== sectionId ? s : {
        ...s, questions: s.questions.map(q => q.id === questionId ? { ...q, [field]: value } : q),
      }
    ));
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(prev => prev.map(s =>
      s.id !== sectionId ? s : { ...s, questions: s.questions.filter(q => q.id !== questionId) }
    ));
  };

  const addSubpart = (sectionId: string, questionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s, questions: s.questions.map(q => {
          if (q.id !== questionId) return q;
          const idx = q.subparts.length;
          const label = subpartStyle === 'alpha' ? `(${String.fromCharCode(97 + idx)})` : `${idx + 1}`;
          return { ...q, subparts: [...q.subparts, { id: crypto.randomUUID(), label, text: '', marks: 1 }] };
        }),
      };
    }));
  };

  const insertImageToQuestion = (sectionId: string, questionId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        updateQuestion(sectionId, questionId, 'imageUrl', URL.createObjectURL(file));
      }
    };
    input.click();
  };

  const insertTableToQuestion = (sectionId: string, questionId: string) => {
    updateQuestion(sectionId, questionId, 'tableData', [
      [{ value: 'Header 1', isHeader: true }, { value: 'Header 2', isHeader: true }, { value: 'Header 3', isHeader: true }],
      [{ value: '' }, { value: '' }, { value: '' }],
      [{ value: '' }, { value: '' }, { value: '' }],
    ]);
    updateQuestion(sectionId, questionId, 'tableRows', 3);
    updateQuestion(sectionId, questionId, 'tableCols', 3);
  };

  // Insert note block into a question
  const insertNoteToQuestion = (sectionId: string, questionId: string) => {
    const currentNote = sections.find(s => s.id === sectionId)?.questions.find(q => q.id === questionId)?.note;
    if (!currentNote) {
      updateQuestion(sectionId, questionId, 'note', 'Use π = 22/7 where applicable');
    }
  };

  // Insert symbol at the end of question text (prototype behavior)
  const handleInsertSymbol = (symbol: string) => {
    if (!focusedQuestion) return;
    const { sectionId, questionId } = focusedQuestion;
    const section = sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(sectionId, questionId, 'text', question.text + symbol);
    }
  };

  // Insert formatting markers (prototype: wraps placeholder text)
  const handleInsertFormatting = (type: 'bold' | 'italic' | 'superscript' | 'subscript' | 'bullet' | 'numbered') => {
    if (!focusedQuestion) return;
    const { sectionId, questionId } = focusedQuestion;
    const section = sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    if (!question) return;

    const markers: Record<string, string> = {
      bold: '**text**',
      italic: '*text*',
      superscript: '^(2)',
      subscript: '_(2)',
      bullet: '\n• ',
      numbered: '\n1. ',
    };
    updateQuestion(sectionId, questionId, 'text', question.text + markers[type]);
  };

  // Insert content blocks
  const handleInsertBlock = (type: 'equation' | 'table' | 'image' | 'note') => {
    if (!focusedQuestion) return;
    const { sectionId, questionId } = focusedQuestion;
    switch (type) {
      case 'equation': {
        const section = sections.find(s => s.id === sectionId);
        const question = section?.questions.find(q => q.id === questionId);
        // Store equation in note field with a prefix to distinguish
        const eqPlaceholder = '$$  $$';
        if (question) {
          updateQuestion(sectionId, questionId, 'text', question.text + '\n' + eqPlaceholder);
        }
        break;
      }
      case 'table':
        insertTableToQuestion(sectionId, questionId);
        break;
      case 'image':
        insertImageToQuestion(sectionId, questionId);
        break;
      case 'note':
        insertNoteToQuestion(sectionId, questionId);
        break;
    }
  };

  const [showSectionPicker, setShowSectionPicker] = useState(false);

  // Parse text to render inline formatting for display
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    // Split by equation blocks
    const parts = text.split(/(\$\$[^$]*\$\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const eq = part.slice(2, -2).trim();
        return (
          <span key={i} className="inline-flex items-center mx-1 px-3 py-1 bg-accent/50 border border-border rounded font-mono text-xs text-foreground">
            {eq || 'equation'}
          </span>
        );
      }
      // Bold
      let rendered = part.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Italic
      rendered = rendered.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      // Superscript
      rendered = rendered.replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>');
      // Subscript
      rendered = rendered.replace(/_\(([^)]+)\)/g, '<sub>$1</sub>');
      return <span key={i} dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  const isToolbarActive = !!focusedQuestion;

  return (
    <TooltipProvider>
      <div className="flex-1 flex min-h-0">

        {/* ===== ACADEMIC EDITING TOOLBAR ===== */}
        <AcademicToolbar
          active={isToolbarActive}
          onInsertSymbol={handleInsertSymbol}
          onInsertFormatting={handleInsertFormatting}
          onInsertBlock={handleInsertBlock}
        />

        {/* ===== DOCUMENT AREA ===== */}
        <div className="flex-1 overflow-y-auto bg-muted/40">
          {/* Section type picker overlay */}
          {showSectionPicker && (
            <div className="max-w-[800px] mx-auto pt-4 px-4">
              <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
                <p className="text-xs font-semibold text-foreground mb-3">Choose question type for new section</p>
                <div className="grid grid-cols-3 gap-2">
                  {questionTypes.map(type => (
                    <button key={type} onClick={() => { addSection(type); setShowSectionPicker(false); }}
                      className="p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-2">
                      <span className="text-lg">{questionTypeIcons[type]}</span>
                      <div>
                        <p className="text-xs font-medium text-foreground">{questionTypeLabels[type]}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowSectionPicker(false)} className="text-xs text-muted-foreground hover:underline mt-3 block mx-auto">Cancel</button>
              </div>
            </div>
          )}

          <div className="mx-auto py-8 px-4 w-full max-w-[960px]">
            {/* The "Paper" — white A4 document with visible page gaps */}
            <div
              ref={paperRef}
              className="font-serif text-base leading-relaxed relative"
              style={{
                minHeight: '297mm',
                width: '100%',
                backgroundImage: `repeating-linear-gradient(
                  to bottom,
                  white 0px,
                  white 297mm,
                  hsl(var(--muted)) 297mm,
                  hsl(var(--muted)) calc(297mm + 24px)
                )`,
                backgroundSize: '100% calc(297mm + 24px)',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                border: '1px solid hsl(var(--border))',
              }}
            >

              {/* ===== HEADER ===== */}
              <div className="text-center pt-8 pb-4 px-10 border-b-2 border-foreground/80" style={{ breakInside: 'avoid' }}>
                <div className="mb-2">
                  {details.logoUrl ? (
                    <div className="relative inline-block group">
                      <img src={details.logoUrl} alt="Logo" className="w-14 h-14 object-contain mx-auto rounded" />
                      <button onClick={() => updateDetail('logoUrl', '')}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-muted-foreground/20 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground/40">
                      <Upload className="w-4 h-4" />
                      <span className="text-xs font-sans">Upload Logo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) updateDetail('logoUrl', URL.createObjectURL(file));
                      }} />
                    </label>
                  )}
                </div>

                <div className="text-sm font-bold text-foreground">
                  <EditableText value={details.institutionName} onChange={v => updateDetail('institutionName', v)} placeholder="Click to add Institution Name" className="text-sm font-bold" />
                </div>
                <div className="text-base font-bold text-foreground mt-1">
                  <EditableText value={details.subject} onChange={v => updateDetail('subject', v)} placeholder="Subject Name" className="text-base font-bold" />
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <EditableText value={details.className} onChange={v => updateDetail('className', v)} placeholder="Class" className="text-sm" />
                  <span>—</span>
                  <EditableText value={details.examName} onChange={v => updateDetail('examName', v)} placeholder="Exam Name" className="text-sm" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-3 px-4">
                  <span className="flex items-center gap-1">Date: <EditableText value={details.date} onChange={v => updateDetail('date', v)} placeholder="DD/MM/YYYY" className="text-xs" /></span>
                  <span className="flex items-center gap-1">Duration: <EditableText value={details.duration} onChange={v => updateDetail('duration', v)} placeholder="3 Hours" className="text-xs" /></span>
                  <span className="flex items-center gap-1">Max Marks: <EditableNumber value={details.targetMarks} onChange={v => updateDetail('targetMarks', v)} className="text-xs" min={1} /></span>
                </div>
              </div>

              {/* ===== INSTRUCTIONS ===== */}
              <div className="px-10 py-4 border-b border-muted" style={{ breakInside: 'avoid' }}>
                <p className="text-xs font-bold text-foreground mb-1">General Instructions:</p>
                <EditableText value={details.instructions} onChange={v => updateDetail('instructions', v)} placeholder="Click to add instructions..." className="text-xs text-muted-foreground leading-relaxed" multiline />
              </div>

              {/* ===== SECTIONS & QUESTIONS ===== */}
              <div className="px-10 py-6 space-y-6" style={{ columns: 'unset' }}>
                {sections.map((section) => {
                  const sectionType = getSectionType(section);
                  const sectionMarks = section.questions.reduce((sum, q) =>
                    sum + (q.subparts.length > 0 ? q.subparts.reduce((s, sp) => s + sp.marks, 0) : q.marks), 0);

                  const marksLabel = section.marksPerQuestion
                    ? section.answerRule === 'any-k' && section.answerAnyK
                      ? `Answer any ${section.answerAnyK} (${section.answerAnyK}×${section.marksPerQuestion}=${section.answerAnyK * section.marksPerQuestion})`
                      : section.questions.length > 0
                        ? `${section.questions.length}×${section.marksPerQuestion}=${section.questions.length * section.marksPerQuestion}`
                        : ''
                    : sectionMarks > 0 ? `${sectionMarks} Marks` : '';

                  return (
                    <div key={section.id} id={`section-${section.id}`} className="relative group/section" style={{ breakInside: 'avoid' }}
                      onMouseEnter={() => { setHoveredSection(section.id); setFocusedSection(section.id); }}
                      onMouseLeave={() => setHoveredSection(null)}
                      onClick={() => setFocusedSection(section.id)}
                    >
                      {/* Section header */}
                      <div data-page-item className="flex items-baseline justify-between mb-3 border-b border-muted-foreground/20 pb-1.5">
                        <h2 className="font-bold text-foreground text-sm flex items-center gap-1">
                          {section.labelStyle === 'roman' ? 'Section' : 'Part'} {section.label}
                          <span className="text-muted-foreground/40 mx-1">—</span>
                          <EditableText value={section.title} onChange={v => updateSection(section.id, 'title', v)} placeholder="Section Title" className="text-sm font-bold" />
                          <Badge variant="outline" className="ml-2 text-[10px] font-sans font-normal">
                            {questionTypeIcons[sectionType]} {questionTypeLabels[sectionType]}
                          </Badge>
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{marksLabel}</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className={cn(
                                'w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-all',
                                hoveredSection === section.id ? 'opacity-100' : 'opacity-0'
                              )}>
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3 space-y-2" side="left">
                              <p className="text-xs font-semibold text-foreground">Section Settings</p>
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] text-muted-foreground">Question Type</label>
                                  <Select value={sectionType} onValueChange={v => updateSection(section.id, 'questionType', v)}>
                                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-card z-50">
                                      {questionTypes.map(t => (
                                        <SelectItem key={t} value={t}>{questionTypeIcons[t]} {questionTypeLabels[t]}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground">Answer Rule</label>
                                  <Select value={section.answerRule} onValueChange={v => updateSection(section.id, 'answerRule', v)}>
                                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-card z-50">
                                      <SelectItem value="all">Answer All</SelectItem>
                                      <SelectItem value="any-k">Any K of N</SelectItem>
                                      <SelectItem value="or-choice">OR Choice</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                {section.answerRule === 'any-k' && (
                                  <div>
                                    <label className="text-[10px] text-muted-foreground">Answer any</label>
                                    <Input type="number" value={section.answerAnyK || ''} onChange={e => updateSection(section.id, 'answerAnyK', parseInt(e.target.value) || 0)} className="h-7 text-xs" />
                                  </div>
                                )}
                                <div>
                                  <label className="text-[10px] text-muted-foreground">Marks per question (uniform)</label>
                                  <Input type="number" value={section.marksPerQuestion || ''} onChange={e => updateSection(section.id, 'marksPerQuestion', parseInt(e.target.value) || 0)} className="h-7 text-xs" placeholder="Leave empty for custom" />
                                </div>
                                <Button variant="destructive" size="sm" className="w-full h-7 text-xs" onClick={() => removeSection(section.id)}>
                                  <Trash2 className="w-3 h-3 mr-1" />Remove Section
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Questions */}
                      {section.questions.map((q, qIdx) => {
                        const isActive = focusedQuestion?.questionId === q.id;
                        return (
                          <div key={q.id} data-page-item
                            className={cn(
                              'mb-4 pl-1 relative group/q rounded-sm transition-all',
                              isActive && 'bg-primary/[0.03] ring-1 ring-primary/20 -mx-2 px-3 py-2'
                            )}
                            onMouseEnter={() => setHoveredQuestion(q.id)}
                            onMouseLeave={() => setHoveredQuestion(null)}
                            onClick={() => setFocusedQuestion({ sectionId: section.id, questionId: q.id })}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 flex items-start gap-1.5">
                                <span className="font-medium text-foreground text-sm">Q{qIdx + 1}. </span>
                                <div className="flex-1">
                                  <EditableText
                                    value={q.text}
                                    onChange={v => updateQuestion(section.id, q.id, 'text', v)}
                                    placeholder="Type your question here..."
                                    className="text-sm"
                                    onFocus={() => setFocusedQuestion({ sectionId: section.id, questionId: q.id })}
                                  />
                                  {/* Render formatted preview when not editing */}
                                  {q.text && (q.text.includes('$$') || q.text.includes('**') || q.text.includes('^(') || q.text.includes('_(')) && (
                                    <div className="mt-1 text-xs text-muted-foreground border-l-2 border-primary/20 pl-2">
                                      <span className="text-[9px] text-primary/50 font-sans block mb-0.5">Preview:</span>
                                      {renderFormattedText(q.text)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 ml-3 shrink-0">
                                <Select value={q.type || 'short-answer'} onValueChange={v => {
                                  const newType = v as QuestionType;
                                  updateQuestion(section.id, q.id, 'type', newType);
                                  if (newType === 'mcq' && !q.options) updateQuestion(section.id, q.id, 'options', ['', '', '', '']);
                                  if (newType === 'match' && !q.matchPairs) updateQuestion(section.id, q.id, 'matchPairs', [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }]);
                                  if (newType !== 'mcq') updateQuestion(section.id, q.id, 'options', undefined);
                                  if (newType !== 'match') updateQuestion(section.id, q.id, 'matchPairs', undefined);
                                }}>
                                  <SelectTrigger className="h-5 text-[9px] w-auto min-w-0 px-1.5 py-0 border border-border/50 bg-muted/30 gap-1 rounded font-sans hover:bg-primary/5 hover:border-primary/30 transition-colors">
                                    <span className="flex items-center gap-1">
                                      <span>{questionTypeIcons[q.type]}</span>
                                      <span className="text-muted-foreground">{questionTypeLabels[q.type]}</span>
                                    </span>
                                  </SelectTrigger>
                                  <SelectContent className="bg-card z-50">
                                    {questionTypes.map(t => (
                                      <SelectItem key={t} value={t} className="text-xs">{questionTypeIcons[t]} {questionTypeLabels[t]}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-0.5">
                                  [<EditableNumber value={q.marks} onChange={v => updateQuestion(section.id, q.id, 'marks', v)} className="text-xs" min={1} />]
                                </span>
                              </div>
                            </div>

                            {/* MCQ options */}
                            {q.type === 'mcq' && q.options && (
                              <div className="pl-6 mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                {q.options.map((opt, i) => (
                                  <span key={i} className="flex items-center gap-1">
                                    ({String.fromCharCode(97 + i)})
                                    <EditableText value={opt} onChange={v => {
                                      const newOpts = [...(q.options || [])]; newOpts[i] = v;
                                      updateQuestion(section.id, q.id, 'options', newOpts);
                                    }} placeholder={`Option ${String.fromCharCode(97 + i)}`} className="text-xs"
                                    onFocus={() => setFocusedQuestion({ sectionId: section.id, questionId: q.id })} />
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Match pairs */}
                            {q.type === 'match' && q.matchPairs && (
                              <div className="pl-6 mt-1.5">
                                <div className="grid grid-cols-2 gap-x-4 text-xs border border-border rounded p-2">
                                  <span className="font-medium text-foreground">Column A</span>
                                  <span className="font-medium text-foreground">Column B</span>
                                  {q.matchPairs.map((pair, i) => (
                                    <React.Fragment key={i}>
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        {i + 1}. <EditableText value={pair.left} onChange={v => {
                                          const p = [...(q.matchPairs || [])]; p[i] = { ...pair, left: v };
                                          updateQuestion(section.id, q.id, 'matchPairs', p);
                                        }} placeholder="___" className="text-[10px]" />
                                      </span>
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        {String.fromCharCode(97 + i)}. <EditableText value={pair.right} onChange={v => {
                                          const p = [...(q.matchPairs || [])]; p[i] = { ...pair, right: v };
                                          updateQuestion(section.id, q.id, 'matchPairs', p);
                                        }} placeholder="___" className="text-[10px]" />
                                      </span>
                                    </React.Fragment>
                                  ))}
                                </div>
                                <button onClick={() => updateQuestion(section.id, q.id, 'matchPairs', [...(q.matchPairs || []), { left: '', right: '' }])}
                                  className="text-[9px] text-primary hover:underline mt-0.5">+ Add pair</button>
                              </div>
                            )}

                            {/* Table data */}
                            {q.tableData && q.tableData.length > 0 && (
                              <div className="pl-5 mt-2">
                                <table className="border-collapse text-[10px] w-full">
                                  <tbody>
                                    {q.tableData.map((row, rIdx) => (
                                      <tr key={rIdx}>
                                        {row.map((cell, cIdx) => (
                                          <td key={cIdx} className={cn('border border-border px-2 py-1', cell.isHeader && 'font-bold bg-muted/50')}>
                                            <EditableText value={cell.value} onChange={v => {
                                              const newTable = q.tableData!.map((r, ri) => r.map((c, ci) =>
                                                ri === rIdx && ci === cIdx ? { ...c, value: v } : c
                                              ));
                                              updateQuestion(section.id, q.id, 'tableData', newTable);
                                            }} placeholder="..." className="text-[10px]" />
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
                              <div className="pl-5 mt-2 relative inline-block group/img">
                                <img src={q.imageUrl} alt="Question" className="max-w-[300px] max-h-[200px] object-contain rounded border border-border" />
                                <button onClick={() => updateQuestion(section.id, q.id, 'imageUrl', undefined)}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {/* Note block */}
                            {q.note && (
                              <div className="pl-5 mt-2 relative group/note">
                                <div className="flex items-start gap-2 bg-accent/40 border border-accent rounded-md px-3 py-2">
                                  <span className="text-[10px] font-semibold text-accent-foreground/70 shrink-0 mt-0.5">📌 Note:</span>
                                  <EditableText
                                    value={q.note}
                                    onChange={v => updateQuestion(section.id, q.id, 'note', v)}
                                    placeholder="Add instruction..."
                                    className="text-[10px] text-accent-foreground/80 font-sans"
                                    onFocus={() => setFocusedQuestion({ sectionId: section.id, questionId: q.id })}
                                  />
                                  <button onClick={() => updateQuestion(section.id, q.id, 'note', undefined)}
                                    className="text-destructive opacity-0 group-hover/note:opacity-100 shrink-0">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Subparts */}
                            {q.subparts.length > 0 && (
                              <div className="pl-6 mt-1.5 space-y-1">
                                {q.subparts.map((sp, spIdx) => (
                                  <div key={sp.id} className="flex justify-between text-xs group/sp">
                                    <span className="flex items-center gap-1">
                                      <span className="font-medium text-primary">{sp.label}</span>
                                      <EditableText value={sp.text} onChange={v => {
                                        const subs = [...q.subparts]; subs[spIdx] = { ...sp, text: v };
                                        updateQuestion(section.id, q.id, 'subparts', subs);
                                      }} placeholder="Subpart text..." className="text-xs" />
                                    </span>
                                    <span className="text-muted-foreground flex items-center gap-0.5">
                                      [<EditableNumber value={sp.marks} onChange={v => {
                                        const subs = [...q.subparts]; subs[spIdx] = { ...sp, marks: v };
                                        updateQuestion(section.id, q.id, 'subparts', subs);
                                      }} className="text-xs" min={1} />]
                                      <button onClick={() => updateQuestion(section.id, q.id, 'subparts', q.subparts.filter((_, i) => i !== spIdx))}
                                        className="text-destructive opacity-0 group-hover/sp:opacity-100 ml-1"><Trash2 className="w-2.5 h-2.5" /></button>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* OR */}
                            {q.hasOr && (
                              <div className="mt-2 pl-6">
                                <p className="text-xs font-bold text-center text-warning">OR</p>
                                <div className="flex justify-between text-sm mt-0.5">
                                  <EditableText value={q.orQuestion?.text || ''} onChange={v => updateQuestion(section.id, q.id, 'orQuestion', {
                                    ...(q.orQuestion || { id: crypto.randomUUID(), internalId: crypto.randomUUID(), type: q.type, text: '', marks: q.marks, subparts: [] }),
                                    text: v,
                                  })} placeholder="OR question text..." className="text-sm" />
                                  <span className="text-xs text-muted-foreground">[{q.marks}]</span>
                                </div>
                              </div>
                            )}

                            {/* Floating action bar */}
                            <div className={cn(
                              'flex items-center gap-0.5 bg-card border border-border rounded-md shadow-sm px-1 py-0.5 transition-opacity mt-1 w-fit ml-auto',
                              hoveredQuestion === q.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            )}>
                              <button onClick={() => addSubpart(section.id, q.id)} className="text-[9px] text-primary hover:bg-primary/10 rounded px-1.5 py-0.5">+Sub</button>
                              <button onClick={() => insertImageToQuestion(section.id, q.id)} className="text-[9px] text-muted-foreground hover:bg-muted rounded px-1 py-0.5">
                                <ImagePlus className="w-3 h-3" />
                              </button>
                              <button onClick={() => insertTableToQuestion(section.id, q.id)} className="text-[9px] text-muted-foreground hover:bg-muted rounded px-1 py-0.5">
                                <TableProperties className="w-3 h-3" />
                              </button>
                              <button onClick={() => insertNoteToQuestion(section.id, q.id)} className="text-[9px] text-muted-foreground hover:bg-muted rounded px-1 py-0.5">
                                📌
                              </button>
                              <div className="flex items-center gap-0.5">
                                <span className="text-[9px] text-muted-foreground">OR</span>
                                <Switch checked={q.hasOr} onCheckedChange={v => updateQuestion(section.id, q.id, 'hasOr', v)} className="scale-50" />
                              </div>
                              <button onClick={() => removeQuestion(section.id, q.id)} className="text-destructive hover:bg-destructive/10 rounded p-0.5">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add question */}
                      {section.questions.length === 0 && (
                        <p className="text-[10px] text-muted-foreground/40 italic pl-1 mb-2">No questions yet — click below to add</p>
                      )}
                      <button onClick={() => addQuestion(section.id)}
                        className="w-full mt-1 py-1.5 rounded border border-dashed border-muted-foreground/20 text-[10px] text-muted-foreground/50 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all font-sans flex items-center justify-center gap-1">
                        <Plus className="w-3 h-3" />
                        Add {questionTypeLabels[sectionType]} Question
                      </button>
                    </div>
                  );
                })}

                {/* Add Section */}
                {sections.length === 0 && !showSectionPicker && (
                  <button onClick={() => setShowSectionPicker(true)}
                    className="w-full py-8 rounded-lg border-2 border-dashed border-muted-foreground/15 text-sm text-muted-foreground/40 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all font-sans flex flex-col items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add your first section to get started
                  </button>
                )}

                {sections.length > 0 && (
                  <button onClick={() => setShowSectionPicker(true)}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-muted-foreground/15 text-xs text-muted-foreground/40 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all font-sans flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Add Section
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DocumentEditor;
