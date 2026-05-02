import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type { PaperDetails, Section, SectionLabelStyle, SubpartStyle, AnswerRule, Question, QuestionType } from '@/types/questionPaper';
import { sectionLabels, questionTypeLabels, questionTypeDescriptions } from '@/types/questionPaper';

interface Props {
  details: PaperDetails;
  setDetails: React.Dispatch<React.SetStateAction<PaperDetails>>;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  subpartStyle: SubpartStyle;
  setSubpartStyle: React.Dispatch<React.SetStateAction<SubpartStyle>>;
}

const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physics', 'Chemistry', 'Biology'];
const exams = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2', 'Unit Test', 'Practice Test'];
const durations = ['30 Minutes', '45 Minutes', '1 Hour', '1.5 Hours', '2 Hours', '2.5 Hours', '3 Hours'];

const questionTypeIcons: Record<QuestionType, string> = {
  'mcq': '🔘', 'true-false': '✓✗', 'fill-blank': '___', 'match': '↔️',
  'table': '📊', 'diagram': '🖼️', 'short-answer': '✏️', 'long-answer': '📝', 'case-study': '📖',
};

const PaperSetupPanel: React.FC<Props> = ({ details, setDetails, sections, setSections, subpartStyle, setSubpartStyle }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showTypePicker, setShowTypePicker] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const updateDetail = (field: keyof PaperDetails, value: string | number) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Section helpers
  const labelStyle: SectionLabelStyle = sections[0]?.labelStyle || 'roman';

  const addSection = () => {
    const idx = sections.length;
    const style = sections[0]?.labelStyle || 'roman';
    const label = sectionLabels[style][idx] || `${idx + 1}`;
    const newId = crypto.randomUUID();
    setSections(prev => [...prev, {
      id: newId, label, title: '', labelStyle: style,
      answerRule: 'all', totalQuestions: 0, totalMarks: 0, questions: [],
    }]);
    setExpandedSections(prev => new Set(prev).add(newId));
  };

  const updateSection = (id: string, field: string, value: any) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const changeLabelStyle = (style: SectionLabelStyle) => {
    setSections(prev => prev.map((s, i) => ({
      ...s, labelStyle: style, label: sectionLabels[style][i] || `${i + 1}`,
    })));
  };

  // Question numbering — restarts per section
  const getDisplayNumber = (sectionId: string, questionIdx: number) => {
    return questionIdx + 1;
  };

  const addQuestion = (sectionId: string, type: QuestionType) => {
    const section = sections.find(s => s.id === sectionId);
    const newQ: Question = {
      id: crypto.randomUUID(), internalId: crypto.randomUUID(), displayNumber: 0,
      type, text: '', marks: section?.marksPerQuestion || 1,
      subparts: [], hasOr: false,
      options: type === 'mcq' ? ['', '', '', ''] : undefined,
      matchPairs: type === 'match' ? [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }] : undefined,
    };
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, questions: [...s.questions, newQ] } : s
    ));
    setShowTypePicker(null);
    setExpandedQuestions(prev => new Set(prev).add(newQ.id));
  };

  const updateQuestion = (sectionId: string, questionId: string, field: string, value: any) => {
    setSections(prev => prev.map(s =>
      s.id !== sectionId ? s : {
        ...s,
        questions: s.questions.map(q => q.id === questionId ? { ...q, [field]: value } : q),
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
        ...s,
        questions: s.questions.map(q => {
          if (q.id !== questionId) return q;
          const idx = q.subparts.length;
          const label = subpartStyle === 'alpha' ? `(${String.fromCharCode(97 + idx)})` : `${q.displayNumber}.${idx + 1}`;
          return { ...q, subparts: [...q.subparts, { id: crypto.randomUUID(), label, text: '', marks: 1 }] };
        }),
      };
    }));
  };


  return (
    <div className="p-5 space-y-5">
      {/* STEP 1: Paper Details — compact */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-purple text-white text-xs flex items-center justify-center">1</span>
          Paper Details
        </h3>

        {/* Institution row */}
        <div className="flex gap-3 mb-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">Institution / School Name</label>
            <Input value={details.institutionName} onChange={e => updateDetail('institutionName', e.target.value)} placeholder="e.g. Delhi Public School" className="bg-background h-9 text-sm" />
          </div>
          <div className="w-48">
            <label className="text-xs text-muted-foreground block mb-1">Logo</label>
            <div className="relative">
              {details.logoUrl ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-background">
                  <img src={details.logoUrl} alt="Logo" className="w-6 h-6 object-contain rounded" />
                  <span className="text-xs text-foreground truncate flex-1">Logo uploaded</span>
                  <button onClick={() => updateDetail('logoUrl', '')} className="text-xs text-destructive hover:underline">Remove</button>
                </div>
              ) : (
                <label className="flex items-center gap-2 h-9 px-3 rounded-md border border-dashed border-border bg-background cursor-pointer hover:border-purple transition-colors">
                  <span className="text-xs text-muted-foreground">Upload logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      updateDetail('logoUrl', url);
                    }
                  }} />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Select value={details.className} onValueChange={v => updateDetail('className', v)}>
            <SelectTrigger className="bg-background h-9 text-sm">
              <SelectValue placeholder="Class *" />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={details.subject} onValueChange={v => updateDetail('subject', v)}>
            <SelectTrigger className="bg-background h-9 text-sm">
              <SelectValue placeholder="Subject *" />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={details.examName} onValueChange={v => updateDetail('examName', v)}>
            <SelectTrigger className="bg-background h-9 text-sm">
              <SelectValue placeholder="Exam *" />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {exams.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={details.duration} onValueChange={v => updateDetail('duration', v)}>
            <SelectTrigger className="bg-background h-9 text-sm">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {durations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={details.date} onChange={e => updateDetail('date', e.target.value)} className="bg-background h-9 text-sm" />
          <Input type="number" value={details.targetMarks || ''} onChange={e => updateDetail('targetMarks', parseInt(e.target.value) || 0)} placeholder="Total Marks *" className="bg-background h-9 text-sm" />
        </div>
      </div>


      {/* STEP 2: Sections + Questions together */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple text-white text-xs flex items-center justify-center">2</span>
            Sections & Questions
          </h3>
          <div className="flex items-center gap-2">
            <Select value={labelStyle} onValueChange={v => changeLabelStyle(v as SectionLabelStyle)}>
              <SelectTrigger className="w-32 bg-background h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                <SelectItem value="roman">I, II, III</SelectItem>
                <SelectItem value="part">A, B, C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const sectionMarks = section.questions.reduce((sum, q) =>
              sum + (q.subparts.length > 0 ? q.subparts.reduce((s, sp) => s + sp.marks, 0) : q.marks), 0);

            return (
              <Card key={section.id} className="card-shadow">
                <CardContent className="p-0">
                  {/* Section header */}
                  <button onClick={() => toggleSection(section.id)} className="w-full px-3 py-2.5 flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <Badge className="bg-purple/10 text-purple border-purple/20 font-bold text-xs">{section.label}</Badge>
                    <span className="text-sm font-medium text-foreground flex-1 text-left truncate">
                      {section.title || 'Untitled Section'}
                    </span>
                    <span className="text-xs text-muted-foreground">{section.questions.length}Q</span>
                    <span className="text-xs font-medium text-purple">{sectionMarks}M</span>
                    <Button variant="ghost" size="sm" className="text-destructive h-6 w-6 p-0" onClick={e => { e.stopPropagation(); removeSection(section.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                      {/* Section settings — compact row */}
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          value={section.title}
                          onChange={e => updateSection(section.id, 'title', e.target.value)}
                          placeholder="Section title"
                          className="bg-background h-8 text-xs"
                        />
                        <Select value={section.answerRule} onValueChange={v => updateSection(section.id, 'answerRule', v)}>
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card z-50">
                            <SelectItem value="all">Answer All</SelectItem>
                            <SelectItem value="any-k">Any K of N</SelectItem>
                            <SelectItem value="or-choice">OR Choice</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={section.marksPerQuestion || ''}
                          onChange={e => updateSection(section.id, 'marksPerQuestion', parseInt(e.target.value) || 0)}
                          placeholder="Marks/Q"
                          className="bg-background h-8 text-xs"
                        />
                      </div>

                      {section.answerRule === 'any-k' && (
                        <div className="flex gap-2">
                          <Input type="number" value={section.answerAnyK || ''} onChange={e => updateSection(section.id, 'answerAnyK', parseInt(e.target.value) || 0)} placeholder="Answer any (K)" className="bg-background h-8 text-xs w-32" />
                          <span className="text-xs text-muted-foreground self-center">out of {section.questions.length} questions</span>
                        </div>
                      )}

                      {/* Questions inside section */}
                      <div className="space-y-2">
                        {section.questions.map((q, qIdx) => {
                          const displayNum = getDisplayNumber(section.id, qIdx);
                          const isQExpanded = expandedQuestions.has(q.id);

                          return (
                            <div key={q.id} className="rounded-lg border border-border bg-background">
                              <button onClick={() => toggleQuestion(q.id)} className="w-full px-3 py-2 flex items-center gap-2 text-left">
                                <span className="text-xs font-bold text-purple">Q{displayNum}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{questionTypeLabels[q.type]}</span>
                                <span className="flex-1 text-xs text-foreground truncate">{q.text || 'Enter question...'}</span>
                                <span className="text-xs font-medium text-purple">{q.marks}M</span>
                                {q.hasOr && <Badge variant="outline" className="text-[10px] py-0 border-warning/30 text-warning">OR</Badge>}
                                {isQExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                              </button>

                              {isQExpanded && (
                                <div className="px-3 pb-3 border-t border-border pt-2 space-y-2">
                                  <div className="flex gap-2">
                                    <Textarea value={q.text} onChange={e => updateQuestion(section.id, q.id, 'text', e.target.value)} placeholder="Question text..." className="bg-card min-h-[40px] text-xs flex-1" />
                                    <Input type="number" value={q.marks} onChange={e => updateQuestion(section.id, q.id, 'marks', parseInt(e.target.value) || 0)} className="bg-card h-10 w-16 text-xs" />
                                  </div>

                                  {/* MCQ */}
                                  {q.type === 'mcq' && q.options && (
                                    <div className="grid grid-cols-2 gap-1.5">
                                      {q.options.map((opt, i) => (
                                        <Input key={i} value={opt} onChange={e => {
                                          const newOpts = [...(q.options || [])];
                                          newOpts[i] = e.target.value;
                                          updateQuestion(section.id, q.id, 'options', newOpts);
                                        }} placeholder={`(${String.fromCharCode(97 + i)})`} className="bg-card h-7 text-xs" />
                                      ))}
                                    </div>
                                  )}

                                  {/* Match */}
                                  {q.type === 'match' && q.matchPairs && (
                                    <div className="space-y-1">
                                      {q.matchPairs.map((pair, i) => (
                                        <div key={i} className="grid grid-cols-[1fr_20px_1fr] gap-1 items-center">
                                          <Input value={pair.left} onChange={e => {
                                            const p = [...(q.matchPairs || [])];
                                            p[i] = { ...pair, left: e.target.value };
                                            updateQuestion(section.id, q.id, 'matchPairs', p);
                                          }} placeholder={`A${i+1}`} className="bg-card h-7 text-xs" />
                                          <ArrowLeftRight className="w-3 h-3 text-muted-foreground mx-auto" />
                                          <Input value={pair.right} onChange={e => {
                                            const p = [...(q.matchPairs || [])];
                                            p[i] = { ...pair, right: e.target.value };
                                            updateQuestion(section.id, q.id, 'matchPairs', p);
                                          }} placeholder={`B${i+1}`} className="bg-card h-7 text-xs" />
                                        </div>
                                      ))}
                                      <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => {
                                        updateQuestion(section.id, q.id, 'matchPairs', [...(q.matchPairs || []), { left: '', right: '' }]);
                                      }}><Plus className="w-3 h-3 mr-1" />Pair</Button>
                                    </div>
                                  )}

                                  {/* Subparts */}
                                  {q.subparts.length > 0 && (
                                    <div className="pl-4 border-l-2 border-purple/20 space-y-1">
                                      {q.subparts.map((sp, spIdx) => (
                                        <div key={sp.id} className="flex gap-1.5 items-center">
                                          <span className="text-[10px] font-medium text-purple w-6">{sp.label}</span>
                                          <Input value={sp.text} onChange={e => {
                                            const subs = [...q.subparts];
                                            subs[spIdx] = { ...sp, text: e.target.value };
                                            updateQuestion(section.id, q.id, 'subparts', subs);
                                          }} placeholder="Subpart..." className="bg-card h-7 text-xs flex-1" />
                                          <Input type="number" value={sp.marks} onChange={e => {
                                            const subs = [...q.subparts];
                                            subs[spIdx] = { ...sp, marks: parseInt(e.target.value) || 0 };
                                            updateQuestion(section.id, q.id, 'subparts', subs);
                                          }} className="bg-card h-7 w-14 text-xs" />
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => {
                                            updateQuestion(section.id, q.id, 'subparts', q.subparts.filter((_, i) => i !== spIdx));
                                          }}><Trash2 className="w-3 h-3" /></Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* OR */}
                                  {q.hasOr && (
                                    <div className="p-2 rounded border border-warning/30 bg-warning-light">
                                      <p className="text-[10px] font-medium text-warning mb-1">OR Alternative ({q.marks}M)</p>
                                      <Textarea value={q.orQuestion?.text || ''} onChange={e => updateQuestion(section.id, q.id, 'orQuestion', {
                                        ...(q.orQuestion || { id: crypto.randomUUID(), internalId: crypto.randomUUID(), type: q.type, text: '', marks: q.marks, subparts: [] }),
                                        text: e.target.value,
                                      })} placeholder="OR question..." className="bg-card min-h-[30px] text-xs" />
                                    </div>
                                  )}

                                  {/* Actions */}
                                  <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-3">
                                      <button onClick={() => addSubpart(section.id, q.id)} className="text-[10px] text-purple hover:underline">+ Subpart</button>
                                      <div className="flex items-center gap-1.5">
                                        <Switch checked={q.hasOr} onCheckedChange={v => updateQuestion(section.id, q.id, 'hasOr', v)} className="scale-75" />
                                        <span className="text-[10px] text-muted-foreground">OR</span>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeQuestion(section.id, q.id)} className="text-destructive h-6 text-[10px]">
                                      <Trash2 className="w-3 h-3 mr-1" />Remove
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add question */}
                      {showTypePicker === section.id ? (
                        <div className="grid grid-cols-3 gap-1.5">
                          {(Object.keys(questionTypeLabels) as QuestionType[]).map(type => (
                            <button key={type} onClick={() => addQuestion(section.id, type)}
                              className="p-2 rounded border border-border hover:border-purple hover:bg-purple-light transition-colors text-left">
                              <span className="text-sm mr-1">{questionTypeIcons[type]}</span>
                              <span className="text-[11px] font-medium text-foreground">{questionTypeLabels[type]}</span>
                            </button>
                          ))}
                          <button onClick={() => setShowTypePicker(null)} className="p-2 rounded border border-border text-xs text-muted-foreground hover:bg-muted">Cancel</button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full border-dashed text-xs h-8" onClick={() => setShowTypePicker(section.id)}>
                          <Plus className="w-3 h-3 mr-1" />Add Question
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Button variant="outline" size="sm" onClick={addSection} className="w-full border-dashed text-xs h-9">
            <Plus className="w-3.5 h-3.5 mr-1.5" />Add Section
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaperSetupPanel;
