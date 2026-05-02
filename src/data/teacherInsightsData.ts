// Mock data for Teacher Insights Portal — aligned with NCERT / Karnataka Board curriculum

export interface TopicPerformance {
  name: string;
  score: number;
  status: 'strong' | 'average' | 'weak';
}

export interface ChapterPerformance {
  id: string;
  name: string;
  avgScore: number;
  status: 'strong' | 'average' | 'weak';
  topics: TopicPerformance[];
}

export interface LearningGap {
  issue: string;
  affectedStudents: number;
  severity: 'high' | 'medium' | 'low';
}

export interface StudentRecord {
  id: string;
  rollNo: string;
  name: string;
  score: number;
  status: 'strong' | 'average' | 'needs-support';
  trend: number[];
  trendDirection: 'up' | 'down' | 'stable';
  learningPattern: string;
  mistakePatterns: string[];
  topicScores: { topic: string; score: number }[];
  suggestedActions: string[];
}

export interface SubjectSummary {
  id: string;
  name: string;
  avgScore: number;
  status: 'strong' | 'average' | 'needs-attention';
  totalStudents: number;
  topIssue: string;
}

export interface ClassSection {
  id: string;
  classNum: number;
  section: string;
  label: string;
  totalStudents: number;
  avgScore: number;
  status: 'strong' | 'average' | 'needs-attention';
  subjects: SubjectSummary[];
}

export interface ClassSubjectData {
  classId: string;
  className: string;
  subject: string;
  avgScore: number;
  classStatus: 'strong' | 'average' | 'needs-attention';
  studentsBelow50: number;
  studentsAbove80: number;
  totalStudents: number;
  learningGaps: LearningGap[];
  chapters: ChapterPerformance[];
  students: StudentRecord[];
  teachingPlan: { day: number; tasks: string[] }[];
}

// ═══════════════════════════════════════════════════════════════
// NCERT / Karnataka Board Curriculum — Chapters & Topics per Subject per Class
// ═══════════════════════════════════════════════════════════════

type CurriculumChapter = {
  name: string;
  topics: string[];
};

type SubjectCurriculum = Record<string, CurriculumChapter[]>; // key = subjectId

