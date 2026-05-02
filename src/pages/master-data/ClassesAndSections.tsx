import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import MasterDataStepFooter from '@/components/MasterDataStepFooter';

interface Section {
  id: string;
  name: string;
  capacity?: number;
}

interface ClassData {
  id: string;
  name: string;
  sections: Section[];
}

const ClassesAndSections = () => {
  const { toast } = useToast();
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [expandedClasses, setExpandedClasses] = useState<string[]>(['1']);

  const [classes, setClasses] = useState<ClassData[]>([
    { id: '1', name: 'Class 1', sections: [{ id: 's1', name: 'A' }, { id: 's2', name: 'B' }] },
    { id: '2', name: 'Class 2', sections: [{ id: 's3', name: 'A' }, { id: 's4', name: 'B' }] },
    { id: '3', name: 'Class 3', sections: [{ id: 's5', name: 'A' }] },
    { id: '4', name: 'Class 4', sections: [{ id: 's6', name: 'A' }, { id: 's7', name: 'B' }] },
    { id: '5', name: 'Class 5', sections: [{ id: 's8', name: 'A' }] },
  ]);

  const [classFormData, setClassFormData] = useState({ name: '' });
  const [sectionFormData, setSectionFormData] = useState({ name: '' });

  

  const toggleExpanded = (classId: string) => {
    setExpandedClasses(prev => prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const newClass: ClassData = { id: Date.now().toString(), name: classFormData.name, sections: [] };
    setClasses([...classes, newClass]);
    setClassFormData({ name: '' });
    setIsClassDialogOpen(false);
    toast({ title: 'Class added successfully' });
  };

  const handleBulkCreate = () => {
    const existing = classes.map(c => c.name);
    const newClasses: ClassData[] = [];
    for (let i = 1; i <= 10; i++) {
      const name = `Class ${i}`;
      if (!existing.includes(name)) {
        newClasses.push({ id: `bulk-${i}`, name, sections: [{ id: `bulk-s-${i}`, name: 'A' }] });
      }
    }
    if (newClasses.length > 0) {
      setClasses([...classes, ...newClasses]);
      toast({ title: `${newClasses.length} classes created with section A` });
    } else {
      toast({ title: 'All classes 1–10 already exist' });
    }
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    const newSection: Section = { id: Date.now().toString(), name: sectionFormData.name };
    setClasses(classes.map(c => c.id === selectedClass.id ? { ...c, sections: [...c.sections, newSection] } : c));
    setSectionFormData({ name: '' });
    setIsSectionDialogOpen(false);
    toast({ title: 'Section added successfully' });
  };

  const handleDeleteClass = (classId: string) => {
    setClasses(classes.filter(c => c.id !== classId));
    toast({ title: 'Class deleted' });
  };

  const handleDeleteSection = (classId: string, sectionId: string) => {
    setClasses(classes.map(c => c.id === classId ? { ...c, sections: c.sections.filter(s => s.id !== sectionId) } : c));
    toast({ title: 'Section deleted' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Classes & Sections</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {classes.length} classes · {classes.reduce((s, c) => s + c.sections.length, 0)} sections
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkCreate} className="gap-2">
            <Zap className="w-4 h-4" />
            Create Classes 1–10
          </Button>
          <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Class</DialogTitle></DialogHeader>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div>
                  <Label htmlFor="className">Class Name</Label>
                  <Input id="className" placeholder="e.g., Class 6" value={classFormData.name} onChange={(e) => setClassFormData({ name: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full">Add Class</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3 mt-5">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="card-shadow">
            <Collapsible open={expandedClasses.includes(classItem.id)} onOpenChange={() => toggleExpanded(classItem.id)}>
              <CollapsibleTrigger asChild>
                <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedClasses.includes(classItem.id) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      <span className="font-medium text-foreground">{classItem.name}</span>
                      <Badge variant="secondary">{classItem.sections.length} sections</Badge>
                      
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedClass(classItem); setIsSectionDialogOpen(true); }}>
                        <Plus className="w-3 h-3 mr-1" />Add Section
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(classItem.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 ml-7 space-y-2">
                  {classItem.sections.map((section) => (
                    <div key={section.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-foreground">Section {section.name}</span>
                        <Badge variant="outline">Section {section.name}</Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteSection(classItem.id, section.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {classItem.sections.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">No sections added yet</p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Section to {selectedClass?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSection} className="space-y-4">
            <div>
              <Label htmlFor="sectionName">Section Name</Label>
              <Input id="sectionName" placeholder="e.g., A, B, C" value={sectionFormData.name} onChange={(e) => setSectionFormData({ name: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full">Add Section</Button>
          </form>
        </DialogContent>
      </Dialog>

      <MasterDataStepFooter currentStepId="classes" canProceed={classes.length > 0} />
    </div>
  );
};

export default ClassesAndSections;
