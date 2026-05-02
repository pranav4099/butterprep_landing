import { useSyncExternalStore } from 'react';

export interface ReportStatusEntry {
  key: string; // `${className}-${section}-${subject}-${examType}`
  className: string;
  section: string;
  subject: string;
  examType: string;
  generatedAt: number;
  generatedBy?: string;
}

const STANDARD_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];

export const REPORT_CATALOG = Array.from({ length: 10 }, (_, i) => ({
  className: `Class ${i + 1}`,
  sections: [
    { name: 'Section A', subjects: STANDARD_SUBJECTS },
    { name: 'Section B', subjects: STANDARD_SUBJECTS },
    { name: 'Section C', subjects: STANDARD_SUBJECTS },
  ],
}));

const TEACHER_ASSIGNMENTS_BY_EXAM: Record<string, Array<{ className: string; section: string; subject: string }>> = {};

export const getTeacherAssignments = (examType: string) => {
  if (TEACHER_ASSIGNMENTS_BY_EXAM[examType]) return TEACHER_ASSIGNMENTS_BY_EXAM[examType];
  // Demo: every section/subject in catalog is assigned to current teacher
  const list: Array<{ className: string; section: string; subject: string }> = [];
  REPORT_CATALOG.forEach(c =>
    c.sections.forEach(s =>
      s.subjects.forEach(sub => list.push({ className: c.className, section: s.name, subject: sub }))
    )
  );
  TEACHER_ASSIGNMENTS_BY_EXAM[examType] = list;
  return list;
};

const buildKey = (className: string, section: string, subject: string, examType: string) =>
  `${className}-${section}-${subject}-${examType}`;

let store: Map<string, ReportStatusEntry> = new Map();
const listeners = new Set<() => void>();

const emit = () => listeners.forEach(l => l());

// Demo seed: simulate teachers having already generated some reports so admins
// see realistic mixed-status data. Section A fully done, B partial, C empty.
const SEED_EXAMS = ['FA1', 'FA2', 'SA1'];
(function seed() {
  const now = Date.now();
  const teacherByIndex = ['Mrs. Iyer', 'Mr. Kapoor', 'Ms. D’Souza', 'Mr. Reddy', 'Mrs. Khan', 'Ms. Pillai'];
  SEED_EXAMS.forEach((exam, examIdx) => {
    REPORT_CATALOG.forEach(cls => {
      cls.sections.forEach((section, sIdx) => {
        section.subjects.forEach((subject, subIdx) => {
          // Section A: all done. Section B: ~half. Section C: none.
          const shouldGenerate = sIdx === 0 || (sIdx === 1 && subIdx % 2 === 0);
          if (!shouldGenerate) return;
          const key = buildKey(cls.className, section.name, subject, exam);
          store.set(key, {
            key,
            className: cls.className,
            section: section.name,
            subject,
            examType: exam,
            generatedAt: now - ((examIdx + 1) * 86400000) - subIdx * 3600000,
            generatedBy: teacherByIndex[(sIdx + subIdx) % teacherByIndex.length],
          });
        });
      });
    });
  });
})();


export const reportStatusStore = {
  getAll(): ReportStatusEntry[] {
    return Array.from(store.values());
  },
  get(className: string, section: string, subject: string, examType: string) {
    return store.get(buildKey(className, section, subject, examType));
  },
  has(className: string, section: string, subject: string, examType: string) {
    return store.has(buildKey(className, section, subject, examType));
  },
  markGenerated(className: string, section: string, subject: string, examType: string, generatedBy?: string) {
    const key = buildKey(className, section, subject, examType);
    store.set(key, { key, className, section, subject, examType, generatedAt: Date.now(), generatedBy });
    // new map reference so useSyncExternalStore snapshot diffs
    store = new Map(store);
    emit();
  },
  markBatch(entries: Array<{ className: string; section: string; subject: string }>, examType: string, generatedBy?: string) {
    entries.forEach(e => {
      const key = buildKey(e.className, e.section, e.subject, examType);
      store.set(key, { key, className: e.className, section: e.section, subject: e.subject, examType, generatedAt: Date.now(), generatedBy });
    });
    store = new Map(store);
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
};

export const useReportStatus = () => {
  return useSyncExternalStore(
    reportStatusStore.subscribe,
    () => store,
    () => store
  );
};

export const buildReportKey = buildKey;
