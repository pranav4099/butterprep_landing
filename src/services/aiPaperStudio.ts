// Lightweight client for the AI Paper Studio edge functions.
// All calls go through Lovable Cloud functions — never call AI directly from the client.
import { supabase } from '@/integrations/supabase/client';

async function invoke<T>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    // edge function returned non-2xx — surface a useful message
    const msg = (error as { message?: string }).message || 'AI request failed';
    throw new Error(msg);
  }
  if (data && typeof data === 'object' && 'error' in (data as object)) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return data as T;
}

// ----- Step 2: Pattern -----
export interface AiPatternRow {
  sectionLabel: string;
  questionType: string;
  count: number;
  marksEach: number;
  rule: string;
}
export interface AiSuggestPatternResponse {
  rows: AiPatternRow[];
  rationale: string;
}
export const aiSuggestPattern = (input: {
  className: string; subject: string; maxMarks: number; duration: string; examName?: string;
}) => invoke<AiSuggestPatternResponse>('ai-suggest-pattern', input);

// ----- Step 3: Syllabus -----
export interface AiDistributeSyllabusResponse {
  allocations: { chapterId: string; targetMarks: number }[];
}
export const aiDistributeSyllabus = (input: {
  className: string; subject: string; maxMarks: number;
  chapters: { chapterId: string; chapterName: string; priority: string; included: boolean }[];
}) => invoke<AiDistributeSyllabusResponse>('ai-distribute-syllabus', input);

// ----- Step 5: Generate Paper -----
export interface AiGeneratedQuestion {
  text: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
  expectedAnswer?: string;
  chapter: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomLevel?: string;
  commonMistakes?: string[];
  subparts?: { label: string; text: string; marks: number }[];
}
export interface AiGeneratedSection {
  sectionLabel: string;
  title: string;
  instruction?: string;
  questionType: string;
  questions: AiGeneratedQuestion[];
}
export interface AiGeneratePaperResponse {
  instructions: string;
  sections: AiGeneratedSection[];
}
export const aiGeneratePaper = (input: unknown) =>
  invoke<AiGeneratePaperResponse>('ai-generate-paper', input);

// ----- Editor: per-question actions -----
export interface AiQuestionActionResponse {
  text: string;
  options?: string[];
  correctAnswer?: string;
  expectedAnswer?: string;
  stepMarking?: { step: string; marks: number }[];
  commonMistakes?: string[];
}
export const aiQuestionAction = (input: {
  action: 'improve' | 'regenerate' | 'translate' | 'answer-key';
  className: string; subject: string;
  questionText: string; questionType: string; marks: number;
  chapter?: string; difficulty?: string; targetLanguage?: string;
}) => invoke<AiQuestionActionResponse>('ai-question-action', input);

// ----- Editor: paper-wide validation -----
export interface AiValidatePaperResponse {
  issues: { severity: 'error' | 'warning' | 'info'; message: string; affectedBlock?: string; suggestedFix?: string }[];
  summary: {
    wordingClarity: 'good' | 'fair' | 'poor';
    syllabusMatch: 'matched' | 'partial' | 'off-syllabus';
    duplicateRisk: 'low' | 'medium' | 'high';
    difficultyBalance: 'balanced' | 'easy-skewed' | 'hard-skewed';
  };
}
export const aiValidatePaper = (input: {
  className: string; subject: string; paperSummary: string; includedChapters: string[];
}) => invoke<AiValidatePaperResponse>('ai-validate-paper', input);
