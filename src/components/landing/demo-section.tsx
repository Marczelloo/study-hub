"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui";
import {
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Folder,
  Brain,
  Plus,
  Edit2,
} from "lucide-react";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "notes", label: "Notes" },
  { id: "tasks", label: "Tasks" },
  { id: "study", label: "Study" },
];

const mockTasks = [
  { id: "1", title: "Study for Calculus exam", subject: "Mathematics", due: "Tomorrow", priority: "high" },
  { id: "2", title: "Complete Physics lab report", subject: "Physics", due: "In 3 days", priority: "medium" },
  { id: "3", title: "Read Chapter 5: World War II", subject: "History", due: "In 5 days", priority: "low" },
  { id: "4", title: "Submit programming assignment", subject: "Computer Science", due: "Next week", priority: "medium" },
  { id: "5", title: "Review lecture notes", subject: "Physics", due: "Done", priority: "low", completed: true },
];

const mockSubjects = [
  { id: "1", name: "All Notes", icon: Folder, count: 12 },
  { id: "2", name: "Mathematics", icon: BookOpen, count: 4 },
  { id: "3", name: "Physics", icon: BookOpen, count: 3 },
  { id: "4", name: "History", icon: BookOpen, count: 3 },
  { id: "5", name: "Computer Science", icon: BookOpen, count: 2 },
];

const mockNotesContent: Record<string, { title: string; content: string[] }> = {
  "2": {
    title: "Calculus II - Integration",
    content: [
      "Integration techniques covered in today's lecture:",
      "• Integration by parts: ∫u dv = uv - ∫v du",
      "• Substitution method for composite functions",
      "• Definite integrals and the Fundamental Theorem",
      "Remember: Practice problems 1-15 for next class.",
    ],
  },
  "3": {
    title: "Quantum Mechanics Basics",
    content: [
      "Wave-particle duality and uncertainty principle:",
      "• Heisenberg's uncertainty: ΔxΔp ≥ ℏ/2",
      "• Schrödinger equation fundamentals",
      "• Probability density interpretation",
      "Key concept: observation collapses the wave function.",
    ],
  },
  "4": {
    title: "World War II Overview",
    content: [
      "Major events and turning points:",
      "• 1939: Germany invades Poland",
      "• 1941: Pearl Harbor attack",
      "• 1944: D-Day invasion of Normandy",
      "• 1945: End of war in Europe and Pacific",
    ],
  },
  "5": {
    title: "Data Structures - Trees",
    content: [
      "Binary trees and traversal methods:",
      "• In-order, pre-order, post-order traversal",
      "• BST property: left < root < right",
      "• Balancing: AVL and Red-Black trees",
      "Assignment: Implement a BST with insert/delete.",
    ],
  },
  "1": {
    title: "All Notes",
    content: [
      "Browse your notes by selecting a subject",
      "from the sidebar on the left.",
      "",
      "Your notes support:",
      "• Rich text formatting",
      "• Code blocks and tables",
      "• Images and drawings",
    ],
  },
};

const mockFlashcardSets = [
  { id: "1", name: "Calculus", count: 12 },
  { id: "2", name: "Physics", count: 8 },
  { id: "3", name: "History", count: 15 },
];

const mockFlashcards: Record<string, { question: string; answer: string }[]> = {
  "1": [
    { question: "What is the derivative of sin(x)?", answer: "cos(x)" },
    { question: "What is the integral of 1/x?", answer: "ln|x| + C" },
    { question: "What is the chain rule?", answer: "d/dx[f(g(x))] = f'(g(x)) · g'(x)" },
    { question: "What is the derivative of e^x?", answer: "e^x" },
    { question: "What is ∫cos(x)dx?", answer: "sin(x) + C" },
    { question: "What is the product rule?", answer: "(fg)' = f'g + fg'" },
  ],
  "2": [
    { question: "What is Newton's Second Law?", answer: "F = ma" },
    { question: "What is the unit of force?", answer: "Newton (N) = kg·m/s²" },
    { question: "What is kinetic energy?", answer: "KE = ½mv²" },
    { question: "What is potential energy?", answer: "PE = mgh" },
  ],
  "3": [
    { question: "When did WWII begin?", answer: "September 1, 1939" },
    { question: "What year was D-Day?", answer: "1944" },
    { question: "Who was the US President during WWII?", answer: "Franklin D. Roosevelt" },
  ],
};