// Curriculum data keyed by class number
const curriculumByClass: Record<number, SubjectCurriculum> = {
  1: {
    math: [
      { name: 'Shapes and Space', topics: ['Flat and Solid Shapes', 'Patterns', 'Spatial Understanding'] },
      { name: 'Numbers from 1 to 9', topics: ['Counting Objects', 'Comparing Numbers', 'Number Names'] },
      { name: 'Addition', topics: ['Adding Single Digits', 'Story Sums', 'Adding with Pictures'] },
    ],
    science: [
      { name: 'My Body', topics: ['Body Parts', 'Sense Organs', 'Good Habits'] },
      { name: 'Plants Around Us', topics: ['Parts of a Plant', 'Types of Plants', 'Uses of Plants'] },
      { name: 'Animals Around Us', topics: ['Domestic Animals', 'Wild Animals', 'Animal Sounds'] },
    ],
    english: [
      { name: 'Marigold Unit 1', topics: ['A Happy Child (Poem)', 'Three Little Pigs (Story)', 'Reading Comprehension'] },
      { name: 'Marigold Unit 2', topics: ['After a Bath (Poem)', 'The Bubble, the Straw and the Shoe', 'Vocabulary Building'] },
      { name: 'Marigold Unit 3', topics: ['One Little Kitten (Poem)', 'Lalu and Peelu', 'Sentence Formation'] },
    ],
    hindi: [
      { name: 'रिमझिम — झूला', topics: ['कविता पठन', 'शब्द भंडार', 'चित्र वर्णन'] },
      { name: 'रिमझिम — आम की कहानी', topics: ['कहानी समझ', 'प्रश्नोत्तर', 'वाक्य रचना'] },
      { name: 'रिमझिम — पत्ते ही पत्ते', topics: ['पत्तों की पहचान', 'रंग और आकार', 'मौखिक अभिव्यक्ति'] },
    ],
    kannada: [
      { name: 'ಅಕ್ಷರ ಪರಿಚಯ', topics: ['ಸ್ವರಗಳು', 'ವ್ಯಂಜನಗಳು', 'ಒತ್ತಕ್ಷರಗಳು'] },
      { name: 'ನನ್ನ ಶಾಲೆ', topics: ['ಪದ್ಯ ಓದು', 'ಚಿತ್ರ ವರ್ಣನೆ', 'ವಾಕ್ಯ ರಚನೆ'] },
      { name: 'ಹೂವು ಮತ್ತು ಹಣ್ಣು', topics: ['ಹೂವಿನ ಹೆಸರು', 'ಹಣ್ಣಿನ ಹೆಸರು', 'ಬಣ್ಣಗಳು'] },
    ],
    social: [
      { name: 'My Family', topics: ['Family Members', 'Roles in Family', 'Joint and Nuclear Family'] },
      { name: 'My Neighbourhood', topics: ['Places Around Us', 'Helpers in Neighbourhood', 'Safety Rules'] },
      { name: 'Our Festivals', topics: ['National Festivals', 'Regional Festivals', 'Importance of Festivals'] },
    ],
  },
  2: {
    math: [
      { name: 'What is Long, What is Round?', topics: ['Measuring Length', 'Comparing Objects', 'Non-standard Units'] },
      { name: 'Counting in Groups', topics: ['Skip Counting', 'Grouping by Tens', 'Place Value Introduction'] },
      { name: 'How Much Can You Carry?', topics: ['Heavy and Light', 'Weighing Objects', 'Comparing Weights'] },
    ],
    science: [
      { name: 'Food We Eat', topics: ['Healthy Food', 'Junk Food', 'Food Groups'] },
      { name: 'Water', topics: ['Sources of Water', 'Uses of Water', 'Saving Water'] },
      { name: 'Our Clothes', topics: ['Types of Clothes', 'Clothes for Seasons', 'Fabrics'] },
    ],
    english: [
      { name: 'Marigold Unit 1 – First Day at School', topics: ['Reading Aloud', 'New Words', 'Comprehension Questions'] },
      { name: 'Marigold Unit 2 – Haldi\'s Adventure', topics: ['Story Sequencing', 'Character Identification', 'Creative Writing'] },
      { name: 'Marigold Unit 3 – I am Lucky', topics: ['Poem Recitation', 'Rhyming Words', 'Picture Composition'] },
    ],
    hindi: [
      { name: 'रिमझिम — ऊँट चला', topics: ['कविता पठन', 'अर्थ समझ', 'शब्द विलोम'] },
      { name: 'रिमझिम — भालू ने खेली फुटबॉल', topics: ['कहानी वाचन', 'प्रश्नोत्तर', 'अनुच्छेद लेखन'] },
      { name: 'रिमझिम — मिठाईवाला', topics: ['पात्र परिचय', 'संवाद लेखन', 'मौखिक प्रस्तुति'] },
    ],
    kannada: [
      { name: 'ಬಾ ಬಾ ಚಂದಮಾಮ', topics: ['ಪದ್ಯ ಓದು', 'ಪ್ರಶ್ನೋತ್ತರ', 'ಪದ ಸಂಪತ್ತು'] },
      { name: 'ನಮ್ಮ ಹಬ್ಬಗಳು', topics: ['ಗದ್ಯ ಓದು', 'ಚಿತ್ರ ವರ್ಣನೆ', 'ವಾಕ್ಯ ಪೂರ್ಣ'] },
      { name: 'ಮಳೆ ಬಂತು', topics: ['ಕವನ ಅರ್ಥ', 'ಪದ ಜೋಡಣೆ', 'ಶ್ರುತಲೇಖನ'] },
    ],
    social: [
      { name: 'Our Earth', topics: ['Land and Water', 'Directions', 'Maps Introduction'] },
      { name: 'Transport', topics: ['Types of Transport', 'Land Transport', 'Water and Air Transport'] },
      { name: 'Communication', topics: ['Old and New Means', 'Letters and Phones', 'Internet Basics'] },
    ],
  },
  3: {
    math: [
      { name: 'Where to Look From', topics: ['Top View', 'Front View', 'Side View'] },
      { name: 'Fun with Numbers', topics: ['4-digit Numbers', 'Ascending/Descending', 'Place Value'] },
      { name: 'Give and Take', topics: ['Addition with Carry', 'Subtraction with Borrow', 'Word Problems'] },
    ],
    science: [
      { name: 'Poonam\'s Day Out', topics: ['Living and Non-living', 'Animal Habitats', 'Observation Skills'] },
      { name: 'Plant Fairy', topics: ['Seed Germination', 'Parts of Flower', 'Plant Growth'] },
      { name: 'Water O Water', topics: ['Water Cycle', 'Rainwater Harvesting', 'Water Pollution'] },
    ],
    english: [
      { name: 'Marigold – Good Morning', topics: ['Poem Comprehension', 'Greetings Vocabulary', 'Conversation Skills'] },
      { name: 'Marigold – The Magic Garden', topics: ['Story Elements', 'New Words', 'Grammar: Nouns'] },
      { name: 'Marigold – Bird Talk', topics: ['Poem Recitation', 'Rhyme Scheme', 'Creative Writing'] },
    ],
    hindi: [
      { name: 'रिमझिम — कक्कू', topics: ['कविता अर्थ', 'भाषा सौंदर्य', 'शब्दार्थ'] },
      { name: 'रिमझिम — चाँद वाली अम्मा', topics: ['कहानी बोध', 'पात्र चरित्र', 'लेखन अभ्यास'] },
      { name: 'रिमझिम — मन करता है', topics: ['कविता पाठ', 'भाव समझ', 'चित्र वर्णन'] },
    ],
    kannada: [
      { name: 'ಹಸಿರು ಮನೆ', topics: ['ಗದ್ಯ ಅರ್ಥ', 'ಪ್ರಶ್ನೋತ್ತರ', 'ವಾಕ್ಯ ರಚನೆ'] },
      { name: 'ಚಿಟ್ಟೆ', topics: ['ಪದ್ಯ ಓದು', 'ಪ್ರಾಸ ಪದ', 'ಶಬ್ದ ಭಂಡಾರ'] },
      { name: 'ನಮ್ಮ ನಾಡು', topics: ['ಕರ್ನಾಟಕ ಪರಿಚಯ', 'ಜಿಲ್ಲೆಗಳು', 'ಸಂಸ್ಕೃತಿ'] },
    ],
    social: [
      { name: 'Our State Karnataka', topics: ['Districts', 'Rivers of Karnataka', 'State Symbols'] },
      { name: 'Food, Clothing and Shelter', topics: ['Regional Food', 'Traditional Clothing', 'Types of Houses'] },
      { name: 'Maps and Directions', topics: ['Reading Maps', 'Cardinal Directions', 'Symbols on Maps'] },
    ],
  },
  4: {
    math: [
      { name: 'Building with Bricks', topics: ['Patterns in Shapes', 'Floor Patterns', 'Tiling'] },
      { name: 'Long and Short', topics: ['Standard Units of Length', 'Converting cm-m', 'Measuring with Scale'] },
      { name: 'A Trip to Bhopal (Tickets & Fares)', topics: ['Money Calculations', 'Bill Making', 'Profit and Loss Basics'] },
    ],
    science: [
      { name: 'Going to School', topics: ['Modes of Transport', 'Animal Locomotion', 'Bridges'] },
      { name: 'Ear to Ear', topics: ['Animals and Sound', 'How Animals Hear', 'Sound Travel'] },
      { name: 'Food and Fun', topics: ['Cooking Methods', 'Nutrition', 'Food Preservation'] },
    ],
    english: [
      { name: 'Marigold – Wake Up!', topics: ['Poem Analysis', 'Morning Routine Vocabulary', 'Grammar: Tenses'] },
      { name: 'Marigold – Neha\'s Alarm Clock', topics: ['Story Comprehension', 'Sequence of Events', 'Letter Writing'] },
      { name: 'Marigold – Noses', topics: ['Poem Interpretation', 'Sensory Words', 'Descriptive Writing'] },
    ],
    hindi: [
      { name: 'रिमझिम — मन के भोले-भाले बादल', topics: ['कविता भाव', 'अलंकार पहचान', 'शब्दार्थ'] },
      { name: 'रिमझिम — जैसा सवाल वैसा जवाब', topics: ['कहानी बोध', 'मुहावरे', 'अनुच्छेद लेखन'] },
      { name: 'रिमझिम — स्वतंत्रता की ओर', topics: ['गद्य पठन', 'राष्ट्रीय भावना', 'व्याकरण अभ्यास'] },
    ],
    kannada: [
      { name: 'ಮಕ್ಕಳ ಹಕ್ಕುಗಳು', topics: ['ಗದ್ಯ ಅರ್ಥ', 'ಹಕ್ಕುಗಳ ಪಟ್ಟಿ', 'ವಾಕ್ಯ ರಚನೆ'] },
      { name: 'ಬೇಂದ್ರೆ ಕವನ', topics: ['ಪದ್ಯ ಸಾರ', 'ಪ್ರಾಸ ಪದಗಳು', 'ಭಾವ ಅರ್ಥ'] },
      { name: 'ನಮ್ಮ ಆಹಾರ', topics: ['ಆಹಾರ ಪದಾರ್ಥಗಳು', 'ಪೌಷ್ಟಿಕ ಆಹಾರ', 'ಆಹಾರ ಸಂಸ್ಕೃತಿ'] },
    ],
    social: [
      { name: 'Karnataka Geography', topics: ['Western Ghats', 'Deccan Plateau', 'Coastal Karnataka'] },
      { name: 'Our Government', topics: ['Panchayat Raj', 'Village Administration', 'Gram Sabha'] },
      { name: 'Natural Resources', topics: ['Forests', 'Minerals', 'Conservation'] },
    ],
  },
  5: {
    math: [
      { name: 'The Fish Tale (Shapes)', topics: ['Symmetry', 'Reflections', 'Rotations'] },
      { name: 'Boxes and Sketches', topics: ['Nets of 3D Shapes', 'Cube and Cuboid', 'Surface Area Intro'] },
      { name: 'Be My Multiple, I\'ll Be Your Factor', topics: ['Multiples', 'Factors', 'LCM and HCF Basics'] },
    ],
    science: [
      { name: 'Super Senses', topics: ['Animal Senses', 'Migration', 'Communication in Animals'] },
      { name: 'Seeds and Seeds', topics: ['Seed Dispersal', 'Sprouting', 'Parts of a Seed'] },
      { name: 'Experiments with Water', topics: ['Soluble/Insoluble', 'Filtration', 'Evaporation'] },
    ],
    english: [
      { name: 'Marigold – Ice Cream Man', topics: ['Poem Analysis', 'Seasonal Vocabulary', 'Adjectives'] },
      { name: 'Marigold – Wonderful Waste', topics: ['Comprehension', 'Recycling Vocabulary', 'Essay Writing'] },
      { name: 'Marigold – My Shadow', topics: ['Poem Interpretation', 'Light and Shadow', 'Creative Writing'] },
    ],
    hindi: [
      { name: 'रिमझिम — राख की रस्सी', topics: ['कहानी बोध', 'पात्र विश्लेषण', 'मूल्य शिक्षा'] },
      { name: 'रिमझिम — चिट्ठी का सफ़र', topics: ['गद्य समझ', 'पत्र लेखन', 'संचार माध्यम'] },
      { name: 'रिमझिम — सबसे अच्छा पेड़', topics: ['कविता अर्थ', 'पर्यावरण चेतना', 'व्याकरण'] },
    ],
    kannada: [
      { name: 'ಕನ್ನಡ ನಾಡು', topics: ['ಗದ್ಯ ಪಠನ', 'ಪ್ರಶ್ನೋತ್ತರ', 'ಕರ್ನಾಟಕ ಇತಿಹಾಸ'] },
      { name: 'ಪರಿಸರ ಕಾಳಜಿ', topics: ['ಪರಿಸರ ಮಾಲಿನ್ಯ', 'ಮರ ನೆಡುವಿಕೆ', 'ನಿಬಂಧ ಬರೆಹ'] },
      { name: 'ಕುವೆಂಪು ಕವಿತೆ', topics: ['ಕವಿ ಪರಿಚಯ', 'ಪದ್ಯ ಸಾರ', 'ಕಾವ್ಯ ಸೌಂದರ್ಯ'] },
    ],
    social: [
      { name: 'India – Physical Features', topics: ['Northern Mountains', 'Northern Plains', 'Peninsular Plateau'] },
      { name: 'Climate of India', topics: ['Seasons', 'Monsoon', 'Weather vs Climate'] },
      { name: 'Great Rulers of Karnataka', topics: ['Chalukyas', 'Hoysalas', 'Vijayanagara Empire'] },
    ],
  },
  6: {
    math: [
      { name: 'Knowing Our Numbers', topics: ['Comparing Numbers', 'Indian and International System', 'Estimation'] },
      { name: 'Whole Numbers', topics: ['Number Line', 'Properties of Whole Numbers', 'Patterns'] },
      { name: 'Playing with Numbers', topics: ['Divisibility Rules', 'Prime and Composite', 'LCM and HCF'] },
      { name: 'Basic Geometrical Ideas', topics: ['Points, Lines, Segments', 'Angles', 'Triangles and Polygons'] },
    ],
    science: [
      { name: 'Food: Where Does It Come From?', topics: ['Food Sources', 'Food Chains', 'Animal Nutrition'] },
      { name: 'Components of Food', topics: ['Nutrients', 'Balanced Diet', 'Deficiency Diseases'] },
      { name: 'Separation of Substances', topics: ['Filtration', 'Evaporation', 'Sedimentation and Decantation'] },
      { name: 'Body Movements', topics: ['Joints', 'Human Skeleton', 'Movement in Animals'] },
    ],
    english: [
      { name: 'Honeysuckle – Who Did Patrick\'s Homework?', topics: ['Story Comprehension', 'Character Analysis', 'Grammar: Tenses'] },
      { name: 'Honeysuckle – How the Dog Found a New Master', topics: ['Narrative Understanding', 'Vocabulary', 'Writing Skills'] },
      { name: 'A Pact with the Sun – A Tale of Two Birds', topics: ['Supplementary Reading', 'Moral of Story', 'Summary Writing'] },
    ],
    hindi: [
      { name: 'वसंत — वह चिड़िया जो', topics: ['कविता भाव', 'प्रतीक समझ', 'शब्दार्थ'] },
      { name: 'वसंत — बचपन', topics: ['गद्य बोध', 'पात्र परिचय', 'अनुच्छेद लेखन'] },
      { name: 'वसंत — नादान दोस्त', topics: ['कहानी विश्लेषण', 'मुहावरे-लोकोक्ति', 'व्याकरण अभ्यास'] },
    ],
    kannada: [
      { name: 'ಗದ್ಯ — ದೊಡ್ಡಮ್ಮನ ಕೊಡುಗೆ', topics: ['ಗದ್ಯ ಅರ್ಥ', 'ಪಾತ್ರ ಚಿತ್ರಣ', 'ಪ್ರಶ್ನೋತ್ತರ'] },
      { name: 'ಪದ್ಯ — ಕನ್ನಡ ಜನ್ಮಭೂಮಿ', topics: ['ಪದ್ಯ ಸಾರ', 'ಛಂದಸ್ಸು', 'ಭಾವ ಅರ್ಥ'] },
      { name: 'ವ್ಯಾಕರಣ — ನಾಮಪದ ಮತ್ತು ಕ್ರಿಯಾಪದ', topics: ['ನಾಮಪದ ಗುರುತಿಸು', 'ಕ್ರಿಯಾಪದ ಬಳಕೆ', 'ವಾಕ್ಯ ಪ್ರಕಾರ'] },
    ],
    social: [
      { name: 'What, Where, How and When?', topics: ['Sources of History', 'Timeline', 'Archaeological Evidence'] },
      { name: 'The Earth in the Solar System', topics: ['Planets', 'Sun and Moon', 'Stars and Constellations'] },
      { name: 'Diversity and Discrimination', topics: ['Prejudice', 'Stereotypes', 'Constitutional Values'] },
    ],
  },
  7: {
    math: [
      { name: 'Integers', topics: ['Positive and Negative Numbers', 'Addition of Integers', 'Subtraction of Integers'] },
      { name: 'Fractions and Decimals', topics: ['Multiplication of Fractions', 'Division of Decimals', 'Word Problems'] },
      { name: 'Data Handling', topics: ['Mean, Median, Mode', 'Bar Graphs', 'Probability Introduction'] },
      { name: 'Simple Equations', topics: ['Setting Up Equations', 'Solving Equations', 'Applications'] },
    ],
    science: [
      { name: 'Nutrition in Plants', topics: ['Photosynthesis', 'Parasitic Plants', 'Insectivorous Plants'] },
      { name: 'Heat', topics: ['Conductors and Insulators', 'Clinical Thermometer', 'Transfer of Heat'] },
      { name: 'Acids, Bases and Salts', topics: ['Natural Indicators', 'Neutralisation', 'Uses of Acids and Bases'] },
      { name: 'Respiration in Organisms', topics: ['Aerobic and Anaerobic', 'Breathing Rate', 'Cellular Respiration'] },
    ],
    english: [
      { name: 'Honeycomb – Three Questions', topics: ['Story Comprehension', 'Character Motives', 'Grammar: Clauses'] },
      { name: 'Honeycomb – The Ashes That Made Trees Bloom', topics: ['Japanese Folktale', 'Vocabulary Building', 'Letter Writing'] },
      { name: 'An Alien Hand – The Tiny Teacher', topics: ['Supplementary Reading', 'Factual Recall', 'Paragraph Writing'] },
    ],
    hindi: [
      { name: 'वसंत — हम पंछी उन्मुक्त गगन के', topics: ['कविता भाव', 'स्वतंत्रता विषय', 'अलंकार'] },
      { name: 'वसंत — दादी माँ', topics: ['गद्य समझ', 'पारिवारिक मूल्य', 'विलोम शब्द'] },
      { name: 'वसंत — रक्त और हमारा शरीर', topics: ['विज्ञान लेख बोध', 'शब्द भंडार', 'सारांश लेखन'] },
    ],
    kannada: [
      { name: 'ಗದ್ಯ — ಶಬರಿ', topics: ['ಕಥೆ ಅರ್ಥ', 'ಪಾತ್ರ ವಿಶ್ಲೇಷಣೆ', 'ಮೌಲ್ಯ ಶಿಕ್ಷಣ'] },
      { name: 'ಪದ್ಯ — ಎಲ್ಲರ ಕನ್ನಡ', topics: ['ಕವಿ ಪರಿಚಯ', 'ಭಾವಾರ್ಥ', 'ಅಲಂಕಾರ'] },
      { name: 'ವ್ಯಾಕರಣ — ಸಮಾಸ ಮತ್ತು ಸಂಧಿ', topics: ['ಸಮಾಸ ಪ್ರಕಾರ', 'ಸಂಧಿ ನಿಯಮ', 'ಉದಾಹರಣೆಗಳು'] },
    ],
    social: [
      { name: 'Medieval India — Delhi Sultanate', topics: ['Slave Dynasty', 'Khalji Dynasty', 'Administration'] },
      { name: 'Our Environment', topics: ['Ecosystem Components', 'Natural Vegetation', 'Wildlife'] },
      { name: 'Democracy and Equality', topics: ['Universal Adult Franchise', 'Equality in Democracy', 'Caste and Gender Discrimination'] },
    ],
  },
  8: {
    math: [
      { name: 'Rational Numbers', topics: ['Properties of Rational Numbers', 'Number Line Representation', 'Between Two Rational Numbers'] },
      { name: 'Linear Equations in One Variable', topics: ['Solving Equations', 'Reducing to Linear Form', 'Word Problems'] },
      { name: 'Understanding Quadrilaterals', topics: ['Polygons', 'Properties of Parallelograms', 'Special Quadrilaterals'] },
      { name: 'Data Handling', topics: ['Organising Data', 'Pie Charts', 'Probability'] },
    ],
    science: [
      { name: 'Crop Production and Management', topics: ['Agricultural Practices', 'Irrigation Methods', 'Storage of Grains'] },
      { name: 'Microorganisms: Friend and Foe', topics: ['Types of Microorganisms', 'Useful Microorganisms', 'Disease-causing Microorganisms'] },
      { name: 'Force and Pressure', topics: ['Contact and Non-contact Forces', 'Pressure', 'Atmospheric Pressure'] },
      { name: 'Chemical Effects of Electric Current', topics: ['Conductors and Insulators', 'Electroplating', 'LED Test'] },
    ],
    english: [
      { name: 'Honeydew – The Best Christmas Present', topics: ['Story Comprehension', 'Inference Skills', 'Grammar: Past Tense'] },
      { name: 'Honeydew – The Tsunami', topics: ['Disaster Vocabulary', 'News Report Writing', 'Cause and Effect'] },
      { name: 'It So Happened – How the Camel Got His Hump', topics: ['Rudyard Kipling', 'Moral Reasoning', 'Creative Writing'] },
    ],
    hindi: [
      { name: 'वसंत — ध्वनि', topics: ['कविता विश्लेषण', 'प्रकृति चित्रण', 'अलंकार पहचान'] },
      { name: 'वसंत — लाख की चूड़ियाँ', topics: ['कहानी बोध', 'ग्रामीण जीवन', 'मुहावरे'] },
      { name: 'वसंत — कबीर की साखियाँ', topics: ['दोहा अर्थ', 'कबीर का दर्शन', 'भक्ति काव्य'] },
    ],
    kannada: [
      { name: 'ಗದ್ಯ — ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ', topics: ['ಗದ್ಯ ಸಾರ', 'ಕನ್ನಡ ಭಾಷಾ ಪ್ರೇಮ', 'ಪ್ರಬಂಧ ಬರೆಹ'] },
      { name: 'ಪದ್ಯ — ಹಕ್ಕಿ ಹಾಡು', topics: ['ದ.ರಾ.ಬೇಂದ್ರೆ ಕವಿ ಪರಿಚಯ', 'ಪದ್ಯ ಭಾವಾರ್ಥ', 'ಛಂದಸ್ಸು-ಅಲಂಕಾರ'] },
      { name: 'ವ್ಯಾಕರಣ — ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯ', topics: ['ಪ್ರಥಮಾ ವಿಭಕ್ತಿ', 'ದ್ವಿತೀಯಾ ವಿಭಕ್ತಿ', 'ಷಷ್ಠೀ ವಿಭಕ್ತಿ'] },
    ],
    social: [
      { name: 'The Indian Constitution', topics: ['Fundamental Rights', 'Directive Principles', 'Preamble'] },
      { name: 'Resources – Types and Conservation', topics: ['Natural Resources', 'Human-made Resources', 'Conservation Methods'] },
      { name: 'Ruling the Countryside', topics: ['East India Company', 'Permanent Settlement', 'Blue Rebellion'] },
    ],
  },
  9: {
    math: [
      { name: 'Number Systems', topics: ['Irrational Numbers', 'Real Number Line', 'Laws of Exponents'] },
      { name: 'Polynomials', topics: ['Zeros of Polynomial', 'Remainder Theorem', 'Factorisation'] },
      { name: 'Coordinate Geometry', topics: ['Cartesian Plane', 'Plotting Points', 'Quadrants'] },
      { name: 'Heron\'s Formula', topics: ['Area of Triangle', 'Application Problems', 'Semi-perimeter'] },
    ],
    science: [
      { name: 'Matter in Our Surroundings', topics: ['States of Matter', 'Change of State', 'Evaporation'] },
      { name: 'The Fundamental Unit of Life', topics: ['Cell Structure', 'Organelles', 'Cell Division'] },
      { name: 'Motion', topics: ['Distance and Displacement', 'Speed and Velocity', 'Equations of Motion'] },
      { name: 'Force and Laws of Motion', topics: ['Newton\'s First Law', 'Newton\'s Second Law', 'Third Law and Conservation of Momentum'] },
    ],
    english: [
      { name: 'Beehive – The Fun They Had', topics: ['Futuristic Story', 'Comprehension', 'Grammar: Reported Speech'] },
      { name: 'Beehive – The Sound of Music', topics: ['Biographical Narrative', 'Vocabulary', 'Article Writing'] },
      { name: 'Moments – The Lost Child', topics: ['Supplementary Comprehension', 'Empathy and Values', 'Descriptive Writing'] },
    ],
    hindi: [
      { name: 'क्षितिज — दो बैलों की कथा', topics: ['कहानी बोध (प्रेमचंद)', 'पात्र विश्लेषण', 'लेखन कौशल'] },
      { name: 'क्षितिज — ल्हासा की ओर', topics: ['यात्रा वृत्तांत', 'भूगोल ज्ञान', 'सारांश लेखन'] },
      { name: 'कृतिका — इस जल प्रलय में', topics: ['रिपोर्ताज', 'आपदा प्रबंधन', 'विचार अभिव्यक्ति'] },
    ],
    kannada: [
      { name: 'ಗದ್ಯ — ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ', topics: ['ಜೀವನ ಚರಿತ್ರೆ', 'ಗದ್ಯ ಸಾರ', 'ಮೌಲ್ಯ ಶಿಕ್ಷಣ'] },
      { name: 'ಪದ್ಯ — ಎದೆಗೆ ಬಿದ್ದ ಅಕ್ಷರ', topics: ['ಆಧುನಿಕ ಕವನ', 'ಕವಿ ಉದ್ದೇಶ', 'ಭಾಷಾ ಸೌಂದರ್ಯ'] },
      { name: 'ವ್ಯಾಕರಣ — ಅಲಂಕಾರ ಮತ್ತು ಛಂದಸ್ಸು', topics: ['ಉಪಮಾ ಅಲಂಕಾರ', 'ರೂಪಕ ಅಲಂಕಾರ', 'ಛಂದಸ್ಸು ಪ್ರಕಾರ'] },
    ],
    social: [
      { name: 'The French Revolution', topics: ['Causes', 'Reign of Terror', 'Impact on World'] },
      { name: 'India – Size and Location', topics: ['Latitude and Longitude', 'Neighbouring Countries', 'Standard Meridian'] },
      { name: 'Constitutional Design', topics: ['Making of Constitution', 'Key Features', 'Fundamental Duties'] },
    ],
  },
  10: {
    math: [
      { name: 'Real Numbers', topics: ['Euclid\'s Division Lemma', 'Fundamental Theorem of Arithmetic', 'Irrational Numbers Proof'] },
      { name: 'Polynomials', topics: ['Geometric Meaning of Zeros', 'Relationship Between Zeros and Coefficients', 'Division Algorithm'] },
      { name: 'Pair of Linear Equations', topics: ['Graphical Method', 'Substitution Method', 'Cross-multiplication Method'] },
      { name: 'Trigonometry', topics: ['Trigonometric Ratios', 'Ratios of Specific Angles', 'Trigonometric Identities'] },
    ],
    science: [
      { name: 'Chemical Reactions and Equations', topics: ['Balancing Equations', 'Types of Reactions', 'Corrosion and Rancidity'] },
      { name: 'Life Processes', topics: ['Nutrition', 'Respiration', 'Transportation in Human Beings'] },
      { name: 'Light – Reflection and Refraction', topics: ['Laws of Reflection', 'Mirror Formula', 'Refraction Through Glass Slab'] },
      { name: 'Electricity', topics: ['Ohm\'s Law', 'Resistance', 'Electric Power and Energy'] },
    ],
    english: [
      { name: 'First Flight – A Letter to God', topics: ['Story Analysis', 'Faith and Belief', 'Grammar: Determiners'] },
      { name: 'First Flight – Nelson Mandela', topics: ['Autobiography', 'Apartheid', 'Essay Writing'] },
      { name: 'Footprints – A Triumph of Surgery', topics: ['Supplementary Story', 'Inference Skills', 'Diary Entry Writing'] },
    ],
    hindi: [
      { name: 'क्षितिज — सूरदास के पद', topics: ['भक्ति काव्य', 'पद अर्थ', 'काव्य सौंदर्य'] },
      { name: 'क्षितिज — बालगोबिन भगत', topics: ['चरित्र चित्रण', 'ग्रामीण परिवेश', 'विचार विमर्श'] },
      { name: 'कृतिका — माता का अँचल', topics: ['बचपन वर्णन', 'ग्रामीण जीवन शैली', 'सारांश और विश्लेषण'] },
    ],
    kannada: [
      { name: 'ಗದ್ಯ — ಶಬ್ದ ಮಣಿ ದರ್ಪಣ', topics: ['ಗದ್ಯ ಸಾರ', 'ಕೇಶಿರಾಜ ಪರಿಚಯ', 'ಪ್ರಶ್ನೋತ್ತರ'] },
      { name: 'ಪದ್ಯ — ಜೀವನ ಧರ್ಮ ಯೋಗ', topics: ['ಕುವೆಂಪು ಕವಿತೆ', 'ಜೀವನ ಮೌಲ್ಯ', 'ಕಾವ್ಯ ವಿಶ್ಲೇಷಣೆ'] },
      { name: 'ವ್ಯಾಕರಣ — ಸಮಾಸ ಮತ್ತು ತತ್ಸಮ-ತದ್ಭವ', topics: ['ಸಮಾಸ ವಿಧಗಳು', 'ತತ್ಸಮ ಪದಗಳು', 'ತದ್ಭವ ಪದಗಳು'] },
    ],
    social: [
      { name: 'The Rise of Nationalism in Europe', topics: ['French Revolution Impact', 'Unification of Italy and Germany', 'Nationalism and Imperialism'] },
      { name: 'Resources and Development', topics: ['Types of Resources', 'Soil Resources', 'Land Use Pattern'] },
      { name: 'Power Sharing', topics: ['Belgium and Sri Lanka', 'Forms of Power Sharing', 'Federal Government'] },
    ],
  },
};

