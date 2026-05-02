import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Image, Table2, ArrowLeftRight, GripVertical } from 'lucide-react';
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
import type { Section, Question, QuestionType, SubpartStyle, Subpart } from '@/types/questionPaper';
import { questionTypeLabels, questionTypeDescriptions } from '@/types/questionPaper';

interface Props {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  subpartStyle: SubpartStyle;
}

const questionTypeIcons: Record<QuestionType, string> = {
  'mcq': '🔘',
  'true-false': '✓✗',
  'fill-blank': '___',
  'match': '↔️',
  'table': '📊',
  'diagram': '🖼️',
  'short-answer': '✏️',
  'long-answer': '📝',
  'case-study': '📖',
};

const QuestionsStep: React.FC<Props> = ({ sections, setSections, subpartStyle }) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const toggleExpanded = (qId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  // Compute continuous numbering across sections
  const getDisplayNumber = (sectionId: string, questionIdx: number) => {
    let num = 0;
    for (const section of sections) {
      for (let i = 0; i < section.questions.length; i++) {
        num++;
        if (section.id === sectionId && i === questionIdx) return num;
      }
    }
    return num + 1;
  };

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: crypto.randomUUID(),
      internalId: crypto.randomUUID(),
      displayNumber: 0, // computed
      type,
      text: '',
      marks: sections.find(s => s.id === activeSection)?.marksPerQuestion || 1,
      subparts: [],
      hasOr: false,
      options: type === 'mcq' ? ['', '', '', ''] : undefined,
      matchPairs: type === 'match' ? [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }] : undefined,
      tableData: type === 'table' ? [[{ value: '', isHeader: true }, { value: '', isHeader: true }], [{ value: '' }, { value: '' }]] : undefined,
      tableRows: type === 'table' ? 2 : undefined,
      tableCols: type === 'table' ? 2 : undefined,
    };

    setSections(prev => prev.map(s => {
      if (s.id !== activeSection) return s;
      return { ...s, questions: [...s.questions, newQ] };
    }));
    setShowTypePicker(false);
    setExpandedQuestions(prev => new Set(prev).add(newQ.id));
  };

  const updateQuestion = (sectionId: string, questionId: string, field: string, value: any) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        questions: s.questions.map(q => q.id === questionId ? { ...q, [field]: value } : q),
      };
    }));
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, questions: s.questions.filter(q => q.id !== questionId) };
    }));
  };

  const addSubpart = (sectionId: string, questionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        questions: s.questions.map(q => {
          if (q.id !== questionId) return q;
          const idx = q.subparts.length;
          const label = subpartStyle === 'alpha'
            ? `(${String.fromCharCode(97 + idx)})`
            : `${q.displayNumber}.${idx + 1}`;
          return {
            ...q,
            subparts: [...q.subparts, { id: crypto.randomUUID(), label, text: '', marks: 1 }],
          };
        }),
      };
    }));
  };

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
              activeSection === section.id
                ? 'bg-purple text-white border-purple'
                : 'bg-card text-muted-foreground border-border hover:border-muted-foreground'
            )}
          >
            Section {section.label} — {section.title || 'Untitled'}
            <Badge variant="outline" className="ml-2 text-xs">{section.questions.length}Q</Badge>
          </button>
        ))}
      </div>

      {!currentSection ? (
        <Card className="card-shadow">
          <CardContent className="p-12 text-center text-muted-foreground">
            Add sections in Step 2 first, then come back to add questions.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Questions list */}
          <div className="space-y-3">
            {currentSection.questions.map((question, qIdx) => {
              const displayNum = getDisplayNumber(currentSection.id, qIdx);
              const isExpanded = expandedQuestions.has(question.id);

              return (
                <Card key={question.id} className="card-shadow">
                  <CardContent className="p-0">
                    {/* Question header */}
                    <button
                      onClick={() => toggleExpanded(question.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <Badge className="bg-purple/10 text-purple border-purple/20 font-bold">Q{displayNum}</Badge>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {questionTypeLabels[question.type]}
                      </span>
                      <span className="flex-1 text-left text-sm text-foreground truncate">
                        {question.text || 'Enter question text...'}
                      </span>
                      <span className="text-sm font-medium text-purple">{question.marks}M</span>
                      {question.hasOr && (
                        <Badge variant="outline" className="text-xs border-warning/30 text-warning">OR</Badge>
                      )}
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </button>

                    {/* Expanded editor */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                        <div className="grid grid-cols-[1fr_100px] gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Question Text</label>
                            <Textarea
                              value={question.text}
                              onChange={e => updateQuestion(currentSection.id, question.id, 'text', e.target.value)}
                              placeholder="Enter the question..."
                              className="bg-background min-h-[60px]"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Marks</label>
                            <Input
                              type="number"
                              value={question.marks}
                              onChange={e => updateQuestion(currentSection.id, question.id, 'marks', parseInt(e.target.value) || 0)}
                              className="bg-background"
                            />
                          </div>
                        </div>

                        {/* MCQ Options */}
                        {question.type === 'mcq' && question.options && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Options</label>
                            <div className="grid grid-cols-2 gap-2">
                              {question.options.map((opt, i) => (
                                <Input
                                  key={i}
                                  value={opt}
                                  onChange={e => {
                                    const newOpts = [...(question.options || [])];
                                    newOpts[i] = e.target.value;
                                    updateQuestion(currentSection.id, question.id, 'options', newOpts);
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                  className="bg-background"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Match the Following */}
                        {question.type === 'match' && question.matchPairs && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Match Pairs</label>
                            <div className="space-y-2">
                              {question.matchPairs.map((pair, i) => (
                                <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                                  <Input
                                    value={pair.left}
                                    onChange={e => {
                                      const newPairs = [...(question.matchPairs || [])];
                                      newPairs[i] = { ...pair, left: e.target.value };
                                      updateQuestion(currentSection.id, question.id, 'matchPairs', newPairs);
                                    }}
                                    placeholder={`Column A (${i + 1})`}
                                    className="bg-background"
                                  />
                                  <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                                  <Input
                                    value={pair.right}
                                    onChange={e => {
                                      const newPairs = [...(question.matchPairs || [])];
                                      newPairs[i] = { ...pair, right: e.target.value };
                                      updateQuestion(currentSection.id, question.id, 'matchPairs', newPairs);
                                    }}
                                    placeholder={`Column B (${i + 1})`}
                                    className="bg-background"
                                  />
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newPairs = [...(question.matchPairs || []), { left: '', right: '' }];
                                  updateQuestion(currentSection.id, question.id, 'matchPairs', newPairs);
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Pair
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Subparts */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-muted-foreground">Subparts</label>
                            <Button variant="outline" size="sm" onClick={() => addSubpart(currentSection.id, question.id)}>
                              <Plus className="w-3 h-3 mr-1" /> Add Subpart
                            </Button>
                          </div>
                          {question.subparts.length > 0 && (
                            <div className="space-y-2 pl-6 border-l-2 border-purple/20">
                              {question.subparts.map((sp, spIdx) => (
                                <div key={sp.id} className="grid grid-cols-[auto_1fr_80px_auto] gap-2 items-center">
                                  <span className="text-xs font-medium text-purple">{sp.label}</span>
                                  <Input
                                    value={sp.text}
                                    onChange={e => {
                                      const newSubs = [...question.subparts];
                                      newSubs[spIdx] = { ...sp, text: e.target.value };
                                      updateQuestion(currentSection.id, question.id, 'subparts', newSubs);
                                    }}
                                    placeholder="Subpart text..."
                                    className="bg-background"
                                  />
                                  <Input
                                    type="number"
                                    value={sp.marks}
                                    onChange={e => {
                                      const newSubs = [...question.subparts];
                                      newSubs[spIdx] = { ...sp, marks: parseInt(e.target.value) || 0 };
                                      updateQuestion(currentSection.id, question.id, 'subparts', newSubs);
                                    }}
                                    className="bg-background"
                                    placeholder="Marks"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newSubs = question.subparts.filter((_, i) => i !== spIdx);
                                      updateQuestion(currentSection.id, question.id, 'subparts', newSubs);
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* OR toggle + actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={question.hasOr}
                                onCheckedChange={v => updateQuestion(currentSection.id, question.id, 'hasOr', v)}
                              />
                              <span className="text-xs text-muted-foreground">OR Question</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(currentSection.id, question.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>

                        {/* OR question editor */}
                        {question.hasOr && (
                          <div className="ml-6 p-3 rounded-lg border border-warning/30 bg-warning-light">
                            <p className="text-xs font-medium text-warning mb-2">OR Alternative (same marks: {question.marks})</p>
                            <Textarea
                              value={question.orQuestion?.text || ''}
                              onChange={e => updateQuestion(currentSection.id, question.id, 'orQuestion', {
                                ...(question.orQuestion || { id: crypto.randomUUID(), internalId: crypto.randomUUID(), type: question.type, text: '', marks: question.marks, subparts: [] }),
                                text: e.target.value,
                              })}
                              placeholder="Enter OR question text..."
                              className="bg-background min-h-[50px]"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add Question */}
          {showTypePicker ? (
            <Card className="card-shadow border-purple/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-foreground">Choose Question Type</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowTypePicker(false)}>Cancel</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(questionTypeLabels) as QuestionType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => addQuestion(type)}
                      className="p-3 rounded-lg border border-border hover:border-purple hover:bg-purple-light transition-colors text-left"
                    >
                      <span className="text-lg mr-2">{questionTypeIcons[type]}</span>
                      <span className="text-sm font-medium text-foreground">{questionTypeLabels[type]}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{questionTypeDescriptions[type]}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button variant="outline" className="w-full border-dashed" onClick={() => setShowTypePicker(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question to Section {currentSection.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionsStep;
