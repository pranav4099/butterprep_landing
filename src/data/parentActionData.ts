// Precomputed Action Plan payload — generated at report time.
// No live AI calls; UI renders fixed placeholders from this structure only.

export type ActionStatus = 'needs_focus' | 'revise' | 'keep_going';

export interface SubjectActionPlan {
  subject: string;
  status: ActionStatus;
  summary: string;
  revise_now: string[];
  marks_lost_due_to: string[];
  weak_topics: string[];
  before_next_exam: string[];
  encouragement: string;
  answer_sheet_available?: boolean;
  full_report_available?: boolean;
}

export interface ExamActionPlan {
  exam_id: string;
  exam_name: string;
  published_on: string;
  summary: string;
  needs_focus_count: number;
  revise_count: number;
  keep_going_count: number;
  subjects: SubjectActionPlan[];
}

export interface ActionTabPayload {
  exams: ExamActionPlan[];
}

// Per-child precomputed payload
const actionData: Record<string, ActionTabPayload> = {
  '1': {
    exams: [
      {
        exam_id: 'fa1',
        exam_name: 'FA1',
        published_on: '2025-07-20',
        summary: 'Hindi needs focus. Mathematics and Science remain strong.',
        needs_focus_count: 1,
        revise_count: 1,
        keep_going_count: 4,
        subjects: [
          {
            subject: 'Hindi',
            status: 'needs_focus',
            summary: 'Vyakaran is the main concern this term.',
            revise_now: ['Sandhi & Samas', 'Complete nibandh', 'Vocabulary'],
            marks_lost_due_to: [
              'Grammar mistakes reduced marks',
              'Nibandh was incomplete',
            ],
            weak_topics: ['Sandhi', 'Samas', 'Nibandh'],
            before_next_exam: [
              'Daily 10-minute Vyakaran practice',
              'Plan nibandh outline before writing',
            ],
            encouragement: 'Comprehension shows clear potential.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'English',
            status: 'revise',
            summary: 'Grammar needs consistent practice.',
            revise_now: ['Tenses', 'Spellings'],
            marks_lost_due_to: ['Tense errors', 'A few spelling mistakes'],
            weak_topics: ['Tenses', 'Spelling'],
            before_next_exam: ['Daily short grammar drill', 'Spelling list revision'],
            encouragement: 'Reading comprehension is strong.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Mathematics',
            status: 'keep_going',
            summary: 'Strong start to the year.',
            revise_now: ['Mensuration steps'],
            marks_lost_due_to: ['One small calculation error'],
            weak_topics: ['Mensuration'],
            before_next_exam: ['Show all steps clearly'],
            encouragement: 'Great beginning — keep it up.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Science',
            status: 'keep_going',
            summary: 'Excellent diagram work in Cell chapter.',
            revise_now: ['Cell labelling'],
            marks_lost_due_to: ['Missed labelling in cell diagram'],
            weak_topics: ['Cell labelling'],
            before_next_exam: ['Skim diagrams once'],
            encouragement: 'Diagrams are very neat.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Social Science',
            status: 'keep_going',
            summary: 'Good understanding of Constitution.',
            revise_now: ['Map work – Resources'],
            marks_lost_due_to: ['Map work was incomplete'],
            weak_topics: ['Geography maps'],
            before_next_exam: ['Practise one map this week'],
            encouragement: 'History is consistent.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Kannada',
            status: 'keep_going',
            summary: 'Good prose comprehension.',
            revise_now: ['Vibhakti basics'],
            marks_lost_due_to: ['Grammar errors in vibhakti'],
            weak_topics: ['Vyakarana'],
            before_next_exam: ['Light grammar revision'],
            encouragement: 'Good effort overall.',
            answer_sheet_available: true,
            full_report_available: true,
          },
        ],
      },
      {
        exam_id: 'fa2',
        exam_name: 'FA2',
        published_on: '2025-09-15',
        summary: 'Hindi still needs focus. Science improved noticeably.',
        needs_focus_count: 1,
        revise_count: 0,
        keep_going_count: 5,
        subjects: [
          {
            subject: 'Hindi',
            status: 'needs_focus',
            summary: 'Slight improvement but Vyakaran still weak.',
            revise_now: ['Sandhi rules', 'Long-answer structure'],
            marks_lost_due_to: ['Sandhi errors', 'Some answers lacked detail'],
            weak_topics: ['Sandhi', 'Long-answer writing'],
            before_next_exam: [
              'Continue daily Vyakaran practice',
              'Write one structured long answer per day',
            ],
            encouragement: 'Improvement is visible — stay consistent.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Mathematics',
            status: 'keep_going',
            summary: 'Consistent performance in algebra.',
            revise_now: ['Linear equations steps'],
            marks_lost_due_to: ['Missed showing steps'],
            weak_topics: ['Linear equations'],
            before_next_exam: ['Show all working steps'],
            encouragement: 'Steady and strong.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Science',
            status: 'keep_going',
            summary: 'Improved in chemical equations balancing.',
            revise_now: ['Force & Pressure units'],
            marks_lost_due_to: ['Minor unit error'],
            weak_topics: ['Force & Pressure'],
            before_next_exam: ['Quick unit revision'],
            encouragement: 'Excellent improvement!',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'English',
            status: 'keep_going',
            summary: 'Writing has improved in essay section.',
            revise_now: ['Tense usage'],
            marks_lost_due_to: ['Tense errors in comprehension'],
            weak_topics: ['Tenses'],
            before_next_exam: ['Brief tense revision'],
            encouragement: 'Good progress in writing.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Social Science',
            status: 'keep_going',
            summary: 'Geography improving in Land & Soil.',
            revise_now: ['Key dates'],
            marks_lost_due_to: ['Date errors in Revolt of 1857'],
            weak_topics: ['History dates'],
            before_next_exam: ['Make a small dates sheet'],
            encouragement: 'Good improvement in maps.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Kannada',
            status: 'keep_going',
            summary: 'Improved padya section.',
            revise_now: ['Vibhakti pratyaya'],
            marks_lost_due_to: ['Vibhakti pratyaya errors'],
            weak_topics: ['Vyakarana'],
            before_next_exam: ['Light grammar revision'],
            encouragement: 'Good improvement.',
            answer_sheet_available: true,
            full_report_available: true,
          },
        ],
      },
      {
        exam_id: 'fa4',
        exam_name: 'FA4',
        published_on: '2026-02-22',
        summary: 'English needs light revision. Mathematics and Science remain strong.',
        needs_focus_count: 0,
        revise_count: 1,
        keep_going_count: 4,
        subjects: [
          {
            subject: 'English',
            status: 'revise',
            summary: 'Light revision needed in tense usage and vocabulary.',
            revise_now: ['Tense usage in letters', 'Vocabulary practice', 'Essay structure'],
            marks_lost_due_to: ['Tense errors in letter writing', 'A few vocabulary slips'],
            weak_topics: ['Letter writing', 'Vocabulary'],
            before_next_exam: [
              'Revise tense rules briefly',
              'Practise one short letter daily',
              'Review last deducted answers',
            ],
            encouragement: 'Comprehension is consistently strong — keep that going.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Mathematics',
            status: 'keep_going',
            summary: 'Performance remains strong with only minor step errors.',
            revise_now: ['Word problems'],
            marks_lost_due_to: ['A few steps were skipped'],
            weak_topics: ['Direct & Inverse Proportions'],
            before_next_exam: ['Continue regular practice', 'Check steps before submitting'],
            encouragement: 'Mathematics remains a strong subject.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Science',
            status: 'keep_going',
            summary: 'Excellent grasp of Sound and Light chapters.',
            revise_now: ['Chemical effects of current'],
            marks_lost_due_to: ['One small reasoning slip'],
            weak_topics: ['Chemical Effects of Electric Current'],
            before_next_exam: ['Maintain current revision rhythm', 'Quickly skim diagrams'],
            encouragement: 'Diagrams and theory are both consistently accurate.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Hindi',
            status: 'keep_going',
            summary: 'Steady improvement compared to earlier exams.',
            revise_now: ['Samas basics'],
            marks_lost_due_to: ['Minor grammar slips'],
            weak_topics: ['Vyakaran – Samas'],
            before_next_exam: ['Review samas types once', 'Read one short passage daily'],
            encouragement: 'Clear improvement curve — keep building on it.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Social Science',
            status: 'keep_going',
            summary: 'Strong across History and Geography.',
            revise_now: ['Civics – Judiciary'],
            marks_lost_due_to: ['One civics answer was incomplete'],
            weak_topics: ['Judiciary'],
            before_next_exam: ['Revise judiciary chapter once'],
            encouragement: 'Map work has clearly improved this term.',
            answer_sheet_available: true,
            full_report_available: true,
          },
        ],
      },
      {
        exam_id: 'fa3',
        exam_name: 'FA3',
        published_on: '2026-01-19',
        summary: 'Hindi needs focus. Mathematics remains a strength.',
        needs_focus_count: 1,
        revise_count: 1,
        keep_going_count: 3,
        subjects: [
          {
            subject: 'Hindi',
            status: 'needs_focus',
            summary: 'Recurring weakness in grammar and answer completeness.',
            revise_now: ['Grammar accuracy', 'Complete long answers', 'Definitions and examples'],
            marks_lost_due_to: [
              'Answers were often incomplete',
              'Grammar mistakes reduced marks',
              'Supporting examples were missing',
            ],
            weak_topics: ['Grammar – Samas', 'Patra Lekhan', 'Long-answer writing'],
            before_next_exam: [
              'Revise Hindi before other subjects',
              'Rework deducted answers once',
              'Practise complete, structured responses',
            ],
            encouragement: 'Improvement is possible with focused revision.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'English',
            status: 'revise',
            summary: 'Essay structure needs a quick revision.',
            revise_now: ['Essay structure', 'Active-Passive voice'],
            marks_lost_due_to: ['Essay structure was weak'],
            weak_topics: ['Essay writing'],
            before_next_exam: ['Practise one essay outline', 'Review active-passive rules'],
            encouragement: 'Comprehension and grammar are both improving.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Mathematics',
            status: 'keep_going',
            summary: 'Best math score — Data Handling was perfect.',
            revise_now: ['Factorisation'],
            marks_lost_due_to: ['One small simplification slip'],
            weak_topics: ['Factorisation'],
            before_next_exam: ['Keep daily practice rhythm'],
            encouragement: 'Math has improved tremendously this term.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Science',
            status: 'keep_going',
            summary: 'Reproduction and Cell Structure remain strong.',
            revise_now: ['Friction formulas'],
            marks_lost_due_to: ['Missed one formula'],
            weak_topics: ['Friction'],
            before_next_exam: ['Skim formula sheet'],
            encouragement: 'Consistent and accurate work overall.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Kannada',
            status: 'keep_going',
            summary: 'Best Kannada score this year.',
            revise_now: ['Alankaara identification'],
            marks_lost_due_to: ['One identification error'],
            weak_topics: ['Alankaara'],
            before_next_exam: ['Quick alankaara revision'],
            encouragement: 'Excellent improvement.',
            answer_sheet_available: true,
            full_report_available: true,
          },
        ],
      },
      {
        exam_id: 'sa1',
        exam_name: 'SA1',
        published_on: '2025-11-24',
        summary: 'Hindi needs focus. Geography map work needs revision.',
        needs_focus_count: 1,
        revise_count: 2,
        keep_going_count: 3,
        subjects: [
          {
            subject: 'Hindi',
            status: 'needs_focus',
            summary: 'Below class average — Vyakaran is the main concern.',
            revise_now: ['Sandhi & Samas', 'Nibandh structure', 'Vocabulary'],
            marks_lost_due_to: [
              'Grammar mistakes reduced many marks',
              'Nibandh was incomplete',
              'Some answers lacked detail',
            ],
            weak_topics: ['Sandhi', 'Samas', 'Nibandh'],
            before_next_exam: [
              'Daily 15-minute Vyakaran practice',
              'Plan nibandh outline before writing',
              'Revise key vocabulary',
            ],
            encouragement: 'Creative writing shows clear potential.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'English',
            status: 'revise',
            summary: 'Grammar needs consistent practice.',
            revise_now: ['Tenses', 'Spellings', 'Essay flow'],
            marks_lost_due_to: ['Tense errors in essay', 'A few spelling mistakes'],
            weak_topics: ['Tenses', 'Spelling'],
            before_next_exam: ['Daily short grammar drill', 'Spelling list revision'],
            encouragement: 'Reading comprehension is genuinely strong.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Social Science',
            status: 'revise',
            summary: 'History is strong; Geography map work needs attention.',
            revise_now: ['Map work – Resources', 'Dates in Colonialism'],
            marks_lost_due_to: ['Map was incomplete', 'A couple of date errors'],
            weak_topics: ['Geography maps'],
            before_next_exam: ['Practise 2 maps this week', 'Make a small dates sheet'],
            encouragement: 'History continues to be a strength.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Mathematics',
            status: 'keep_going',
            summary: 'Strong overall — Algebraic Expressions was excellent.',
            revise_now: ['Mensuration steps'],
            marks_lost_due_to: ['Some steps were missed'],
            weak_topics: ['Mensuration'],
            before_next_exam: ['Show all working steps clearly'],
            encouragement: 'Very good performance overall.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Science',
            status: 'keep_going',
            summary: 'Excellent — Reproduction chapter is strongest.',
            revise_now: ['Equation balancing'],
            marks_lost_due_to: ['One balancing slip'],
            weak_topics: ['Metals & Non-Metals'],
            before_next_exam: ['Quick equation practice'],
            encouragement: 'Diagrams are excellent.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'Kannada',
            status: 'keep_going',
            summary: 'Consistent performance overall.',
            revise_now: ['Vyakarana basics'],
            marks_lost_due_to: ['A few grammar errors'],
            weak_topics: ['Vyakarana'],
            before_next_exam: ['Light grammar revision'],
            encouragement: 'Keep up the consistent effort.',
            answer_sheet_available: true,
            full_report_available: true,
          },
        ],
      },
    ],
  },
  '2': {
    exams: [
      {
        exam_id: 'fa2',
        exam_name: 'FA2',
        published_on: '2025-09-15',
        summary: 'No major concerns. Maintain current performance.',
        needs_focus_count: 0,
        revise_count: 0,
        keep_going_count: 3,
        subjects: [
          {
            subject: 'Mathematics',
            status: 'keep_going',
            summary: 'Strong and steady.',
            revise_now: ['Times tables'],
            marks_lost_due_to: ['One small calculation slip'],
            weak_topics: ['Multiplication speed'],
            before_next_exam: ['Continue daily practice'],
            encouragement: 'Math is a clear strength.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'EVS',
            status: 'keep_going',
            summary: 'Good understanding across chapters.',
            revise_now: ['Plant parts'],
            marks_lost_due_to: ['One labelling miss'],
            weak_topics: ['Plant labelling'],
            before_next_exam: ['Skim diagrams once'],
            encouragement: 'Diagrams are neat and accurate.',
            answer_sheet_available: true,
            full_report_available: true,
          },
          {
            subject: 'English',
            status: 'keep_going',
            summary: 'Reading and writing both consistent.',
            revise_now: ['Spellings'],
            marks_lost_due_to: ['Two spelling errors'],
            weak_topics: ['Spelling'],
            before_next_exam: ['Daily 5-word spelling list'],
            encouragement: 'Reading fluency is excellent.',
            answer_sheet_available: true,
            full_report_available: true,
          },
        ],
      },
    ],
  },
};

