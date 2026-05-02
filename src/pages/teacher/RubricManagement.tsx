import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, BookOpen, MoreVertical, Copy, Archive, Edit, GraduationCap, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RubricEntry {
  id: string;
  className: string;
  subject: string;
  criteria: { name: string; marks: number }[];
}

const sampleEntries: RubricEntry[] = [
  {
    id: '1', className: 'Class 8', subject: 'Mathematics',
    criteria: [
      { name: 'Concept understanding', marks: 4 },
      { name: 'Problem-solving strategy', marks: 3 },
      { name: 'Stepwise working', marks: 4 },
      { name: 'Accuracy of answers', marks: 3 },
      { name: 'Neatness', marks: 1 },
    ],
  },
  {
    id: '2', className: 'Class 7', subject: 'English',
    criteria: [
      { name: 'Ideas and content', marks: 4 },
      { name: 'Organization', marks: 3 },
      { name: 'Grammar', marks: 3 },
      { name: 'Vocabulary', marks: 2 },
      { name: 'Spelling / punctuation', marks: 2 },
    ],
  },
  {
    id: '3', className: 'Class 9', subject: 'Science',
    criteria: [
      { name: 'Follows procedure', marks: 3 },
      { name: 'Observation accuracy', marks: 4 },
      { name: 'Records data', marks: 3 },
      { name: 'Conclusion', marks: 4 },
    ],
  },
  {
    id: '4', className: 'Class 8', subject: 'Kannada',
    criteria: [
      { name: 'Fluency', marks: 3 },
      { name: 'Pronunciation', marks: 2 },
      { name: 'Expression', marks: 2 },
    ],
  },
  {
    id: '5', className: 'Class 7', subject: 'Social Science',
    criteria: [
      { name: 'Correct identification', marks: 3 },
      { name: 'Labeling accuracy', marks: 3 },
      { name: 'Neatness', marks: 2 },
      { name: 'Completion', marks: 3 },
    ],
  },
];

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-primary/10 text-primary',
  English: 'bg-warning/10 text-warning',
  Science: 'bg-success/10 text-success',
  Kannada: 'bg-accent/80 text-accent-foreground',
  'Social Science': 'bg-secondary text-secondary-foreground',
};

const RubricManagement = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = sampleEntries.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.className.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q)
      || e.criteria.some(c => c.name.toLowerCase().includes(q));
  });

  const totalCriteria = (entry: RubricEntry) => entry.criteria.reduce((s, c) => s + c.marks, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Rubric Management</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">View and manage assigned rubrics</p>
        </div>
        <Button onClick={() => navigate('/teacher/rubrics/create')} className="gap-2 shrink-0 rounded-xl">
          <Plus className="w-4 h-4" /> Assign Rubric
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by class, subject, or criteria..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 text-sm rounded-xl border-border/60 bg-card shadow-sm"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-3 md:p-4">
            <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Total Rubrics</p>
            <p className="text-xl md:text-2xl font-bold text-foreground">{sampleEntries.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-3 md:p-4">
            <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Classes</p>
            <p className="text-xl md:text-2xl font-bold text-primary">{new Set(sampleEntries.map(e => e.className)).size}</p>
          </CardContent>
        </Card>
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-3 md:p-4">
            <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">Subjects</p>
            <p className="text-xl md:text-2xl font-bold text-success">{new Set(sampleEntries.map(e => e.subject)).size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">No rubrics found</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs">Start by assigning rubrics to a class and subject.</p>
            <Button onClick={() => navigate('/teacher/rubrics/create')} className="gap-2 rounded-xl">
              <Plus className="w-4 h-4" /> Assign Your First Rubric
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => {
            const total = totalCriteria(entry);
            const colorClass = subjectColors[entry.subject] || 'bg-muted text-muted-foreground';

            return (
              <Card key={entry.id} className="border-0 card-shadow rounded-2xl hover:shadow-lg transition-all">
                <CardContent className="p-3.5 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    {/* Left */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Title row */}
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] md:text-base font-bold text-foreground">{entry.className}</span>
                        <span className="text-[13px] md:text-base font-semibold text-primary">{entry.subject}</span>
                      </div>

                      {/* Meta badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className={cn("border-0 text-[10px]", colorClass)}>
                          <GraduationCap className="w-2.5 h-2.5 mr-0.5" /> {entry.criteria.length} criteria
                        </Badge>
                        <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-[10px]">
                          <Hash className="w-2.5 h-2.5 mr-0.5" /> {total} marks
                        </Badge>
                      </div>

                      {/* Criteria chips */}
                      <div className="flex flex-wrap gap-1">
                        {entry.criteria.map((c, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-muted/60 border border-border/40">
                            <span className="text-foreground font-medium">{c.name}</span>
                            <span className="font-bold text-primary text-[10px] bg-primary/10 px-1 py-0.5 rounded">{c.marks}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center self-center shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="rounded-lg"><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg"><Copy className="w-4 h-4 mr-2" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg"><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RubricManagement;
