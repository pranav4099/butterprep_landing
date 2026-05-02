import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const exams = [
  { id: 'FA1', name: 'FA1 (Formative Assessment 1)' },
  { id: 'FA2', name: 'FA2 (Formative Assessment 2)' },
  { id: 'SA1', name: 'SA1 (Summative Assessment 1)' },
  { id: 'FA3', name: 'FA3 (Formative Assessment 3)' },
  { id: 'FA4', name: 'FA4 (Formative Assessment 4)' },
  { id: 'SA2', name: 'SA2 (Summative Assessment 2)' },
];

interface ExamTypeDropdownProps {
  selectedExamType: string;
  onExamTypeChange: (examType: string) => void;
}

const ExamTypeDropdown = ({ selectedExamType, onExamTypeChange }: ExamTypeDropdownProps) => {
  const [open, setOpen] = useState(false);
  const selectedExam = exams.find(e => e.id === selectedExamType) || exams[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors w-full"
      >
        <span className="text-sm font-medium text-foreground flex-1 text-left truncate">
          {selectedExam.name}
        </span>
        <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {exams.map((exam) => (
            <button
              key={exam.id}
              onClick={() => { onExamTypeChange(exam.id); setOpen(false); }}
              className={cn("w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors", selectedExamType === exam.id && "bg-primary/10 text-primary")}
            >
              {exam.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamTypeDropdown;