// Subject-specific issue pools
const issuesBySubject: Record<string, string[]> = {
  math: [
    'Word problems left incomplete',
    'Missing steps in calculations',
    'Formula application errors',
    'Place value confusion',
    'Unable to interpret data from graphs',
    'Algebraic manipulation mistakes',
  ],
  science: [
    'Diagram labelling incomplete',
    'Scientific reasoning weak',
    'Experiment conclusions not written',
    'Unable to differentiate between concepts',
    'Chemical equation balancing errors',
    'Definitions not precise',
  ],
  english: [
    'Reading comprehension weak',
    'Grammar errors — tense inconsistency',
    'Spelling and punctuation mistakes',
    'Unable to frame answers in own words',
    'Creative writing lacks structure',
    'Vocabulary usage limited',
  ],
  hindi: [
    'व्याकरण त्रुटियाँ — लिंग-वचन',
    'गद्यांश बोध में कमजोरी',
    'मुहावरे-लोकोक्ति का गलत प्रयोग',
    'वर्तनी दोष',
    'अनुच्छेद में क्रम भंग',
    'कविता भाव समझ कमजोर',
  ],
  kannada: [
    'ವ್ಯಾಕರಣ ದೋಷ — ಲಿಂಗ ವಚನ',
    'ಗದ್ಯ ಅರ್ಥ ಗ್ರಹಿಕೆ ಕಡಿಮೆ',
    'ಪದ ಸಂಪತ್ತು ಸೀಮಿತ',
    'ಕಾಗುಣಿತ ತಪ್ಪು',
    'ಪ್ರಬಂಧ ಬರೆಹದಲ್ಲಿ ಕ್ರಮ ತಪ್ಪು',
    'ಪದ್ಯ ಭಾವಾರ್ಥ ಬರೆಯಲು ಕಷ್ಟ',
  ],
  social: [
    'Map work inaccurate',
    'Date and event confusion',
    'Unable to connect cause and effect',
    'Answer too brief — lacks explanation',
    'Constitutional concepts mixed up',
    'Geographical terms not understood',
  ],
};

