export type QuestionType =
  | 'mcq'
  | 'true-false'
  | 'fill-blank'
  | 'match'
  | 'table'
  | 'diagram'
  | 'short-answer'
  | 'long-answer'
  | 'case-study';

export type SectionLabelStyle = 'roman' | 'part';
export type SubpartStyle = 'alpha' | 'decimal';
export type AnswerRule = 'all' | 'any-k' | 'or-choice';
export type PaperStatus = 'draft' | 'published';
export type ExamType = 'FA1' | 'FA2' | 'SA1' | 'SA2' | 'custom';

export interface Subpart {
  id: string;
  label: string;
  text: string;
  marks: number;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface TableCell {
  value: string;
  isHeader?: boolean;
  isBlank?: boolean;
}

export interface Question {
  id: string;
  internalId: string;
  displayNumber: number;
  type: QuestionType;
  text: string;
  marks: number;
  subparts: Subpart[];
  hasOr: boolean;
  orQuestion?: Omit<Question, 'displayNumber' | 'hasOr' | 'orQuestion'>;
  imageUrl?: string;
  note?: string;
  options?: string[];
  matchPairs?: MatchPair[];
  tableData?: TableCell[][];
  tableRows?: number;
  tableCols?: number;
}

export interface Section {
  id: string;
  label: string;
  title: string;
  labelStyle: SectionLabelStyle;
  answerRule: AnswerRule;
  answerAnyK?: number;
  totalQuestions: number;
  marksPerQuestion?: number;
  totalMarks: number;
  questions: Question[];
  questionType?: QuestionType;
  instructions?: string;
}

export interface PaperDetails {
  id: string;
  institutionName: string;
  logoUrl: string;
  className: string;
  subject: string;
  examName: string;
  examType?: ExamType;
  date: string;
  duration: string;
  targetMarks: number;
  instructions: string;
}

export interface QuestionPaper {
  id: string;
  details: PaperDetails;
  sections: Section[];
  subpartStyle: SubpartStyle;
  status: PaperStatus;
  createdAt: string;
  updatedAt: string;
  currentMarks: number;
  templateId?: string;
}

export interface PaperTemplate {
  id: string;
  name: string;
  description: string;
  targetMarks: number;
  icon: string;
  sections: Omit<Section, 'questions'>[];
}

export interface QuestionMapRow {
  questionId: string;
  displayNumber: string;
  section: string;
  marks: number;
  isOptionalGroup: boolean;
  groupId: string;
  subparts: string;
  maxMarks: number;
  questionType: QuestionType;
}

export interface ValidationWarning {
  type: 'error' | 'warning';
  message: string;
  sectionId?: string;
  questionId?: string;
}

// Question type metadata
export const questionTypeLabels: Record<QuestionType, string> = {
  'mcq': 'Multiple Choice',
  'true-false': 'True / False',
  'fill-blank': 'Fill in the Blanks',
  'match': 'Match the Following',
  'table': 'Table / Complete',
  'diagram': 'Diagram / Image',
  'short-answer': 'Short Answer',
  'long-answer': 'Long Answer',
  'case-study': 'Case Study / Passage',
};

export const questionTypeDescriptions: Record<QuestionType, string> = {
  'mcq': 'Choose correct option from A, B, C, D',
  'true-false': 'Mark statements as true or false',
  'fill-blank': 'Complete sentences with missing words',
  'match': 'Match items from column A to column B',
  'table': 'Fill in table values or complete data',
  'diagram': 'Label, draw, or identify from images',
  'short-answer': '2–3 sentence answers',
  'long-answer': 'Detailed paragraph answers',
  'case-study': 'Read passage and answer subquestions',
};

export const sectionLabels: Record<SectionLabelStyle, string[]> = {
  roman: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
  part: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
};

export const answerRuleLabels: Record<AnswerRule, string> = {
  'all': 'Answer All',
  'any-k': 'Answer Any K of N',
  'or-choice': 'OR Choice Within Questions',
};

export const examTypes: ExamType[] = ['FA1', 'FA2', 'SA1', 'SA2', 'custom'];

// Compute answerable marks for a section
export function computeSectionAnswerableMarks(section: Section): number {
  const questionMarks = section.questions.map(q => {
    if (q.subparts.length > 0) {
      return q.subparts.reduce((s, sp) => s + sp.marks, 0);
    }
    return q.marks;
  });

  if (section.answerRule === 'any-k' && section.answerAnyK) {
    // Sort descending and take top K
    const sorted = [...questionMarks].sort((a, b) => b - a);
    return sorted.slice(0, section.answerAnyK).reduce((s, m) => s + m, 0);
  }

  if (section.answerRule === 'or-choice') {
    // For OR choice, each question with hasOr counts only once (max of main/or)
    return section.questions.reduce((sum, q) => {
      const qMarks = q.subparts.length > 0
        ? q.subparts.reduce((s, sp) => s + sp.marks, 0)
        : q.marks;
      return sum + qMarks; // OR question has same marks, so just count once
    }, 0);
  }

  // 'all' — sum everything
  return questionMarks.reduce((s, m) => s + m, 0);
}

// Compute total answerable marks for a paper
export function computePaperMarks(sections: Section[]): number {
  return sections.reduce((total, section) => total + computeSectionAnswerableMarks(section), 0);
}

// Validate a paper and return warnings
export function validatePaper(details: PaperDetails, sections: Section[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const computed = computePaperMarks(sections);

  if (computed !== details.targetMarks) {
    warnings.push({
      type: 'error',
      message: `Marks mismatch: ${computed}/${details.targetMarks} (${computed > details.targetMarks ? `${computed - details.targetMarks} over` : `${details.targetMarks - computed} remaining`})`,
    });
  }

  sections.forEach(section => {
    if (!section.title.trim()) {
      warnings.push({ type: 'error', message: 'Empty section title', sectionId: section.id });
    }

    if (section.answerRule === 'any-k' && section.answerAnyK) {
      if (section.answerAnyK > section.questions.length) {
        warnings.push({
          type: 'error',
          message: `Section ${section.label}: Answer any ${section.answerAnyK} but only ${section.questions.length} questions`,
          sectionId: section.id,
        });
      }
    }

    section.questions.forEach(q => {
      if (!q.text.trim()) {
        warnings.push({
          type: 'warning',
          message: `Q${q.displayNumber}: Empty question text`,
          sectionId: section.id,
          questionId: q.id,
        });
      }
    });
  });

  if (sections.length === 0) {
    warnings.push({ type: 'warning', message: 'No sections added yet' });
  }

  return warnings;
}

// Auto-number questions across all sections
export function autoNumberQuestions(sections: Section[]): Section[] {
  let counter = 1;
  return sections.map(section => ({
    ...section,
    totalQuestions: section.questions.length,
    totalMarks: computeSectionAnswerableMarks(section),
    questions: section.questions.map(q => ({
      ...q,
      displayNumber: counter++,
    })),
  }));
}
