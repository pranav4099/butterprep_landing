export interface MasterExam {
  id: string;
  exam_name: string;
  term: string;
  academic_year: string;
  components?: { name: string; max_marks: number }[];
}

export interface QuickAssessment {
  id: string;
  master_exam_id: string;
  class_id: string;
  className: string;
  section: string;
  subject_id: string;
  subject: string;
  teacher_id: string;
  assessment_type: 'oral' | 'practical';
  title: string;
  assessment_date: string;
  total_marks: number;
  instructions: string;
  status: 'draft' | 'active' | 'finalized';
  created_at: string;
  updated_at: string;
}

export interface QuickAssessmentScore {
  id: string;
  quick_assessment_id: string;
  student_id: string;
  marks_obtained: number | null;
  absent: boolean;
  remark: string;
  graded_at: string | null;
}

export interface StudentRecord {
  id: string;
  roll_no: number;
  name: string;
  class_id: string;
}

export const masterExams: MasterExam[] = [
  { id: 'fa1', exam_name: 'FA1 (Formative Assessment 1)', term: 'Term 1', academic_year: '2025-2026', components: [{ name: 'Written', max_marks: 20 }, { name: 'Oral', max_marks: 10 }, { name: 'Practical', max_marks: 10 }] },
  { id: 'fa2', exam_name: 'FA2 (Formative Assessment 2)', term: 'Term 1', academic_year: '2025-2026', components: [{ name: 'Written', max_marks: 20 }, { name: 'Oral', max_marks: 10 }] },
  { id: 'sa1', exam_name: 'SA1 (Summative Assessment 1)', term: 'Term 1', academic_year: '2025-2026', components: [{ name: 'Written', max_marks: 40 }, { name: 'Practical', max_marks: 20 }] },
  { id: 'fa3', exam_name: 'FA3 (Formative Assessment 3)', term: 'Term 2', academic_year: '2025-2026' },
  { id: 'fa4', exam_name: 'FA4 (Formative Assessment 4)', term: 'Term 2', academic_year: '2025-2026' },
  { id: 'sa2', exam_name: 'SA2 (Summative Assessment 2)', term: 'Term 2', academic_year: '2025-2026' },
];

export const teacherClasses = [
  { id: 'c6a', className: 'Class 6', section: 'A' },
  { id: 'c7b', className: 'Class 7', section: 'B' },
  { id: 'c8a', className: 'Class 8', section: 'A' },
  { id: 'c8b', className: 'Class 8', section: 'B' },
  { id: 'c5c', className: 'Class 5', section: 'C' },
];

export const teacherSubjects = [
  { id: 's1', name: 'Kannada', classIds: ['c6a', 'c8a'] },
  { id: 's2', name: 'English', classIds: ['c7b', 'c8b'] },
  { id: 's3', name: 'Science', classIds: ['c8a', 'c8b'] },
  { id: 's4', name: 'Hindi', classIds: ['c5c'] },
];

export const mockStudents: StudentRecord[] = [
  { id: 'st1', roll_no: 1, name: 'Aarav Sharma', class_id: 'c6a' },
  { id: 'st2', roll_no: 2, name: 'Aditi Rao', class_id: 'c6a' },
  { id: 'st3', roll_no: 3, name: 'Ananya Kulkarni', class_id: 'c6a' },
  { id: 'st4', roll_no: 4, name: 'Arjun Reddy', class_id: 'c6a' },
  { id: 'st5', roll_no: 5, name: 'Bhavya Patil', class_id: 'c6a' },
  { id: 'st6', roll_no: 6, name: 'Chirag Desai', class_id: 'c6a' },
  { id: 'st7', roll_no: 7, name: 'Deepa Hegde', class_id: 'c6a' },
  { id: 'st8', roll_no: 8, name: 'Eshan Gupta', class_id: 'c6a' },
  { id: 'st9', roll_no: 9, name: 'Fatima Khan', class_id: 'c6a' },
  { id: 'st10', roll_no: 10, name: 'Ganesh Joshi', class_id: 'c6a' },
  { id: 'st11', roll_no: 11, name: 'Harini Nair', class_id: 'c6a' },
  { id: 'st12', roll_no: 12, name: 'Ishaan Mehta', class_id: 'c6a' },
  { id: 'st13', roll_no: 1, name: 'Kavya Shetty', class_id: 'c7b' },
  { id: 'st14', roll_no: 2, name: 'Lakshmi Iyer', class_id: 'c7b' },
  { id: 'st15', roll_no: 3, name: 'Mohan Das', class_id: 'c7b' },
  { id: 'st16', roll_no: 4, name: 'Nandini Pai', class_id: 'c7b' },
  { id: 'st17', roll_no: 5, name: 'Omkar Bhat', class_id: 'c7b' },
  { id: 'st18', roll_no: 6, name: 'Priya Menon', class_id: 'c7b' },
  { id: 'st19', roll_no: 7, name: 'Rahul Verma', class_id: 'c7b' },
  { id: 'st20', roll_no: 8, name: 'Sneha Gowda', class_id: 'c7b' },
  { id: 'st21', roll_no: 1, name: 'Tanvi Acharya', class_id: 'c8a' },
  { id: 'st22', roll_no: 2, name: 'Uday Kiran', class_id: 'c8a' },
  { id: 'st23', roll_no: 3, name: 'Varun Prasad', class_id: 'c8a' },
  { id: 'st24', roll_no: 4, name: 'Yamini Rao', class_id: 'c8a' },
  { id: 'st25', roll_no: 5, name: 'Zara Ahmed', class_id: 'c8a' },
  { id: 'st26', roll_no: 6, name: 'Aditya Naik', class_id: 'c8a' },
  { id: 'st27', roll_no: 7, name: 'Bhoomika Sagar', class_id: 'c8a' },
  { id: 'st28', roll_no: 8, name: 'Chetan Kumar', class_id: 'c8a' },
  { id: 'st29', roll_no: 9, name: 'Divya Ballal', class_id: 'c8a' },
  { id: 'st30', roll_no: 10, name: 'Eshwar Gowda', class_id: 'c8a' },
  { id: 'st31', roll_no: 1, name: 'Farhaan Syed', class_id: 'c8b' },
  { id: 'st32', roll_no: 2, name: 'Gauri Kamath', class_id: 'c8b' },
  { id: 'st33', roll_no: 3, name: 'Hari Prasad', class_id: 'c8b' },
  { id: 'st34', roll_no: 4, name: 'Indu Sharma', class_id: 'c8b' },
  { id: 'st35', roll_no: 5, name: 'Jayant Rao', class_id: 'c8b' },
  { id: 'st36', roll_no: 1, name: 'Karthik Bhat', class_id: 'c5c' },
  { id: 'st37', roll_no: 2, name: 'Lavanya Patel', class_id: 'c5c' },
  { id: 'st38', roll_no: 3, name: 'Manjunath G', class_id: 'c5c' },
  { id: 'st39', roll_no: 4, name: 'Nisha Shetty', class_id: 'c5c' },
  { id: 'st40', roll_no: 5, name: 'Pavan Kumar', class_id: 'c5c' },
];