// Subject-specific student topic scores
const topicsBySubject: Record<string, { topic: string; baseScore: number }[]> = {
  math: [
    { topic: 'Number Systems', baseScore: 88 },
    { topic: 'Geometry', baseScore: 72 },
    { topic: 'Algebra', baseScore: 65 },
    { topic: 'Word Problems', baseScore: 48 },
  ],
  science: [
    { topic: 'Biology', baseScore: 82 },
    { topic: 'Physics', baseScore: 68 },
    { topic: 'Chemistry', baseScore: 60 },
    { topic: 'Practicals / Diagrams', baseScore: 75 },
  ],
  english: [
    { topic: 'Reading Comprehension', baseScore: 78 },
    { topic: 'Grammar', baseScore: 65 },
    { topic: 'Writing Skills', baseScore: 55 },
    { topic: 'Vocabulary', baseScore: 70 },
  ],
  hindi: [
    { topic: 'गद्य बोध', baseScore: 72 },
    { topic: 'कविता भाव', baseScore: 65 },
    { topic: 'व्याकरण', baseScore: 58 },
    { topic: 'लेखन कौशल', baseScore: 50 },
  ],
  kannada: [
    { topic: 'ಗದ್ಯ ಅರ್ಥ', baseScore: 74 },
    { topic: 'ಪದ್ಯ ಭಾವಾರ್ಥ', baseScore: 62 },
    { topic: 'ವ್ಯಾಕರಣ', baseScore: 56 },
    { topic: 'ನಿಬಂಧ / ಪ್ರಬಂಧ', baseScore: 68 },
  ],
  social: [
    { topic: 'History', baseScore: 70 },
    { topic: 'Geography', baseScore: 65 },
    { topic: 'Civics', baseScore: 75 },
    { topic: 'Map Work', baseScore: 50 },
  ],
};

