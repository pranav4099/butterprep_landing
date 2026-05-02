import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PaperTemplate, Section, Question, QuestionType, AnswerRule } from '@/types/questionPaper';
import { questionTypeLabels } from '@/types/questionPaper';

interface SectionSetup {
  id: string;
  label: string;
  questionCount: number;
  marksPerQuestion: number;
  questionType: QuestionType;
  answerRule: AnswerRule;
  answerAnyK?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PaperTemplate) => void;
  onStartBlank: () => void;
  onGenerateSkeleton?: (sectionSetups: SectionSetup[]) => void;
}

const defaultSection = (): SectionSetup => ({
  id: crypto.randomUUID(),
  label: '',
  questionCount: 5,
  marksPerQuestion: 1,
  questionType: 'short-answer',
  answerRule: 'all',
});

const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const TemplatePicker: React.FC<Props> = ({ open, onClose, onSelectTemplate, onStartBlank, onGenerateSkeleton }) => {
  const [sectionSetups, setSectionSetups] = useState<SectionSetup[]>([
    { ...defaultSection(), label: 'Section A' },
  ]);

  if (!open) return null;

  const addSection = () => {
    const idx = sectionSetups.length;
    const letter = sectionLetters[idx] || String(idx + 1);
    setSectionSetups(prev => [...prev, { ...defaultSection(), label: `Section ${letter}` }]);
  };

  const removeSection = (id: string) => {
    setSectionSetups(prev => {
      const updated = prev.filter(s => s.id !== id);
      // Re-label
      return updated.map((s, i) => ({
        ...s,
        label: `Section ${sectionLetters[i] || String(i + 1)}`,
      }));
    });
  };

  const updateSection = (id: string, patch: Partial<SectionSetup>) => {
    setSectionSetups(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const totalMarks = sectionSetups.reduce((sum, s) => {
    if (s.answerRule === 'any-k' && s.answerAnyK) {
      return sum + s.answerAnyK * s.marksPerQuestion;
    }
    return sum + s.questionCount * s.marksPerQuestion;
  }, 0);

  const handleGenerate = () => {
    if (onGenerateSkeleton) {
      onGenerateSkeleton(sectionSetups);
    }
  };

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div>
            <h3 className="text-base font-semibold text-foreground">Setup Question Paper Structure</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Define your sections and the system will generate the skeleton
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sections list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {sectionSetups.map((section, idx) => (
            <div key={section.id} className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">{section.label}</h4>
                {sectionSetups.length > 1 && (
                  <button
                    onClick={() => removeSection(section.id)}
                    className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Questions</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={section.questionCount}
                    onChange={e => updateSection(section.id, { questionCount: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Marks each</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={section.marksPerQuestion}
                    onChange={e => updateSection(section.id, { marksPerQuestion: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Section total</Label>
                  <div className="h-9 flex items-center px-3 rounded-md bg-muted border border-border text-sm font-semibold text-foreground">
                    {section.answerRule === 'any-k' && section.answerAnyK
                      ? `${section.answerAnyK}×${section.marksPerQuestion} = ${section.answerAnyK * section.marksPerQuestion}`
                      : `${section.questionCount}×${section.marksPerQuestion} = ${section.questionCount * section.marksPerQuestion}`
                    }
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Answer rule</Label>
                  <Select
                    value={section.answerRule}
                    onValueChange={(v: AnswerRule) => {
                      const patch: Partial<SectionSetup> = { answerRule: v };
                      if (v === 'any-k') {
                        patch.answerAnyK = Math.max(1, section.questionCount - 1);
                      }
                      updateSection(section.id, patch);
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-sm">Answer All</SelectItem>
                      <SelectItem value="any-k" className="text-sm">Answer Any K of N</SelectItem>
                      <SelectItem value="or-choice" className="text-sm">OR Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              {section.answerRule === 'any-k' && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Answer any</Label>
                  <Input
                    type="number"
                    min={1}
                    max={section.questionCount}
                    value={section.answerAnyK || section.questionCount - 1}
                    onChange={e => updateSection(section.id, { answerAnyK: Math.max(1, Math.min(section.questionCount, parseInt(e.target.value) || 1)) })}
                    className="h-8 w-16 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">out of {section.questionCount}</span>
                </div>
              )}
            </div>
          ))}

          {sectionSetups.length < 8 && (
            <button
              onClick={addSection}
              className="w-full p-3 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex items-center justify-between shrink-0">
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{sectionSetups.reduce((s, sec) => s + sec.questionCount, 0)} questions</span>
            {' · '}
            <span className="font-semibold text-foreground">{totalMarks} marks</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onStartBlank}>
              Skip — Start Blank
            </Button>
            <Button size="sm" onClick={handleGenerate} className="bg-primary hover:bg-primary/90">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Generate Skeleton
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePicker;
