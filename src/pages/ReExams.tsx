import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Upload as UploadIcon, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, RotateCcw, X, User, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/admin/PageHeader';
import SectionCard from '@/components/admin/SectionCard';

// ── Data ──────────────────────────────────────────────────────────────────────

const classesData = [
  { name: 'Class 10', sections: ['A', 'B', 'C', 'D'] },
  { name: 'Class 9', sections: ['A', 'B', 'C'] },
  { name: 'Class 8', sections: ['A', 'B'] },
];

const subjectsData = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];

const studentsPerSection: Record<string, { id: string; name: string; rollNo: string }[]> = {
  'Class 10-A': [
    { id: 's1', name: 'Aarav Sharma', rollNo: '001' },
    { id: 's2', name: 'Priya Patel', rollNo: '002' },
    { id: 's3', name: 'Rohan Gupta', rollNo: '003' },
    { id: 's4', name: 'Ananya Singh', rollNo: '004' },
    { id: 's5', name: 'Karthik Reddy', rollNo: '005' },
  ],
  'Class 10-B': [
    { id: 's6', name: 'Meera Iyer', rollNo: '001' },
    { id: 's7', name: 'Arjun Nair', rollNo: '002' },
    { id: 's8', name: 'Diya Chopra', rollNo: '003' },
    { id: 's9', name: 'Vikram Das', rollNo: '004' },
  ],
  'Class 10-C': [
    { id: 's10', name: 'Sneha Rao', rollNo: '001' },
    { id: 's11', name: 'Aditya Kumar', rollNo: '002' },
    { id: 's12', name: 'Ishita Jain', rollNo: '003' },
  ],
};

// Generate default students for sections without data
const getStudents = (cls: string, section: string) => {
  const key = `${cls}-${section}`;
  if (studentsPerSection[key]) return studentsPerSection[key];
  return [
    { id: `${key}-1`, name: 'Student 1', rollNo: '001' },
    { id: `${key}-2`, name: 'Student 2', rollNo: '002' },
    { id: `${key}-3`, name: 'Student 3', rollNo: '003' },
  ];
};

// Track uploads: key = "class-subject" for QP, "class-section-subject-studentId" for AP
type UploadRecord = Record<string, string>; // key -> filename