// ═══════════════════════════════════════════════════════════════
// Generate class sections & subjects
// ═══════════════════════════════════════════════════════════════

const sectionLetters = ['A', 'B', 'C', 'D'];

const subjectTemplates = [
  { id: 'math', name: 'Mathematics' },
  { id: 'science', name: 'Science' },
  { id: 'english', name: 'English' },
  { id: 'hindi', name: 'Hindi' },
  { id: 'kannada', name: 'Kannada' },
  { id: 'social', name: 'Social Science' },
];

// Exam type offsets to vary data per exam
const examTypeOffsets: Record<string, number> = {
  FA1: 0, FA2: 5, SA1: -3, FA3: 8, FA4: 2, SA2: -6,
};

function getExamOffset(examType?: string): number {
  return examTypeOffsets[examType || 'FA1'] || 0;
}

function seededScore(classNum: number, sectionIdx: number, subjectIdx: number, examType?: string): number {
  const examOff = getExamOffset(examType);
  const base = ((classNum * 17 + sectionIdx * 31 + subjectIdx * 43) % 50) + 40 + examOff;
  return Math.min(95, Math.max(35, base));
}

// Default export for backward compat
export const classSections: ClassSection[] = buildClassSections();

export function buildClassSections(examType?: string): ClassSection[] {
  const result: ClassSection[] = [];
  for (let c = 1; c <= 10; c++) {
    sectionLetters.forEach((sec, si) => {
      const subjects: SubjectSummary[] = subjectTemplates.map((sub, subIdx) => {
        const score = seededScore(c, si, subIdx, examType);
        const issues = issuesBySubject[sub.id] || issuesBySubject['math'];
        const status: SubjectSummary['status'] = score >= 75 ? 'strong' : score >= 55 ? 'average' : 'needs-attention';
        return {
          id: sub.id,
          name: sub.name,
          avgScore: score,
          status,
          totalStudents: 35 + ((c + si) % 10),
          topIssue: issues[(c + si + subIdx) % issues.length],
        };
      });

      const classAvg = Math.round(subjects.reduce((s, sub) => s + sub.avgScore, 0) / subjects.length);
      const classStatus: ClassSection['status'] = classAvg >= 75 ? 'strong' : classAvg >= 55 ? 'average' : 'needs-attention';

      result.push({
        id: `c${c}${sec.toLowerCase()}`,
        classNum: c,
        section: sec,
        label: `Class ${c}${sec}`,
        totalStudents: subjects[0].totalStudents,
        avgScore: classAvg,
        status: classStatus,
        subjects,
      });
    });
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// Student mock data
// ═══════════════════════════════════════════════════════════════

function makeStudents(subjectId: string): StudentRecord[] {
  const topics = topicsBySubject[subjectId] || topicsBySubject['math'];

  const students: { base: Omit<StudentRecord, 'topicScores'>; scoreVariance: number[] }[] = [
    { base: { id: 's1', rollNo: '01', name: 'Aarav Kumar', score: 84, status: 'strong', trend: [78, 81, 84], trendDirection: 'up', learningPattern: 'Strong conceptual understanding. Excels in problem-solving but occasionally skips showing work.', mistakePatterns: ['Skips intermediate steps', 'Minor calculation errors in long problems'], suggestedActions: ['Encourage showing all steps', 'Give advanced problems for challenge', 'Assign peer tutoring role'] }, scoreVariance: [4, -2, 6, -8] },
    { base: { id: 's2', rollNo: '02', name: 'Priya Sharma', score: 72, status: 'average', trend: [65, 68, 72], trendDirection: 'up', learningPattern: 'Steady improvement. Understands concepts but needs more practice with application-type questions.', mistakePatterns: ['Incomplete answers in application questions', 'Formula application errors', 'Time management issues'], suggestedActions: ['Give 3 application questions daily', 'Practice timed exercises', 'Pair with Aarav for group work'] }, scoreVariance: [-2, 6, -5, -18] },
    { base: { id: 's3', rollNo: '03', name: 'Rohan Gupta', score: 42, status: 'needs-support', trend: [38, 40, 42], trendDirection: 'up', learningPattern: 'Struggles with foundational concepts. Understands when explained individually but cannot apply independently.', mistakePatterns: ['Skips steps in solutions', 'Calculation errors', "Doesn't complete answers", 'Conceptual confusion in fundamentals'], suggestedActions: ['One-on-one revision sessions', 'Give 5 practice problems daily', 'Pair with a strong student', 'Focus on basics before advancing'] }, scoreVariance: [-18, -7, -10, -20] },
    { base: { id: 's4', rollNo: '04', name: 'Ananya Singh', score: 91, status: 'strong', trend: [88, 90, 91], trendDirection: 'up', learningPattern: 'Consistent top performer. Excellent at both conceptual and application questions.', mistakePatterns: ['Rare careless errors'], suggestedActions: ['Assign leadership in group activities', 'Provide enrichment problems', 'Encourage participation in olympiad'] }, scoreVariance: [4, 16, 10, 17] },
    { base: { id: 's5', rollNo: '05', name: 'Arjun Reddy', score: 55, status: 'average', trend: [52, 55, 55], trendDirection: 'stable', learningPattern: 'Understands concepts but loses marks due to incomplete steps and careless errors.', mistakePatterns: ['Incomplete steps', 'Calculation errors', 'Misreads question requirements'], suggestedActions: ['Focus on reading comprehension for questions', 'Practice step-by-step solutions', 'Weekly mini-tests'] }, scoreVariance: [-20, -3, -3, -25] },
    { base: { id: 's6', rollNo: '06', name: 'Meera Patel', score: 38, status: 'needs-support', trend: [45, 42, 38], trendDirection: 'down', learningPattern: 'Declining performance. Was average but recent exams show dropping confidence and engagement.', mistakePatterns: ['Leaves questions unanswered', 'Conceptual gaps in basics', 'No attempt at application questions'], suggestedActions: ['Immediate one-on-one session', 'Build confidence with easier problems first', 'Talk to parents about study routine', 'Daily 10-minute drills on weak areas'] }, scoreVariance: [-28, -14, -8, -28] },
    { base: { id: 's7', rollNo: '07', name: 'Vikram Joshi', score: 67, status: 'average', trend: [60, 63, 67], trendDirection: 'up', learningPattern: 'Improving steadily. Has specific strengths but weak in certain topics consistently.', mistakePatterns: ['Errors in specific concepts', 'Misapplies formulas', 'Inconsistent working'], suggestedActions: ['Extra practice on weak topics', 'Use visual aids for concepts', 'Leverage strengths to build confidence'] }, scoreVariance: [-16, 10, 5, -13] },
    { base: { id: 's8', rollNo: '08', name: 'Sneha Iyer', score: 48, status: 'needs-support', trend: [44, 46, 48], trendDirection: 'up', learningPattern: 'Slow but improving. Needs more time and repeated practice to grasp concepts.', mistakePatterns: ['Slow processing', 'Repeats same mistakes', 'Weak in multi-step problems'], suggestedActions: ['Allow extra time in tests', 'Provide worked examples before practice', 'Daily 15-minute revision sessions'] }, scoreVariance: [-22, -4, -7, -16] },
    { base: { id: 's9', rollNo: '09', name: 'Karthik Nair', score: 76, status: 'strong', trend: [70, 73, 76], trendDirection: 'up', learningPattern: 'Good overall performer. Particularly strong in specific areas with minor weak spots.', mistakePatterns: ['Occasional errors in complex problems', 'Application question interpretation'], suggestedActions: ['Targeted practice on weak areas', 'Advanced problems for strong areas', 'Encourage competition participation'] }, scoreVariance: [-4, -2, 9, 0] },
    { base: { id: 's10', rollNo: '10', name: 'Divya Menon', score: 61, status: 'average', trend: [58, 60, 61], trendDirection: 'up', learningPattern: 'Consistent but needs push to move from average to strong. Understands when guided.', mistakePatterns: ['Dependent on memorisation without understanding', 'Weak conceptual base in some topics', 'Needs repeated practice'], suggestedActions: ['Conceptual teaching over rote learning', 'Assign buddy from strong group', 'Weekly progress check-ins'] }, scoreVariance: [-12, -3, 4, -14] },
  ];

  return students.map(({ base, scoreVariance }) => ({
    ...base,
    topicScores: topics.map((t, i) => ({
      topic: t.topic,
      score: Math.min(100, Math.max(10, t.baseScore + (scoreVariance[i] || 0) + (base.score - 62))),
    })),
  }));
}

// ═══════════════════════════════════════════════════════════════
// Build class-subject detail data
// ═══════════════════════════════════════════════════════════════

function getStatusFromScore(s: number): 'strong' | 'average' | 'weak' {
  return s >= 75 ? 'strong' : s >= 55 ? 'average' : 'weak';
}

export function getClassSubjectData(classSection: ClassSection, subjectSummary: SubjectSummary, examType?: string): ClassSubjectData {
  const subjectId = subjectSummary.id;
  const examOff = getExamOffset(examType);
  const classNum = classSection.classNum;
  const curriculum = curriculumByClass[classNum]?.[subjectId] || curriculumByClass[6][subjectId];
  const issues = issuesBySubject[subjectId] || issuesBySubject['math'];

  const students = makeStudents(subjectId).map(s => ({
    ...s,
    score: Math.min(100, Math.max(10, s.score + (subjectSummary.avgScore - 62))),
  }));

  // Reassign status based on adjusted scores
  students.forEach(s => {
    s.status = s.score >= 75 ? 'strong' : s.score >= 50 ? 'average' : 'needs-support';
  });

  const below50 = students.filter(s => s.score < 50).length;
  const above80 = students.filter(s => s.score > 80).length;

  // Build chapters from curriculum
  const chapters: ChapterPerformance[] = curriculum.map((ch, i) => {
    const offsets = [-4, 10, 19, 5];
    const baseScore = Math.min(95, Math.max(30, subjectSummary.avgScore + (offsets[i] || 0)));
    return {
      id: `ch${i + 1}`,
      name: ch.name,
      avgScore: baseScore,
      status: getStatusFromScore(baseScore),
      topics: ch.topics.map((topicName, ti) => {
        const topicOffsets = [13, 0, -21, 6, -7, 23, 20, 28];
        const topicScore = Math.min(98, Math.max(20, subjectSummary.avgScore + (topicOffsets[(i * 3 + ti) % topicOffsets.length] || 0)));
        return {
          name: topicName,
          score: topicScore,
          status: getStatusFromScore(topicScore),
        };
      }),
    };
  });

  // Subject-specific learning gaps
  const topIssueIdx = issues.indexOf(subjectSummary.topIssue);
  const gap2 = issues[(topIssueIdx + 1) % issues.length];
  const gap3 = issues[(topIssueIdx + 2) % issues.length];

  // Subject-specific teaching plan
  const subjectName = subjectSummary.name;
  const weakChapter = chapters.reduce((w, c) => c.avgScore < w.avgScore ? c : w, chapters[0]);

  return {
    classId: classSection.id,
    className: classSection.label,
    subject: subjectName,
    avgScore: subjectSummary.avgScore,
    classStatus: subjectSummary.status,
    studentsBelow50: below50,
    studentsAbove80: above80,
    totalStudents: subjectSummary.totalStudents,
    learningGaps: [
      { issue: subjectSummary.topIssue, affectedStudents: Math.round(subjectSummary.totalStudents * 0.7), severity: 'high' as const },
      { issue: gap2, affectedStudents: Math.round(subjectSummary.totalStudents * 0.6), severity: 'high' as const },
      { issue: gap3, affectedStudents: Math.round(subjectSummary.totalStudents * 0.45), severity: 'medium' as const },
    ],
    chapters,
    students,
    teachingPlan: [
      { day: 1, tasks: [`Revise "${weakChapter.name}" — focus on common mistakes`, `Quick recap of key concepts in ${subjectName}`] },
      { day: 2, tasks: [`Practice application questions from "${weakChapter.name}"`, 'Pair weak students with strong ones for peer learning'] },
      { day: 3, tasks: [`15-min assessment on weak topics`, `Group activity: problem-solving in ${subjectName}`, 'Review and feedback session'] },
    ],
  };
}

// All students (default Math topics for studentwise tab)
export const allStudents = makeStudents('math');

// ═══════════════════════════════════════════════════════════════
// Per-subject student data for student detail view
// ═══════════════════════════════════════════════════════════════

export interface StudentChapterPerformance {
  id: string;
  name: string;
  score: number;
  status: 'strong' | 'average' | 'weak';
  topics: { name: string; score: number; status: 'strong' | 'average' | 'weak' }[];
  aiComment: string;
}

export interface SubjectStudentData {
  subjectId: string;
  subjectName: string;
  score: number;
  status: 'strong' | 'average' | 'needs-support';
  topicScores: { topic: string; score: number }[];
  mistakePatterns: string[];
  suggestedActions: string[];
  learningPattern: string;
  trend: number[];
  trendDirection: 'up' | 'down' | 'stable';
  chapters: StudentChapterPerformance[];
}

const subjectNames: Record<string, string> = {
  math: 'Mathematics', science: 'Science', english: 'English',
  hindi: 'Hindi', kannada: 'Kannada', social: 'Social Science',
};

const chapterComments: Record<string, string[]> = {
  strong: [
    'Excellent grasp — minimal errors, ready for advanced problems.',
    'Consistently strong performance across all topics in this chapter.',
    'Demonstrates deep understanding, can help peers in this area.',
  ],
  average: [
    'Understands basics but struggles with application-level questions.',
    'Partial understanding — needs targeted practice on weaker topics.',
    'Shows potential but inconsistent performance across topics.',
  ],
  weak: [
    'Significant gaps — foundational concepts need re-teaching.',
    'Consistently low scores — requires dedicated remedial sessions.',
    'Struggles with both conceptual and application questions here.',
  ],
};

function getChapterComment(status: 'strong' | 'average' | 'weak', chapterIdx: number): string {
  const comments = chapterComments[status];
  return comments[chapterIdx % comments.length];
}

export function getStudentAllSubjects(studentId: string, examType?: string): SubjectStudentData[] {
  const subjectIds = ['math', 'science', 'english', 'hindi', 'kannada', 'social'];
  const examOffset = examTypeOffsets[examType || 'FA1'] || 0;

  // Use a default class (6) for curriculum - in real app this would be dynamic
  const defaultClass = 6;

  return subjectIds.map(subjectId => {
    const students = makeStudents(subjectId);
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    const subjectOffset = { math: 0, science: -3, english: 5, hindi: -5, kannada: -2, social: 3 }[subjectId] || 0;
    const adjustedScore = Math.min(100, Math.max(10, student.score + subjectOffset + examOffset));
    const adjustedStatus: SubjectStudentData['status'] = adjustedScore >= 75 ? 'strong' : adjustedScore >= 50 ? 'average' : 'needs-support';

    // Build chapter data from curriculum
    const curriculum = curriculumByClass[defaultClass]?.[subjectId] || curriculumByClass[6]?.[subjectId] || [];
    const chapters: StudentChapterPerformance[] = curriculum.map((ch, i) => {
      const offsets = [-6, 8, -15, 12, -3, 18];
      const chapterScore = Math.min(98, Math.max(15, adjustedScore + (offsets[i % offsets.length] || 0)));
      const chStatus = chapterScore >= 75 ? 'strong' as const : chapterScore >= 55 ? 'average' as const : 'weak' as const;
      return {
        id: `ch${i + 1}`,
        name: ch.name,
        score: chapterScore,
        status: chStatus,
        topics: ch.topics.map((topicName, ti) => {
          const topicOffsets = [10, -5, -18, 14, -8, 22, 7, -12];
          const topicScore = Math.min(98, Math.max(12, adjustedScore + (topicOffsets[(i * 3 + ti) % topicOffsets.length] || 0)));
          return {
            name: topicName,
            score: topicScore,
            status: topicScore >= 75 ? 'strong' as const : topicScore >= 55 ? 'average' as const : 'weak' as const,
          };
        }),
        aiComment: getChapterComment(chStatus, i),
      };
    });

    return {
      subjectId,
      subjectName: subjectNames[subjectId],
      score: adjustedScore,
      status: adjustedStatus,
      topicScores: student.topicScores.map(t => ({
        ...t,
        score: Math.min(100, Math.max(10, t.score + subjectOffset)),
      })),
      mistakePatterns: student.mistakePatterns,
      suggestedActions: student.suggestedActions,
      learningPattern: student.learningPattern,
      trend: student.trend.map(t => Math.min(100, Math.max(10, t + subjectOffset))),
      trendDirection: student.trendDirection,
      chapters,
    };
  }).filter(Boolean) as SubjectStudentData[];
}
