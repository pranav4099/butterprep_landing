import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChildProfile {
  id: string;
  name: string;
  className: string;
  section: string;
  rollNumber: string;
  schoolName: string;
}

export interface MarksBreakdown {
  category: string;
  obtained: number;
  total: number;
}

export type ExamType = 'FA1' | 'FA2' | 'SA1' | 'FA3' | 'FA4' | 'SA2';

export interface ExamResult {
  id: string;
  examType: ExamType;
  examName: string;
  subject: string;
  score: number;
  total: number;
  classAverage: number;
  totalStudents: number;
  studentsAboveAvg: number;
  date: string;
  answerSheetPages: string[];
  insights: string[];
  reasonsMarksLost: string[];
  teacherFeedback: string;
  marksBreakdown: MarksBreakdown[];
}

export interface TopicAnalysis {
  topic: string;
  status: 'strong' | 'needs-practice';
  score?: number;
  total?: number;
  remark?: string;
}

export interface ChapterAnalysis {
  chapter: string;
  topics: TopicAnalysis[];
  score?: number;
  total?: number;
  deductions?: string[];
  positives?: string[];
}

export interface SubjectInsight {
  subject: string;
  chapterAnalysis: ChapterAnalysis[];
  /** @deprecated Use chapterAnalysis instead */
  topicAnalysis: TopicAnalysis[];
  commonMistakes: string[];
  parentActions: string[];
}

export interface SubjectProgress {
  subject: string;
  scores: { examName: string; score: number; total: number }[];
}

export interface ParentNotification {
  id: string;
  type: 'result' | 'answer_sheet' | 'feedback';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface ParentContextType {
  children: ChildProfile[];
  selectedChild: ChildProfile | null;
  selectChild: (child: ChildProfile) => void;
  getExamResults: () => ExamResult[];
  getLatestExam: () => ExamResult | null;
  getStrengths: () => string[];
  getWeaknesses: () => { area: string; reason: string }[];
  getProgress: () => SubjectProgress[];
  getInsights: () => string[];
  getActions: () => string[];
  getNotifications: () => ParentNotification[];
  markNotificationRead: (id: string) => void;
  getSubjectInsight: (subject: string) => SubjectInsight | null;
  getOverallAverage: () => number;
  getStrongSubjects: () => string[];
  getNeedsAttentionSubjects: () => string[];
}

const ParentContext = createContext<ParentContextType | undefined>(undefined);

const mockChildren: ChildProfile[] = [
  { id: '1', name: 'Rahul Sharma', className: '8', section: 'A', rollNumber: '23', schoolName: 'Kendriya Vidyalaya, Bangalore' },
  { id: '2', name: 'Ananya Sharma', className: '5', section: 'B', rollNumber: '11', schoolName: 'Kendriya Vidyalaya, Bangalore' },
];

const examTypeOrder: ExamType[] = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];

