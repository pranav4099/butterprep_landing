// Question Bank store — in-memory, subscribe-driven CRUD with seeded data.
// Used by the teacher Question Bank module, admin approvals queue, and the
// in-editor QuestionBankDrawer. Persistence layer is mock (resets on reload).
import type { QuestionType } from '@/types/questionPaper';
import type { Difficulty, BloomLevel } from '@/types/paperStudio';

export type BankVisibility = 'private' | 'pending' | 'approved';
export type BankSource = 'authored' | 'ai' | 'paper' | 'imported';

export interface BankQuestion {
  id: string;
  createdBy: string;        // teacher username/id
  createdByName?: string;
  type: QuestionType;
  text: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
  modelAnswer?: string;
  chapter: string;
  topic: string;
  difficulty: Difficulty;
  bloomLevel: BloomLevel;
  className: string;
  subject: string;
  visibility: BankVisibility;
  source: BankSource;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  // Legacy (kept so older code paths don't break)
  approved?: boolean;
  used?: boolean;
}

const now = () => new Date().toISOString();

const seed: BankQuestion[] = [
  {
    id: 'bank-sci-1', createdBy: 'system', createdByName: 'School Library',
    type: 'mcq', marks: 1, className: 'Class 10', subject: 'Science',
    text: 'Which gas is evolved when zinc reacts with dilute hydrochloric acid?',
    options: ['Oxygen', 'Hydrogen', 'Nitrogen', 'Carbon dioxide'], correctAnswer: 'Hydrogen',
    chapter: 'Chemical Reactions and Equations', topic: 'Types of reactions',
    difficulty: 'easy', bloomLevel: 'remember',
    visibility: 'approved', source: 'authored', usageCount: 4,
    createdAt: now(), updatedAt: now(), approved: true, used: false,
  },
  {
    id: 'bank-sci-2', createdBy: 'system', createdByName: 'School Library',
    type: 'mcq', marks: 1, className: 'Class 10', subject: 'Science',
    text: 'The pH of a neutral solution is:',
    options: ['0', '7', '14', '1'], correctAnswer: '7',
    chapter: 'Acids, Bases and Salts', topic: 'pH scale',
    difficulty: 'easy', bloomLevel: 'remember',
    visibility: 'approved', source: 'authored', usageCount: 7,
    createdAt: now(), updatedAt: now(), approved: true, used: false,
  },
  {
    id: 'bank-sci-3', createdBy: 'teacher-1', createdByName: 'Mrs. Iyer',
    type: 'short-answer', marks: 2, className: 'Class 10', subject: 'Science',
    text: 'State two differences between aerobic and anaerobic respiration.',
    modelAnswer: 'Aerobic uses oxygen, releases more energy, end products CO₂ + H₂O. Anaerobic without oxygen, less energy, end product lactic acid (in muscles) or ethanol (in yeast).',
    chapter: 'Life Processes', topic: 'Respiration',
    difficulty: 'medium', bloomLevel: 'understand',
    visibility: 'approved', source: 'authored', usageCount: 2,
    createdAt: now(), updatedAt: now(), approved: true, used: false,
  },
  {
    id: 'bank-sci-4', createdBy: 'teacher-1', createdByName: 'Mrs. Iyer',
    type: 'short-answer', marks: 3, className: 'Class 10', subject: 'Science',
    text: 'A wire of resistance 4Ω is bent in the form of a circle. What is the effective resistance between two diametrically opposite points?',
    modelAnswer: 'Two semicircles of 2Ω each in parallel → 1Ω.',
    chapter: 'Electricity', topic: 'Resistance',
    difficulty: 'hard', bloomLevel: 'apply',
    visibility: 'approved', source: 'authored', usageCount: 1,
    createdAt: now(), updatedAt: now(), approved: true, used: false,
  },
  {
    id: 'bank-sci-5', createdBy: 'teacher-2', createdByName: 'Mr. Rao',
    type: 'long-answer', marks: 5, className: 'Class 10', subject: 'Science',
    text: 'Derive the lens formula 1/v - 1/u = 1/f using a ray diagram for a convex lens.',
    chapter: 'Light', topic: 'Lens formula',
    difficulty: 'hard', bloomLevel: 'analyze',
    visibility: 'approved', source: 'authored', usageCount: 0,
    createdAt: now(), updatedAt: now(), approved: true, used: false,
  },
  {
    id: 'bank-sci-6', createdBy: 'teacher-1', createdByName: 'Mrs. Iyer',
    type: 'case-study', marks: 4, className: 'Class 10', subject: 'Science',
    text: 'A student wound an insulated copper wire around a soft iron nail and connected it to a battery. (i) What does this device act as? (ii) Name two factors that affect its strength. (iii) State one practical use.',
    chapter: 'Magnetic Effects of Current', topic: 'Electromagnet',
    difficulty: 'medium', bloomLevel: 'apply',
    visibility: 'approved', source: 'ai', usageCount: 3,
    createdAt: now(), updatedAt: now(), approved: true, used: false,
  },
  {
    id: 'bank-sci-7', createdBy: 'system', createdByName: 'School Library',
    type: 'mcq', marks: 1, className: 'Class 10', subject: 'Science',
    text: 'Which of the following is a producer in a food chain?',
    options: ['Lion', 'Grass', 'Frog', 'Eagle'], correctAnswer: 'Grass',
    chapter: 'Our Environment', topic: 'Food chain',
    difficulty: 'easy', bloomLevel: 'remember',
    visibility: 'approved', source: 'authored', usageCount: 5,
    createdAt: now(), updatedAt: now(), approved: true, used: false,
  },
  // Pending submissions for admin queue
  {
    id: 'bank-sci-pending-1', createdBy: 'teacher-3', createdByName: 'Ms. Khan',
    type: 'short-answer', marks: 2, className: 'Class 10', subject: 'Science',
    text: 'Why is the colour of the copper sulphate solution lost when an iron nail is dipped in it?',
    modelAnswer: 'Iron is more reactive than copper, so it displaces copper. The blue Cu²⁺ ions are replaced by pale-green Fe²⁺ ions.',
    chapter: 'Chemical Reactions and Equations', topic: 'Oxidation and reduction',
    difficulty: 'medium', bloomLevel: 'understand',
    visibility: 'pending', source: 'authored', usageCount: 0,
    createdAt: now(), updatedAt: now(),
  },
  {
    id: 'bank-sci-pending-2', createdBy: 'teacher-3', createdByName: 'Ms. Khan',
    type: 'mcq', marks: 1, className: 'Class 10', subject: 'Science',
    text: 'Which of the following is NOT a renewable source of energy?',
    options: ['Solar', 'Wind', 'Coal', 'Hydro'], correctAnswer: 'Coal',
    chapter: 'Sources of Energy', topic: 'Renewable vs non-renewable',
    difficulty: 'easy', bloomLevel: 'remember',
    visibility: 'pending', source: 'paper', usageCount: 0,
    createdAt: now(), updatedAt: now(),
  },
  // Private — only visible to its author
  {
    id: 'bank-sci-private-1', createdBy: 'teacher-current', createdByName: 'You',
    type: 'short-answer', marks: 2, className: 'Class 10', subject: 'Science',
    text: 'Define electric power and write its SI unit.',
    modelAnswer: 'Electric power = rate of doing work by an electric current. SI unit: Watt (W).',
    chapter: 'Electricity', topic: 'Power',
    difficulty: 'easy', bloomLevel: 'remember',
    visibility: 'private', source: 'authored', usageCount: 0,
    createdAt: now(), updatedAt: now(),
  },
];