export const mockQuickAssessments: QuickAssessment[] = [
  {
    id: 'qa1', master_exam_id: 'fa1', class_id: 'c6a', className: 'Class 6', section: 'A',
    subject_id: 's1', subject: 'Kannada', teacher_id: 't1', assessment_type: 'oral',
    title: 'Reading Aloud', assessment_date: '2025-12-10', total_marks: 10,
    instructions: 'Evaluate fluency, pronunciation, and expression while reading the prescribed passage.',
    status: 'active', created_at: '2025-12-08', updated_at: '2025-12-12',
  },
  {
    id: 'qa2', master_exam_id: 'fa1', class_id: 'c7b', className: 'Class 7', section: 'B',
    subject_id: 's2', subject: 'English', teacher_id: 't1', assessment_type: 'oral',
    title: 'Speaking Assessment', assessment_date: '2025-12-12', total_marks: 20,
    instructions: 'Assess grammar usage, vocabulary, confidence, and clarity of speech.',
    status: 'active', created_at: '2025-12-10', updated_at: '2025-12-14',
  },
  {
    id: 'qa3', master_exam_id: 'fa1', class_id: 'c8a', className: 'Class 8', section: 'A',
    subject_id: 's3', subject: 'Science', teacher_id: 't1', assessment_type: 'practical',
    title: 'Lab Observation', assessment_date: '2025-12-14', total_marks: 15,
    instructions: 'Observe lab technique, accuracy of readings, and proper documentation.',
    status: 'draft', created_at: '2025-12-12', updated_at: '2025-12-12',
  },
  {
    id: 'qa4', master_exam_id: 'sa1', class_id: 'c5c', className: 'Class 5', section: 'C',
    subject_id: 's4', subject: 'Hindi', teacher_id: 't1', assessment_type: 'oral',
    title: 'Recitation', assessment_date: '2025-12-16', total_marks: 10,
    instructions: 'Evaluate memorization, pronunciation, rhythm, and expression.',
    status: 'finalized', created_at: '2025-12-14', updated_at: '2025-12-18',
  },
];

// Pre-populated scores for qa1 (partially graded) and qa4 (fully graded/finalized)
export const mockScores: QuickAssessmentScore[] = [
  // qa1 - 5 of 12 graded
  { id: 'sc1', quick_assessment_id: 'qa1', student_id: 'st1', marks_obtained: 8, absent: false, remark: 'Good fluency', graded_at: '2025-12-10' },
  { id: 'sc2', quick_assessment_id: 'qa1', student_id: 'st2', marks_obtained: 9, absent: false, remark: 'Excellent expression', graded_at: '2025-12-10' },
  { id: 'sc3', quick_assessment_id: 'qa1', student_id: 'st3', marks_obtained: 6, absent: false, remark: 'Needs work on pronunciation', graded_at: '2025-12-10' },
  { id: 'sc4', quick_assessment_id: 'qa1', student_id: 'st4', marks_obtained: null, absent: true, remark: '', graded_at: '2025-12-10' },
  { id: 'sc5', quick_assessment_id: 'qa1', student_id: 'st5', marks_obtained: 7, absent: false, remark: '', graded_at: '2025-12-10' },
  // qa4 - all 5 graded (finalized)
  { id: 'sc6', quick_assessment_id: 'qa4', student_id: 'st36', marks_obtained: 9, absent: false, remark: 'Beautiful recitation', graded_at: '2025-12-16' },
  { id: 'sc7', quick_assessment_id: 'qa4', student_id: 'st37', marks_obtained: 8, absent: false, remark: 'Good rhythm', graded_at: '2025-12-16' },
  { id: 'sc8', quick_assessment_id: 'qa4', student_id: 'st38', marks_obtained: 7, absent: false, remark: '', graded_at: '2025-12-16' },
  { id: 'sc9', quick_assessment_id: 'qa4', student_id: 'st39', marks_obtained: null, absent: true, remark: 'Medical leave', graded_at: '2025-12-16' },
  { id: 'sc10', quick_assessment_id: 'qa4', student_id: 'st40', marks_obtained: 10, absent: false, remark: 'Perfect', graded_at: '2025-12-16' },
];
