export type WorkflowStatus =
  | 'draft'
  | 'under-review'
  | 'changes-requested'
  | 'approved'
  | 'answer-key-draft'
  | 'answer-key-finalized';

export const workflowStatusLabels: Record<WorkflowStatus, string> = {
  'draft': 'Draft',
  'under-review': 'Under Review',
  'changes-requested': 'Changes Requested',
  'approved': 'Approved',
  'answer-key-draft': 'Answer Key Draft',
  'answer-key-finalized': 'Answer Key Finalized',
};

export const workflowStatusColors: Record<WorkflowStatus, { bg: string; text: string; border: string }> = {
  'draft': { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  'under-review': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  'changes-requested': { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
  'approved': { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
  'answer-key-draft': { bg: 'bg-purple/10', text: 'text-purple', border: 'border-purple/30' },
  'answer-key-finalized': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
};

export interface ReviewComment {
  id: string;
  author: string;
  role: 'admin' | 'teacher';
  text: string;
  sectionId?: string;
  questionId?: string;
  timestamp: string;
}

export interface AnswerKeyEntry {
  questionId: string;
  displayNumber: number;
  questionText: string;
  questionType: string;
  marks: number;
  sectionLabel: string;
  answer: string;
  keyPoints: string[];
  markingGuidance: string;
  isEdited: boolean;
}

export interface PaperWorkflow {
  paperId: string;
  assignedTeacherId: string;
  assignedTeacherName: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  assignNote: string;
  workflowStatus: WorkflowStatus;
  comments: ReviewComment[];
  answerKey: AnswerKeyEntry[];
  statusHistory: { status: WorkflowStatus; timestamp: string; by: string }[];
}
