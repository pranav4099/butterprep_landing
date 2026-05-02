import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Upload as UploadIcon, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';

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
import { cn } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';
import SectionCard from '@/components/admin/SectionCard';

const initialClasses = [
  {
    name: 'Class 10',
    subjects: [
      { name: 'Mathematics', uploaded: true },
      { name: 'Science', uploaded: true },
      { name: 'English', uploaded: true },
      { name: 'Hindi', uploaded: false },
      { name: 'Social Studies', uploaded: false },
      { name: 'Computer Science', uploaded: false },
    ],
  },
  {
    name: 'Class 9',
    subjects: [
      { name: 'Mathematics', uploaded: true },
      { name: 'Science', uploaded: true },
      { name: 'English', uploaded: false },
      { name: 'Hindi', uploaded: false },
      { name: 'Social Studies', uploaded: false },
      { name: 'Computer Science', uploaded: false },
    ],
  },
  {
    name: 'Class 8',
    subjects: [
      { name: 'Mathematics', uploaded: false },
      { name: 'Science', uploaded: false },
      { name: 'English', uploaded: false },
      { name: 'Hindi', uploaded: false },
      { name: 'Social Studies', uploaded: false },
      { name: 'Computer Science', uploaded: false },
    ],
  },
];

const sectionsPerClass: Record<string, string[]> = {
  'Class 10': ['A', 'B', 'C', 'D'],
  'Class 9': ['A', 'B', 'C'],
  'Class 8': ['A', 'B'],
};

const teachers = [
  { id: '1', name: 'Dr. Sharma' },
  { id: '2', name: 'Mrs. Patel' },
  { id: '3', name: 'Mr. Gupta' },
  { id: '4', name: 'Ms. Verma' },
  { id: '5', name: 'Mr. Singh' },
];

const UploadPapers = () => {
  const [activeTab, setActiveTab] = useState<'question' | 'answer'>('question');
  const [expandedClasses, setExpandedClasses] = useState<string[]>(['Class 10']);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [classes, setClasses] = useState(initialClasses);

  useEffect(() => {
    if (selectedClass && !expandedClasses.includes(selectedClass)) {
      setExpandedClasses(prev => [...prev, selectedClass]);
    }
  }, [selectedClass]);

  useEffect(() => {
    setSelectedSection('');
    setSelectedTeacher('');
  }, [activeTab, selectedClass]);

  const toggleClass = (className: string) => {
    setExpandedClasses(prev =>
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  const getClassStats = (cls: typeof classes[0]) => {
    const uploaded = cls.subjects.filter(s => s.uploaded).length;
    const total = cls.subjects.length;
    return { uploaded, total };
  };

  const handleUpload = () => {
    if (!selectedClass || !selectedSubject) return;
    if (activeTab === 'answer' && !selectedSection) return;
    
    setClasses(prev => prev.map(cls => {
      if (cls.name === selectedClass) {
        return {
          ...cls,
          subjects: cls.subjects.map(sub => 
            sub.name === selectedSubject ? { ...sub, uploaded: true } : sub
          ),
        };
      }
      return cls;
    }));

    setSelectedSubject('');
    setSelectedSection('');
    setSelectedTeacher('');
  };

  const availableSections = selectedClass ? sectionsPerClass[selectedClass] || [] : [];

  const isSelected = (className: string, subjectName: string) => {
    return selectedClass === className && selectedSubject === subjectName;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Upload Papers"
        description="Upload question papers and student answer sheets per class & subject."
        icon={UploadIcon}
      />

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('question')}
          className={cn(
            'flex-1 py-4 px-6 rounded-2xl border-2 flex items-center justify-center gap-2 transition-colors',
            activeTab === 'question'
              ? 'border-purple bg-purple-light text-purple font-medium'
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
              ? 'border-purple bg-purple-light text-purple font-medium'
              : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
          )}
        >
          <RefreshCw className="w-5 h-5" />
          Answer Papers
        </button>
      </div>

      {/* Upload Form */}
      <SectionCard
        title={`Upload ${activeTab === 'question' ? 'Question' : 'Answer'} Paper`}
      >
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
                  {classes.map((cls) => (
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
                    {availableSections.map((section) => (
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
                  {selectedClass && classes.find(c => c.name === selectedClass)?.subjects.map((sub) => (
                    <SelectItem key={sub.name} value={sub.name}>
                      <span className="flex items-center gap-2">
                        {sub.name}
                        {sub.uploaded && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeTab === 'answer' && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Assign To</label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher} disabled={!selectedSubject}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={selectedSubject ? "Select teacher" : "Select subject first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <Button 
              disabled={!selectedClass || !selectedSubject || (activeTab === 'answer' && (!selectedSection || !selectedTeacher))} 
              onClick={handleUpload}
              className="bg-purple hover:bg-purple/90 text-white"
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Upload {activeTab === 'question' ? 'Question' : 'Answer'} Paper
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {activeTab === 'question' 
                ? "Select class and subject, then upload PDF or DOC file"
                : "Select class, section, subject & teacher, then upload PDF or DOC file"
              }
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Upload Status */}
      <SectionCard title="Upload Status by Class">
        <div className="space-y-3">
          {classes.map((cls) => {
            const { uploaded, total } = getClassStats(cls);
            const isClassSelected = selectedClass === cls.name;

            return (
              <div
                key={cls.name}
                className={cn(
                  "rounded-xl border bg-card transition-all duration-200 overflow-hidden",
                  isClassSelected && "ring-2 ring-purple ring-offset-2"
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
                      <p className={cn(
                        "font-medium",
                        isClassSelected ? "text-purple" : "text-foreground"
                      )}>
                        {cls.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{uploaded} of {total} uploaded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={(uploaded / total) * 100} className="w-32 h-2" />
                    <span className="text-sm font-medium w-10 text-right">
                      {Math.round((uploaded / total) * 100)}%
                    </span>
                  </div>
                </button>

                {expandedClasses.includes(cls.name) && cls.subjects.length > 0 && (
                  <div className="px-12 pb-4 flex flex-wrap gap-2">
                    {cls.subjects.map((subject) => {
                      const isSubjectSelected = isSelected(cls.name, subject.name);

                      return (
                        <span
                          key={subject.name}
                          onClick={() => {
                            setSelectedClass(cls.name);
                            setSelectedSubject(subject.name);
                          }}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm flex items-center gap-1 cursor-pointer transition-all duration-200',
                            subject.uploaded
                              ? 'bg-success-light text-success border border-success/30'
                              : 'bg-muted text-muted-foreground border border-border hover:border-muted-foreground',
                            isSubjectSelected && !subject.uploaded && 'ring-2 ring-purple bg-purple-light text-purple border-purple',
                            isSubjectSelected && subject.uploaded && 'ring-2 ring-success'
                          )}
                        >
                          {subject.name}
                          {subject.uploaded && <CheckCircle className="w-3.5 h-3.5" />}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};

export default UploadPapers;