const mockExamResults: Record<string, ExamResult[]> = {
  '1': [
    // FA1
    { id: 'e1', examType: 'FA1', examName: 'FA1 – Mathematics', subject: 'Mathematics', score: 18, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 13, date: '2025-07-15', answerSheetPages: ['/placeholder.svg', '/placeholder.svg'], insights: ['Strong start to the year in Math.'], reasonsMarksLost: ['Minor calculation error in mensuration (2 marks)'], teacherFeedback: 'Great beginning. Keep it up!', marksBreakdown: [{ category: 'Concept', obtained: 9, total: 10 }, { category: 'Application', obtained: 9, total: 10 }] },
    { id: 'e2', examType: 'FA1', examName: 'FA1 – Science', subject: 'Science', score: 17, total: 20, classAverage: 14, totalStudents: 42, studentsAboveAvg: 14, date: '2025-07-16', answerSheetPages: ['/placeholder.svg'], insights: ['Excellent diagram work in Cell chapter.'], reasonsMarksLost: ['Missed labelling in cell diagram (2 marks)'], teacherFeedback: 'Very neat diagrams.', marksBreakdown: [{ category: 'Theory', obtained: 8, total: 9 }, { category: 'Diagrams', obtained: 9, total: 11 }] },
    { id: 'e3', examType: 'FA1', examName: 'FA1 – English', subject: 'English', score: 14, total: 20, classAverage: 13, totalStudents: 42, studentsAboveAvg: 24, date: '2025-07-17', answerSheetPages: ['/placeholder.svg'], insights: ['Comprehension from Honeydew is strong.'], reasonsMarksLost: ['Grammar errors in tenses (5 marks)', 'Spelling mistakes (3 marks)'], teacherFeedback: 'Work on grammar rules.', marksBreakdown: [{ category: 'Comprehension', obtained: 8, total: 8 }, { category: 'Grammar', obtained: 3, total: 6 }, { category: 'Writing', obtained: 4, total: 6 }] },
    { id: 'e4', examType: 'FA1', examName: 'FA1 – Hindi', subject: 'Hindi', score: 11, total: 20, classAverage: 14, totalStudents: 42, studentsAboveAvg: 23, date: '2025-07-18', answerSheetPages: ['/placeholder.svg'], insights: ['Vyakaran needs consistent practice.'], reasonsMarksLost: ['Vyakaran errors in sandhi & samas (8 marks)', 'Incomplete nibandh (4 marks)'], teacherFeedback: 'Needs to practice grammar daily.', marksBreakdown: [{ category: 'Grammar', obtained: 3, total: 8 }, { category: 'Comprehension', obtained: 5, total: 6 }, { category: 'Writing', obtained: 3, total: 6 }] },
    { id: 'e5', examType: 'FA1', examName: 'FA1 – Social Science', subject: 'Social Science', score: 15, total: 20, classAverage: 14, totalStudents: 42, studentsAboveAvg: 19, date: '2025-07-19', answerSheetPages: ['/placeholder.svg'], insights: ['Good understanding of Indian Constitution.'], reasonsMarksLost: ['Map work incomplete in Resources chapter (4 marks)'], teacherFeedback: 'Practice map work more.', marksBreakdown: [{ category: 'History', obtained: 7, total: 7 }, { category: 'Geography', obtained: 4, total: 7 }, { category: 'Civics', obtained: 4, total: 6 }] },
    { id: 'e26', examType: 'FA1', examName: 'FA1 – Kannada', subject: 'Kannada', score: 16, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 24, date: '2025-07-20', answerSheetPages: ['/placeholder.svg'], insights: ['Good prose comprehension.'], reasonsMarksLost: ['Grammar errors in vibhakti (3 marks)', 'Incomplete prabandha (2 marks)'], teacherFeedback: 'Good effort. Practice grammar.', marksBreakdown: [{ category: 'Gadya', obtained: 7, total: 7 }, { category: 'Padya', obtained: 4, total: 5 }, { category: 'Vyakarana', obtained: 5, total: 8 }] },

    // FA2
    { id: 'e6', examType: 'FA2', examName: 'FA2 – Mathematics', subject: 'Mathematics', score: 18, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 16, date: '2025-09-10', answerSheetPages: ['/placeholder.svg'], insights: ['Consistent performance in algebra.'], reasonsMarksLost: ['Missed showing steps in linear equations (3 marks)'], teacherFeedback: 'Show all working steps.', marksBreakdown: [{ category: 'Concept', obtained: 9, total: 10 }, { category: 'Application', obtained: 9, total: 10 }] },
    { id: 'e7', examType: 'FA2', examName: 'FA2 – Science', subject: 'Science', score: 19, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 15, date: '2025-09-11', answerSheetPages: ['/placeholder.svg'], insights: ['Improved in chemical equations balancing.'], reasonsMarksLost: ['Minor unit error in Force & Pressure (1 mark)'], teacherFeedback: 'Excellent improvement!', marksBreakdown: [{ category: 'Theory', obtained: 9, total: 9 }, { category: 'Diagrams', obtained: 10, total: 11 }] },
    { id: 'e8', examType: 'FA2', examName: 'FA2 – English', subject: 'English', score: 15, total: 20, classAverage: 14, totalStudents: 42, studentsAboveAvg: 22, date: '2025-09-12', answerSheetPages: ['/placeholder.svg'], insights: ['Writing has improved in essay section.'], reasonsMarksLost: ['Tense errors in The Tsunami comprehension (4 marks)'], teacherFeedback: 'Good progress in writing.', marksBreakdown: [{ category: 'Comprehension', obtained: 7, total: 8 }, { category: 'Grammar', obtained: 4, total: 6 }, { category: 'Writing', obtained: 4, total: 6 }] },
    { id: 'e9', examType: 'FA2', examName: 'FA2 – Hindi', subject: 'Hindi', score: 13, total: 20, classAverage: 14, totalStudents: 42, studentsAboveAvg: 17, date: '2025-09-13', answerSheetPages: ['/placeholder.svg'], insights: ['Slight improvement in Vasant comprehension.'], reasonsMarksLost: ['Sandhi errors (6 marks)'], teacherFeedback: 'Improving but needs more effort.', marksBreakdown: [{ category: 'Grammar', obtained: 4, total: 8 }, { category: 'Comprehension', obtained: 5, total: 6 }, { category: 'Writing', obtained: 4, total: 6 }] },
    { id: 'e10', examType: 'FA2', examName: 'FA2 – Social Science', subject: 'Social Science', score: 16, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 24, date: '2025-09-14', answerSheetPages: ['/placeholder.svg'], insights: ['Geography improving in Land & Soil Resources.'], reasonsMarksLost: ['Date errors in history – Revolt of 1857 (2 marks)'], teacherFeedback: 'Good improvement in maps.', marksBreakdown: [{ category: 'History', obtained: 6, total: 7 }, { category: 'Geography', obtained: 5, total: 7 }, { category: 'Civics', obtained: 5, total: 6 }] },
    { id: 'e27', examType: 'FA2', examName: 'FA2 – Kannada', subject: 'Kannada', score: 17, total: 20, classAverage: 16, totalStudents: 42, studentsAboveAvg: 19, date: '2025-09-15', answerSheetPages: ['/placeholder.svg'], insights: ['Improved padya section.'], reasonsMarksLost: ['Vibhakti pratyaya errors (2 marks)'], teacherFeedback: 'Good improvement.', marksBreakdown: [{ category: 'Gadya', obtained: 7, total: 7 }, { category: 'Padya', obtained: 5, total: 5 }, { category: 'Vyakarana', obtained: 6, total: 8 }] },

    // SA1
    { id: 'e11', examType: 'SA1', examName: 'SA1 – Mathematics', subject: 'Mathematics', score: 34, total: 40, classAverage: 29, totalStudents: 42, studentsAboveAvg: 17, date: '2025-11-20', answerSheetPages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'], insights: ['Strong overall. Algebraic Expressions chapter was excellent.'], reasonsMarksLost: ['Missing steps in mensuration (4 marks)', 'Arithmetic error in exponents (2 marks)'], teacherFeedback: 'Very good performance. Keep practising word problems.', marksBreakdown: [{ category: 'Concept', obtained: 12, total: 13 }, { category: 'Application', obtained: 13, total: 15 }, { category: 'Accuracy', obtained: 9, total: 13 }] },
    { id: 'e12', examType: 'SA1', examName: 'SA1 – Science', subject: 'Science', score: 36, total: 40, classAverage: 31, totalStudents: 42, studentsAboveAvg: 19, date: '2025-11-21', answerSheetPages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'], insights: ['Excellent overall. Reproduction chapter is strongest.'], reasonsMarksLost: ['Chemical equation balancing in Metals & Non-Metals (2 marks)'], teacherFeedback: 'Outstanding work. Diagrams are excellent.', marksBreakdown: [{ category: 'Theory', obtained: 15, total: 15 }, { category: 'Diagrams', obtained: 9, total: 10 }, { category: 'Reasoning', obtained: 12, total: 15 }] },
    { id: 'e13', examType: 'SA1', examName: 'SA1 – English', subject: 'English', score: 28, total: 40, classAverage: 26, totalStudents: 42, studentsAboveAvg: 17, date: '2025-11-22', answerSheetPages: ['/placeholder.svg', '/placeholder.svg'], insights: ['Comprehension from Honeydew strong, grammar needs work.'], reasonsMarksLost: ['Tense errors in essay (6 marks)', 'Spelling in The Comet summary (4 marks)'], teacherFeedback: 'Good reading skills. Grammar needs consistent practice.', marksBreakdown: [{ category: 'Comprehension', obtained: 13, total: 14 }, { category: 'Grammar', obtained: 6, total: 12 }, { category: 'Writing', obtained: 9, total: 14 }] },
    { id: 'e14', examType: 'SA1', examName: 'SA1 – Hindi', subject: 'Hindi', score: 21, total: 40, classAverage: 25, totalStudents: 42, studentsAboveAvg: 24, date: '2025-11-23', answerSheetPages: ['/placeholder.svg', '/placeholder.svg'], insights: ['Below class average. Vyakaran is the main concern.'], reasonsMarksLost: ['Grammar errors in sandhi & samas (14 marks)', 'Incomplete nibandh (6 marks)'], teacherFeedback: 'Needs regular Vyakaran practice. Creative writing shows potential.', marksBreakdown: [{ category: 'Grammar', obtained: 6, total: 15 }, { category: 'Comprehension', obtained: 8, total: 11 }, { category: 'Writing', obtained: 7, total: 14 }] },
    { id: 'e15', examType: 'SA1', examName: 'SA1 – Social Science', subject: 'Social Science', score: 29, total: 40, classAverage: 27, totalStudents: 42, studentsAboveAvg: 24, date: '2025-11-24', answerSheetPages: ['/placeholder.svg', '/placeholder.svg'], insights: ['History – Our Pasts III is strong. Geography map work needs attention.'], reasonsMarksLost: ['Map incomplete – Resources & Development (6 marks)', 'Date errors in Colonialism chapter (2 marks)'], teacherFeedback: 'Good understanding. Focus on map work.', marksBreakdown: [{ category: 'History', obtained: 12, total: 13 }, { category: 'Geography', obtained: 7, total: 14 }, { category: 'Civics', obtained: 10, total: 13 }] },
    { id: 'e28', examType: 'SA1', examName: 'SA1 – Kannada', subject: 'Kannada', score: 30, total: 40, classAverage: 28, totalStudents: 42, studentsAboveAvg: 17, date: '2025-11-25', answerSheetPages: ['/placeholder.svg', '/placeholder.svg'], insights: ['Good overall. Vyakarana needs more practice.'], reasonsMarksLost: ['Grammar errors (8 marks)', 'Prabandha incomplete (4 marks)'], teacherFeedback: 'Consistent effort. Keep it up.', marksBreakdown: [{ category: 'Gadya', obtained: 12, total: 13 }, { category: 'Padya', obtained: 8, total: 10 }, { category: 'Vyakarana', obtained: 10, total: 17 }] },

    // FA3
    { id: 'e16', examType: 'FA3', examName: 'FA3 – Mathematics', subject: 'Mathematics', score: 19, total: 20, classAverage: 16, totalStudents: 42, studentsAboveAvg: 15, date: '2026-01-15', answerSheetPages: ['/placeholder.svg'], insights: ['Excellent. Best math score this year – Data Handling was perfect.'], reasonsMarksLost: ['Minor simplification error in factorisation (1 mark)'], teacherFeedback: 'Rahul has improved tremendously in Math.', marksBreakdown: [{ category: 'Concept', obtained: 10, total: 10 }, { category: 'Application', obtained: 9, total: 10 }] },
    { id: 'e17', examType: 'FA3', examName: 'FA3 – Science', subject: 'Science', score: 18, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 19, date: '2026-01-16', answerSheetPages: ['/placeholder.svg'], insights: ['Consistently strong in Reproduction & Cell Structure.'], reasonsMarksLost: ['Missed one formula in Friction chapter (2 marks)'], teacherFeedback: 'Very good. Keep it up.', marksBreakdown: [{ category: 'Theory', obtained: 9, total: 9 }, { category: 'Diagrams', obtained: 10, total: 11 }] },
    { id: 'e18', examType: 'FA3', examName: 'FA3 – English', subject: 'English', score: 16, total: 20, classAverage: 14, totalStudents: 42, studentsAboveAvg: 17, date: '2026-01-17', answerSheetPages: ['/placeholder.svg'], insights: ['Grammar improving steadily – active-passive better.'], reasonsMarksLost: ['Essay structure weak (3 marks)'], teacherFeedback: 'Grammar is improving. Work on essay structure.', marksBreakdown: [{ category: 'Comprehension', obtained: 8, total: 8 }, { category: 'Grammar', obtained: 5, total: 6 }, { category: 'Writing', obtained: 4, total: 6 }] },
    { id: 'e19', examType: 'FA3', examName: 'FA3 – Hindi', subject: 'Hindi', score: 14, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 23, date: '2026-01-18', answerSheetPages: ['/placeholder.svg'], insights: ['Slight improvement in Vasant but still needs practice.'], reasonsMarksLost: ['Samas errors (5 marks)', 'Spelling in patra lekhan (3 marks)'], teacherFeedback: 'Better than last time. Keep practising.', marksBreakdown: [{ category: 'Grammar', obtained: 5, total: 8 }, { category: 'Comprehension', obtained: 6, total: 6 }, { category: 'Writing', obtained: 4, total: 6 }] },
    { id: 'e20', examType: 'FA3', examName: 'FA3 – Social Science', subject: 'Social Science', score: 17, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 12, date: '2026-01-19', answerSheetPages: ['/placeholder.svg'], insights: ['Improved in geography – Industries chapter maps were good.'], reasonsMarksLost: ['One civics answer incomplete on Judiciary (2 marks)'], teacherFeedback: 'Good improvement in maps!', marksBreakdown: [{ category: 'History', obtained: 7, total: 7 }, { category: 'Geography', obtained: 6, total: 7 }, { category: 'Civics', obtained: 4, total: 6 }] },
    { id: 'e29', examType: 'FA3', examName: 'FA3 – Kannada', subject: 'Kannada', score: 18, total: 20, classAverage: 16, totalStudents: 42, studentsAboveAvg: 18, date: '2026-01-20', answerSheetPages: ['/placeholder.svg'], insights: ['Best Kannada score this year.'], reasonsMarksLost: ['Alankaara identification error (2 marks)'], teacherFeedback: 'Excellent improvement!', marksBreakdown: [{ category: 'Gadya', obtained: 7, total: 7 }, { category: 'Padya', obtained: 5, total: 5 }, { category: 'Vyakarana', obtained: 6, total: 8 }] },

    // FA4
    { id: 'e21', examType: 'FA4', examName: 'FA4 – Mathematics', subject: 'Mathematics', score: 19, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 17, date: '2026-02-20', answerSheetPages: ['/placeholder.svg'], insights: ['Maintaining high level in Factorisation & Graphs.'], reasonsMarksLost: ['Word problem step missed in Direct & Inverse Proportions (2 marks)'], teacherFeedback: 'Excellent consistency.', marksBreakdown: [{ category: 'Concept', obtained: 10, total: 10 }, { category: 'Application', obtained: 9, total: 10 }] },
    { id: 'e22', examType: 'FA4', examName: 'FA4 – Science', subject: 'Science', score: 19, total: 20, classAverage: 16, totalStudents: 42, studentsAboveAvg: 15, date: '2026-02-21', answerSheetPages: ['/placeholder.svg'], insights: ['Best science score – Sound & Light chapters excellent!'], reasonsMarksLost: ['Minor error in Chemical Effects of Electric Current (1 mark)'], teacherFeedback: 'Outstanding performance!', marksBreakdown: [{ category: 'Theory', obtained: 9, total: 9 }, { category: 'Diagrams', obtained: 10, total: 11 }] },
    { id: 'e23', examType: 'FA4', examName: 'FA4 – English', subject: 'English', score: 17, total: 20, classAverage: 14, totalStudents: 42, studentsAboveAvg: 13, date: '2026-02-22', answerSheetPages: ['/placeholder.svg'], insights: ['Continued improvement – The Great Stone Face comprehension was perfect.'], reasonsMarksLost: ['Tense error in letter writing (2 marks)', 'Vocabulary in A Short Monsoon Diary (1 mark)'], teacherFeedback: 'Very good progress this term.', marksBreakdown: [{ category: 'Comprehension', obtained: 8, total: 8 }, { category: 'Grammar', obtained: 5, total: 6 }, { category: 'Writing', obtained: 4, total: 6 }] },
    { id: 'e24', examType: 'FA4', examName: 'FA4 – Hindi', subject: 'Hindi', score: 15, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 24, date: '2026-02-23', answerSheetPages: ['/placeholder.svg'], insights: ['Above class average for the first time in Hindi!'], reasonsMarksLost: ['Samas errors (4 marks)', 'Incomplete answer in Vasant (2 marks)'], teacherFeedback: 'Good effort. Keep it going.', marksBreakdown: [{ category: 'Grammar', obtained: 5, total: 8 }, { category: 'Comprehension', obtained: 6, total: 6 }, { category: 'Writing', obtained: 5, total: 6 }] },
    { id: 'e25', examType: 'FA4', examName: 'FA4 – Social Science', subject: 'Social Science', score: 18, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 16, date: '2026-02-24', answerSheetPages: ['/placeholder.svg'], insights: ['Strong across History & Civics – Indian Constitution well understood.'], reasonsMarksLost: ['One incomplete answer on Public Facilities (2 marks)'], teacherFeedback: 'Well done!', marksBreakdown: [{ category: 'History', obtained: 7, total: 7 }, { category: 'Geography', obtained: 6, total: 7 }, { category: 'Civics', obtained: 5, total: 6 }] },
    { id: 'e35', examType: 'FA4', examName: 'FA4 – Kannada', subject: 'Kannada', score: 18, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 13, date: '2026-02-25', answerSheetPages: ['/placeholder.svg'], insights: ['Excellent – all sections improved.'], reasonsMarksLost: ['Minor grammar error (1 mark)'], teacherFeedback: 'Outstanding progress!', marksBreakdown: [{ category: 'Gadya', obtained: 7, total: 7 }, { category: 'Padya', obtained: 5, total: 5 }, { category: 'Vyakarana', obtained: 6, total: 8 }] },
  ],
  '2': [
    { id: 'e30', examType: 'FA1', examName: 'FA1 – Mathematics', subject: 'Mathematics', score: 18, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 19, date: '2025-07-15', answerSheetPages: ['/placeholder.svg'], insights: ['Very good start – Shapes & Angles chapter was perfect.'], reasonsMarksLost: ['Word problem incomplete in How Many Squares (3 marks)'], teacherFeedback: 'Bright student!', marksBreakdown: [{ category: 'Numbers', obtained: 9, total: 9 }, { category: 'Word Problems', obtained: 5, total: 6 }, { category: 'Shapes', obtained: 4, total: 5 }] },
    { id: 'e31', examType: 'FA1', examName: 'FA1 – English', subject: 'English', score: 17, total: 20, classAverage: 14, totalStudents: 42, studentsAboveAvg: 14, date: '2025-07-16', answerSheetPages: ['/placeholder.svg'], insights: ['Good reading skills from Marigold textbook.'], reasonsMarksLost: ['Spelling errors (3 marks)'], teacherFeedback: 'Good work!', marksBreakdown: [{ category: 'Reading', obtained: 8, total: 8 }, { category: 'Grammar', obtained: 5, total: 6 }, { category: 'Writing', obtained: 4, total: 6 }] },
    { id: 'e32', examType: 'FA2', examName: 'FA2 – Mathematics', subject: 'Mathematics', score: 19, total: 20, classAverage: 16, totalStudents: 42, studentsAboveAvg: 13, date: '2025-09-10', answerSheetPages: ['/placeholder.svg'], insights: ['Improving in word problems – Parts and Wholes better.'], reasonsMarksLost: ['One error in fractions (2 marks)'], teacherFeedback: 'Keep up the good work!', marksBreakdown: [{ category: 'Numbers', obtained: 9, total: 9 }, { category: 'Word Problems', obtained: 6, total: 6 }, { category: 'Shapes', obtained: 4, total: 5 }] },
    { id: 'e33', examType: 'SA1', examName: 'SA1 – Mathematics', subject: 'Mathematics', score: 35, total: 40, classAverage: 30, totalStudents: 42, studentsAboveAvg: 16, date: '2025-11-20', answerSheetPages: ['/placeholder.svg', '/placeholder.svg'], insights: ['Excellent performance across all chapters.'], reasonsMarksLost: ['Word problem steps missed in Be My Multiple (4 marks)'], teacherFeedback: 'Ananya is doing very well!', marksBreakdown: [{ category: 'Numbers', obtained: 15, total: 15 }, { category: 'Word Problems', obtained: 10, total: 13 }, { category: 'Shapes', obtained: 10, total: 12 }] },
    { id: 'e34', examType: 'FA1', examName: 'FA1 – EVS', subject: 'EVS', score: 18, total: 20, classAverage: 16, totalStudents: 42, studentsAboveAvg: 18, date: '2025-07-17', answerSheetPages: ['/placeholder.svg'], insights: ['Excellent understanding of plants and animals.'], reasonsMarksLost: ['Incomplete answer on water cycle (2 marks)'], teacherFeedback: 'Very observant student!', marksBreakdown: [{ category: 'Theory', obtained: 9, total: 9 }, { category: 'Application', obtained: 5, total: 6 }, { category: 'Diagrams', obtained: 4, total: 5 }] },
    { id: 'e36', examType: 'FA1', examName: 'FA1 – Kannada', subject: 'Kannada', score: 17, total: 20, classAverage: 15, totalStudents: 42, studentsAboveAvg: 16, date: '2025-07-18', answerSheetPages: ['/placeholder.svg'], insights: ['Good reading and writing.'], reasonsMarksLost: ['Spelling errors (3 marks)'], teacherFeedback: 'Keep reading Kannada stories.', marksBreakdown: [{ category: 'Odhu', obtained: 7, total: 7 }, { category: 'Baraha', obtained: 5, total: 6 }, { category: 'Vyakarana', obtained: 5, total: 7 }] },
  ],
};

const mockSubjectInsights: Record<string, SubjectInsight[]> = {
  '1': [
    {
      subject: 'Mathematics',
      chapterAnalysis: [
        { chapter: 'Ch 1: Rational Numbers', score: 14, total: 15, topics: [{ topic: 'Properties of rational numbers', status: 'strong', score: 8, total: 8 }, { topic: 'Representation on number line', status: 'strong', score: 6, total: 7 }], positives: ['Perfect understanding of closure & commutativity properties', 'All rational number operations solved correctly'], deductions: ['Minor plotting error between two rationals on the number line (–1 mark)'] },
        { chapter: 'Ch 2: Linear Equations in One Variable', score: 10, total: 14, topics: [{ topic: 'Solving linear equations', status: 'strong', score: 7, total: 7 }, { topic: 'Word problems on linear equations', status: 'needs-practice', score: 3, total: 7 }], positives: ['All direct equation-solving questions correct'], deductions: ['Could not translate 2 word problems into equations (–4 marks)', 'Skipped showing intermediate steps in one problem (–1 mark)'] },
        { chapter: 'Ch 3: Understanding Quadrilaterals', score: 12, total: 12, topics: [{ topic: 'Types of quadrilaterals', status: 'strong', score: 6, total: 6 }, { topic: 'Angle sum property', status: 'strong', score: 6, total: 6 }], positives: ['All quadrilateral types identified correctly', 'Angle sum property applied perfectly with clear diagrams'] },
        { chapter: 'Ch 6: Squares and Square Roots', score: 8, total: 12, topics: [{ topic: 'Finding square roots by prime factorisation', status: 'strong', score: 6, total: 6 }, { topic: 'Square roots of decimals', status: 'needs-practice', score: 2, total: 6 }], positives: ['Prime factorisation method applied correctly'], deductions: ['Skipped intermediate steps in decimal square root (–2 marks)', 'Wrong decimal placement in 2 answers (–2 marks)'] },
        { chapter: 'Ch 9: Algebraic Expressions and Identities', score: 10, total: 10, topics: [{ topic: 'Multiplication of polynomials', status: 'strong', score: 5, total: 5 }, { topic: 'Standard identities', status: 'strong', score: 5, total: 5 }], positives: ['Applied (a+b)² and (a–b)² correctly in all problems', 'Neat step-by-step working shown'] },
        { chapter: 'Ch 10: Visualising Solid Shapes', score: 8, total: 8, topics: [{ topic: "Euler's formula (F+V-E=2)", status: 'strong', score: 4, total: 4 }, { topic: 'Views of 3D shapes', status: 'strong', score: 4, total: 4 }], positives: ["Euler's formula applied correctly to all shapes", 'Top/front/side views drawn accurately'] },
        { chapter: 'Ch 11: Mensuration', score: 5, total: 12, topics: [{ topic: 'Area of trapezium & polygon', status: 'needs-practice', score: 3, total: 6 }, { topic: 'Surface area & volume of cube/cuboid', status: 'needs-practice', score: 2, total: 6 }], deductions: ['Used parallelogram formula instead of trapezium (–3 marks)', 'Unit conversion errors in volume calculation (–2 marks)', 'Missing final unit in 2 answers (–2 marks)'] },
        { chapter: 'Ch 13: Direct and Inverse Proportions', score: 6, total: 8, topics: [{ topic: 'Direct proportion problems', status: 'strong', score: 4, total: 4 }, { topic: 'Inverse proportion problems', status: 'needs-practice', score: 2, total: 4 }], positives: ['Direct proportion concepts well understood'], deductions: ['Used direct proportion method for an inverse proportion word problem (–2 marks)'] },
      ],
      topicAnalysis: [],
      commonMistakes: ['Missing calculation steps in mensuration', 'Arithmetic mistakes in decimal square roots', 'Confusing direct & inverse proportion'],
      parentActions: ['Practice Ch 11 Mensuration word problems 15 minutes daily', 'Encourage showing all steps in calculations', 'Use real-life examples for direct & inverse proportions'],
    },
    {
      subject: 'Science',
      chapterAnalysis: [
        { chapter: 'Ch 1: Crop Production and Management', score: 8, total: 8, topics: [{ topic: 'Agricultural practices & crop seasons', status: 'strong', score: 4, total: 4 }, { topic: 'Irrigation methods', status: 'strong', score: 4, total: 4 }], positives: ['All crop seasons identified correctly', 'Clear explanation of irrigation methods with examples'] },
        { chapter: 'Ch 2: Microorganisms: Friend and Foe', score: 7, total: 8, topics: [{ topic: 'Types of microorganisms', status: 'strong', score: 4, total: 4 }, { topic: 'Food preservation methods', status: 'strong', score: 3, total: 4 }], positives: ['Good classification of microorganisms'], deductions: ['Misspelled one preservation method name (–1 mark)'] },
        { chapter: 'Ch 4: Materials: Metals and Non-Metals', score: 10, total: 14, topics: [{ topic: 'Physical & chemical properties', status: 'strong', score: 7, total: 7 }, { topic: 'Reactivity series & displacement reactions', status: 'needs-practice', score: 3, total: 7 }], positives: ['Properties table drawn accurately'], deductions: ['Errors in balancing 2 displacement equations (–3 marks)', 'Wrote wrong product in one reaction (–1 mark)'] },
        { chapter: 'Ch 8: Cell — Structure and Functions', score: 14, total: 14, topics: [{ topic: 'Parts of cell & their functions', status: 'strong', score: 7, total: 7 }, { topic: 'Difference between plant & animal cell', status: 'strong', score: 7, total: 7 }], positives: ['Excellent labelled diagram of plant and animal cell', 'All differences listed correctly with examples'] },
        { chapter: 'Ch 9: Reproduction in Animals', score: 12, total: 12, topics: [{ topic: 'Sexual & asexual reproduction', status: 'strong', score: 6, total: 6 }, { topic: 'Stages of reproduction', status: 'strong', score: 6, total: 6 }], positives: ['All diagrams labelled perfectly', 'Clear distinction between sexual and asexual reproduction'] },
        { chapter: 'Ch 11: Force and Pressure', score: 9, total: 14, topics: [{ topic: 'Types of forces & pressure concepts', status: 'strong', score: 6, total: 7 }, { topic: 'Numerical problems on pressure', status: 'needs-practice', score: 3, total: 7 }], positives: ['Good conceptual understanding of force types'], deductions: ['Missing units in 3 final numerical answers (–3 marks)', 'Calculation error in one pressure problem (–2 marks)'] },
        { chapter: 'Ch 12: Friction', score: 7, total: 8, topics: [{ topic: 'Types of friction & factors', status: 'strong', score: 4, total: 4 }, { topic: 'Friction in daily life', status: 'strong', score: 3, total: 4 }], positives: ['All types of friction explained well'], deductions: ['Missed one daily-life example (–1 mark)'] },
        { chapter: 'Ch 14: Chemical Effects of Electric Current', score: 6, total: 8, topics: [{ topic: 'Conductors & insulators', status: 'strong', score: 4, total: 4 }, { topic: 'Electroplating process', status: 'needs-practice', score: 2, total: 4 }], positives: ['Conductors and insulators classified correctly'], deductions: ['Incomplete explanation of electroplating steps (–2 marks)'] },
      ],
      topicAnalysis: [],
      commonMistakes: ['Errors in balancing chemical equations', 'Missing units in numerical answers', 'Incomplete electroplating explanation'],
      parentActions: ['Practice balancing equations from Ch 4', 'Always write units — make it a habit', 'Watch NCERT experiment videos on YouTube for Ch 14'],
    },
    {
      subject: 'English',
      chapterAnalysis: [
        { chapter: 'Honeydew Ch 1: The Best Christmas Present in the World', score: 8, total: 8, topics: [{ topic: 'Reading comprehension & character analysis', status: 'strong', score: 8, total: 8 }], positives: ['All comprehension answers correct and well-articulated', 'Excellent character analysis with textual evidence'] },
        { chapter: 'Honeydew Ch 2: The Tsunami', score: 7, total: 8, topics: [{ topic: 'Comprehension & vocabulary', status: 'strong', score: 4, total: 4 }, { topic: 'Summary writing', status: 'strong', score: 3, total: 4 }], positives: ['Good vocabulary usage in answers'], deductions: ['Minor spelling error in summary (–1 mark)'] },
        { chapter: 'Honeydew Ch 5: The Great Stone Face – I', score: 6, total: 6, topics: [{ topic: 'Character sketch & moral', status: 'strong', score: 6, total: 6 }], positives: ['Well-written character sketch with clear moral understanding'] },
        { chapter: 'Honeydew Ch 7: A Visit to Cambridge', score: 5, total: 6, topics: [{ topic: 'Comprehension & inference', status: 'strong', score: 5, total: 6 }], positives: ['Good inferential answers'], deductions: ['One inference question partially answered (–1 mark)'] },
        { chapter: 'It So Happened Ch 3: The Selfish Giant', score: 6, total: 6, topics: [{ topic: 'Story comprehension & values', status: 'strong', score: 6, total: 6 }], positives: ['Beautiful expression of values and moral of the story'] },
        { chapter: 'Grammar: Tenses', score: 5, total: 12, topics: [{ topic: 'Present, past & future tenses', status: 'needs-practice', score: 3, total: 6 }, { topic: 'Tense consistency in writing', status: 'needs-practice', score: 2, total: 6 }], deductions: ['Confused past perfect with simple past in 3 answers (–3 marks)', 'Switched tenses mid-paragraph in essay question (–2 marks)', 'Wrong auxiliary verb used twice (–2 marks)'] },
        { chapter: 'Grammar: Active & Passive Voice', score: 3, total: 6, topics: [{ topic: 'Voice conversion rules', status: 'needs-practice', score: 3, total: 6 }], deductions: ['Used incorrect auxiliary verbs in 2 conversions (–2 marks)', 'Did not change tense while converting voice (–1 mark)'] },
        { chapter: 'Grammar: Direct & Indirect Speech', score: 4, total: 6, topics: [{ topic: 'Reporting verbs & tense changes', status: 'needs-practice', score: 4, total: 6 }], positives: ['Reporting verbs chosen correctly'], deductions: ['Forgot to change pronouns in 2 sentences (–2 marks)'] },
        { chapter: 'Writing: Essay & Letter Writing', score: 8, total: 12, topics: [{ topic: 'Essay structure & content', status: 'needs-practice', score: 3, total: 6 }, { topic: 'Formal & informal letter format', status: 'strong', score: 5, total: 6 }], positives: ['Letter format and tone were perfect'], deductions: ['Weak essay introduction — no hook sentence (–2 marks)', 'Abrupt conclusion without summarising key points (–1 mark)'] },
      ],
      topicAnalysis: [],
      commonMistakes: ['Tense errors in essays — switches between past and present', 'Spelling mistakes in comprehension answers', 'Weak essay introductions'],
      parentActions: ['Read one Honeydew chapter aloud together every week', 'Practice 5 tense conversion exercises daily', 'Keep a spelling journal for new words'],
    },
    {
      subject: 'Hindi',
      chapterAnalysis: [
        { chapter: 'वसंत Ch 1: ध्वनि (Dhwani)', score: 7, total: 8, topics: [{ topic: 'Kavita ka bhavarth', status: 'strong', score: 4, total: 4 }, { topic: 'Comprehension questions', status: 'strong', score: 3, total: 4 }], positives: ['Bhavarth written beautifully with own words'], deductions: ['One comprehension answer incomplete (–1 mark)'] },
        { chapter: 'वसंत Ch 2: लाख की चूड़ियाँ', score: 6, total: 8, topics: [{ topic: 'Story comprehension', status: 'strong', score: 4, total: 4 }, { topic: 'Character analysis', status: 'strong', score: 2, total: 4 }], positives: ['Good story recall'], deductions: ['Character analysis lacked depth — only surface-level points (–2 marks)'] },
        { chapter: 'वसंत Ch 3: बस की यात्रा', score: 8, total: 8, topics: [{ topic: 'Hasya ras & comprehension', status: 'strong', score: 4, total: 4 }, { topic: 'Creative writing based on chapter', status: 'strong', score: 4, total: 4 }], positives: ['Very expressive answers with hasya ras', 'Creative writing showed original thinking'] },
        { chapter: 'वसंत Ch 5: चिट्ठियों की अनूठी दुनिया', score: 5, total: 6, topics: [{ topic: 'Patra lekhan importance', status: 'strong', score: 5, total: 6 }], positives: ['Good understanding of letter-writing importance'], deductions: ['One point not elaborated fully (–1 mark)'] },
        { chapter: 'व्याकरण: संधि (Sandhi)', score: 3, total: 8, topics: [{ topic: 'स्वर संधि (Swar Sandhi)', status: 'needs-practice', score: 2, total: 4 }, { topic: 'व्यंजन संधि (Vyanjan Sandhi)', status: 'needs-practice', score: 1, total: 4 }], deductions: ['Confused दीर्घ and गुण संधि in 2 answers (–2 marks)', 'Could not identify संधि विच्छेद correctly in 3 words (–3 marks)'] },
        { chapter: 'व्याकरण: समास (Samas)', score: 4, total: 8, topics: [{ topic: 'Types of samas', status: 'needs-practice', score: 2, total: 4 }, { topic: 'Samas vigrah', status: 'needs-practice', score: 2, total: 4 }], deductions: ['Mixed up तत्पुरुष and कर्मधारय in 2 answers (–2 marks)', 'Incomplete समास विग्रह for 2 words (–2 marks)'] },
        { chapter: 'व्याकरण: वाच्य (Voice)', score: 3, total: 6, topics: [{ topic: 'कर्तृ, कर्म & भाव वाच्य', status: 'needs-practice', score: 3, total: 6 }], deductions: ['Confused कर्म and भाव वाच्य in 3 sentences (–3 marks)'] },
        { chapter: 'पत्र लेखन (Letter Writing)', score: 6, total: 8, topics: [{ topic: 'Formal letter format (औपचारिक पत्र)', status: 'needs-practice', score: 2, total: 4 }, { topic: 'Informal letter tone (अनौपचारिक पत्र)', status: 'strong', score: 4, total: 4 }], positives: ['Informal letter tone was natural and engaging'], deductions: ['Missing sender address and date in formal letter (–2 marks)'] },
      ],
      topicAnalysis: [],
      commonMistakes: ['संधि विच्छेद errors – confusing स्वर and व्यंजन संधि', 'Incomplete समास विग्रह', 'Missing format elements in औपचारिक पत्र'],
      parentActions: ['Practice संधि and समास 10 minutes daily from व्याकरण book', 'Read Hindi paragraphs from वसंत together', 'Practice formal letter format with correct structure'],
    },
    {
      subject: 'Social Science',
      chapterAnalysis: [
        { chapter: 'History Ch 1: How, When and Where', score: 8, total: 8, topics: [{ topic: 'Importance of dates & historical sources', status: 'strong', score: 8, total: 8 }], positives: ['Excellent recall of concepts', 'Well-structured answers with examples'] },
        { chapter: 'History Ch 2: From Trade to Territory (EIC)', score: 10, total: 10, topics: [{ topic: 'Rise of East India Company', status: 'strong', score: 5, total: 5 }, { topic: 'Battle of Plassey & Buxar', status: 'strong', score: 5, total: 5 }], positives: ['Detailed timeline of EIC expansion', 'Accurate battle descriptions'] },
        { chapter: 'History Ch 5: When People Rebel (1857)', score: 8, total: 10, topics: [{ topic: 'Causes of Revolt of 1857', status: 'strong', score: 5, total: 5 }, { topic: 'Leaders & aftermath', status: 'strong', score: 3, total: 5 }], positives: ['All causes listed systematically'], deductions: ['Wrong date written for Rani Lakshmibai (–1 mark)', 'Incomplete description of aftermath (–1 mark)'] },
        { chapter: 'Geography Ch 1: Resources', score: 7, total: 12, topics: [{ topic: 'Types of resources', status: 'strong', score: 5, total: 5 }, { topic: 'Resource conservation & map work', status: 'needs-practice', score: 2, total: 7 }], positives: ['Resource classification was accurate'], deductions: ['Incomplete map markings for resource distribution (–3 marks)', 'Missing legend in map (–2 marks)'] },
        { chapter: 'Geography Ch 2: Land, Soil, Water, Natural Vegetation', score: 5, total: 10, topics: [{ topic: 'Land use patterns', status: 'strong', score: 3, total: 3 }, { topic: 'Soil types & conservation', status: 'needs-practice', score: 2, total: 7 }], positives: ['Land use patterns explained well'], deductions: ['Could not identify soil types on Karnataka map (–3 marks)', 'Conservation methods incomplete (–2 marks)'] },
        { chapter: 'Geography Ch 3: Mineral and Power Resources', score: 4, total: 8, topics: [{ topic: 'Types of minerals & distribution', status: 'needs-practice', score: 2, total: 4 }, { topic: 'Conventional & non-conventional energy', status: 'needs-practice', score: 2, total: 4 }], deductions: ['Missed iron ore locations in Karnataka (–2 marks)', 'Incomplete answer on solar energy advantages (–2 marks)'] },
        { chapter: 'Civics Ch 1: The Indian Constitution', score: 10, total: 10, topics: [{ topic: 'Key features & Preamble', status: 'strong', score: 5, total: 5 }, { topic: 'Fundamental Rights & Duties', status: 'strong', score: 5, total: 5 }], positives: ['Preamble written from memory correctly', 'All Fundamental Rights listed with examples'] },
        { chapter: 'Civics Ch 2: Understanding Secularism', score: 6, total: 6, topics: [{ topic: 'Secularism in Indian context', status: 'strong', score: 6, total: 6 }], positives: ['Excellent real-life examples given for secularism'] },
        { chapter: 'Civics Ch 4: Understanding Laws', score: 5, total: 6, topics: [{ topic: 'How laws are made & rule of law', status: 'strong', score: 5, total: 6 }], positives: ['Good understanding of law-making process'], deductions: ['One step in legislative process missed (–1 mark)'] },
      ],
      topicAnalysis: [],
      commonMistakes: ['Incomplete map markings in Geography', 'Minor date errors in History', 'Cannot identify mineral locations on Karnataka map'],
      parentActions: ['Practice map marking with blank India & Karnataka maps', 'Create a timeline chart for History chapters', 'Discuss current events related to Indian Constitution'],
    },
    {
      subject: 'Kannada',
      chapterAnalysis: [
        { chapter: 'ಗದ್ಯ: ಅಣ್ಣನ ನೆನಪು (Annana Nenapu)', score: 8, total: 8, topics: [{ topic: 'Prose comprehension', status: 'strong', score: 4, total: 4 }, { topic: 'Character analysis', status: 'strong', score: 4, total: 4 }], positives: ['Well-articulated answers with textual references', 'Character analysis showed deep understanding'] },
        { chapter: 'ಗದ್ಯ: ಶಬರಿ (Shabari)', score: 7, total: 8, topics: [{ topic: 'Story summary & moral', status: 'strong', score: 4, total: 4 }, { topic: 'Vocabulary & word meanings', status: 'strong', score: 3, total: 4 }], positives: ['Moral of the story expressed beautifully'], deductions: ['One word meaning written incorrectly (–1 mark)'] },
        { chapter: 'ಪದ್ಯ: ಹಕ್ಕಿ ಹಾರುತಿದೆ ನೋಡಿದಿರಾ', score: 8, total: 10, topics: [{ topic: 'Poem meaning & bhavartha', status: 'strong', score: 5, total: 5 }, { topic: 'Rhyme scheme & poetic devices', status: 'strong', score: 3, total: 5 }], positives: ['Bhavartha written in own words with feeling'], deductions: ['Missed one alankaara identification (–1 mark)', 'Rhyme scheme explanation incomplete (–1 mark)'] },
        { chapter: 'ಪದ್ಯ: ದೊಡ್ಡ ಮಾತು (Dodda Maatu)', score: 6, total: 6, topics: [{ topic: 'Poem comprehension & values', status: 'strong', score: 6, total: 6 }], positives: ['Perfect comprehension with value-based answers'] },
        { chapter: 'ವ್ಯಾಕರಣ: ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು (Vibhakti)', score: 4, total: 8, topics: [{ topic: 'Identifying vibhakti pratyaya', status: 'needs-practice', score: 2, total: 4 }, { topic: 'Using vibhakti in sentences', status: 'needs-practice', score: 2, total: 4 }], deductions: ['Confused ತೃತೀಯ and ಚತುರ್ಥೀ vibhakti in 2 answers (–2 marks)', 'Used incorrect pratyaya in 2 sentence constructions (–2 marks)'] },
        { chapter: 'ವ್ಯಾಕರಣ: ಸಮಾಸ (Samaasa)', score: 3, total: 6, topics: [{ topic: 'Types of samaasa', status: 'needs-practice', score: 2, total: 3 }, { topic: 'Samaasa vigrahane', status: 'needs-practice', score: 1, total: 3 }], deductions: ['Mixed up ತತ್ಪುರುಷ and ಕರ್ಮಧಾರಯ samaasa (–1 mark)', 'Incomplete vigraha for 2 words (–2 marks)'] },
        { chapter: 'ವ್ಯಾಕರಣ: ಅಲಂಕಾರ (Alankaara)', score: 4, total: 6, topics: [{ topic: 'ಉಪಮಾ & ರೂಪಕ alankaara', status: 'strong', score: 3, total: 3 }, { topic: 'ಅನುಪ್ರಾಸ alankaara', status: 'needs-practice', score: 1, total: 3 }], positives: ['ಉಪಮಾ and ರೂಪಕ identified correctly'], deductions: ['Could not identify anuprasa in poem excerpt (–2 marks)'] },
        { chapter: 'ಪ್ರಬಂಧ ಲೇಖನ (Essay Writing)', score: 6, total: 8, topics: [{ topic: 'Essay structure & content', status: 'strong', score: 4, total: 4 }, { topic: 'Formal Kannada usage', status: 'needs-practice', score: 2, total: 4 }], positives: ['Good essay structure with introduction and conclusion'], deductions: ['Used colloquial Kannada instead of formal in 2 paragraphs (–2 marks)'] },
      ],
      topicAnalysis: [],
      commonMistakes: ['Vibhakti pratyaya confusion between ತೃತೀಯ and ಚತುರ್ಥೀ', 'Incomplete samaasa vigrahane', 'Using colloquial Kannada in formal writing'],
      parentActions: ['Practice vibhakti pratyaya exercises from vyakarana textbook daily', 'Read Kannada newspaper editorial section together', 'Write one short Kannada essay per week'],
    },
  ],
  '2': [
    {
      subject: 'Mathematics',
      chapterAnalysis: [
        { chapter: 'Ch 1: The Fish Tale (Numbers)', score: 18, total: 18, topics: [{ topic: 'Large numbers & place value', status: 'strong', score: 9, total: 9 }, { topic: 'Estimation & rounding', status: 'strong', score: 9, total: 9 }], positives: ['Perfect understanding of place value', 'All estimation problems solved correctly'] },
        { chapter: 'Ch 3: How Many Squares?', score: 8, total: 10, topics: [{ topic: 'Area using grid/squares', status: 'strong', score: 5, total: 5 }, { topic: 'Perimeter & irregular shapes', status: 'strong', score: 3, total: 5 }], positives: ['Grid-based area calculations done well'], deductions: ['One counting error in irregular shape perimeter (–1 mark)', 'Forgot to include unit in one answer (–1 mark)'] },
        { chapter: 'Ch 5: Does it Look the Same? (Symmetry)', score: 7, total: 8, topics: [{ topic: 'Lines of symmetry', status: 'strong', score: 4, total: 4 }, { topic: 'Mirror images', status: 'strong', score: 3, total: 4 }], positives: ['Lines of symmetry identified perfectly'], deductions: ['One mirror image drawn slightly incorrectly (–1 mark)'] },
        { chapter: "Ch 6: Be My Multiple, I'll Be Your Factor", score: 6, total: 10, topics: [{ topic: 'Factors & multiples', status: 'strong', score: 4, total: 4 }, { topic: 'Word problems on LCM/HCF', status: 'needs-practice', score: 2, total: 6 }], positives: ['Factors and multiples concepts are clear'], deductions: ['Used LCM where HCF was needed in 2 word problems (–4 marks)'] },
        { chapter: 'Ch 7: Can You See the Pattern?', score: 8, total: 8, topics: [{ topic: 'Number & shape patterns', status: 'strong', score: 8, total: 8 }], positives: ['All patterns identified and extended correctly', 'Creative pattern explanations'] },
        { chapter: 'Ch 9: Boxes and Sketches (3D Shapes)', score: 6, total: 8, topics: [{ topic: 'Nets of 3D shapes', status: 'strong', score: 4, total: 4 }, { topic: 'Faces, edges, vertices', status: 'needs-practice', score: 2, total: 4 }], positives: ['Nets drawn accurately'], deductions: ['Confused prism and pyramid face count (–2 marks)'] },
        { chapter: 'Ch 11: Area and Its Boundary', score: 4, total: 8, topics: [{ topic: 'Area of rectangles & squares', status: 'strong', score: 3, total: 3 }, { topic: 'Word problems on area', status: 'needs-practice', score: 1, total: 5 }], positives: ['Basic area formula understood'], deductions: ['Left 2 word problems incomplete (–3 marks)', 'Wrong unit used in one answer (–1 mark)'] },
      ],
      topicAnalysis: [],
      commonMistakes: ['Leaving word problems incomplete', 'Confusing LCM and HCF application', 'Counting errors in grid-based area'],
      parentActions: ['Read word problems aloud and break into steps together', 'Use objects at home to explain factors and multiples', 'Practice area problems with graph paper'],
    },
    {
      subject: 'English',
      chapterAnalysis: [
        { chapter: 'Marigold Ch 1: Wonderful Waste', score: 8, total: 8, topics: [{ topic: 'Reading comprehension', status: 'strong', score: 4, total: 4 }, { topic: 'Vocabulary from lesson', status: 'strong', score: 4, total: 4 }], positives: ['All comprehension answers correct', 'Good vocabulary recall'] },
        { chapter: 'Marigold Ch 2: Flying Together', score: 7, total: 8, topics: [{ topic: 'Story summary & moral', status: 'strong', score: 4, total: 4 }, { topic: 'New words & meanings', status: 'strong', score: 3, total: 4 }], positives: ['Story moral explained nicely'], deductions: ['One word meaning written incorrectly (–1 mark)'] },
        { chapter: 'Marigold Ch 3: My Shadow (Poem)', score: 6, total: 6, topics: [{ topic: 'Poem comprehension & rhyming words', status: 'strong', score: 6, total: 6 }], positives: ['All rhyming words identified', 'Beautiful poem explanation'] },
        { chapter: 'Grammar: Nouns & Pronouns', score: 5, total: 6, topics: [{ topic: 'Identifying nouns & pronouns', status: 'strong', score: 5, total: 6 }], positives: ['Most nouns and pronouns identified correctly'], deductions: ['Missed identifying one collective noun (–1 mark)'] },
        { chapter: 'Grammar: Tenses (Simple)', score: 4, total: 6, topics: [{ topic: 'Simple present & past tense', status: 'needs-practice', score: 4, total: 6 }], deductions: ['Mixed up is/are with was/were in 2 sentences (–2 marks)'] },
        { chapter: 'Writing: Short Paragraphs', score: 5, total: 8, topics: [{ topic: 'Paragraph structure', status: 'strong', score: 3, total: 4 }, { topic: 'Spelling & punctuation', status: 'needs-practice', score: 2, total: 4 }], positives: ['Good paragraph structure with topic sentence'], deductions: ['Spelling errors in 3 longer words (–2 marks)', 'Missing full stop in one sentence (–1 mark)'] },
      ],
      topicAnalysis: [],
      commonMistakes: ['Spelling errors in longer words', 'Mixing up is/are with was/were'],
      parentActions: ['Read one Marigold story together every week', 'Practice spelling 5 new words daily', 'Write a short diary entry in English every day'],
    },
    {
      subject: 'EVS',
      chapterAnalysis: [
        { chapter: 'Ch 1: Super Senses', score: 8, total: 8, topics: [{ topic: 'Animal senses & adaptation', status: 'strong', score: 4, total: 4 }, { topic: 'Comparison with human senses', status: 'strong', score: 4, total: 4 }], positives: ['Excellent comparison between animal and human senses', 'All examples given correctly'] },
        { chapter: 'Ch 3: From Tasting to Digesting', score: 7, total: 8, topics: [{ topic: 'Digestive system basics', status: 'strong', score: 4, total: 4 }, { topic: 'Healthy eating habits', status: 'strong', score: 3, total: 4 }], positives: ['Digestive system diagram labelled well'], deductions: ['Missed one healthy eating habit example (–1 mark)'] },
        { chapter: 'Ch 7: Experiments with Water', score: 6, total: 8, topics: [{ topic: 'Soluble & insoluble substances', status: 'strong', score: 4, total: 4 }, { topic: 'Water cycle', status: 'needs-practice', score: 2, total: 4 }], positives: ['Soluble/insoluble classification perfect'], deductions: ['Water cycle diagram incomplete — missing condensation step (–2 marks)'] },
        { chapter: 'Ch 10: Walls Tell Stories', score: 6, total: 6, topics: [{ topic: 'Historical monuments & their stories', status: 'strong', score: 6, total: 6 }], positives: ['Excellent description of monuments with historical context'] },
        { chapter: 'Ch 15: Blow Hot, Blow Cold', score: 5, total: 6, topics: [{ topic: 'Weather & seasons', status: 'strong', score: 3, total: 3 }, { topic: 'Hot & cold regions', status: 'strong', score: 2, total: 3 }], positives: ['Seasons explained with good examples'], deductions: ['One region classified incorrectly (–1 mark)'] },
      ],
      topicAnalysis: [],
      commonMistakes: ['Incomplete diagrams of water cycle', 'Mixing up weather and climate'],
      parentActions: ['Draw and label the water cycle diagram together', 'Visit local parks to observe plants & animals', 'Discuss weather changes daily'],
    },
    {
      subject: 'Kannada',
      chapterAnalysis: [
        { chapter: 'ಗದ್ಯ: ನಮ್ಮ ದೇಶ ಭಾರತ', score: 7, total: 8, topics: [{ topic: 'Prose comprehension', status: 'strong', score: 4, total: 4 }, { topic: 'Vocabulary', status: 'strong', score: 3, total: 4 }], positives: ['Good prose understanding'], deductions: ['One vocabulary word meaning incorrect (–1 mark)'] },
        { chapter: 'ಪದ್ಯ: ಕನ್ನಡ ನಾಡು', score: 6, total: 6, topics: [{ topic: 'Poem meaning', status: 'strong', score: 6, total: 6 }], positives: ['Poem meaning expressed beautifully in own words'] },
        { chapter: 'ವ್ಯಾಕರಣ: ಲಿಂಗ ಮತ್ತು ವಚನ', score: 5, total: 8, topics: [{ topic: 'Gender in Kannada', status: 'strong', score: 3, total: 4 }, { topic: 'Singular & plural forms', status: 'needs-practice', score: 2, total: 4 }], positives: ['Most gender forms identified correctly'], deductions: ['Confused some ನಪುಂಸಕಲಿಂಗ forms (–1 mark)', 'Wrong plural form for 2 words (–2 marks)'] },
        { chapter: 'ಬರಹ: ಪತ್ರ ಲೇಖನ', score: 5, total: 6, topics: [{ topic: 'Simple letter writing', status: 'strong', score: 5, total: 6 }], positives: ['Good letter format and tone'], deductions: ['Missing date in letter header (–1 mark)'] },
      ],
      topicAnalysis: [],
      commonMistakes: ['Confusing ನಪುಂಸಕಲಿಂಗ with other genders', 'Spelling errors in longer Kannada words'],
      parentActions: ['Read Kannada stories from Chandamama or Tunturu together', 'Practice writing 5 Kannada words daily', 'Label household items in Kannada'],
    },
  ],
};

const mockNotifications: ParentNotification[] = [
  { id: 'n1', type: 'result', title: 'New Result Available', message: 'FA4 results are out. Check your child\'s performance.', date: '2026-02-24', read: false },
  { id: 'n2', type: 'answer_sheet', title: 'Answer Sheets Uploaded', message: 'FA4 answer sheets are now available for viewing.', date: '2026-02-25', read: false },
  { id: 'n3', type: 'feedback', title: 'Teacher Comment Added', message: 'New feedback added for FA3 exams.', date: '2026-01-20', read: true },
];

export const ParentProvider: React.FC<{ children: ReactNode }> = ({ children: childrenProp }) => {
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(mockChildren[0]);
  const [notifications, setNotifications] = useState(mockNotifications);

  const selectChild = (child: ChildProfile) => setSelectedChild(child);

  const getExamResults = () => selectedChild ? (mockExamResults[selectedChild.id] || []) : [];
  const getLatestExam = () => { const r = getExamResults(); return r.length > 0 ? r[r.length - 1] : null; };

  const getOverallAverage = () => {
    const results = getExamResults();
    if (results.length === 0) return 0;
    const totalPct = results.reduce((sum, r) => sum + (r.score / r.total) * 100, 0);
    return Math.round(totalPct / results.length);
  };

  const getStrongSubjects = () => {
    if (!selectedChild) return [];
    const results = getExamResults();
    const subjectAvgs: Record<string, number[]> = {};
    results.forEach(r => {
      if (!subjectAvgs[r.subject]) subjectAvgs[r.subject] = [];
      subjectAvgs[r.subject].push((r.score / r.total) * 100);
    });
    return Object.entries(subjectAvgs)
      .filter(([, pcts]) => pcts.reduce((a, b) => a + b, 0) / pcts.length >= 75)
      .map(([subj]) => subj);
  };

  const getNeedsAttentionSubjects = () => {
    if (!selectedChild) return [];
    const results = getExamResults();
    const subjectAvgs: Record<string, number[]> = {};
    results.forEach(r => {
      if (!subjectAvgs[r.subject]) subjectAvgs[r.subject] = [];
      subjectAvgs[r.subject].push((r.score / r.total) * 100);
    });
    return Object.entries(subjectAvgs)
      .filter(([, pcts]) => pcts.reduce((a, b) => a + b, 0) / pcts.length < 65)
      .map(([subj]) => subj);
  };

  const getStrengths = () => {
    if (!selectedChild) return [];
    if (selectedChild.id === '1') return ['Problem solving in Mathematics', 'Science diagrams and explanations', 'Reading comprehension in English'];
    return ['Basic arithmetic', 'Neat handwriting'];
  };

  const getWeaknesses = () => {
    if (!selectedChild) return [];
    if (selectedChild.id === '1') return [
      { area: 'Hindi grammar', reason: 'Grammar errors in 4 out of 6 questions in last test.' },
      { area: 'Showing full calculation steps', reason: 'Understands concepts but misses writing steps.' },
    ];
    return [{ area: 'Word problems', reason: 'Needs practice with story-based math problems.' }];
  };

  const getProgress = (): SubjectProgress[] => {
    if (!selectedChild) return [];
    const results = getExamResults();
    const map: Record<string, SubjectProgress> = {};
    results.forEach(r => {
      if (!map[r.subject]) map[r.subject] = { subject: r.subject, scores: [] };
      map[r.subject].scores.push({ examName: r.examType, score: r.score, total: r.total });
    });
    return Object.values(map);
  };

  const getInsights = () => {
    if (!selectedChild) return [];
    if (selectedChild.id === '1') return [
      'Rahul understands concepts well but sometimes loses marks due to incomplete steps.',
      'Regular practice of word problems could improve his math scores further.',
      'His Science performance is consistently above class average — encourage him to keep it up.',
      'Hindi needs focused attention. Daily 15 minutes of grammar practice can help.',
    ];
    return ['Ananya is performing above class average in Mathematics.'];
  };

  const getActions = () => {
    if (!selectedChild) return [];
    if (selectedChild.id === '1') return [
      'Practice word problems together for 15 minutes daily.',
      'Encourage Rahul to always show calculation steps in Math.',
      'Review teacher feedback after each test together.',
      'Spend 10 minutes daily on Hindi grammar exercises.',
    ];
    return ['Keep encouraging Ananya to read story books.', 'Practice word problems at home.'];
  };

  const getSubjectInsight = (subject: string): SubjectInsight | null => {
    if (!selectedChild) return null;
    const insights = mockSubjectInsights[selectedChild.id] || [];
    return insights.find(si => si.subject === subject) || null;
  };

  const getNotifications = () => notifications;
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <ParentContext.Provider value={{
      children: mockChildren,
      selectedChild, selectChild,
      getExamResults, getLatestExam, getStrengths, getWeaknesses,
      getProgress, getInsights, getActions, getNotifications, markNotificationRead,
      getSubjectInsight, getOverallAverage, getStrongSubjects, getNeedsAttentionSubjects,
    }}>
      {childrenProp}
    </ParentContext.Provider>
  );
};

export const useParent = () => {
  const ctx = useContext(ParentContext);
  if (!ctx) throw new Error('useParent must be used within ParentProvider');
  return ctx;
};
