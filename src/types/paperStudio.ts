// AI Paper Studio types — extends the existing questionPaper model with the
// metadata required for AI generation, validation, and the new editor right panel.

import type { QuestionType } from './questionPaper';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
export type QuestionSource = 'bank' | 'ai' | 'manual' | 'previous-paper';
export type QuestionStatus = 'draft' | 'approved' | 'flagged' | 'replaced';
export type Priority = 'low' | 'medium' | 'high';
export type PaperLanguage = 'english' | 'hindi' | 'kannada' | 'bilingual';
export type GenerationSource = 'bank-only' | 'bank-plus-ai' | 'ai-fresh' | 'similar-to-previous';

export interface TopicSelection {
  name: string;
  included: boolean;
  targetMarks: number;
}

export interface ChapterSelection {
  chapterId: string;
  chapterName: string;
  topics: string[]; // all available topic names (reference)
  topicSelections: TopicSelection[]; // per-topic include + marks
  targetMarks: number; // chapter-level total
  priority: Priority;
  difficultyFocus: Difficulty;
  included: boolean;
}

export interface PatternRow {
  id: string;
  sectionLabel: string; // A, B, C…
  questionType: QuestionType;
  count: number;
  marksEach: number;
  total: number; // computed = count * marksEach
  rule: string; // "Answer all" | "Answer any 5 of 6" | "Internal choice"
}

export interface DifficultyDistribution {
  easy: number; // 0-100
  medium: number;
  hard: number;
}

export interface QuestionPreferences {
  source: GenerationSource;
  difficulty: DifficultyDistribution;
  styles: string[]; // ['conceptual', 'application-based', 'competency-based', 'numerical', 'diagram-based', 'case-based']
  avoid: string[]; // ['last-exam', 'repeated-concepts', 'out-of-syllabus', 'too-many-from-one-chapter']
  answerKey: {
    generateKey: boolean;
    stepMarking: boolean;
    rubric: boolean;
    commonMistakes: boolean;
  };
}

export interface PaperStudioDetails {
  examName: string;
  className: string;
  subject: string;
  academicYear: string;
  date: string;
  duration: string;
  maxMarks: number;
  language: PaperLanguage;
  institutionName: string;
  template: string;
}

export interface PaperStudioState {
  details: PaperStudioDetails;
  pattern: PatternRow[];
  syllabus: ChapterSelection[];
  preferences: QuestionPreferences;
  generatedPaperId?: string;
}

export type IssueSeverity = 'error' | 'warning' | 'info';
export type IssueKind = 'deterministic' | 'ai';

export interface ValidationIssue {
  id: string;
  severity: IssueSeverity;
  kind: IssueKind;
  message: string;
  affectedBlock?: string; // sectionId or questionId
  suggestedFix?: string;
}

export interface ChoiceGroup {
  id: string;
  type: 'OR' | 'ANSWER_ANY';
  effectiveMarks: number;
  questionIds: string[];
  k?: number; // for ANSWER_ANY: answer any K of N
}

export interface ExtendedQuestionMeta {
  chapter?: string;
  topic?: string;
  difficulty?: Difficulty;
  bloomLevel?: BloomLevel;
  source?: QuestionSource;
  status?: QuestionStatus;
  answerKey?: {
    correctAnswer?: string;
    expectedAnswer?: string;
    stepMarking?: { step: string; marks: number }[];
    rubric?: string;
    alternates?: string[];
    commonMistakes?: string[];
  };
}

// Default factories
export const defaultPreferences = (): QuestionPreferences => ({
  source: 'bank-plus-ai',
  difficulty: { easy: 30, medium: 50, hard: 20 },
  styles: ['conceptual', 'application-based', 'competency-based'],
  avoid: ['last-exam', 'out-of-syllabus'],
  answerKey: { generateKey: true, stepMarking: true, rubric: false, commonMistakes: true },
});

export const defaultDetails = (): PaperStudioDetails => ({
  examName: 'Annual Exam 2026',
  className: 'Class 10',
  subject: 'Science',
  academicYear: '2025–26',
  date: new Date().toLocaleDateString('en-GB'),
  duration: '3 Hours',
  maxMarks: 80,
  language: 'english',
  institutionName: 'ButterPrep School',
  template: 'School Standard Format',
});

export const defaultPattern = (): PatternRow[] => [
  { id: 'p1', sectionLabel: 'A', questionType: 'mcq', count: 20, marksEach: 1, total: 20, rule: 'Answer all' },
  { id: 'p2', sectionLabel: 'B', questionType: 'short-answer', count: 6, marksEach: 2, total: 12, rule: 'Answer all' },
  { id: 'p3', sectionLabel: 'C', questionType: 'short-answer', count: 7, marksEach: 3, total: 21, rule: 'Answer all' },
  { id: 'p4', sectionLabel: 'D', questionType: 'long-answer', count: 3, marksEach: 5, total: 15, rule: 'Answer all' },
  { id: 'p5', sectionLabel: 'E', questionType: 'case-study', count: 3, marksEach: 4, total: 12, rule: 'Answer all (3 case sets)' },
];

export const sumPatternMarks = (rows: PatternRow[]) =>
  rows.reduce((sum, r) => sum + r.count * r.marksEach, 0);

export const sumSyllabusMarks = (chapters: ChapterSelection[]) =>
  chapters.filter(c => c.included).reduce((sum, c) => sum + c.targetMarks, 0);
