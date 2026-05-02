

## Teacher Question Bank — Standalone Module

A dedicated space where teachers build, curate, and reuse a personal + school-wide library of vetted questions, independent of any single paper.

### Why it's needed
- Today, questions only exist *inside* papers or as static mock data. Teachers can't proactively build a reusable library.
- AI-generated questions get thrown away after a paper is finalised — no compounding value.
- No way for the school to share vetted questions across teachers of the same subject.

### Module shape

**Route**: `/teacher/question-bank` (sidebar entry under Teacher portal)

**Three tabs**:
1. **My Bank** — questions the teacher authored or saved (private)
2. **School Bank** — approved, shared across all teachers of that class+subject
3. **Pending Approval** — teacher submissions awaiting admin sign-off before joining School Bank

### Core screens

**1. Bank list view**
- Filter rail: Class, Subject, Chapter, Topic, Difficulty, Bloom level, Type (MCQ/Short/Long/Case), Marks
- Search by question text
- Cards showing: question preview, tags (chapter, marks, difficulty), source badge (Authored / AI-generated / Imported), usage count ("Used in 3 papers")
- Bulk actions: Approve, Delete, Export, Submit for school approval

**2. Add / Edit question**
- Form with: type, text (rich), marks via `NumberPickerPopover`, options + correct answer (for MCQ), model answer, chapter/topic dropdowns (from existing syllabus data), difficulty, bloom level
- "Save to My Bank" or "Submit to School Bank"

**3. Bulk import**
- CSV upload with downloadable template
- Paste-from-doc parser (optional later)

**4. Auto-harvest from finalised papers**
- When a teacher finalises a paper in Studio Editor, prompt: *"Save these N questions to your bank?"*
- One click adds all to **My Bank** as `source: 'paper'`

### Admin side
- New route `/question-bank-approvals` for admins to review **Pending Approval** queue → approve into **School Bank** or reject with note.

### Integration with existing AI Studio
- `QuestionBankDrawer` (already exists) reads from the new DB-backed bank instead of mock data, scoped to: My Bank ∪ School Bank for the current class+subject.
- "Insert" action increments the question's `usage_count`.

### Technical details

**New tables (Supabase)**
```
question_bank
  id, created_by (uuid), class, subject, chapter, topic,
  type, text, marks, options (jsonb), correct_answer,
  model_answer, difficulty, bloom_level,
  visibility ('private' | 'pending' | 'approved'),
  source ('authored' | 'ai' | 'paper' | 'imported'),
  usage_count, created_at, updated_at

question_bank_usage  (optional, for analytics)
  id, question_id, paper_id, used_at
```

**RLS policies**
- `private`: only `created_by` can read/write
- `pending`: owner + admins can read; only admins can update visibility
- `approved`: anyone in same school can read; only admins/owner can edit

**New files**
- `src/pages/teacher/QuestionBank.tsx` — list view with tabs
- `src/pages/teacher/QuestionBankEditor.tsx` — add/edit form
- `src/components/question-bank/QuestionCard.tsx`, `BankFilters.tsx`, `BulkImportDialog.tsx`
- `src/hooks/useQuestionBank.ts` — CRUD + filter logic
- `src/pages/QuestionBankApprovals.tsx` — admin queue
- Migration: create `question_bank` table + RLS

**Changes to existing files**
- `src/components/paper-studio/QuestionBankDrawer.tsx` — swap mock import for `useQuestionBank`
- `src/data/questionBankData.ts` — keep as seed/fallback only
- `src/components/TeacherLayout.tsx` sidebar — add "Question Bank" entry
- `src/pages/paper-studio/StudioEditor.tsx` — add "Save to bank" prompt on finalise

### Out of scope (future)
- AI-suggested duplicates / similar questions
- Question quality scoring based on student performance
- Import from PDF

