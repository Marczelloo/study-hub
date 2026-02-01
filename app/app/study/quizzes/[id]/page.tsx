"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Edit3,
  Trash2,
  Plus,
  Play,
  Check,
  X,
  Save,
  ChevronRight,
  Download,
  FileQuestion,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
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
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import * as studyService from "@/services/study.service";
import { subjectService } from "@/services";
import type { Quiz, QuizQuestion, QuizAttempt, Subject } from "@/domain/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateId } from "@/lib/ids";

// ==================== Edit Question Dialog ====================

function EditQuestionDialog({
  question,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: {
  question: QuizQuestion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<QuizQuestion>) => void;
  onDelete: (id: string) => void;
}) {
  const [type, setType] = useState<QuizQuestion["type"]>("mcq");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (question) {
      setType(question.type);
      setPrompt(question.prompt);
      setOptions(question.options?.join("\n") || "");
      setCorrectAnswer(question.correctAnswer);
      setExplanation(question.explanation || "");
    }
  }, [question]);

  const handleSave = () => {
    if (!question) return;
    if (!prompt.trim() || !correctAnswer.trim()) {
      toast.error("Prompt and correct answer are required");
      return;
    }
    onSave(question.id, {
      type,
      prompt,
      options: type === "mcq" ? options.split("\n").filter(Boolean) : undefined,
      correctAnswer,
      explanation: explanation || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as QuizQuestion["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="truefalse">True/False</SelectItem>
                  <SelectItem value="short">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Input
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Correct answer"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Question Prompt</Label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} />
          </div>
          {type === "mcq" && (
            <div className="space-y-2">
              <Label>Options (one per line)</Label>
              <Textarea
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                rows={4}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Explanation (optional)</Label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why this is the correct answer"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => {
              if (question) onDelete(question.id);
              onClose();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Add Question Dialog ====================

function AddQuestionDialog({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Omit<QuizQuestion, "id">) => void;
}) {
  const [type, setType] = useState<QuizQuestion["type"]>("mcq");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  const handleSave = () => {
    if (!prompt.trim() || !correctAnswer.trim()) {
      toast.error("Prompt and correct answer are required");
      return;
    }
    onSave({
      type,
      prompt,
      options: type === "mcq" ? options.split("\n").filter(Boolean) : undefined,
      correctAnswer,
      explanation: explanation || undefined,
    });
    setType("mcq");
    setPrompt("");
    setOptions("");
    setCorrectAnswer("");
    setExplanation("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as QuizQuestion["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="truefalse">True/False</SelectItem>
                  <SelectItem value="short">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Input
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Correct answer"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Question Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the question"
              rows={3}
            />
          </div>
          {type === "mcq" && (
            <div className="space-y-2">
              <Label>Options (one per line)</Label>
              <Textarea
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                rows={4}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Explanation (optional)</Label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why this is the correct answer"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Take Quiz Mode ====================

function TakeQuizMode({
  quiz,
  onClose,
  onComplete,
}: {
  quiz: Quiz;
  onClose: () => void;
  onComplete: (attempt: Omit<QuizAttempt, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ questionId: string; answer: string; correct: boolean }[]>([]);

  const currentQuestion = quiz.questions[currentIndex];

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
  };

  const handleSubmit = () => {
    const attemptResults = quiz.questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || "",
      correct: (answers[q.id] || "").toLowerCase().trim() === q.correctAnswer.toLowerCase().trim(),
    }));

    setResults(attemptResults);
    setSubmitted(true);

    const score = attemptResults.filter((r) => r.correct).length;
    onComplete({
      quizId: quiz.id,
      score,
      totalQuestions: quiz.questions.length,
      answers: attemptResults,
    });
  };

  const answeredCount = Object.keys(answers).length;
  const score = results.filter((r) => r.correct).length;
  const percentage = Math.round((score / quiz.questions.length) * 100);

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{quiz.title} - Results</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 mb-6 text-center">
              <h3 className="text-4xl font-bold mb-2">{percentage}%</h3>
              <p className="text-lg text-muted-foreground">
                {score} out of {quiz.questions.length} correct
              </p>
              <div
                className={cn(
                  "mt-4 text-lg font-medium",
                  percentage >= 80 ? "text-green-500" : percentage >= 60 ? "text-yellow-500" : "text-red-500"
                )}
              >
                {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : "Keep practicing!"}
              </div>
            </Card>

            <div className="space-y-4">
              {quiz.questions.map((q, i) => {
                const result = results.find((r) => r.questionId === q.id);
                return (
                  <Card key={q.id} className={cn("p-4", result?.correct ? "border-green-500/50" : "border-red-500/50")}>
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-white text-sm",
                          result?.correct ? "bg-green-500" : "bg-red-500"
                        )}
                      >
                        {result?.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          {i + 1}. {q.prompt}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Your answer: </span>
                          <span className={result?.correct ? "text-green-500" : "text-red-500"}>
                            {result?.answer || "(no answer)"}
                          </span>
                        </p>
                        {!result?.correct && (
                          <p className="text-sm mt-1">
                            <span className="text-muted-foreground">Correct answer: </span>
                            <span className="text-green-500">{q.correctAnswer}</span>
                          </p>
                        )}
                        {q.explanation && <p className="text-sm text-muted-foreground mt-2 italic">{q.explanation}</p>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setCurrentIndex(0);
                  setAnswers({});
                  setResults([]);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={onClose}>Done</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">{quiz.title}</h2>
            <p className="text-sm text-muted-foreground">
              {answeredCount}/{quiz.questions.length} answered
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <Progress value={((currentIndex + 1) / quiz.questions.length) * 100} className="h-1" />
        <p className="text-center text-sm text-muted-foreground mt-1">
          Question {currentIndex + 1} of {quiz.questions.length}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 mb-6">
            <Badge variant="outline" className="mb-4 capitalize">
              {currentQuestion.type}
            </Badge>
            <h3 className="text-xl font-medium">{currentQuestion.prompt}</h3>
          </Card>

          {currentQuestion.type === "mcq" && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((opt, i) => (
                <label
                  key={i}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    answers[currentQuestion.id] === opt ? "border-primary bg-primary/10" : "hover:bg-accent"
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={opt}
                    checked={answers[currentQuestion.id] === opt}
                    onChange={() => handleAnswer(opt)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      answers[currentQuestion.id] === opt ? "border-primary" : "border-muted"
                    )}
                  >
                    {answers[currentQuestion.id] === opt && <div className="w-3 h-3 rounded-full bg-primary" />}
                  </div>
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === "truefalse" && (
            <div className="flex gap-4">
              {["True", "False"].map((opt) => (
                <Button
                  key={opt}
                  variant={answers[currentQuestion.id] === opt ? "default" : "outline"}
                  className="flex-1 py-6"
                  onClick={() => handleAnswer(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          )}

          {currentQuestion.type === "short" && (
            <Textarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer..."
              rows={3}
            />
          )}
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button variant="outline" onClick={() => setCurrentIndex((i) => i - 1)} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentIndex === quiz.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={answeredCount < quiz.questions.length}>
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={() => setCurrentIndex((i) => i + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== Main Page ====================

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [activeTab, setActiveTab] = useState("questions");
  const [showAnswers, setShowAnswers] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditQuizOpen, setIsEditQuizOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [isTaking, setIsTaking] = useState(false);

  // Edit quiz state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadData = () => {
    const q = studyService.getQuizById(quizId);
    if (!q) {
      router.push("/app/study");
      return;
    }
    setQuiz(q);
    setSubjects(subjectService.list());
    setAttempts(studyService.getQuizAttempts(quizId));
    setEditTitle(q.title);
    setEditDescription(q.description || "");
  };

  useEffect(() => {
    loadData();
  }, [quizId]);

  const subject = useMemo(() => subjects.find((s) => s.id === quiz?.subjectId), [subjects, quiz]);

  const bestAttempt = useMemo(() => studyService.getBestAttempt(quizId), [attempts]);

  const handleSaveQuestion = (id: string, data: Partial<QuizQuestion>) => {
    studyService.updateQuizQuestion(quizId, id, data);
    toast.success("Question updated");
    loadData();
  };

  const handleDeleteQuestion = (id: string) => {
    studyService.deleteQuizQuestion(quizId, id);
    toast.success("Question deleted");
    loadData();
  };

  const handleAddQuestion = (question: Omit<QuizQuestion, "id">) => {
    studyService.addQuizQuestion(quizId, question);
    toast.success("Question added");
    loadData();
  };

  const handleSaveQuiz = () => {
    if (!editTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    studyService.updateQuiz(quizId, {
      title: editTitle,
      description: editDescription || undefined,
    });
    toast.success("Quiz updated");
    setIsEditQuizOpen(false);
    loadData();
  };

  const handleDeleteQuiz = () => {
    studyService.deleteQuiz(quizId);
    toast.success("Quiz deleted");
    router.push("/app/study");
  };

  const handleExport = () => {
    if (!quiz) return;
    const exportData = {
      type: "quiz",
      version: 1,
      data: {
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions.map((q) => ({
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      },
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.title.replace(/[^a-z0-9]/gi, "_")}_quiz.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Quiz exported");
  };

  const handleQuizComplete = (attempt: Omit<QuizAttempt, "id" | "createdAt" | "updatedAt">) => {
    studyService.createQuizAttempt(attempt);
    toast.success("Quiz completed!");
    loadData();
  };

  if (!quiz) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (isTaking) {
    return (
      <TakeQuizMode
        quiz={quiz}
        onClose={() => {
          setIsTaking(false);
          loadData();
        }}
        onComplete={handleQuizComplete}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/app/study")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}
            <div className="flex items-center gap-2 mt-1">
              {subject && (
                <Badge variant="outline" style={{ borderColor: subject.color }}>
                  {subject.name}
                </Badge>
              )}
              <Badge variant="secondary">{quiz.questions.length} questions</Badge>
              {bestAttempt && (
                <Badge variant="secondary">
                  Best: {Math.round((bestAttempt.score / bestAttempt.totalQuestions) * 100)}%
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsEditQuizOpen(true)}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsTaking(true)} disabled={quiz.questions.length === 0}>
            <Play className="h-4 w-4 mr-2" />
            Take Quiz
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      {attempts.length > 0 && (
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{attempts.length}</p>
              <p className="text-sm text-muted-foreground">Attempts</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {bestAttempt ? Math.round((bestAttempt.score / bestAttempt.totalQuestions) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Best Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / attempts.length)}
                %
              </p>
              <p className="text-sm text-muted-foreground">Average</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="questions">Questions ({quiz.questions.length})</TabsTrigger>
          <TabsTrigger value="history">History ({attempts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" size="sm" onClick={() => setShowAnswers(!showAnswers)}>
              {showAnswers ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {quiz.questions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No questions yet</h3>
              <p className="text-sm">Add some questions to create your quiz</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <Card
                  key={question.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setEditingQuestion(question)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <Badge variant="secondary" className="capitalize">
                        {question.type}
                      </Badge>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-medium mb-2">{question.prompt}</p>
                  {question.type === "mcq" && question.options && (
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {question.options.map((opt, i) => (
                        <li
                          key={i}
                          className={cn(showAnswers && opt === question.correctAnswer && "text-green-500 font-medium")}
                        >
                          {String.fromCharCode(65 + i)}. {opt}
                        </li>
                      ))}
                    </ul>
                  )}
                  {showAnswers && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <strong>Answer:</strong> {question.correctAnswer}
                      {question.explanation && <p className="text-muted-foreground mt-1">{question.explanation}</p>}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {attempts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No attempts yet</h3>
              <p className="text-sm">Take the quiz to see your history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((attempt, i) => {
                  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  return (
                    <Card key={attempt.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Attempt #{attempts.length - i}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(attempt.createdAt).toLocaleDateString()} at{" "}
                            {new Date(attempt.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "text-2xl font-bold",
                              pct >= 80 ? "text-green-500" : pct >= 60 ? "text-yellow-500" : "text-red-500"
                            )}
                          >
                            {pct}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {attempt.score}/{attempt.totalQuestions}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Question Dialog */}
      <EditQuestionDialog
        question={editingQuestion}
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSave={handleSaveQuestion}
        onDelete={handleDeleteQuestion}
      />

      {/* Add Question Dialog */}
      <AddQuestionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddQuestion}
      />

      {/* Edit Quiz Dialog */}
      <Dialog open={isEditQuizOpen} onOpenChange={setIsEditQuizOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Quiz
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditQuizOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveQuiz}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this quiz and all its questions? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuiz}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
