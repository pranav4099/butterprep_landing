import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { paperTemplates } from '@/data/questionPaperData';
import type { PaperDetails } from '@/types/questionPaper';
import { cn } from '@/lib/utils';

interface Props {
  details: PaperDetails;
  setDetails: React.Dispatch<React.SetStateAction<PaperDetails>>;
}

const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physics', 'Chemistry', 'Biology'];
const exams = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2', 'Unit Test', 'Practice Test'];
const durations = ['30 Minutes', '45 Minutes', '1 Hour', '1.5 Hours', '2 Hours', '2.5 Hours', '3 Hours'];

const PaperDetailsStep: React.FC<Props> = ({ details, setDetails }) => {
  const update = (field: keyof PaperDetails, value: string | number) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Templates */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Start from a Template (optional)</h3>
        <div className="grid grid-cols-4 gap-3">
          {paperTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => update('targetMarks', template.targetMarks)}
              className={cn(
                'p-4 rounded-lg border text-left transition-all hover:shadow-sm',
                details.targetMarks === template.targetMarks
                  ? 'border-purple bg-purple-light'
                  : 'border-border bg-card hover:border-muted-foreground'
              )}
            >
              <span className="text-2xl mb-2 block">{template.icon}</span>
              <p className="font-medium text-sm text-foreground">{template.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <Card className="card-shadow">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Paper Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Class / Grade *</label>
              <Select value={details.className} onValueChange={v => update('className', v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Subject *</label>
              <Select value={details.subject} onValueChange={v => update('subject', v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Exam Name *</label>
              <Select value={details.examName} onValueChange={v => update('examName', v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {exams.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Duration</label>
              <Select value={details.duration} onValueChange={v => update('duration', v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {durations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Date</label>
              <Input type="date" value={details.date} onChange={e => update('date', e.target.value)} className="bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Target Total Marks *</label>
              <Input
                type="number"
                value={details.targetMarks || ''}
                onChange={e => update('targetMarks', parseInt(e.target.value) || 0)}
                placeholder="e.g. 80"
                className="bg-background"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-foreground block mb-1.5">General Instructions</label>
            <Textarea
              value={details.instructions}
              onChange={e => update('instructions', e.target.value)}
              placeholder="Instructions for students..."
              className="bg-background min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaperDetailsStep;
