import type { PaperWorkflow, AnswerKeyEntry } from '@/types/paperWorkflow';

// Demo answer key for seed-paper-1 (Class 10 Math SA1)
const mathAnswerKey: AnswerKeyEntry[] = [
  { questionId: 'q1', displayNumber: 1, questionText: 'The HCF of 36 and 84 is:', questionType: 'mcq', marks: 1, sectionLabel: 'A', answer: '(b) 12', keyPoints: ['HCF(36, 84) = 12'], markingGuidance: 'Direct answer — 1 mark', isEdited: false },
  { questionId: 'q2', displayNumber: 2, questionText: 'If one zero of p(x) = 2x² + x + k is 1...', questionType: 'mcq', marks: 1, sectionLabel: 'A', answer: '(a) -3', keyPoints: ['Substitute x=1: 2+1+k=0, k=-3'], markingGuidance: 'Direct answer — 1 mark', isEdited: false },
  { questionId: 'q3', displayNumber: 3, questionText: 'The pair of linear equations 2x + 3y = 5...', questionType: 'mcq', marks: 1, sectionLabel: 'A', answer: '(c) Infinitely many solutions', keyPoints: ['Second equation is 2× first'], markingGuidance: 'Direct answer — 1 mark', isEdited: false },
  { questionId: 'q4', displayNumber: 4, questionText: 'The distance of the point (3, 4) from origin...', questionType: 'mcq', marks: 1, sectionLabel: 'A', answer: '(c) 5', keyPoints: ['√(9+16) = 5'], markingGuidance: 'Direct answer — 1 mark', isEdited: false },
  { questionId: 'q5', displayNumber: 5, questionText: 'If tan θ = 5/12, then sin θ is:', questionType: 'mcq', marks: 1, sectionLabel: 'A', answer: '(a) 5/13', keyPoints: ['hyp = 13, sin = 5/13'], markingGuidance: 'Direct answer — 1 mark', isEdited: false },
  { questionId: 'q6', displayNumber: 6, questionText: 'The median of 3, 5, 7, 9, 11 is:', questionType: 'mcq', marks: 1, sectionLabel: 'A', answer: '(b) 7', keyPoints: ['Middle value of sorted data'], markingGuidance: 'Direct answer — 1 mark', isEdited: false },
  { questionId: 'q7', displayNumber: 7, questionText: 'Quadratic polynomial with sum=3, product=-2:', questionType: 'mcq', marks: 1, sectionLabel: 'A', answer: '(a) x² - 3x - 2', keyPoints: ['x² - (sum)x + (product)'], markingGuidance: 'Direct answer — 1 mark', isEdited: false },
  { questionId: 'q8', displayNumber: 8, questionText: 'The 10th term of AP 2, 7, 12...', questionType: 'mcq', marks: 1, sectionLabel: 'A', answer: '(a) 47', keyPoints: ['a=2, d=5, a10 = 2+9×5 = 47'], markingGuidance: 'Direct answer — 1 mark', isEdited: false },
  { questionId: 'q9', displayNumber: 9, questionText: 'Ratio of areas of similar triangles...', questionType: 'mcq', marks: 1, sectionLabel: 'A', answer: '(b) 9:25', keyPoints: ['Area ratio = (side ratio)²'], markingGuidance: 'Direct answer — 1 mark', isEdited: false },
  { questionId: 'q10', displayNumber: 10, questionText: 'If P(E) = 0.6, then P(not E) is:', questionType: 'mcq', marks: 1, sectionLabel: 'A', answer: '(b) 0.4', keyPoints: ['P(not E) = 1 - P(E)'], markingGuidance: 'Direct answer — 1 mark', isEdited: false },
  { questionId: 'q11', displayNumber: 11, questionText: 'Find the LCM of 12, 15, and 21...', questionType: 'short-answer', marks: 2, sectionLabel: 'B', answer: 'LCM = 420. Prime factorisation: 12 = 2² × 3, 15 = 3 × 5, 21 = 3 × 7. LCM = 2² × 3 × 5 × 7 = 420.', keyPoints: ['Correct prime factorisation — 1 mark', 'Correct LCM — 1 mark'], markingGuidance: '1 mark for factorisation, 1 mark for final answer', isEdited: false },
  { questionId: 'q12', displayNumber: 12, questionText: 'Find zeroes of x² - 3x - 10...', questionType: 'short-answer', marks: 2, sectionLabel: 'B', answer: 'x² - 3x - 10 = (x-5)(x+2) = 0. Zeroes: x = 5, x = -2. Sum = 3 = -(-3)/1 ✓. Product = -10 = -10/1 ✓.', keyPoints: ['Finding zeroes: 5 and -2', 'Verification of sum and product'], markingGuidance: '1 mark for zeroes, 1 mark for verification', isEdited: false },
  { questionId: 'q13', displayNumber: 13, questionText: 'Distance between A(2,3) and B(4,1)...', questionType: 'short-answer', marks: 2, sectionLabel: 'B', answer: 'Distance = √[(4-2)² + (1-3)²] = √[4+4] = √8 = 2√2 units.', keyPoints: ['Correct formula application', 'Correct simplification'], markingGuidance: '1 mark for formula, 1 mark for answer', isEdited: false },
  { questionId: 'q14', displayNumber: 14, questionText: 'If sin A = 3/4, find cos A and tan A...', questionType: 'short-answer', marks: 2, sectionLabel: 'B', answer: 'cos A = √(1 - 9/16) = √(7/16) = √7/4. tan A = sin A / cos A = 3/√7 = 3√7/7.', keyPoints: ['cos A = √7/4', 'tan A = 3√7/7'], markingGuidance: '1 mark for cos A, 1 mark for tan A', isEdited: false },
  { questionId: 'q15', displayNumber: 15, questionText: 'Mean of 4, 6, 7, 8, 10, 12, 13...', questionType: 'short-answer', marks: 2, sectionLabel: 'B', answer: 'Mean = (4+6+7+8+10+12+13)/7 = 60/7 ≈ 8.57.', keyPoints: ['Correct sum = 60', 'Correct division by 7'], markingGuidance: '1 mark for sum, 1 mark for mean', isEdited: false },
  { questionId: 'q16', displayNumber: 16, questionText: 'Prove that √2 is irrational.', questionType: 'short-answer', marks: 3, sectionLabel: 'C', answer: 'Proof by contradiction. Assume √2 = p/q where p,q are coprime. Then 2 = p²/q², so p² = 2q². This means p is even, say p = 2k. Then 4k² = 2q², so q² = 2k², meaning q is also even. This contradicts p,q being coprime. Hence √2 is irrational.', keyPoints: ['Assume rational form p/q', 'Show p must be even', 'Show q must be even — contradiction'], markingGuidance: '1 mark for assumption, 1 mark for showing p is even, 1 mark for contradiction', isEdited: false },
  { questionId: 'q17', displayNumber: 17, questionText: 'Solve: 3x + 4y = 10 and 2x - 2y = 2', questionType: 'short-answer', marks: 3, sectionLabel: 'C', answer: 'From eq 2: x = y + 1. Substituting: 3(y+1) + 4y = 10 → 7y = 7 → y = 1. x = 2.', keyPoints: ['Express x in terms of y', 'Substitute and solve for y', 'Find x'], markingGuidance: '1 mark per step', isEdited: false },
  { questionId: 'q18', displayNumber: 18, questionText: 'Sum of first 15 terms of AP: 7, 13, 19...', questionType: 'short-answer', marks: 3, sectionLabel: 'C', answer: 'a = 7, d = 6. S15 = 15/2 [2(7) + 14(6)] = 15/2 [14 + 84] = 15/2 × 98 = 735.', keyPoints: ['Identify a=7, d=6', 'Apply sum formula', 'S15 = 735'], markingGuidance: '1 mark for a,d; 1 mark for formula; 1 mark for answer', isEdited: false },
];