export const getActionPayload = (childId: string): ActionTabPayload => {
  return actionData[childId] ?? { exams: [] };
};

export const getExamActionPlan = (childId: string, examId: string): ExamActionPlan | null => {
  return getActionPayload(childId).exams.find(e => e.exam_id === examId) ?? null;
};

export const getSubjectActionPlan = (
  childId: string,
  examId: string,
  subject: string
): { exam: ExamActionPlan; subject: SubjectActionPlan } | null => {
  const exam = getExamActionPlan(childId, examId);
  if (!exam) return null;
  const subj = exam.subjects.find(s => s.subject.toLowerCase() === subject.toLowerCase());
  if (!subj) return null;
  return { exam, subject: subj };
};

export const STATUS_META: Record<
  ActionStatus,
  { label: string; chipClass: string; tintClass: string; iconColor: string; rank: number }
> = {
  needs_focus: {
    label: 'Needs Focus',
    chipClass: 'bg-orange-100 text-orange-700 border-orange-200',
    tintClass: 'bg-orange-50',
    iconColor: 'text-orange-600',
    rank: 0,
  },
  revise: {
    label: 'Revise',
    chipClass: 'bg-blue-100 text-blue-700 border-blue-200',
    tintClass: 'bg-blue-50',
    iconColor: 'text-blue-600',
    rank: 1,
  },
  keep_going: {
    label: 'Keep Going',
    chipClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    tintClass: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    rank: 2,
  },
};
