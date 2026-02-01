"use client";

import { useState, useMemo } from "react";
import { Plus, Filter, Calendar, Circle, CheckCircle2, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Badge,
} from "@/components/ui";
import { taskService, subjectService } from "@/services";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDate, getDaysOverdue, isPast, isToday } from "@/lib/dates";
import type { Task, Subject } from "@/domain/types";

const PRIORITY_OPTIONS: Task["priority"][] = ["low", "med", "high"];

interface TaskFormData {
  title: string;
  description: string;
  priority: Task["priority"];
  dueDate: string;
  subjectId: string;
}

function TaskForm({
  task,
  subjects,
  onSave,
  onCancel,
}: {
  task?: Task;
  subjects: Subject[];
  onSave: (data: TaskFormData) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Task["priority"]>(task?.priority ?? "med");
  const [dueDate, setDueDate] = useState(task?.dueDate?.split("T")[0] ?? "");
  const [subjectId, setSubjectId] = useState(task?.subjectId ?? "__none__");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    onSave({
      title,
      description,
      priority,
      dueDate: dueDate ? `${dueDate}T23:59:59.000Z` : "",
      subjectId: subjectId === "__none__" ? "" : subjectId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  <span className="capitalize">{p === "med" ? "medium" : p}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <div
            className="relative cursor-pointer"
            onClick={() => (document.getElementById("dueDate") as HTMLInputElement)?.showPicker?.()}
          >
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="cursor-pointer w-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject (optional)</Label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{task ? "Save Changes" : "Create Task"}</Button>
      </DialogFooter>
    </form>
  );
}

function TaskItem({
  task,
  subject,
  onToggle,
  onDelete,
}: {
  task: Task;
  subject: Subject | null;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isOverdue = task.dueDate && isPast(task.dueDate) && !isToday(task.dueDate) && task.status === "todo";
  const daysOverdue = task.dueDate && isOverdue ? getDaysOverdue(task.dueDate) : 0;

  return (
    <Card
      className={cn(
        "p-4 transition-all",
        task.status === "done" && "opacity-60",
        isOverdue && "border-l-4 border-l-red-500"
      )}
    >
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="mt-0.5 text-muted-foreground hover:text-primary transition-colors">
          {task.status === "done" ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={cn("font-medium", task.status === "done" && "line-through text-muted-foreground")}>
                {task.title}
              </h3>
              {subject && <p className="text-sm text-muted-foreground">{subject.name}</p>}
              {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={task.priority === "high" ? "danger" : task.priority === "med" ? "warning" : "secondary"}>
                {task.priority === "med" ? "medium" : task.priority}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {task.dueDate && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={cn("text-muted-foreground", isOverdue && "text-red-500")}>
                {formatDate(task.dueDate)}
                {isOverdue && ` (${daysOverdue} days overdue)`}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function TasksPage() {
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return [];
    return taskService.list();
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    if (typeof window === "undefined") return [];
    return subjectService.list();
  });

  const refreshData = () => {
    setTasks(taskService.list());
    setSubjects(subjectService.list());
  };

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filterSubject !== "all" && task.subjectId !== filterSubject) return false;
        if (filterPriority !== "all" && task.priority !== filterPriority) return false;
        if (!showCompleted && task.status === "done") return false;
        return true;
      })
      .sort((a, b) => {
        // Sort: incomplete first, then by due date, then by priority
        if (a.status !== b.status) {
          return a.status === "todo" ? -1 : 1;
        }
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        const priorityOrder = { high: 0, med: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [tasks, filterSubject, filterPriority, showCompleted]);

  const pendingCount = tasks.filter((t) => t.status === "todo").length;
  const completedCount = tasks.filter((t) => t.status === "done").length;

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleToggleTask = (taskId: string) => {
    taskService.toggleStatus(taskId);
    refreshData();
  };

  const handleSaveTask = (formData: TaskFormData) => {
    if (editingTask) {
      taskService.update(editingTask.id, {
        ...formData,
        status: editingTask.status,
      });
      toast.success("Task updated");
    } else {
      taskService.create({
        ...formData,
        status: "todo",
      });
      toast.success("Task created");
    }
    setIsFormOpen(false);
    refreshData();
  };

  const handleDeleteTask = () => {
    if (deleteConfirmId) {
      taskService.remove(deleteConfirmId);
      setDeleteConfirmId(null);
      refreshData();
      toast.success("Task deleted");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks & Reminders</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending · {completedCount} completed
          </p>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm">Filter:</span>
        </div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {PRIORITY_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>
                <span className="capitalize">{p === "med" ? "medium" : p}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Checkbox
            id="showCompleted"
            checked={showCompleted}
            onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
          />
          <label htmlFor="showCompleted" className="text-sm cursor-pointer">
            Show completed
          </label>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-sm">Create a new task to get started</p>
            </div>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              subject={task.subjectId ? (subjectMap.get(task.subjectId) ?? null) : null}
              onToggle={() => handleToggleTask(task.id)}
              onDelete={() => setDeleteConfirmId(task.id)}
            />
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            subjects={subjects}
            onSave={handleSaveTask}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