export const seedWorkflows: PaperWorkflow[] = [
  // Paper 1: Class 10 Math — Approved with Answer Key Draft (teacher can review AK)
  {
    paperId: 'seed-paper-1',
    assignedTeacherId: 't4',
    assignedTeacherName: 'Deepak Joshi',
    assignedBy: 'Admin',
    assignedDate: '2026-03-25',
    dueDate: '2026-04-05',
    assignNote: 'Please review the SA1 paper for Class 10 Mathematics. Pay special attention to Section D long answer questions.',
    workflowStatus: 'answer-key-draft',
    comments: [
      { id: 'c1', author: 'Deepak Joshi', role: 'teacher', text: 'Question 24 about heights and distances — the angle values might be too complex for mid-term. Consider using standard angles (30°, 45°, 60°).', sectionId: 'sec-d', questionId: 'q24', timestamp: '2026-03-27T10:30:00Z' },
      { id: 'c2', author: 'Admin', role: 'admin', text: 'Updated Q24 to use standard angles. Please review again.', timestamp: '2026-03-28T09:00:00Z' },
      { id: 'c3', author: 'Deepak Joshi', role: 'teacher', text: 'Looks good now. Approving the paper.', timestamp: '2026-03-29T14:00:00Z' },
    ],
    answerKey: mathAnswerKey,
    statusHistory: [
      { status: 'draft', timestamp: '2026-03-20T08:00:00Z', by: 'Admin' },
      { status: 'under-review', timestamp: '2026-03-25T10:00:00Z', by: 'Admin' },
      { status: 'changes-requested', timestamp: '2026-03-27T10:30:00Z', by: 'Deepak Joshi' },
      { status: 'under-review', timestamp: '2026-03-28T09:00:00Z', by: 'Admin' },
      { status: 'approved', timestamp: '2026-03-29T14:00:00Z', by: 'Deepak Joshi' },
      { status: 'answer-key-draft', timestamp: '2026-03-29T14:01:00Z', by: 'System' },
    ],
  },
  // Paper 2: Class 10 Science — Under Review (teacher can review)
  {
    paperId: 'seed-paper-2',
    assignedTeacherId: 't13',
    assignedTeacherName: 'Suresh Patil',
    assignedBy: 'Admin',
    assignedDate: '2026-03-28',
    dueDate: '2026-04-08',
    assignNote: 'Draft science paper for SA1. Please check difficulty level and chapter coverage.',
    workflowStatus: 'under-review',
    comments: [],
    answerKey: [],
    statusHistory: [
      { status: 'draft', timestamp: '2026-03-22T08:00:00Z', by: 'Admin' },
      { status: 'under-review', timestamp: '2026-03-28T10:00:00Z', by: 'Admin' },
    ],
  },
  // Paper 3: Class 9 English — Answer Key Finalized (complete workflow)
  {
    paperId: 'seed-paper-3',
    assignedTeacherId: 't15',
    assignedTeacherName: 'Harish Shetty',
    assignedBy: 'Admin',
    assignedDate: '2026-03-18',
    dueDate: '2026-03-25',
    assignNote: 'FA2 English paper for review.',
    workflowStatus: 'answer-key-finalized',
    comments: [
      { id: 'c4', author: 'Harish Shetty', role: 'teacher', text: 'Paper looks well-structured. Approved.', timestamp: '2026-03-19T11:00:00Z' },
    ],
    answerKey: [],
    statusHistory: [
      { status: 'draft', timestamp: '2026-03-15T08:00:00Z', by: 'Admin' },
      { status: 'under-review', timestamp: '2026-03-18T10:00:00Z', by: 'Admin' },
      { status: 'approved', timestamp: '2026-03-19T11:00:00Z', by: 'Harish Shetty' },
      { status: 'answer-key-draft', timestamp: '2026-03-19T11:01:00Z', by: 'System' },
      { status: 'answer-key-finalized', timestamp: '2026-03-20T15:00:00Z', by: 'Harish Shetty' },
    ],
  },
];