const ReExams = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'question' | 'answer'>('question');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [expandedClasses, setExpandedClasses] = useState<string[]>(['Class 10']);
  const [uploads, setUploads] = useState<UploadRecord>({});

  useEffect(() => {
    if (selectedClass && !expandedClasses.includes(selectedClass)) {
      setExpandedClasses(prev => [...prev, selectedClass]);
    }
  }, [selectedClass]);

  useEffect(() => {
    setSelectedSection('');
    setSelectedSubject('');
    setSelectedStudent('');
  }, [activeTab, selectedClass]);

  useEffect(() => {
    setSelectedStudent('');
  }, [selectedSection, selectedSubject]);

  const availableSections = selectedClass
    ? classesData.find(c => c.name === selectedClass)?.sections || []
    : [];

  const availableStudents = selectedClass && selectedSection
    ? getStudents(selectedClass, selectedSection)
    : [];

  const toggleClass = (className: string) => {
    setExpandedClasses(prev =>
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const getUploadKey = () => {
    if (activeTab === 'question') return `qp-${selectedClass}-${selectedSubject}`;
    return `ap-${selectedClass}-${selectedSection}-${selectedSubject}-${selectedStudent}`;
  };

  const handleUpload = () => {
    if (!selectedClass || !selectedSubject) return;
    if (activeTab === 'answer' && (!selectedSection || !selectedStudent)) return;

    const key = getUploadKey();
    const fileName = activeTab === 'question'
      ? `${selectedSubject.toLowerCase()}_${selectedClass.replace(' ', '')}_reexam_qp.pdf`
      : `${selectedSubject.toLowerCase()}_${selectedClass.replace(' ', '')}${selectedSection}_${selectedStudent}.pdf`;

    setUploads(prev => ({ ...prev, [key]: fileName }));
    toast({
      title: `${activeTab === 'question' ? 'Question' : 'Answer'} paper uploaded`,
      description: fileName,
    });

    if (activeTab === 'answer') {
      setSelectedStudent('');
    } else {
      setSelectedSubject('');
    }
  };

  // Stats per class
  const getClassStats = (className: string) => {
    const total = subjectsData.length;
    const uploaded = subjectsData.filter(sub => uploads[`qp-${className}-${sub}`]).length;
    return { uploaded, total };
  };

  const isSubjectUploaded = (className: string, subjectName: string) => {
    return !!uploads[`qp-${className}-${subjectName}`];
  };

  const isSelected = (className: string, subjectName: string) => {
    return selectedClass === className && selectedSubject === subjectName;
  };

  // Answer paper stats per class/section
  const getAnswerStats = (className: string, section: string) => {
    const students = getStudents(className, section);
    const total = students.length * subjectsData.length;
    let uploaded = 0;
    students.forEach(st => {
      subjectsData.forEach(sub => {
        if (uploads[`ap-${className}-${section}-${sub}-${st.id}`]) uploaded++;
      });
    });
    return { uploaded, total };
  };

  const canUpload = activeTab === 'question'
    ? selectedClass && selectedSubject
    : selectedClass && selectedSection && selectedSubject && selectedStudent;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Re-exam Papers"
        description="Upload re-exam question and answer papers for individual students."
        icon={RefreshCw}
      />

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('question')}
          className={cn(
            'flex-1 py-4 px-6 rounded-2xl border-2 flex items-center justify-center gap-2 transition-colors',
            activeTab === 'question'
              ? 'border-teal bg-teal-light text-teal font-medium'
              : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
          )}
        >
          <FileText className="w-5 h-5" />
          Question Papers
        </button>
        <button
          onClick={() => setActiveTab('answer')}
          className={cn(
            'flex-1 py-4 px-6 rounded-2xl border-2 flex items-center justify-center gap-2 transition-colors',
            activeTab === 'answer'
              ? 'border-teal bg-teal-light text-teal font-medium'
              : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
          )}
        >
          <RefreshCw className="w-5 h-5" />
          Answer Papers
        </button>
      </div>

      {/* Upload Form */}
      <SectionCard title={`Upload Re-exam ${activeTab === 'question' ? 'Question' : 'Answer'} Paper`}>
        <div>
          <div className={cn(
            "grid gap-6 mb-6",
            activeTab === 'answer' ? "grid-cols-4" : "grid-cols-2"
          )}>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Select Class</label>
              <Select value={selectedClass} onValueChange={(value) => {
                setSelectedClass(value);
                setSelectedSubject('');
                setSelectedSection('');
              }}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {classesData.map(cls => (
                    <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeTab === 'answer' && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Select Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClass}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={selectedClass ? "Choose section" : "Select class first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {availableSections.map(section => (
                      <SelectItem key={section} value={section}>Section {section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Select Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass || (activeTab === 'answer' && !selectedSection)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={
                    !selectedClass
                      ? "Select class first"
                      : (activeTab === 'answer' && !selectedSection)
                        ? "Select section first"
                        : "Choose subject"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {subjectsData.map(sub => (
                    <SelectItem key={sub} value={sub}>
                      <span className="flex items-center gap-2">
                        {sub}
                        {selectedClass && isSubjectUploaded(selectedClass, sub) && (
                          <CheckCircle className="w-3.5 h-3.5 text-success" />
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeTab === 'answer' && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Select Student</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedSubject}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={selectedSubject ? "Choose student" : "Select subject first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {availableStudents.map(st => {
                      const uploaded = !!uploads[`ap-${selectedClass}-${selectedSection}-${selectedSubject}-${st.id}`];
                      return (
                        <SelectItem key={st.id} value={st.id}>
                          <span className="flex items-center gap-2">
                            #{st.rollNo} — {st.name}
                            {uploaded && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <Button
              disabled={!canUpload}
              onClick={handleUpload}
              className="bg-teal hover:bg-teal/90 text-teal-foreground"
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Upload {activeTab === 'question' ? 'Question' : 'Answer'} Paper
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {activeTab === 'question'
                ? "Select class and subject, then upload PDF or DOC file"
                : "Select class, section, subject & student, then upload PDF or DOC file"
              }
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Upload Status */}
      <SectionCard title={activeTab === 'question' ? 'Upload Status by Class' : 'Upload Status by Class & Section'}>
        <div className="space-y-3">
          {classesData.map(cls => {
            if (activeTab === 'question') {
              const { uploaded, total } = getClassStats(cls.name);
              const isClassSelected = selectedClass === cls.name;

              return (
                <div
                  key={cls.name}
                  className={cn(
                    "rounded-xl border bg-card transition-all duration-200 overflow-hidden",
                    isClassSelected && "ring-2 ring-teal ring-offset-2"
                  )}
                >
                  <button
                    onClick={() => toggleClass(cls.name)}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedClasses.includes(cls.name) ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <p className={cn("font-medium", isClassSelected ? "text-teal" : "text-foreground")}>
                          {cls.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{uploaded} of {total} uploaded</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={total > 0 ? (uploaded / total) * 100 : 0} className="w-32 h-2" />
                      <span className="text-sm font-medium w-10 text-right">
                        {total > 0 ? Math.round((uploaded / total) * 100) : 0}%
                      </span>
                    </div>
                  </button>

                  {expandedClasses.includes(cls.name) && (
                    <div className="px-12 pb-4 flex flex-wrap gap-2">
                      {subjectsData.map(sub => {
                        const uploaded = isSubjectUploaded(cls.name, sub);
                        const subSelected = isSelected(cls.name, sub);

                        return (
                          <span
                            key={sub}
                            onClick={() => {
                              setSelectedClass(cls.name);
                              setSelectedSubject(sub);
                            }}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-sm flex items-center gap-1 cursor-pointer transition-all duration-200',
                              uploaded
                                ? 'bg-success-light text-success border border-success/30'
                                : 'bg-muted text-muted-foreground border border-border hover:border-muted-foreground',
                              subSelected && !uploaded && 'ring-2 ring-teal bg-teal-light text-teal border-teal',
                              subSelected && uploaded && 'ring-2 ring-success'
                            )}
                          >
                            {sub}
                            {uploaded && <CheckCircle className="w-3.5 h-3.5" />}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
              const isClassSelected = selectedClass === cls.name;

              return (
                <div
                  key={cls.name}
                  className={cn(
                    "rounded-xl border bg-card transition-all duration-200 overflow-hidden",
                    isClassSelected && "ring-2 ring-teal ring-offset-2"
                  )}
                >
                  <button
                    onClick={() => toggleClass(cls.name)}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedClasses.includes(cls.name) ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <p className={cn("font-medium", isClassSelected ? "text-teal" : "text-foreground")}>
                          {cls.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{cls.sections.length} sections</p>
                      </div>
                    </div>
                  </button>

                  {expandedClasses.includes(cls.name) && (
                    <div className="px-12 pb-4 space-y-3">
                      {cls.sections.map(section => {
                        const { uploaded, total } = getAnswerStats(cls.name, section);
                        const students = getStudents(cls.name, section);
                        const isSectionSelected = selectedClass === cls.name && selectedSection === section;

                        return (
                          <div
                            key={section}
                            onClick={() => {
                              setSelectedClass(cls.name);
                              setSelectedSection(section);
                            }}
                            className={cn(
                              'flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all',
                              isSectionSelected
                                ? 'border-teal bg-teal-light'
                                : 'border-border hover:border-muted-foreground'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className={cn("text-sm font-medium", isSectionSelected ? "text-teal" : "text-foreground")}>
                                  Section {section}
                                </p>
                                <p className="text-xs text-muted-foreground">{students.length} students · {uploaded}/{total} papers</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress value={total > 0 ? (uploaded / total) * 100 : 0} className="w-24 h-2" />
                              <span className="text-xs font-medium w-8 text-right">
                                {total > 0 ? Math.round((uploaded / total) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      </SectionCard>
    </div>
  );
};

export default ReExams;
