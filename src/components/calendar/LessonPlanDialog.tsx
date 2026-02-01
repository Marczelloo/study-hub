'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Clock, MapPin, User as PersonIcon, GraduationCap } from 'lucide-react';
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { lessonService, subjectService } from '@/services';
import type { Lesson, Subject, DayOfWeek } from '@/domain/types';

import { toast } from 'sonner';

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const SUBJECT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
];

// ─────────────────────────────────────────────────────────────────────────────
// Lesson Form Component
// ─────────────────────────────────────────────────────────────────────────────

interface LessonFormData {
  subjectId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  location?: string;
  instructor?: string;
}

interface LessonFormProps {
  lesson?: Lesson;
  subjects: Subject[];
  onSave: (data: LessonFormData) => void;
  onCancel: () => void;
  onSubjectCreated: () => void;
}

function LessonForm({ lesson, subjects, onSave, onCancel, onSubjectCreated }: LessonFormProps) {
  const [subjectId, setSubjectId] = useState(lesson?.subjectId || '');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(lesson?.dayOfWeek || 'monday');
  const [startTime, setStartTime] = useState(lesson?.startTime || '09:00');
  const [endTime, setEndTime] = useState(lesson?.endTime || '10:00');
  const [location, setLocation] = useState(lesson?.location || '');
  const [instructor, setInstructor] = useState(lesson?.instructor || '');
  
  // New subject creation
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      toast.error('Please select a subject');
      return;
    }
    onSave({ subjectId, dayOfWeek, startTime, endTime, location: location || undefined, instructor: instructor || undefined });
  };

  const handleCreateSubject = () => {
    if (!newSubjectName.trim()) {
      toast.error('Subject name is required');
      return;
    }
    const color = SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)];
    const newSubject = subjectService.create({ name: newSubjectName.trim(), color, semesterId: '' });
    setSubjectId(newSubject.id);
    setNewSubjectName('');
    setIsCreatingSubject(false);
    onSubjectCreated();
    toast.success(`Subject "${newSubject.name}" created`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject Selection */}
      <div className="space-y-2">
        <Label>Subject</Label>
        {isCreatingSubject ? (
          <div className="flex gap-2">
            <Input
              placeholder="New subject name..."
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateSubject())}
              autoFocus
            />
            <Button type="button" onClick={handleCreateSubject}>Add</Button>
            <Button type="button" variant="ghost" onClick={() => setIsCreatingSubject(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select subject..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={() => setIsCreatingSubject(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Day & Time */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Day</Label>
          <Select value={dayOfWeek} onValueChange={(v) => setDayOfWeek(v as DayOfWeek)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS_ORDER.map((d) => (
                <SelectItem key={d} value={d}>{DAY_LABELS[d]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Start</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>End</Label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
      </div>

      {/* Optional Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Room (optional)</Label>
          <Input placeholder="e.g. Room 101" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Instructor (optional)</Label>
          <Input placeholder="e.g. Prof. Smith" value={instructor} onChange={(e) => setInstructor(e.target.value)} />
        </div>
      </div>

      {/* Actions */}
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{lesson ? 'Update' : 'Add Lesson'}</Button>
      </DialogFooter>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Timetable Grid Component (visual weekly schedule)
// ─────────────────────────────────────────────────────────────────────────────

interface TimetableProps {
  lessons: Lesson[];
  subjects: Subject[];
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
}

function Timetable({ lessons, subjects, onEdit, onDelete }: TimetableProps) {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  
  // Group lessons by day
  const lessonsByDay = DAYS_ORDER.reduce((acc, day) => {
    acc[day] = lessons
      .filter((l) => l.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<DayOfWeek, Lesson[]>);

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No lessons added yet</p>
        <p className="text-sm">Click &quot;Add Lesson&quot; to create your schedule</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day Headers */}
      {DAYS_ORDER.map((day) => (
        <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2 border-b">
          {DAY_LABELS[day]}
        </div>
      ))}

      {/* Lesson Cards by Day */}
      {DAYS_ORDER.map((day) => (
        <div key={day} className="min-h-30 space-y-1">
          {lessonsByDay[day].map((lesson) => {
            const subject = subjectMap.get(lesson.subjectId);
            return (
              <Card
                key={lesson.id}
                className="p-2 text-xs cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all group relative"
                style={{ borderLeftColor: subject?.color, borderLeftWidth: '3px' }}
                onClick={() => onEdit(lesson)}
              >
                <div className="font-medium truncate" style={{ color: subject?.color }}>
                  {subject?.name || 'Unknown'}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                  <Clock className="h-3 w-3" />
                  {lesson.startTime}-{lesson.endTime}
                </div>
                {lesson.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {lesson.location}
                  </div>
                )}
                {lesson.instructor && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <PersonIcon className="h-3 w-3" />
                    {lesson.instructor}
                  </div>
                )}
                
                {/* Delete button - appears on hover */}
                <button
                  className="absolute top-1 right-1 p-1 rounded bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); onDelete(lesson); }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dialog Component
// ─────────────────────────────────────────────────────────────────────────────

interface LessonPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonsChanged: () => void;
}

export function LessonPlanDialog({ isOpen, onClose, onLessonsChanged }: LessonPlanDialogProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>();
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  const loadData = useCallback(() => {
    setLessons(lessonService.list());
    setSubjects(subjectService.list());
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Defer state updates to avoid cascading renders
      const timer = setTimeout(() => {
        loadData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, loadData]);

  const handleAddLesson = () => {
    setEditingLesson(undefined);
    setIsFormOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsFormOpen(true);
  };

  const handleSaveLesson = (data: LessonFormData) => {
    if (editingLesson) {
      lessonService.update(editingLesson.id, data);
      toast.success('Lesson updated');
    } else {
      lessonService.create(data);
      toast.success('Lesson added to schedule');
    }
    setIsFormOpen(false);
    setEditingLesson(undefined);
    loadData();
    onLessonsChanged();
  };

  const handleDeleteLesson = () => {
    if (deletingLesson) {
      lessonService.remove(deletingLesson.id);
      toast.success('Lesson removed');
      setDeletingLesson(null);
      loadData();
      onLessonsChanged();
    }
  };

  return (
    <>
      {/* Main Lesson Plan Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Weekly Lesson Plan
              </DialogTitle>
              <Button size="sm" onClick={handleAddLesson}>
                <Plus className="h-4 w-4 mr-1" />
                Add Lesson
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <Timetable
              lessons={lessons}
              subjects={subjects}
              onEdit={handleEditLesson}
              onDelete={setDeletingLesson}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Lesson Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={() => { setIsFormOpen(false); setEditingLesson(undefined); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
          </DialogHeader>
          <LessonForm
            lesson={editingLesson}
            subjects={subjects}
            onSave={handleSaveLesson}
            onCancel={() => { setIsFormOpen(false); setEditingLesson(undefined); }}
            onSubjectCreated={loadData}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingLesson} onOpenChange={() => setDeletingLesson(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This will remove this lesson from your weekly schedule. The subject will not be deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingLesson(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteLesson}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
