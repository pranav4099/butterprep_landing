export const ratingScale = [
  { score: 4, label: 'Excellent', tag: 'Exceeds expectations', color: 'success' },
  { score: 3, label: 'Good', tag: 'Meets expectations', color: 'primary' },
  { score: 2, label: 'Satisfactory', tag: 'Developing', color: 'warning' },
  { score: 1, label: 'Needs Improvement', tag: 'Needs support', color: 'destructive' },
];

export interface RubricTemplate {
  id: string;
  name: string;
  criteria: string[];
}

export interface SubjectRubricConfig {
  subject: string;
  commonCriteria: string[];
  templates: RubricTemplate[];
}

export const subjectRubricConfigs: SubjectRubricConfig[] = [
  {
    subject: 'Mathematics',
    commonCriteria: [
      'Concept understanding',
      'Accuracy of answers',
      'Problem-solving strategy',
      'Stepwise working / method',
      'Application of concepts',
      'Mental math / reasoning',
      'Neatness and organization',
    ],
    templates: [
      { id: 'math-cw', name: 'Classwork / Worksheet', criteria: ['Accuracy', 'Method shown', 'Completion', 'Neatness'] },
      { id: 'math-ps', name: 'Problem Solving', criteria: ['Understands the question', 'Chooses correct strategy', 'Carries out steps correctly', 'Final answer accuracy', 'Explains reasoning'] },
      { id: 'math-oral', name: 'Math Oral / Viva', criteria: ['Recall of concepts', 'Correct use of math vocabulary', 'Speed and confidence', 'Logical explanation'] },
    ],
  },
  {
    subject: 'Kannada',
    commonCriteria: [
      'Reading fluency',
      'Pronunciation',
      'Comprehension',
      'Vocabulary usage',
      'Grammar correctness',
      'Sentence formation',
      'Creative expression',
      'Handwriting / presentation',
      'Oral confidence',
    ],
    templates: [
      { id: 'kan-read', name: 'Reading', criteria: ['Fluency', 'Pronunciation', 'Expression', 'Understanding of passage'] },
      { id: 'kan-write', name: 'Writing', criteria: ['Grammar', 'Vocabulary', 'Organization of ideas', 'Content relevance', 'Handwriting'] },
      { id: 'kan-speak', name: 'Speaking / Recitation', criteria: ['Pronunciation', 'Clarity', 'Confidence', 'Memorization / accuracy', 'Expression'] },
    ],
  },
  {
    subject: 'Hindi',
    commonCriteria: [
      'Pronunciation (उच्चारण)',
      'Fluency',
      'Comprehension',
      'Grammar accuracy',
      'Vocabulary',
      'Sentence structure',
      'Creativity / expression',
      'Presentation / handwriting',
      'Oral confidence',
    ],
    templates: [
      { id: 'hin-comp', name: 'Comprehension', criteria: ['Understanding of text', 'Correct answers', 'Vocabulary interpretation', 'Inference / meaning'] },
      { id: 'hin-write', name: 'Writing', criteria: ['Content relevance', 'Grammar', 'Vocabulary', 'Organization', 'Handwriting'] },
      { id: 'hin-oral', name: 'Recitation / Oral', criteria: ['Pronunciation', 'Fluency', 'Expression', 'Confidence'] },
    ],
  },
  {
    subject: 'Science',
    commonCriteria: [
      'Concept understanding',
      'Scientific reasoning',
      'Observation skills',
      'Accuracy of responses',
      'Practical / lab skills',
      'Recording of data',
      'Interpretation of results',
      'Diagram labeling',
      'Application to real life',
    ],
    templates: [
      { id: 'sci-lab', name: 'Experiment / Lab', criteria: ['Follows procedure correctly', 'Uses materials safely', 'Observes carefully', 'Records data accurately', 'Draws conclusion logically'] },
      { id: 'sci-note', name: 'Notebook / Assignment', criteria: ['Completeness', 'Accuracy', 'Diagrams and labels', 'Organization', 'Timely submission'] },
      { id: 'sci-concept', name: 'Conceptual Understanding', criteria: ['Explains concept clearly', 'Uses scientific terms correctly', 'Applies concept to examples', 'Answers accurately'] },
    ],
  },
  {
    subject: 'Social Science',
    commonCriteria: [
      'Concept understanding',
      'Recall of facts / dates / terms',
      'Interpretation and analysis',
      'Cause-effect explanation',
      'Map / chart skills',
      'Use of examples',
      'Writing organization',
      'Presentation and completeness',
    ],
    templates: [
      { id: 'ss-written', name: 'Written Answer', criteria: ['Content accuracy', 'Use of key points', 'Explanation depth', 'Organization', 'Presentation'] },
      { id: 'ss-map', name: 'Map Work', criteria: ['Correct identification', 'Labeling accuracy', 'Neatness', 'Completion'] },
      { id: 'ss-project', name: 'Project / Presentation', criteria: ['Research quality', 'Relevance of content', 'Organization', 'Creativity', 'Presentation skills'] },
    ],
  },
  {
    subject: 'English',
    commonCriteria: [
      'Reading fluency',
      'Comprehension',
      'Vocabulary',
      'Grammar',
      'Sentence construction',
      'Coherence and organization',
      'Creativity / expression',
      'Pronunciation',
      'Confidence and participation',
    ],
    templates: [
      { id: 'eng-read', name: 'Reading', criteria: ['Fluency', 'Pronunciation', 'Expression', 'Comprehension'] },
      { id: 'eng-write', name: 'Writing', criteria: ['Ideas and content', 'Organization', 'Grammar', 'Vocabulary', 'Spelling / punctuation'] },
      { id: 'eng-speak', name: 'Speaking', criteria: ['Pronunciation', 'Fluency', 'Confidence', 'Clarity of ideas', 'Listening / response'] },
    ],
  },
];

export const presetConditions = [
  'Must show all working steps',
  'Minimum word count required',
  'Partial marks for correct method',
  'Deduct marks for untidy work',
  'Diagrams must be labeled',
  'Must include examples',
  'Correct grammar required',
  'Time-bound completion',
  'Original work only',
  'Must attempt all parts',
];
