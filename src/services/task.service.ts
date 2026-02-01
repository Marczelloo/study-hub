import { localTaskRepository, localSubjectRepository } from "@/data/local";
import type { Task, Subject } from "@/domain/types";
import { isToday, isPast, getStartOfWeek, getEndOfWeek } from "@/lib/dates";

export const taskService = {
  list(): Task[] {
    return localTaskRepository.list();
  },

  getById(id: string): Task | null {
    return localTaskRepository.getById(id);
  },

  create(payload: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
    return localTaskRepository.create(payload);
  },

  update(id: string, patch: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Task | null {
    return localTaskRepository.update(id, patch);
  },

  remove(id: string): boolean {
    return localTaskRepository.remove(id);
  },

  toggleStatus(id: string): Task | null {
    const task = this.getById(id);
    if (!task) return null;
    return this.update(id, {
      status: task.status === "todo" ? "done" : "todo",
    });
  },

  getTasksDueToday(): Task[] {
    return this.list().filter((task) => task.dueDate && isToday(task.dueDate) && task.status === "todo");
  },

  getOverdueTasks(): Task[] {
    return this.list().filter(
      (task) => task.dueDate && isPast(task.dueDate) && !isToday(task.dueDate) && task.status === "todo"
    );
  },

  getTasksDueThisWeek(): Task[] {
    const weekStart = getStartOfWeek();
    const weekEnd = getEndOfWeek();
    return this.list().filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= weekStart && dueDate <= weekEnd && task.status === "todo";
    });
  },

  getCompletedThisWeek(): Task[] {
    const weekStart = getStartOfWeek();
    return this.list().filter((task) => {
      if (task.status !== "done") return false;
      const updatedAt = new Date(task.updatedAt);
      return updatedAt >= weekStart;
    });
  },

  getSubjects(): Subject[] {
    return localSubjectRepository.list();
  },

  filterTasks(
    tasks: Task[],
    filters: {
      subjectId?: string;
      priority?: Task["priority"];
      showCompleted?: boolean;
    }
  ): Task[] {
    return tasks.filter((task) => {
      if (filters.subjectId && task.subjectId !== filters.subjectId) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (!filters.showCompleted && task.status === "done") return false;
      return true;
    });
  },
};
