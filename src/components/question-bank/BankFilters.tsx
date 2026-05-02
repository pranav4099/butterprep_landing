// BankFilters — compact filter rail for the Question Bank list view.
// Drives the BankFilter object passed into useQuestionBank.
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { questionTypeLabels, type QuestionType } from '@/types/questionPaper';
import type { Difficulty, BloomLevel } from '@/types/paperStudio';
import type { BankFilter } from '@/data/questionBankData';

interface Props {
  filter: BankFilter;
  onChange: (next: BankFilter) => void;
  classes: string[];
  subjects: string[];
  chapters: string[];
}

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
const blooms: BloomLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
const types: QuestionType[] = ['mcq', 'short-answer', 'long-answer', 'case-study', 'true-false', 'fill-blank', 'match'];
const ANY = '__any__';
const toRaw = (v: string | undefined) => (v === undefined || v === '' ? ANY : v);
const fromRaw = <T,>(v: string): T | undefined => (v === ANY ? undefined : (v as T));

export const BankFilters: React.FC<Props> = ({ filter, onChange, classes, subjects, chapters }) => {
  const set = <K extends keyof BankFilter>(k: K, v: BankFilter[K]) => onChange({ ...filter, [k]: v });
  const clear = () => onChange({ visibility: filter.visibility, visibleTo: filter.visibleTo });
  const hasActive = !!(filter.className || filter.subject || filter.chapter || filter.difficulty || filter.bloomLevel || filter.type || filter.search || filter.marks);

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search question text, chapter, topic…"
          className="pl-9 h-10"
          value={filter.search || ''}
          onChange={e => set('search', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Select value={toRaw(filter.className)} onValueChange={v => set('className', fromRaw(v))}>
          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any class</SelectItem>
            {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={toRaw(filter.subject)} onValueChange={v => set('subject', fromRaw(v))}>
          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any subject</SelectItem>
            {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={toRaw(filter.chapter)} onValueChange={v => set('chapter', fromRaw(v))}>
          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Chapter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any chapter</SelectItem>
            {chapters.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={toRaw(filter.type as string | undefined)} onValueChange={v => set('type', fromRaw<QuestionType>(v))}>
          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any type</SelectItem>
            {types.map(t => <SelectItem key={t} value={t}>{questionTypeLabels[t]}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={toRaw(filter.difficulty)} onValueChange={v => set('difficulty', fromRaw<Difficulty>(v))}>
          <SelectTrigger className="h-9 text-xs capitalize"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any difficulty</SelectItem>
            {difficulties.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={toRaw(filter.bloomLevel)} onValueChange={v => set('bloomLevel', fromRaw<BloomLevel>(v))}>
          <SelectTrigger className="h-9 text-xs capitalize"><SelectValue placeholder="Bloom level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any bloom level</SelectItem>
            {blooms.map(b => <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {hasActive && (
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={clear}>
          <X className="w-3 h-3" /> Clear filters
        </Button>
      )}
    </div>
  );
};

export default BankFilters;
