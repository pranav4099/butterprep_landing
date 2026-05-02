// QuestionEditorDialog — add or edit a single bank question.
// "Save to My Bank" → visibility:'private', "Submit to School Bank" → 'pending'.
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { questionTypeLabels, type QuestionType } from '@/types/questionPaper';
import type { Difficulty, BloomLevel } from '@/types/paperStudio';
import { syllabusBank } from '@/data/syllabusData';
import type { BankQuestion } from '@/data/questionBankData';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: BankQuestion | null;
  defaultClassName?: string;
  defaultSubject?: string;
  currentUserId: string;
  currentUserName: string;
  onSave: (q: Omit<BankQuestion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>, mode: 'private' | 'pending') => void;
}

const types: QuestionType[] = ['mcq', 'short-answer', 'long-answer', 'case-study', 'true-false', 'fill-blank'];
const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
const blooms: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

const QuestionEditorDialog: React.FC<Props> = ({ open, onOpenChange, initial, defaultClassName, defaultSubject, currentUserId, currentUserName, onSave }) => {
  const { toast } = useToast();
  const [type, setType] = useState<QuestionType>('short-answer');
  const [text, setText] = useState('');
  const [marks, setMarks] = useState(2);
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [modelAnswer, setModelAnswer] = useState('');
  const [className, setClassName] = useState(defaultClassName || 'Class 10');
  const [subject, setSubject] = useState(defaultSubject || 'Science');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>('understand');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setType(initial.type);
      setText(initial.text);
      setMarks(initial.marks);
      setOptions(initial.options || ['', '', '', '']);
      setCorrectAnswer(initial.correctAnswer || '');
      setModelAnswer(initial.modelAnswer || '');
      setClassName(initial.className);
      setSubject(initial.subject);
      setChapter(initial.chapter);
      setTopic(initial.topic);
      setDifficulty(initial.difficulty);
      setBloomLevel(initial.bloomLevel);
    } else {
      setType('short-answer'); setText(''); setMarks(2);
      setOptions(['', '', '', '']); setCorrectAnswer(''); setModelAnswer('');
      setClassName(defaultClassName || 'Class 10');
      setSubject(defaultSubject || 'Science');
      setChapter(''); setTopic('');
      setDifficulty('medium'); setBloomLevel('understand');
    }
  }, [open, initial, defaultClassName, defaultSubject]);

  const classes = useMemo(() => Array.from(new Set(syllabusBank.map(s => s.className))), []);
  const subjectsForClass = useMemo(() => Array.from(new Set(syllabusBank.filter(s => s.className === className).map(s => s.subject))), [className]);
  const chapters = useMemo(() => syllabusBank.find(s => s.className === className && s.subject === subject)?.chapters || [], [className, subject]);
  const topics = useMemo(() => chapters.find(c => c.name === chapter)?.topics || [], [chapters, chapter]);

  const handleSave = (mode: 'private' | 'pending') => {
    if (!text.trim()) { toast({ title: 'Question text required', variant: 'destructive' }); return; }
    if (!chapter || !topic) { toast({ title: 'Select chapter and topic', variant: 'destructive' }); return; }
    if (type === 'mcq' && !correctAnswer) { toast({ title: 'Pick a correct option', variant: 'destructive' }); return; }

    onSave({
      createdBy: initial?.createdBy || currentUserId,
      createdByName: initial?.createdByName || currentUserName,
      type, text: text.trim(), marks,
      options: type === 'mcq' ? options.filter(o => o.trim()) : undefined,
      correctAnswer: type === 'mcq' ? correctAnswer : undefined,
      modelAnswer: type !== 'mcq' ? modelAnswer.trim() : undefined,
      className, subject, chapter, topic,
      difficulty, bloomLevel,
      visibility: mode,
      source: initial?.source || 'authored',
    }, mode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit question' : 'Add question to bank'}</DialogTitle>
          <DialogDescription>
            Fill in the details. Save privately to your own bank or submit for school-wide approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Class</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{subjectsForClass.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Chapter</Label>
              <Select value={chapter} onValueChange={v => { setChapter(v); setTopic(''); }}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Pick chapter" /></SelectTrigger>
                <SelectContent>{chapters.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Topic</Label>
              <Select value={topic} onValueChange={setTopic} disabled={!chapter}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Pick topic" /></SelectTrigger>
                <SelectContent>{topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={v => setType(v as QuestionType)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{questionTypeLabels[t]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Marks</Label>
              <Input type="number" min={1} max={20} value={marks} onChange={e => setMarks(Number(e.target.value) || 1)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Difficulty</Label>
              <Select value={difficulty} onValueChange={v => setDifficulty(v as Difficulty)}>
                <SelectTrigger className="h-9 capitalize"><SelectValue /></SelectTrigger>
                <SelectContent>{difficulties.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Bloom level</Label>
            <Select value={bloomLevel} onValueChange={v => setBloomLevel(v as BloomLevel)}>
              <SelectTrigger className="h-9 capitalize"><SelectValue /></SelectTrigger>
              <SelectContent>{blooms.map(b => <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Question text</Label>
            <Textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Type the question…" />
          </div>

          {type === 'mcq' ? (
            <div className="space-y-2">
              <Label className="text-xs">Options (mark one as correct)</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(opt)}
                    className={`shrink-0 w-7 h-7 rounded-full border text-xs font-medium ${correctAnswer && correctAnswer === opt ? 'bg-success text-success-foreground border-success' : 'bg-card text-muted-foreground border-border'}`}
                    title="Mark as correct"
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                  <Input
                    value={opt}
                    onChange={e => {
                      const next = [...options];
                      const wasCorrect = correctAnswer === next[i];
                      next[i] = e.target.value;
                      setOptions(next);
                      if (wasCorrect) setCorrectAnswer(e.target.value);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="h-9"
                  />
                  {options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                      const next = options.filter((_, idx) => idx !== i);
                      setOptions(next);
                      if (correctAnswer === opt) setCorrectAnswer('');
                    }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setOptions([...options, ''])}>
                  <Plus className="w-3 h-3" /> Add option
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs">Model answer / marking notes (optional)</Label>
              <Textarea rows={3} value={modelAnswer} onChange={e => setModelAnswer(e.target.value)} placeholder="Expected answer or scoring rubric…" />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="secondary" onClick={() => handleSave('private')}>Save to My Bank</Button>
          <Button onClick={() => handleSave('pending')}>Submit to School Bank</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionEditorDialog;