function DashboardDemo() {
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const completed = mockTasks.filter((t) => t.completed || completedTaskIds.has(t.id)).length;
    const dueThisWeek = mockTasks.filter((t) => !t.completed && !completedTaskIds.has(t.id)).length;
    return { completed, dueThisWeek, events: 5, notes: 12 };
  }, [completedTaskIds]);

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const activeTasks = mockTasks.filter((t) => !t.completed && !completedTaskIds.has(t.id)).slice(0, 3);

  return (
    <div className="absolute inset-0 p-4 sm:p-6 overflow-auto">
      <div className="h-full flex flex-col gap-4">
        <p className="text-sm font-medium text-foreground">Welcome back, Alex!</p>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <div className="p-2.5 sm:p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-500 mb-1" />
            <p className="text-lg sm:text-xl font-bold text-foreground">{stats.completed}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Clock className="h-4 w-4 text-yellow-500 mb-1" />
            <p className="text-lg sm:text-xl font-bold text-foreground">{stats.dueThisWeek}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Due This Week</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Calendar className="h-4 w-4 text-blue-500 mb-1" />
            <p className="text-lg sm:text-xl font-bold text-foreground">{stats.events}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Upcoming</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <FileText className="h-4 w-4 text-purple-500 mb-1" />
            <p className="text-lg sm:text-xl font-bold text-foreground">{stats.notes}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Notes</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-3 overflow-auto">
            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Today&apos;s Tasks
            </p>
            <div className="space-y-1.5">
              {activeTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full flex items-center justify-between p-2 rounded bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                        completedTaskIds.has(task.id)
                          ? "bg-green-500 border-green-500"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {completedTaskIds.has(task.id) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-xs text-foreground truncate transition-all",
                          completedTaskIds.has(task.id) && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{task.subject}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.priority === "high"
                        ? "danger"
                        : task.priority === "medium"
                          ? "warning"
                          : "secondary"
                    }
                    className="text-[9px] px-1.5 py-0 h-4"
                  >
                    {task.priority}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 overflow-auto">
            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
              Upcoming Events
            </p>
            <div className="space-y-2">
              <div className="p-2 rounded bg-red-500/10 border-l-2 border-red-500">
                <p className="text-xs font-medium text-foreground">Calculus Exam</p>
                <p className="text-[10px] text-muted-foreground">Tomorrow, 9:00 AM</p>
              </div>
              <div className="p-2 rounded bg-green-500/10 border-l-2 border-green-500">
                <p className="text-xs font-medium text-foreground">Physics Lab</p>
                <p className="text-[10px] text-muted-foreground">Fri, 2:00 PM</p>
              </div>
              <div className="p-2 rounded bg-blue-500/10 border-l-2 border-blue-500">
                <p className="text-xs font-medium text-foreground">Assignment Due</p>
                <p className="text-[10px] text-muted-foreground">Mon, 11:59 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotesDemo() {
  const [activeSubjectId, setActiveSubjectId] = useState("2");

  const noteContent = mockNotesContent[activeSubjectId] || mockNotesContent["1"];

  return (
    <div className="absolute inset-0 p-4 sm:p-6 overflow-auto">
      <div className="h-full flex gap-4 min-h-0">
        <div className="w-44 sm:w-52 flex-shrink-0 bg-card border border-border rounded-lg p-3 overflow-auto">
          <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5" />
            Subjects
          </p>
          <div className="space-y-1">
            {mockSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setActiveSubjectId(subject.id)}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded text-left transition-colors",
                  activeSubjectId === subject.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <subject.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-xs truncate flex-1">{subject.name}</span>
                <span className="text-[10px] text-muted-foreground">{subject.count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-card border border-border rounded-lg p-4 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">{noteContent.title}</h3>
            <div className="flex gap-1">
              <button className="p-1.5 rounded hover:bg-muted transition-colors">
                <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {noteContent.content.map((line, i) => (
              <p
                key={i}
                className={cn(
                  "text-xs",
                  line.startsWith("•") ? "text-muted-foreground pl-2" : "text-foreground font-medium"
                )}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TasksDemo() {
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(
    new Set(["5"])
  );
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      const isCompleted = task.completed || completedTaskIds.has(task.id);
      if (filter === "active") return !isCompleted;
      if (filter === "completed") return isCompleted;
      return true;
    });
  }, [filter, completedTaskIds]);

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  return (
    <div className="absolute inset-0 p-4 sm:p-6 overflow-auto">
      <div className="h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            New Task
          </button>
        </div>

        <div className="flex gap-2">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-2 overflow-auto">
          {filteredTasks.map((task) => {
            const isCompleted = task.completed || completedTaskIds.has(task.id);
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-all text-left"
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                    isCompleted ? "bg-green-500 border-green-500" : "border-muted-foreground/30"
                  )}
                >
                  {isCompleted && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-medium text-foreground transition-all",
                      isCompleted && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {task.subject} • {task.due}
                  </p>
                </div>
                <Badge
                  variant={
                    isCompleted
                      ? "secondary"
                      : task.priority === "high"
                        ? "danger"
                        : task.priority === "medium"
                          ? "warning"
                          : "secondary"
                  }
                  className="text-[9px] px-1.5 py-0 h-4"
                >
                  {isCompleted ? "done" : task.priority}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StudyDemo() {
  const [activeSetId, setActiveSetId] = useState("1");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = mockFlashcards[activeSetId] || [];
  const currentCard = cards[currentCardIndex];
  const totalCards = cards.length;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % totalCards);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + totalCards) % totalCards);
    }, 150);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleSetChange = (setId: string) => {
    setActiveSetId(setId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="absolute inset-0 p-4 sm:p-6 overflow-auto">
      <div className="h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Study Mode
          </h3>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          <div className="flex-1 flex flex-col items-center justify-center">
            <button
              onClick={handleFlip}
              className="w-full max-w-sm aspect-[4/3] perspective-1000"
            >
              <div
                className={cn(
                  "relative w-full h-full transition-transform duration-500 transform-style-preserve-3d",
                  isFlipped && "rotate-y-180"
                )}
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex flex-col items-center justify-center p-6 backface-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <p className="text-[10px] text-muted-foreground mb-2">QUESTION</p>
                  <p className="text-sm text-center text-foreground font-medium">{currentCard?.question}</p>
                  <p className="text-[10px] text-muted-foreground mt-4">Click to reveal answer</p>
                </div>
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 flex flex-col items-center justify-center p-6"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <p className="text-[10px] text-green-500 mb-2">ANSWER</p>
                  <p className="text-sm text-center text-foreground font-medium">{currentCard?.answer}</p>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <span className="text-xs text-muted-foreground">
                {currentCardIndex + 1} / {totalCards}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </div>
          </div>

          <div className="w-40 sm:w-48 bg-card border border-border rounded-lg p-3 overflow-auto">
            <p className="text-xs font-medium text-foreground mb-2">Your Sets</p>
            <div className="space-y-1.5">
              {mockFlashcardSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => handleSetChange(set.id)}
                  className={cn(
                    "w-full p-2 rounded-lg text-left transition-colors",
                    activeSetId === set.id
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-muted/50 hover:bg-muted border border-transparent"
                  )}
                >
                  <p className="text-xs font-medium text-foreground">{set.name}</p>
                  <p className="text-[10px] text-muted-foreground">{set.count} cards</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoSection() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <section id="demo" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            See It In Action
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore the intuitive interface designed to help you stay organized and focused on what matters.
            Try clicking the interactive elements below!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-[16/9] bg-muted/30 overflow-hidden">
              {activeTab === "dashboard" && <DashboardDemo />}
              {activeTab === "notes" && <NotesDemo />}
              {activeTab === "tasks" && <TasksDemo />}
              {activeTab === "study" && <StudyDemo />}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
