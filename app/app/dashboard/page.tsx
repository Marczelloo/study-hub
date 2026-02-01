"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle, Calendar, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { taskService, calendarService, subjectService, noteService } from "@/services";
import { getDaysUntil, formatDate, formatTime, formatRelativeTime } from "@/lib/dates";
import type { Task, CalendarEvent, Note } from "@/domain/types";

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  iconColor?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <p className="text-xs text-muted-foreground mt-2">{title}</p>
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );
}

function TodaysTasks({ tasks }: { tasks: Task[] }) {
  const subjects = subjectService.list();
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          Today&apos;s Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tasks due today. Great job!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const subject = task.subjectId ? subjectMap.get(task.subjectId) : null;
              return (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    {subject && <p className="text-xs text-muted-foreground">{subject.name}</p>}
                  </div>
                  <Badge
                    variant={task.priority === "high" ? "danger" : task.priority === "med" ? "warning" : "secondary"}
                  >
                    {task.priority}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NextDeadlines({ tasks }: { tasks: Task[] }) {
  const subjects = subjectService.list();
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const sortedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [tasks]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          Next Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming deadlines</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task) => {
              const daysUntil = getDaysUntil(task.dueDate!);
              const isOverdue = daysUntil < 0;
              const subject = task.subjectId ? subjectMap.get(task.subjectId) : null;

              return (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    {subject && <p className="text-xs text-muted-foreground">{subject.name}</p>}
                  </div>
                  <span className={`text-xs ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                    {isOverdue
                      ? `${Math.abs(daysUntil)} days overdue`
                      : daysUntil === 0
                        ? "Today"
                        : `in ${daysUntil} days`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingEvents({ events }: { events: CalendarEvent[] }) {
  const subjects = subjectService.list();
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const getEventStyles = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "exam":
        return "border-l-red-500 bg-red-500/10";
      case "assignment":
        return "border-l-blue-500 bg-blue-500/10";
      case "project":
        return "border-l-purple-500 bg-purple-500/10";
      case "class":
        return "border-l-green-500 bg-green-500/10";
      default:
        return "border-l-gray-500 bg-gray-500/10";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          Upcoming Events & Exams
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.slice(0, 4).map((event) => {
              const daysUntil = getDaysUntil(event.startAt);
              const subject = event.subjectId ? subjectMap.get(event.subjectId) : null;

              return (
                <div key={event.id} className={`p-3 rounded-lg border-l-4 ${getEventStyles(event.type)}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs uppercase font-medium text-muted-foreground">{event.type}</span>
                    <span className="text-xs text-primary">in {daysUntil} days</span>
                  </div>
                  <p className="font-medium text-sm text-primary">{event.title}</p>
                  {subject && <p className="text-xs text-muted-foreground">{subject.name}</p>}
                  <div className="text-xs text-muted-foreground mt-1">
                    <p>{formatDate(event.startAt)}</p>
                    <p>
                      {formatTime(event.startAt)}
                      {event.endAt ? ` - ${formatTime(event.endAt)}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentNotes({ notes }: { notes: Note[] }) {
  const subjects = subjectService.list();
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-500" />
            Recent Notes
          </CardTitle>
          <Link href="/app/notes" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notes yet</p>
            <Link href="/app/notes" className="text-xs text-primary hover:underline mt-2 inline-block">
              Create your first note
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => {
              const subject = note.subjectId ? subjectMap.get(note.subjectId) : null;

              return (
                <Link
                  key={note.id}
                  href="/app/notes"
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {note.title || "Untitled"}
                    </p>
                    {subject && <p className="text-xs text-muted-foreground truncate">{subject.name}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {formatRelativeTime(note.updatedAt)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const data = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        completedThisWeek: 0,
        dueThisWeek: 0,
        tasksDueToday: [] as Task[],
        upcomingEvents: [] as CalendarEvent[],
        allTasks: [] as Task[],
        recentNotes: [] as Note[],
      };
    }
    return {
      completedThisWeek: taskService.getCompletedThisWeek().length,
      dueThisWeek: taskService.getTasksDueThisWeek().length,
      tasksDueToday: taskService.getTasksDueToday(),
      upcomingEvents: calendarService.getUpcomingEvents(14),
      allTasks: taskService.list().filter((t) => t.status === "todo"),
      recentNotes: noteService
        .list()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your studies today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Completed This Week"
          value={data.completedThisWeek}
          icon={CheckCircle2}
          iconColor="text-green-500"
        />
        <StatCard title="Due This Week" value={data.dueThisWeek} icon={Clock} iconColor="text-yellow-500" />
        <StatCard
          title="Tasks Due Today"
          value={data.tasksDueToday.length}
          icon={AlertCircle}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Upcoming Events"
          value={data.upcomingEvents.length}
          icon={Calendar}
          iconColor="text-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TodaysTasks tasks={data.tasksDueToday} />
        <NextDeadlines tasks={data.allTasks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingEvents events={data.upcomingEvents} />
        <RecentNotes notes={data.recentNotes} />
      </div>
    </div>
  );
}
