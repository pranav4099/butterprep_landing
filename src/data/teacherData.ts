// Teacher assignments — maps teachers to subjects and class-sections
// Supports multi-subject teachers (common in primary schools)

export interface TeacherAssignment {
  classNum: number;
  section: string;
  subjectId: string;
  subjectName: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  /** Primary subjects taught — derived from assignments */
  subjects: { id: string; name: string }[];
  assignments: TeacherAssignment[];
}

// Helper to build a teacher with typed assignments
function makeTeacher(
  id: string,
  name: string,
  assignments: TeacherAssignment[],
): TeacherProfile {
  const subjectMap = new Map<string, string>();
  assignments.forEach(a => subjectMap.set(a.subjectId, a.subjectName));
  return {
    id,
    name,
    subjects: Array.from(subjectMap.entries()).map(([sid, sname]) => ({ id: sid, name: sname })),
    assignments,
  };
}

// Shorthand to create assignments for a subject across multiple class-sections
function assign(subjectId: string, subjectName: string, classSections: [number, string][]): TeacherAssignment[] {
  return classSections.map(([classNum, section]) => ({ classNum, section, subjectId, subjectName }));
}

export const teachers: TeacherProfile[] = [
  // ── Primary teachers (Classes 1–3): teach multiple subjects ──
  makeTeacher('t1', 'Ramesh Kumar', [
    ...assign('math', 'Mathematics', [[1, 'A'], [1, 'B'], [2, 'A']]),
    ...assign('science', 'Science', [[1, 'A'], [1, 'B'], [2, 'A']]),
  ]),
  makeTeacher('t2', 'Kavitha Rao', [
    ...assign('math', 'Mathematics', [[2, 'B'], [3, 'A'], [3, 'B']]),
    ...assign('science', 'Science', [[2, 'B'], [3, 'A'], [3, 'B']]),
  ]),
  makeTeacher('t6', 'Priya Nair', [
    ...assign('english', 'English', [[1, 'A'], [1, 'B'], [2, 'A'], [2, 'B'], [3, 'A'], [3, 'B']]),
    ...assign('hindi', 'Hindi', [[1, 'A'], [1, 'B']]),
  ]),
  makeTeacher('t8', 'Anjali Mishra', [
    ...assign('hindi', 'Hindi', [[2, 'A'], [2, 'B'], [3, 'A'], [3, 'B']]),
    ...assign('kannada', 'Kannada', [[1, 'A'], [1, 'B'], [2, 'A'], [2, 'B']]),
  ]),
  makeTeacher('t10', 'Lakshmi Gowda', [
    ...assign('kannada', 'Kannada', [[3, 'A'], [3, 'B']]),
    ...assign('social', 'Social Science', [[1, 'A'], [1, 'B'], [2, 'A'], [2, 'B'], [3, 'A'], [3, 'B']]),
  ]),

  // ── Middle school teachers (Classes 4–6): mostly single-subject, some dual ──
  makeTeacher('t3', 'Sunita Devi', [
    ...assign('math', 'Mathematics', [[4, 'A'], [4, 'B'], [5, 'A'], [5, 'B'], [6, 'A'], [6, 'B']]),
  ]),
  makeTeacher('t5', 'Anil Hegde', [
    ...assign('science', 'Science', [[4, 'A'], [4, 'B'], [5, 'A'], [5, 'B'], [6, 'A'], [6, 'B']]),
  ]),
  makeTeacher('t7', 'Mohan Das', [
    ...assign('english', 'English', [[4, 'A'], [4, 'B'], [5, 'A'], [5, 'B'], [6, 'A'], [6, 'B']]),
  ]),
  makeTeacher('t9', 'Rajesh Pandey', [
    ...assign('hindi', 'Hindi', [[4, 'A'], [4, 'B'], [5, 'A'], [5, 'B'], [6, 'A'], [6, 'B']]),
  ]),
  makeTeacher('t11', 'Venkatesh Murthy', [
    ...assign('kannada', 'Kannada', [[4, 'A'], [4, 'B'], [5, 'A'], [5, 'B'], [6, 'A'], [6, 'B']]),
  ]),
  makeTeacher('t14', 'Meena Kulkarni', [
    ...assign('social', 'Social Science', [[4, 'A'], [4, 'B'], [5, 'A'], [5, 'B'], [6, 'A'], [6, 'B']]),
  ]),

  // ── Senior teachers (Classes 7–10): single-subject specialists ──
  makeTeacher('t4', 'Deepak Joshi', [
    ...assign('math', 'Mathematics', [[7, 'A'], [7, 'B'], [8, 'A'], [8, 'B'], [9, 'A'], [9, 'B'], [10, 'A'], [10, 'B']]),
  ]),
  makeTeacher('t13', 'Suresh Patil', [
    ...assign('science', 'Science', [[7, 'A'], [7, 'B'], [8, 'A'], [8, 'B'], [9, 'A'], [9, 'B'], [10, 'A'], [10, 'B']]),
  ]),
  makeTeacher('t15', 'Harish Shetty', [
    ...assign('english', 'English', [[7, 'A'], [7, 'B'], [8, 'A'], [8, 'B'], [9, 'A'], [9, 'B'], [10, 'A'], [10, 'B']]),
  ]),
  makeTeacher('t16', 'Rekha Sharma', [
    ...assign('hindi', 'Hindi', [[7, 'A'], [7, 'B'], [8, 'A'], [8, 'B'], [9, 'A'], [9, 'B'], [10, 'A'], [10, 'B']]),
  ]),
  makeTeacher('t12', 'Shruthi Bhat', [
    ...assign('kannada', 'Kannada', [[7, 'A'], [7, 'B'], [8, 'A'], [8, 'B'], [9, 'A'], [9, 'B'], [10, 'A'], [10, 'B']]),
  ]),
  makeTeacher('t17', 'Nagesh Iyengar', [
    ...assign('social', 'Social Science', [[7, 'A'], [7, 'B'], [8, 'A'], [8, 'B'], [9, 'A'], [9, 'B'], [10, 'A'], [10, 'B']]),
  ]),
];
