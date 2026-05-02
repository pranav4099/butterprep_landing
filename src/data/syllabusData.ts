// NCERT-aligned syllabus mock data for AI Paper Studio
// Used by the Syllabus Coverage step (Step 3) of the wizard.

export interface SyllabusChapter {
  id: string;
  name: string;
  topics: string[];
  recommendedMarks: number;
}

export interface ClassSubjectSyllabus {
  className: string;
  subject: string;
  chapters: SyllabusChapter[];
}

export const syllabusBank: ClassSubjectSyllabus[] = [
  {
    className: 'Class 10',
    subject: 'Science',
    chapters: [
      {
        id: 'sci10-1',
        name: 'Chemical Reactions and Equations',
        topics: ['Types of reactions', 'Balancing equations', 'Oxidation and reduction'],
        recommendedMarks: 12,
      },
      {
        id: 'sci10-2',
        name: 'Acids, Bases and Salts',
        topics: ['Indicators', 'pH scale', 'Salts'],
        recommendedMarks: 10,
      },
      {
        id: 'sci10-3',
        name: 'Life Processes',
        topics: ['Nutrition', 'Respiration', 'Transportation', 'Excretion'],
        recommendedMarks: 14,
      },
      {
        id: 'sci10-4',
        name: 'Electricity',
        topics: ["Ohm's Law", 'Resistance', 'Series and parallel circuits', 'Power'],
        recommendedMarks: 14,
      },
      {
        id: 'sci10-5',
        name: 'Light',
        topics: ['Reflection', 'Refraction', 'Lens formula'],
        recommendedMarks: 10,
      },
      {
        id: 'sci10-6',
        name: 'Magnetic Effects of Current',
        topics: ['Magnetic field', 'Electromagnet', 'Motor principle'],
        recommendedMarks: 10,
      },
      {
        id: 'sci10-7',
        name: 'Our Environment',
        topics: ['Ecosystem', 'Food chain', 'Ozone depletion'],
        recommendedMarks: 10,
      },
    ],
  },
  {
    className: 'Class 10',
    subject: 'Mathematics',
    chapters: [
      { id: 'math10-1', name: 'Real Numbers', topics: ['Euclid algorithm', 'HCF & LCM', 'Irrational numbers'], recommendedMarks: 8 },
      { id: 'math10-2', name: 'Polynomials', topics: ['Zeroes', 'Division algorithm'], recommendedMarks: 10 },
      { id: 'math10-3', name: 'Pair of Linear Equations', topics: ['Graphical method', 'Substitution', 'Elimination'], recommendedMarks: 12 },
      { id: 'math10-4', name: 'Quadratic Equations', topics: ['Factorisation', 'Quadratic formula', 'Nature of roots'], recommendedMarks: 12 },
      { id: 'math10-5', name: 'Arithmetic Progressions', topics: ['nth term', 'Sum of n terms'], recommendedMarks: 10 },
      { id: 'math10-6', name: 'Triangles', topics: ['Similarity', 'Pythagoras theorem'], recommendedMarks: 10 },
      { id: 'math10-7', name: 'Trigonometry', topics: ['Ratios', 'Identities', 'Heights and distances'], recommendedMarks: 10 },
      { id: 'math10-8', name: 'Statistics & Probability', topics: ['Mean', 'Median', 'Mode', 'Probability'], recommendedMarks: 8 },
    ],
  },
];

export const getSyllabus = (className: string, subject: string): SyllabusChapter[] => {
  const match = syllabusBank.find(s => s.className === className && s.subject === subject);
  return match?.chapters ?? syllabusBank[0].chapters;
};
