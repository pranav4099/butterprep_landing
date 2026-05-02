import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Section, SectionLabelStyle, SubpartStyle, AnswerRule } from '@/types/questionPaper';
import { sectionLabels, answerRuleLabels } from '@/types/questionPaper';

interface Props {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  subpartStyle: SubpartStyle;
  setSubpartStyle: React.Dispatch<React.SetStateAction<SubpartStyle>>;
}

const SectionsStep: React.FC<Props> = ({ sections, setSections, subpartStyle, setSubpartStyle }) => {
  const labelStyle: SectionLabelStyle = sections[0]?.labelStyle || 'roman';

  const addSection = () => {
    const idx = sections.length;
    const style = sections[0]?.labelStyle || 'roman';
    const label = sectionLabels[style][idx] || `${idx + 1}`;
    setSections(prev => [...prev, {
      id: crypto.randomUUID(),
      label,
      title: '',
      labelStyle: style,
      answerRule: 'all',
      totalQuestions: 0,
      totalMarks: 0,
      questions: [],
    }]);
  };

  const updateSection = (id: string, field: string, value: any) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const changeLabelStyle = (style: SectionLabelStyle) => {
    setSections(prev => prev.map((s, i) => ({
      ...s,
      labelStyle: style,
      label: sectionLabels[style][i] || `${i + 1}`,
    })));
  };

  const getMarksDisplay = (section: Section) => {
    if (!section.marksPerQuestion || !section.totalQuestions) return null;
    if (section.answerRule === 'any-k' && section.answerAnyK) {
      return `Answer any ${section.answerAnyK} (${section.answerAnyK}×${section.marksPerQuestion}=${section.answerAnyK * section.marksPerQuestion})`;
    }
    return `(${section.totalQuestions}×${section.marksPerQuestion}=${section.totalQuestions * section.marksPerQuestion})`;
  };

  return (
    <div className="space-y-4">
      {/* Global settings */}
      <Card className="card-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-6">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Section Label Style</label>
              <Select value={labelStyle} onValueChange={(v) => changeLabelStyle(v as SectionLabelStyle)}>
                <SelectTrigger className="w-48 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  <SelectItem value="roman">Roman (I, II, III)</SelectItem>
                  <SelectItem value="part">Part (A, B, C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Subpart Style</label>
              <Select value={subpartStyle} onValueChange={(v) => setSubpartStyle(v as SubpartStyle)}>
                <SelectTrigger className="w-48 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  <SelectItem value="alpha">(a), (b), (c)</SelectItem>
                  <SelectItem value="decimal">1.1, 1.2, 1.3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections list */}
      {sections.map((section, idx) => (
        <Card key={section.id} className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 pt-1">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Badge className="bg-purple/10 text-purple border-purple/20 font-bold text-sm min-w-[36px] justify-center">
                  {section.label}
                </Badge>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Section Title</label>
                  <Input
                    value={section.title}
                    onChange={e => updateSection(section.id, 'title', e.target.value)}
                    placeholder="e.g. Multiple Choice Questions"
                    className="bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Answer Rule</label>
                  <Select value={section.answerRule} onValueChange={v => updateSection(section.id, 'answerRule', v)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50">
                      <SelectItem value="all">Answer All</SelectItem>
                      <SelectItem value="any-k">Answer Any K of N</SelectItem>
                      <SelectItem value="or-choice">OR Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Marks/Q</label>
                  <Input
                    type="number"
                    value={section.marksPerQuestion || ''}
                    onChange={e => updateSection(section.id, 'marksPerQuestion', parseInt(e.target.value) || 0)}
                    placeholder="e.g. 1"
                    className="bg-background"
                  />
                </div>
                {section.answerRule === 'any-k' && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Total Questions (N)</label>
                      <Input
                        type="number"
                        value={section.totalQuestions || ''}
                        onChange={e => updateSection(section.id, 'totalQuestions', parseInt(e.target.value) || 0)}
                        placeholder="e.g. 7"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Answer Any (K)</label>
                      <Input
                        type="number"
                        value={section.answerAnyK || ''}
                        onChange={e => updateSection(section.id, 'answerAnyK', parseInt(e.target.value) || 0)}
                        placeholder="e.g. 5"
                        className="bg-background"
                      />
                    </div>
                  </>
                )}
              </div>
              {/* Marks display & delete */}
              <div className="flex items-center gap-2 pt-5">
                {getMarksDisplay(section) && (
                  <span className="text-xs font-medium text-purple bg-purple-light px-2 py-1 rounded whitespace-nowrap">
                    {getMarksDisplay(section)}
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addSection} className="w-full border-dashed">
        <Plus className="w-4 h-4 mr-2" />
        Add Section
      </Button>
    </div>
  );
};

export default SectionsStep;