let store: BankQuestion[] = [...seed];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export const questionBankStore = {
  subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); },
  getAll(): BankQuestion[] { return store; },
  getById(id: string) { return store.find(q => q.id === id); },
  add(q: Omit<BankQuestion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> & Partial<Pick<BankQuestion, 'usageCount'>>) {
    const item: BankQuestion = {
      ...q,
      id: `bank-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      usageCount: q.usageCount ?? 0,
      createdAt: now(), updatedAt: now(),
    };
    store = [item, ...store];
    emit();
    return item;
  },
  update(id: string, patch: Partial<BankQuestion>) {
    store = store.map(q => q.id === id ? { ...q, ...patch, updatedAt: now() } : q);
    emit();
  },
  remove(id: string) {
    store = store.filter(q => q.id !== id);
    emit();
  },
  bulkUpdate(ids: string[], patch: Partial<BankQuestion>) {
    store = store.map(q => ids.includes(q.id) ? { ...q, ...patch, updatedAt: now() } : q);
    emit();
  },
  bulkRemove(ids: string[]) {
    store = store.filter(q => !ids.includes(q.id));
    emit();
  },
  incrementUsage(id: string) {
    store = store.map(q => q.id === id ? { ...q, usageCount: q.usageCount + 1 } : q);
    emit();
  },
};

// Filtering helper used by drawer + bank list view.
export interface BankFilter {
  className?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  difficulty?: Difficulty;
  bloomLevel?: BloomLevel;
  marks?: number;
  type?: QuestionType;
  visibility?: BankVisibility | 'all';
  visibleTo?: string;       // teacher id — restricts private items to author
  search?: string;
  // Back-compat
  approvedOnly?: boolean;
  unusedOnly?: boolean;
}

export const filterBank = (f: BankFilter): BankQuestion[] => {
  return questionBankStore.getAll().filter(q => {
    if (f.className && q.className !== f.className) return false;
    if (f.subject && q.subject !== f.subject) return false;
    if (f.chapter && q.chapter !== f.chapter) return false;
    if (f.topic && q.topic !== f.topic) return false;
    if (f.difficulty && q.difficulty !== f.difficulty) return false;
    if (f.bloomLevel && q.bloomLevel !== f.bloomLevel) return false;
    if (f.marks && q.marks !== f.marks) return false;
    if (f.type && q.type !== f.type) return false;
    if (f.visibility && f.visibility !== 'all' && q.visibility !== f.visibility) return false;
    if (f.approvedOnly && q.visibility !== 'approved') return false;
    if (f.unusedOnly && q.usageCount > 0) return false;
    // Privacy: private items only visible to creator
    if (q.visibility === 'private' && f.visibleTo && q.createdBy !== f.visibleTo) return false;
    if (f.search) {
      const s = f.search.toLowerCase();
      if (
        !q.text.toLowerCase().includes(s) &&
        !q.chapter.toLowerCase().includes(s) &&
        !q.topic.toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });
};

// Back-compat export — old code imported `questionBank` directly.
export const questionBank = store;
