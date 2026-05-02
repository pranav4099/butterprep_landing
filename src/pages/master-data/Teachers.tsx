import React, { useState } from 'react';
import {
  Plus, Pencil, Trash2, Search, Upload, KeyRound, ShieldAlert,
  ShieldCheck, RotateCcw, Eye, EyeOff, Copy, MoreHorizontal,
  CheckCircle2, XCircle, Clock, AlertTriangle, UserPlus, User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import MasterDataStepFooter from '@/components/MasterDataStepFooter';

/* ─── Types ─── */

interface Teacher {
  id: string;
  empId: string;
  name: string;
  phone: string;
  isActive: boolean;
}

interface TeacherCredential {
  teacherId: string;
  email: string;
  accessStatus: 'active' | 'revoked';
  lastLogin: string | null;
  updatedBy: string;
  forcePasswordChange: boolean;
  createdAt: string;
}


const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

/* ─── Main Component ─── */

const Teachers = () => {
  const { toast } = useToast();

  /* Profile & Assignment state */
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: '1', empId: 'T001', name: 'Dr. Anil Kumar', phone: '9876543210', isActive: true },
    { id: '2', empId: 'T002', name: 'Mrs. Priya Sharma', phone: '9876543211', isActive: true },
    { id: '3', empId: 'T003', name: 'Mr. Rajesh Gupta', phone: '9876543212', isActive: true },
    { id: '4', empId: 'T004', name: 'Ms. Sunita Patel', phone: '9876543213', isActive: false },
  ]);

  const [formData, setFormData] = useState({ empId: '', name: '', phone: '' });

  /* Access & Credentials state */
  const [credentials, setCredentials] = useState<TeacherCredential[]>([
    { teacherId: '1', email: 'anil.kumar@school.edu', accessStatus: 'active', lastLogin: '2026-02-13 09:14 AM', updatedBy: 'Admin', forcePasswordChange: false, createdAt: '2026-01-10' },
    { teacherId: '2', email: 'priya.sharma@school.edu', accessStatus: 'active', lastLogin: '2026-02-12 03:22 PM', updatedBy: 'Admin', forcePasswordChange: false, createdAt: '2026-01-10' },
    { teacherId: '3', email: 'rajesh.gupta@school.edu', accessStatus: 'active', lastLogin: null, updatedBy: 'Admin', forcePasswordChange: true, createdAt: '2026-02-01' },
    { teacherId: '4', email: '', accessStatus: 'revoked', lastLogin: '2026-01-20 11:00 AM', updatedBy: 'Admin', forcePasswordChange: false, createdAt: '2026-01-15' },
  ]);

  const [credSearchQuery, setCredSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* Modals */
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [createAccountTeacherId, setCreateAccountTeacherId] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetTeacherId, setResetTeacherId] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeTeacherId, setRevokeTeacherId] = useState('');

  const [bulkAction, setBulkAction] = useState<'reset' | 'revoke' | null>(null);

  /* Helpers */
  const getTeacher = (id: string) => teachers.find(t => t.id === id);

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.empId.includes(searchQuery)
  );

  const filteredCredentials = credentials.filter(c => {
    const teacher = getTeacher(c.teacherId);
    if (!teacher) return false;
    const q = credSearchQuery.toLowerCase();
    return teacher.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || teacher.empId.includes(credSearchQuery);
  });

  /* Profile handlers */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      setTeachers(teachers.map(t => t.id === editingTeacher.id ? { ...t, ...formData } : t));
      toast({ title: 'Teacher updated successfully' });
    } else {
      const newId = Date.now().toString();
      setTeachers([...teachers, { id: newId, ...formData, isActive: true }]);
      setCredentials([...credentials, { teacherId: newId, email: '', accessStatus: 'revoked', lastLogin: null, updatedBy: 'Admin', forcePasswordChange: true, createdAt: new Date().toISOString().split('T')[0] }]);
      toast({ title: 'Teacher added successfully' });
    }
    setFormData({ empId: '', name: '', phone: '' });
    setEditingTeacher(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({ empId: teacher.empId, name: teacher.name, phone: teacher.phone });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTeachers(teachers.filter(t => t.id !== id));
    setCredentials(credentials.filter(c => c.teacherId !== id));
    toast({ title: 'Teacher deleted' });
  };

  const handleToggleActive = (id: string) => {
    setTeachers(teachers.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  };

  /* Credential handlers */
  const openCreateAccount = (teacherId: string) => {
    const teacher = getTeacher(teacherId);
    const cred = credentials.find(c => c.teacherId === teacherId);
    setCreateAccountTeacherId(teacherId);
    setCreateEmail(cred?.email || '');
    setGeneratedPassword(generateTempPassword());
    setShowPassword(false);
    setAccountCreated(false);
    setCreateAccountOpen(true);
  };

  const handleCreateAccount = () => {
    setCredentials(prev => prev.map(c =>
      c.teacherId === createAccountTeacherId
        ? { ...c, email: createEmail, accessStatus: 'active', forcePasswordChange: true, updatedBy: 'Admin' }
        : c
    ));
    setAccountCreated(true);
    toast({ title: 'Account created', description: `Login credentials generated for ${getTeacher(createAccountTeacherId)?.name}` });
  };

  const openReset = (teacherId: string) => {
    setResetTeacherId(teacherId);
    setResetPassword(generateTempPassword());
    setShowResetPassword(false);
    setPasswordReset(false);
    setResetOpen(true);
  };

  const handleReset = () => {
    setCredentials(prev => prev.map(c =>
      c.teacherId === resetTeacherId
        ? { ...c, forcePasswordChange: true, updatedBy: 'Admin' }
        : c
    ));
    setPasswordReset(true);
    toast({ title: 'Credentials reset', description: `New temporary password generated for ${getTeacher(resetTeacherId)?.name}` });
  };

  const openRevoke = (teacherId: string) => {
    setRevokeTeacherId(teacherId);
    setRevokeOpen(true);
  };

  const handleRevoke = () => {
    setCredentials(prev => prev.map(c =>
      c.teacherId === revokeTeacherId ? { ...c, accessStatus: 'revoked', updatedBy: 'Admin' } : c
    ));
    setRevokeOpen(false);
    toast({ title: 'Access revoked', description: `${getTeacher(revokeTeacherId)?.name} can no longer log in.` });
  };

  const handleReactivate = (teacherId: string) => {
    setCredentials(prev => prev.map(c =>
      c.teacherId === teacherId ? { ...c, accessStatus: 'active', updatedBy: 'Admin' } : c
    ));
    toast({ title: 'Access reactivated' });
  };

  const handleForcePasswordChange = (teacherId: string) => {
    setCredentials(prev => prev.map(c =>
      c.teacherId === teacherId ? { ...c, forcePasswordChange: true, updatedBy: 'Admin' } : c
    ));
    toast({ title: 'Password change enforced on next login' });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCredentials.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCredentials.map(c => c.teacherId)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const handleBulkConfirm = () => {
    if (bulkAction === 'reset') {
      setCredentials(prev => prev.map(c =>
        selectedIds.has(c.teacherId) ? { ...c, forcePasswordChange: true, updatedBy: 'Admin' } : c
      ));
      toast({ title: `Credentials reset for ${selectedIds.size} teachers` });
    } else if (bulkAction === 'revoke') {
      setCredentials(prev => prev.map(c =>
        selectedIds.has(c.teacherId) ? { ...c, accessStatus: 'revoked', updatedBy: 'Admin' } : c
      ));
      toast({ title: `Access revoked for ${selectedIds.size} teachers` });
    }
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  /* ─── Render ─── */

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-foreground">Teachers</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {teachers.filter(t => t.isActive).length} active teachers · {credentials.filter(c => c.accessStatus === 'active').length} with login access
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-5 w-full sm:w-auto bg-muted/50 p-1.5 h-12 rounded-xl border border-border/50">
          <TabsTrigger value="profile" className="gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:hover:bg-muted">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:hover:bg-muted">
            <KeyRound className="w-4 h-4" /> Access & Credentials
          </TabsTrigger>
        </TabsList>

        {/* ═══ Tab 1: Profile & Assignment ═══ */}
        <TabsContent value="profile" className="mt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => toast({ title: '📂 Bulk import coming soon' })}>
                <Upload className="w-4 h-4" />Import
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingTeacher(null); setFormData({ empId: '', name: '', phone: '' }); }}>
                    <Plus className="w-4 h-4 mr-2" />Add Teacher
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingTeacher ? 'Edit' : 'Add'} Teacher</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Employee ID</Label><Input placeholder="e.g., T001" value={formData.empId} onChange={(e) => setFormData({ ...formData, empId: e.target.value })} required /></div>
                      <div><Label>Full Name</Label><Input placeholder="Teacher's name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input placeholder="Contact number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <Button type="submit" className="w-full">{editingTeacher ? 'Update' : 'Add'} Teacher</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="card-shadow">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.empId}</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>
                        <Badge variant={teacher.isActive ? 'default' : 'secondary'} className="text-xs gap-1">
                          {teacher.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(teacher)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Tab 2: Access & Credentials ═══ */}
        <TabsContent value="access" className="mt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={credSearchQuery} onChange={(e) => setCredSearchQuery(e.target.value)} className="pl-9" />
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setBulkAction('reset')}>
                  <RotateCcw className="w-3.5 h-3.5" />Reset
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setBulkAction('revoke')}>
                  <ShieldAlert className="w-3.5 h-3.5" />Revoke
                </Button>
              </div>
            )}
          </div>

          <Card className="card-shadow">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filteredCredentials.length > 0 && selectedIds.size === filteredCredentials.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCredentials.map((cred) => {
                    const teacher = getTeacher(cred.teacherId);
                    if (!teacher) return null;
                    const hasAccount = !!cred.email;

                    return (
                      <TableRow key={cred.teacherId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(cred.teacherId)}
                            onCheckedChange={() => toggleSelect(cred.teacherId)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{teacher.name}</span>
                            <span className="block text-xs text-muted-foreground">{teacher.empId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {hasAccount ? (
                            <span className="text-sm">{cred.email}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No account</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch checked={teacher.isActive} onCheckedChange={() => handleToggleActive(teacher.id)} />
                            <span className={`text-xs w-12 ${teacher.isActive ? 'text-success' : 'text-muted-foreground'}`}>{teacher.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{cred.updatedBy}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {!hasAccount ? (
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openCreateAccount(cred.teacherId)}>
                              <UserPlus className="w-3.5 h-3.5" />Create Account
                            </Button>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openReset(cred.teacherId)} className="gap-2">
                                  <RotateCcw className="w-4 h-4" />Reset Credentials
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleForcePasswordChange(cred.teacherId)} className="gap-2">
                                  <KeyRound className="w-4 h-4" />Force Password Change
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {cred.accessStatus === 'active' ? (
                                  <DropdownMenuItem onClick={() => openRevoke(cred.teacherId)} className="gap-2 text-destructive focus:text-destructive">
                                    <ShieldAlert className="w-4 h-4" />Revoke Access
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleReactivate(cred.teacherId)} className="gap-2 text-success focus:text-success">
                                    <ShieldCheck className="w-4 h-4" />Re-activate Access
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══ Create Account Modal ═══ */}
      <Dialog open={createAccountOpen} onOpenChange={(open) => { if (!open) setCreateAccountOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />Create Teacher Account
            </DialogTitle>
            <DialogDescription>
              Set up login credentials for <span className="font-medium text-foreground">{getTeacher(createAccountTeacherId)?.name}</span>
            </DialogDescription>
          </DialogHeader>
          {!accountCreated ? (
            <div className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input type="email" placeholder="teacher@school.edu" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} required />
              </div>
              <div>
                <Label>Temporary Password</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="relative flex-1">
                    <Input type={showPassword ? 'text' : 'password'} value={generatedPassword} readOnly className="pr-10 font-mono text-sm" />
                    <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedPassword)} title="Copy password">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setGeneratedPassword(generateTempPassword())} title="Regenerate">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Teacher will be required to change this on first login.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateAccountOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateAccount} disabled={!createEmail}>Create Account</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-medium text-success flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4" />Account created successfully
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{createEmail}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Password</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm">{showPassword ? generatedPassword : '••••••••••••'}</span>
                      <button onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => copyToClipboard(generatedPassword)} className="text-muted-foreground hover:text-foreground">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />Save these credentials now. The password won't be shown again.
              </p>
              <DialogFooter>
                <Button onClick={() => setCreateAccountOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ Reset Credentials Modal ═══ */}
      <Dialog open={resetOpen} onOpenChange={(open) => { if (!open) setResetOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />Reset Credentials
            </DialogTitle>
            <DialogDescription>
              Generate a new temporary password for <span className="font-medium text-foreground">{getTeacher(resetTeacherId)?.name}</span>
            </DialogDescription>
          </DialogHeader>
          {!passwordReset ? (
            <div className="space-y-4">
              <div>
                <Label>New Temporary Password</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="relative flex-1">
                    <Input type={showResetPassword ? 'text' : 'password'} value={resetPassword} readOnly className="pr-10 font-mono text-sm" />
                    <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowResetPassword(!showResetPassword)}>
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(resetPassword)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setResetPassword(generateTempPassword())}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">The previous password will be invalidated immediately.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
                <Button onClick={handleReset}>Reset Password</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-medium text-success flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4" />Password reset successfully
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">New Password</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm">{showResetPassword ? resetPassword : '••••••••••••'}</span>
                    <button onClick={() => setShowResetPassword(!showResetPassword)} className="text-muted-foreground hover:text-foreground">
                      {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => copyToClipboard(resetPassword)} className="text-muted-foreground hover:text-foreground">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />Save this password now. It won't be shown again.
              </p>
              <DialogFooter>
                <Button onClick={() => setResetOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ Revoke Access Confirmation ═══ */}
      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />Revoke Teacher Access
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke access for <span className="font-medium text-foreground">{getTeacher(revokeTeacherId)?.name}</span>?
              They will be immediately logged out and unable to sign in until re-activated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ Bulk Action Confirmation ═══ */}
      <AlertDialog open={!!bulkAction} onOpenChange={(open) => { if (!open) setBulkAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'reset' ? 'Reset credentials for selected teachers?' : 'Revoke access for selected teachers?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will affect {selectedIds.size} teacher(s).
              {bulkAction === 'revoke' && ' They will be immediately logged out.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkConfirm}
              className={bulkAction === 'revoke' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {bulkAction === 'reset' ? 'Reset All' : 'Revoke All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MasterDataStepFooter currentStepId="teachers" canProceed={teachers.length > 0} />
    </div>
  );
};

export default Teachers;
