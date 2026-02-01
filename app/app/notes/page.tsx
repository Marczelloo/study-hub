"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  FileText,
  Trash2,
  Circle,
  PlusCircle,
  ChevronRight,
  ChevronDown,
  Save,
  Pencil,
} from "lucide-react";
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label } from "@/components/ui";
import { RichTextEditor } from "@/components/editor";
import type { RichTextEditorRef, InkTool } from "@/components/editor";
import { noteService, subjectService, semesterService } from "@/services";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Note, Subject, Semester, InkStroke } from "@/domain/types";
import { SUBJECT_COLORS } from "@/domain/constants";

// Auto-save delay in milliseconds
const AUTO_SAVE_DELAY = 2000;

// Collapsible subject with notes
function SubjectSection({
  subject,
  notes,
  selectedNoteId,
  onNoteSelect,
  onCreateNote,
  defaultExpanded = false,
}: {
  subject: Subject;
  notes: Note[];
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  onCreateNote: (subjectId: string) => void;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-1">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors group cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <Circle className="h-3 w-3" style={{ color: subject.color, fill: subject.color }} />
        <span className="text-sm font-medium truncate flex-1 text-left">{subject.name}</span>
        <span className="text-xs text-muted-foreground">{notes.length}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateNote(subject.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/20 rounded transition-all"
          title="New note in this subject"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {isExpanded && (
        <div className="ml-4 pl-3 border-l border-border">
          {notes.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 px-3">No notes yet</p>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                onClick={() => onNoteSelect(note.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors",
                  selectedNoteId === note.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
              >
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate">{note.title || "Untitled"}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// New Subject dialog
function NewSubjectDialog({
  open,
  onOpenChange,
  semester,
  onSubjectCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semester: Semester | null;
  onSubjectCreated: (subject: Subject) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(SUBJECT_COLORS[0]);

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a subject name");
      return;
    }

    const newSubject = subjectService.create({
      name: name.trim(),
      color,
      semesterId: semester?.id ?? "",
    });

    onSubjectCreated(newSubject);
    setName("");
    setColor(SUBJECT_COLORS[0]);
    onOpenChange(false);
    toast.success("Subject created");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Subject</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subjectName">Subject Name</Label>
            <Input
              id="subjectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mathematics"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === c && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Subject</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewSubjectDialog, setShowNewSubjectDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [inkStrokes, setInkStrokes] = useState<InkStroke[]>([]);
  const [inkTool, setInkTool] = useState<InkTool>("pen");
  const [inkColor, setInkColor] = useState("#ef4444");
  const [inkBrushSize, setInkBrushSize] = useState(4);
  const editorRef = useRef<RichTextEditorRef>(null);

  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === "undefined") return [];
    return noteService.list();
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    if (typeof window === "undefined") return [];
    return subjectService.list();
  });

  const semester = useMemo(() => {
    if (typeof window === "undefined") return null;
    return semesterService.getCurrent();
  }, []);

  const refreshData = () => {
    setNotes(noteService.list());
    setSubjects(subjectService.list());
  };

  // Group notes by subject
  const notesBySubject = useMemo(() => {
    const grouped = new Map<string, Note[]>();

    // Filter by search query first
    const filteredNotes = notes.filter(
      (note) =>
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    subjects.forEach((subject) => {
      const subjectNotes = filteredNotes.filter((note) => note.subjectId === subject.id);
      grouped.set(subject.id, subjectNotes);
    });

    return grouped;
  }, [notes, subjects, searchQuery]);

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedNoteId) ?? null, [notes, selectedNoteId]);

  // Load note content into editor when selected
  useEffect(() => {
    if (selectedNote) {
      editorRef.current?.setContent(selectedNote.content);
      queueMicrotask(() => {
        setNoteTitle(selectedNote.title);
        setNoteContent(selectedNote.content);
        setInkStrokes(selectedNote.inkStrokes ?? []);
        setHasUnsavedChanges(false);
        setDrawingMode(false);
      });
    } else {
      editorRef.current?.setContent("");
      queueMicrotask(() => {
        setNoteTitle("");
        setNoteContent("");
        setInkStrokes([]);
        setHasUnsavedChanges(false);
        setDrawingMode(false);
      });
    }
  }, [selectedNote]);

  const handleCreateNote = (subjectId: string) => {
    const newNote = noteService.create({
      title: "Untitled Note",
      content: "",
      subjectId,
      semesterId: semester?.id ?? "",
    });
    setSelectedNoteId(newNote.id);
    refreshData();
    toast.success("Note created");
  };

  const handleSaveNote = useCallback(
    (silent = false) => {
      if (!selectedNoteId) return;

      const content = editorRef.current?.getHTML() ?? noteContent;

      noteService.update(selectedNoteId, {
        title: noteTitle || "Untitled Note",
        content,
        inkStrokes,
      });

      setHasUnsavedChanges(false);

      // Only refresh and show toast for manual saves to avoid interrupting drawing
      if (!silent) {
        refreshData();
        toast.success("Note saved");
      }
    },
    [selectedNoteId, noteTitle, noteContent, inkStrokes]
  );

  const handleDeleteNote = () => {
    if (deleteConfirmId) {
      noteService.remove(deleteConfirmId);
      if (selectedNoteId === deleteConfirmId) {
        setSelectedNoteId(null);
      }
      setDeleteConfirmId(null);
      refreshData();
      toast.success("Note deleted");
    }
  };

  // Auto-save on Ctrl+S, toggle drawing with Ctrl+D, exit with Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSaveNote(false); // Manual save with toast
      }
      if (e.ctrlKey && e.key === "d" && selectedNoteId) {
        e.preventDefault();
        setDrawingMode((prev) => !prev);
      }
      if (e.key === "Escape" && drawingMode) {
        setDrawingMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveNote, selectedNoteId, drawingMode]);

  // Auto-save after user stops typing/drawing
  useEffect(() => {
    if (!hasUnsavedChanges || !selectedNoteId) return;

    const timer = setTimeout(() => {
      handleSaveNote(true); // Silent auto-save
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, selectedNoteId, noteTitle, noteContent, handleSaveNote]);

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen -mx-6 -mb-6 -mt-16 lg:-mx-8 lg:-mb-8 lg:-mt-8">
      {/* Sidebar with collapsible subjects */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col bg-muted/20">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold">Notes</h1>
            <Button size="sm" variant="outline" onClick={() => setShowNewSubjectDialog(true)}>
              <PlusCircle className="h-4 w-4 mr-1" />
              Subject
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Subjects list */}
        <div className="flex-1 overflow-y-auto p-2">
          {subjects.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No subjects yet</p>
              <Button size="sm" variant="link" onClick={() => setShowNewSubjectDialog(true)}>
                Create your first subject
              </Button>
            </div>
          ) : (
            subjects.map((subject) => (
              <SubjectSection
                key={subject.id}
                subject={subject}
                notes={notesBySubject.get(subject.id) ?? []}
                selectedNoteId={selectedNoteId}
                onNoteSelect={setSelectedNoteId}
                onCreateNote={handleCreateNote}
                defaultExpanded={notesBySubject.get(subject.id)?.some((n) => n.id === selectedNoteId)}
              />
            ))
          )}
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            {/* Note header */}
            <div className="p-4 border-b border-border flex items-center gap-4">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => {
                  setNoteTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Note title..."
                className="flex-1 text-xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
                <Button onClick={() => handleSaveNote()} size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button variant="destructive" size="icon" onClick={() => setDeleteConfirmId(selectedNote.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Editor with Ink Overlay - draw directly on the note like OneNote */}
            <div className="flex-1 overflow-hidden">
              {/* Rich Text Editor with integrated Ink Overlay */}
              <div className="h-full overflow-auto">
                <RichTextEditor
                  ref={editorRef}
                  content={noteContent}
                  onChange={(content) => {
                    setNoteContent(content);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Start typing your note..."
                  drawingMode={drawingMode}
                  onDrawingModeChange={setDrawingMode}
                  inkTool={inkTool}
                  onInkToolChange={setInkTool}
                  inkColor={inkColor}
                  onInkColorChange={setInkColor}
                  inkBrushSize={inkBrushSize}
                  onInkBrushSizeChange={setInkBrushSize}
                  inkStrokes={inkStrokes}
                  onInkStrokesChange={(newStrokes) => {
                    setInkStrokes(newStrokes);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Pencil className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Select a note to edit</h3>
              <p className="text-sm">or click + on a subject to create a new note</p>
            </div>
          </div>
        )}
      </div>

      {/* New Subject Dialog */}
      <NewSubjectDialog
        open={showNewSubjectDialog}
        onOpenChange={setShowNewSubjectDialog}
        semester={semester}
        onSubjectCreated={() => {
          refreshData();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this note? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
