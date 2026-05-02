import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  role: 'admin' | 'teacher';
}

interface AcademicYear {
  id: string;
  year: string;
  examName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface AuthContextType {
  user: User | null;
  selectedAcademicYear: AcademicYear | null;
  selectedExamType: string;
  isAuthenticated: boolean;
  selectAcademicYear: (year: AcademicYear) => void;
  setSelectedExamType: (examType: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const academicYears: AcademicYear[] = [
  {
    id: '1',
    year: '2025-2026',
    examName: 'Annual Exam 2026',
    startDate: 'March 15',
    endDate: 'March 30',
    isCurrent: true,
  },
  {
    id: '2',
    year: '2024-2025',
    examName: 'Annual Exam 2025',
    startDate: 'March 10',
    endDate: 'March 25',
    isCurrent: false,
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currentAcademicYear = academicYears.find(y => y.isCurrent) || academicYears[0];
  const [user] = useState<User | null>({ username: 'Admin', role: 'admin' });
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(currentAcademicYear);
  const [selectedExamType, setSelectedExamType] = useState<string>('FA1');

  const selectAcademicYear = (year: AcademicYear) => {
    setSelectedAcademicYear(year);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        selectedAcademicYear,
        selectedExamType,
        isAuthenticated: !!user && !!selectedAcademicYear,
        selectAcademicYear,
        setSelectedExamType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { academicYears };
export type { AcademicYear, User };
