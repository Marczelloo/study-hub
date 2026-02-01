"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  GraduationCap,
  Sparkles,
  Zap,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Play,
  RotateCcw,
  Layers,
  FileQuestion,
  Upload,
  Download,
  ExternalLink,
  Edit3,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Checkbox,
  Progress,
} from "@/components/ui";
import * as studyService from "@/services/study.service";
import { subjectService, noteService } from "@/services";
import type { FlashcardSet, Flashcard, Quiz, QuizQuestion, QuizAttempt, Subject, Note } from "@/domain/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateId } from "@/lib/ids";
import { getStudyGenerationProvider } from "@/services/study-generators";

// ==================== Library View (Main View) ====================

function FlashcardSetCard({
  set,
  cardCount,
  learnedCount,
  subject,
  onStudy,
  onOpen,
  onDelete,
}: {
  set: FlashcardSet;
  cardCount: number;
  learnedCount: number;
  subject?: Subject;
  onStudy: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const progress = cardCount > 0 ? Math.round((learnedCount / cardCount) * 100) : 0;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <Badge variant={set.source === "manual" ? "secondary" : "default"} className="text-xs">
            {set.source}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onOpen}>
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <button className="text-left w-full cursor-pointer hover:underline" onClick={onOpen}>
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{set.title}</h3>
      </button>
      {set.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{set.description}</p>}

      <div className="flex items-center gap-2 mb-3">
        {subject && (
          <Badge variant="outline" className="text-xs" style={{ borderColor: subject.color }}>
            {subject.name}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{cardCount} cards</span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Button className="w-full" onClick={onStudy} disabled={cardCount === 0}>
        <Play className="h-4 w-4 mr-2" />
        Study
      </Button>
    </Card>
  );
}

function QuizCard({
  quiz,
  subject,
  bestAttempt,
  onTake,
  onOpen,
  onDelete,
}: {
  quiz: Quiz;
  subject?: Subject;
  bestAttempt?: QuizAttempt;
  onTake: () => void;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const bestScore = bestAttempt ? Math.round((bestAttempt.score / bestAttempt.totalQuestions) * 100) : null;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5 text-primary" />
          <Badge variant={quiz.source === "manual" ? "secondary" : "default"} className="text-xs">
            {quiz.source}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onOpen}>
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <button className="text-left w-full cursor-pointer hover:underline" onClick={onOpen}>
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{quiz.title}</h3>
      </button>
      {quiz.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{quiz.description}</p>}

      <div className="flex items-center gap-2 mb-3">
        {subject && (
          <Badge variant="outline" className="text-xs" style={{ borderColor: subject.color }}>
            {subject.name}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{quiz.questions.length} questions</span>
      </div>

      {bestScore !== null && (
        <div className="mb-4 p-2 rounded bg-muted">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Best Score</span>
            <span
              className={cn(
                "font-medium",
                bestScore >= 80 ? "text-green-500" : bestScore >= 60 ? "text-yellow-500" : "text-red-500"
              )}
            >
              {bestScore}%
            </span>
          </div>
        </div>
      )}

      <Button className="w-full" onClick={onTake} disabled={quiz.questions.length === 0}>
        <Play className="h-4 w-4 mr-2" />
        Take Quiz
      </Button>
    </Card>
  );
}

// ==================== Flashcard Study Mode ====================

function FlashcardStudyMode({
  set,
  cards,
  onClose,
  onCardUpdate,
}: {
  set: FlashcardSet;
  cards: Flashcard[];
  onClose: () => void;
  onCardUpdate: (id: string, learned: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<"all" | "unlearned">("all");

  const filteredCards = useMemo(() => {
    if (studyMode === "unlearned") {
      return cards.filter((c) => !c.learned);
    }
    return cards;
  }, [cards, studyMode]);

  const currentCard = filteredCards[currentIndex];
  const learnedCount = cards.filter((c) => c.learned).length;

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleToggleLearned = () => {
    if (currentCard) {
      onCardUpdate(currentCard.id, !currentCard.learned);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (filteredCards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{set.title}</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">All Done!</h3>
            <p className="text-muted-foreground mb-4">
              {studyMode === "unlearned" ? "You've learned all cards in this set!" : "No cards in this set yet."}
            </p>
            <div className="flex gap-2 justify-center">
              {studyMode === "unlearned" && (
                <Button variant="outline" onClick={() => setStudyMode("all")}>
                  Review All Cards
                </Button>
              )}
              <Button onClick={onClose}>Back to Library</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">{set.title}</h2>
            <p className="text-sm text-muted-foreground">
              {learnedCount}/{cards.length} learned
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={studyMode}
            onValueChange={(v) => {
              setStudyMode(v as "all" | "unlearned");
              setCurrentIndex(0);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cards</SelectItem>
              <SelectItem value="unlearned">Unlearned</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-muted-foreground">
            Card {currentIndex + 1} of {filteredCards.length}
          </span>
        </div>
        <Progress value={((currentIndex + 1) / filteredCards.length) * 100} className="h-1" />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card
          className="w-full max-w-2xl min-h-[300px] cursor-pointer flex items-center justify-center p-8 transition-all hover:shadow-xl"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-4">{isFlipped ? "Answer" : "Question"} • Click to flip</p>
            <p className={cn("text-xl", isFlipped ? "" : "font-medium")}>
              {isFlipped ? currentCard.answer : currentCard.question}
            </p>
            {currentCard.learned && (
              <Badge className="mt-4" variant="secondary">
                <Check className="h-3 w-3 mr-1" /> Learned
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button variant={currentCard.learned ? "secondary" : "default"} onClick={handleToggleLearned}>
            {currentCard.learned ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Mark Unlearned
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Mark Learned
              </>
            )}
          </Button>

          <Button variant="outline" onClick={handleNext} disabled={currentIndex === filteredCards.length - 1}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ==================== Quiz Taking Mode ====================

function QuizTakingMode({
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

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
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
            {/* Score Summary */}
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

            {/* Question Review */}
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

            <div className="mt-6 flex justify-center">
              <Button onClick={onClose}>Back to Library</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
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

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
        </div>
        <Progress value={((currentIndex + 1) / quiz.questions.length) * 100} className="h-1" />
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <Badge variant="outline" className="mb-4 capitalize">
              {currentQuestion.type}
            </Badge>
            <h3 className="text-xl font-medium mb-6">{currentQuestion.prompt}</h3>

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
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentIndex === quiz.questions.length - 1 ? (
            <Button onClick={handleSubmit}>Submit Quiz</Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== Create Dialogs ====================

function CreateFlashcardSetDialog({
  isOpen,
  onClose,
  subjects,
  notes,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  notes: Note[];
  onSave: (set: FlashcardSet, cards: Flashcard[]) => void;
}) {
  const [mode, setMode] = useState<"manual" | "ai" | "basic">("manual");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual cards
  const [cards, setCards] = useState<{ question: string; answer: string }[]>([{ question: "", answer: "" }]);

  const filteredNotes = useMemo(() => {
    if (!subjectId) return notes;
    return notes.filter((n) => n.subjectId === subjectId);
  }, [notes, subjectId]);

  const resetForm = () => {
    setMode("manual");
    setSubjectId("");
    setTitle("");
    setDescription("");
    setSelectedNotes([]);
    setCards([{ question: "", answer: "" }]);
  };

  const addCard = () => {
    setCards([...cards, { question: "", answer: "" }]);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  const updateCard = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectId || !title.trim()) {
      toast.error("Please fill in subject and title");
      return;
    }

    if (mode === "manual") {
      const validCards = cards.filter((c) => c.question.trim() && c.answer.trim());
      if (validCards.length === 0) {
        toast.error("Please add at least one card with question and answer");
        return;
      }

      const newSet = studyService.createFlashcardSet({
        title,
        description: description || undefined,
        subjectId,
        noteIds: [],
        source: "manual",
      });

      const savedCards = validCards.map((c) =>
        studyService.createFlashcard({
          setId: newSet.id,
          question: c.question,
          answer: c.answer,
          learned: false,
        })
      );

      onSave(newSet, savedCards);
      toast.success("Flashcard set created");
      resetForm();
      onClose();
    } else {
      // AI or Basic generation
      if (selectedNotes.length === 0) {
        toast.error("Please select at least one note for generation");
        return;
      }

      setIsGenerating(true);
      try {
        const selectedNoteObjects = notes.filter((n) => selectedNotes.includes(n.id));
        const provider = getStudyGenerationProvider(mode === "ai" ? "ai" : "basic");

        const result = await provider.generate({
          notes: selectedNoteObjects,
          subjectId,
          title,
          mode: "flashcards",
        });

        if (result.flashcardSet) {
          const savedResult = studyService.saveGenerationResult({
            flashcardSet: result.flashcardSet,
            quiz: null,
            warnings: result.warnings,
          });

          if (savedResult.flashcardSet) {
            onSave(savedResult.flashcardSet, savedResult.flashcards);
            toast.success(`Created ${savedResult.flashcards.length} flashcards`);
          }
        } else {
          toast.error("No flashcards generated");
        }

        result.warnings?.forEach((w) => toast.warning(w));
        resetForm();
        onClose();
      } catch (error) {
        console.error("Generation failed:", error);
        toast.error("Generation failed. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Flashcard Set</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Creation Mode */}
          <div className="space-y-2">
            <Label>Creation Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={mode === "manual" ? "default" : "outline"}
                onClick={() => setMode("manual")}
                className="justify-start"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Manual
              </Button>
              <Button
                type="button"
                variant={mode === "basic" ? "default" : "outline"}
                onClick={() => setMode("basic")}
                className="justify-start"
              >
                <Zap className="h-4 w-4 mr-2" />
                Basic
              </Button>
              <Button
                type="button"
                variant={mode === "ai" ? "default" : "outline"}
                onClick={() => setMode("ai")}
                className="justify-start"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Set title" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this set"
              rows={2}
            />
          </div>

          {/* Notes selection for AI/Basic */}
          {mode !== "manual" && (
            <div className="space-y-2">
              <Label>Select Notes ({selectedNotes.length} selected)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {filteredNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {subjectId ? "No notes for this subject" : "Select a subject first"}
                  </p>
                ) : (
                  filteredNotes.map((note) => (
                    <label key={note.id} className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer">
                      <Checkbox
                        checked={selectedNotes.includes(note.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNotes([...selectedNotes, note.id]);
                          } else {
                            setSelectedNotes(selectedNotes.filter((id) => id !== note.id));
                          }
                        }}
                      />
                      <span className="text-sm truncate">{note.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Manual cards */}
          {mode === "manual" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Cards ({cards.length})</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCard}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Card
                </Button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-3">
                {cards.map((card, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Question"
                          value={card.question}
                          onChange={(e) => updateCard(index, "question", e.target.value)}
                        />
                        <Textarea
                          placeholder="Answer"
                          value={card.answer}
                          onChange={(e) => updateCard(index, "answer", e.target.value)}
                          rows={2}
                        />
                      </div>
                      {cards.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => removeCard(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateQuizDialog({
  isOpen,
  onClose,
  subjects,
  notes,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  notes: Note[];
  onSave: (quiz: Quiz) => void;
}) {
  const [mode, setMode] = useState<"manual" | "ai" | "basic">("manual");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual questions
  const [questions, setQuestions] = useState<Omit<QuizQuestion, "id">[]>([
    { type: "mcq", prompt: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);

  const filteredNotes = useMemo(() => {
    if (!subjectId) return notes;
    return notes.filter((n) => n.subjectId === subjectId);
  }, [notes, subjectId]);

  const resetForm = () => {
    setMode("manual");
    setSubjectId("");
    setTitle("");
    setDescription("");
    setSelectedNotes([]);
    setQuestions([{ type: "mcq", prompt: "", options: ["", "", "", ""], correctAnswer: "" }]);
  };

  const addQuestion = () => {
    setQuestions([...questions, { type: "mcq", prompt: "", options: ["", "", "", ""], correctAnswer: "" }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: string | string[]) => {
    const updated = [...questions];
    (updated[index] as Record<string, unknown>)[field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectId || !title.trim()) {
      toast.error("Please fill in subject and title");
      return;
    }

    if (mode === "manual") {
      const validQuestions = questions.filter((q) => q.prompt.trim() && q.correctAnswer.trim());
      if (validQuestions.length === 0) {
        toast.error("Please add at least one question with prompt and answer");
        return;
      }

      const newQuiz = studyService.createQuiz({
        title,
        description: description || undefined,
        subjectId,
        noteIds: [],
        questions: validQuestions.map((q) => ({ ...q, id: generateId() })),
        source: "manual",
      });

      onSave(newQuiz);
      toast.success("Quiz created");
      resetForm();
      onClose();
    } else {
      // AI or Basic generation
      if (selectedNotes.length === 0) {
        toast.error("Please select at least one note for generation");
        return;
      }

      setIsGenerating(true);
      try {
        const selectedNoteObjects = notes.filter((n) => selectedNotes.includes(n.id));
        const provider = getStudyGenerationProvider(mode === "ai" ? "ai" : "basic");

        const result = await provider.generate({
          notes: selectedNoteObjects,
          subjectId,
          title,
          mode: "quiz",
        });

        if (result.quiz) {
          const savedResult = studyService.saveGenerationResult({
            flashcardSet: null,
            quiz: result.quiz,
            warnings: result.warnings,
          });

          if (savedResult.quiz) {
            onSave(savedResult.quiz);
            toast.success(`Created quiz with ${savedResult.quiz.questions.length} questions`);
          }
        } else {
          toast.error("No quiz generated");
        }

        result.warnings?.forEach((w) => toast.warning(w));
        resetForm();
        onClose();
      } catch (error) {
        console.error("Generation failed:", error);
        toast.error("Generation failed. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Creation Mode */}
          <div className="space-y-2">
            <Label>Creation Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={mode === "manual" ? "default" : "outline"}
                onClick={() => setMode("manual")}
                className="justify-start"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Manual
              </Button>
              <Button
                type="button"
                variant={mode === "basic" ? "default" : "outline"}
                onClick={() => setMode("basic")}
                className="justify-start"
              >
                <Zap className="h-4 w-4 mr-2" />
                Basic
              </Button>
              <Button
                type="button"
                variant={mode === "ai" ? "default" : "outline"}
                onClick={() => setMode("ai")}
                className="justify-start"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this quiz"
              rows={2}
            />
          </div>

          {/* Notes selection for AI/Basic */}
          {mode !== "manual" && (
            <div className="space-y-2">
              <Label>Select Notes ({selectedNotes.length} selected)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {filteredNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {subjectId ? "No notes for this subject" : "Select a subject first"}
                  </p>
                ) : (
                  filteredNotes.map((note) => (
                    <label key={note.id} className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer">
                      <Checkbox
                        checked={selectedNotes.includes(note.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNotes([...selectedNotes, note.id]);
                          } else {
                            setSelectedNotes(selectedNotes.filter((id) => id !== note.id));
                          }
                        }}
                      />
                      <span className="text-sm truncate">{note.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Manual questions */}
          {mode === "manual" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Questions ({questions.length})</Label>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-3">
                {questions.map((q, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">Q{index + 1}</Badge>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeQuestion(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={q.type} onValueChange={(v) => updateQuestion(index, "type", v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="truefalse">True/False</SelectItem>
                            <SelectItem value="short">Short Answer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Correct answer"
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                        />
                      </div>
                      <Textarea
                        placeholder="Question prompt"
                        value={q.prompt}
                        onChange={(e) => updateQuestion(index, "prompt", e.target.value)}
                        rows={2}
                      />
                      {q.type === "mcq" && (
                        <Textarea
                          placeholder="Options (one per line)"
                          value={q.options?.join("\n") || ""}
                          onChange={(e) => updateQuestion(index, "options", e.target.value.split("\n"))}
                          rows={4}
                        />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Main Page ====================

export default function StudyPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "flashcards" | "quizzes">("all");

  const [isCreateSetOpen, setIsCreateSetOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "set" | "quiz"; id: string } | null>(null);

  // Study/Quiz modes
  const [studyingSet, setStudyingSet] = useState<FlashcardSet | null>(null);
  const [studyingCards, setStudyingCards] = useState<Flashcard[]>([]);
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);

  const loadData = useCallback(() => {
    setSubjects(subjectService.list());
    setNotes(noteService.list());
    setFlashcardSets(studyService.listFlashcardSets());
    setFlashcards(studyService.listFlashcards());
    setQuizzes(studyService.listQuizzes());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const filteredSets = useMemo(() => {
    return flashcardSets.filter((s) => {
      if (filterSubject !== "all" && s.subjectId !== filterSubject) return false;
      if (filterType === "quizzes") return false;
      return true;
    });
  }, [flashcardSets, filterSubject, filterType]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      if (filterSubject !== "all" && q.subjectId !== filterSubject) return false;
      if (filterType === "flashcards") return false;
      return true;
    });
  }, [quizzes, filterSubject, filterType]);

  const getCardsForSet = (setId: string) => flashcards.filter((c) => c.setId === setId);
  const getLearnedCount = (setId: string) => flashcards.filter((c) => c.setId === setId && c.learned).length;

  const handleStudySet = (set: FlashcardSet) => {
    const cards = getCardsForSet(set.id);
    setStudyingSet(set);
    setStudyingCards(cards);
  };

  const handleCardUpdate = (id: string, learned: boolean) => {
    studyService.markFlashcardLearned(id, learned);
    setFlashcards(studyService.listFlashcards());
    setStudyingCards((prev) => prev.map((c) => (c.id === id ? { ...c, learned } : c)));
  };

  const handleTakeQuiz = (quiz: Quiz) => {
    setTakingQuiz(quiz);
  };

  const handleQuizComplete = (attempt: Omit<QuizAttempt, "id" | "createdAt" | "updatedAt">) => {
    studyService.createQuizAttempt(attempt);
    toast.success("Quiz completed!");
  };

  const handleDeleteSet = () => {
    if (deleteConfirm?.type === "set") {
      studyService.deleteFlashcardSet(deleteConfirm.id);
      toast.success("Flashcard set deleted");
      loadData();
    }
    setDeleteConfirm(null);
  };

  const handleDeleteQuiz = () => {
    if (deleteConfirm?.type === "quiz") {
      studyService.deleteQuiz(deleteConfirm.id);
      toast.success("Quiz deleted");
      loadData();
    }
    setDeleteConfirm(null);
  };

  // Import/Export functionality
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportAll = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      flashcardSets: flashcardSets,
      flashcards: flashcards,
      quizzes: quizzes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-materials-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Study materials exported");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate structure
        if (
          !data.version ||
          !Array.isArray(data.flashcardSets) ||
          !Array.isArray(data.flashcards) ||
          !Array.isArray(data.quizzes)
        ) {
          throw new Error("Invalid file format");
        }

        let importedSets = 0;
        let importedCards = 0;
        let importedQuizzes = 0;

        // Import flashcard sets with new IDs
        const setIdMap = new Map<string, string>();
        for (const set of data.flashcardSets) {
          const newId = generateId();
          setIdMap.set(set.id, newId);
          studyService.createFlashcardSet({
            ...set,
            id: undefined, // Let the service generate new ID
            title: `${set.title} (imported)`,
          });
          importedSets++;
        }

        // Import flashcards with updated setIds
        for (const card of data.flashcards) {
          const newSetId = setIdMap.get(card.setId);
          if (newSetId) {
            studyService.createFlashcard({
              ...card,
              id: undefined,
              setId: newSetId,
            });
            importedCards++;
          }
        }

        // Import quizzes
        for (const quiz of data.quizzes) {
          studyService.createQuiz({
            ...quiz,
            id: undefined,
            title: `${quiz.title} (imported)`,
          });
          importedQuizzes++;
        }

        toast.success(`Imported ${importedSets} sets, ${importedCards} cards, ${importedQuizzes} quizzes`);
        loadData();
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Import failed. Please check the file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  // Study mode active
  if (studyingSet) {
    return (
      <FlashcardStudyMode
        set={studyingSet}
        cards={studyingCards}
        onClose={() => {
          setStudyingSet(null);
          loadData();
        }}
        onCardUpdate={handleCardUpdate}
      />
    );
  }

  // Quiz mode active
  if (takingQuiz) {
    return (
      <QuizTakingMode
        quiz={takingQuiz}
        onClose={() => {
          setTakingQuiz(null);
          loadData();
        }}
        onComplete={handleQuizComplete}
      />
    );
  }

  return (
    <div>
      {/* Hidden file input for import */}
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Study</h1>
          <p className="text-sm text-muted-foreground">Create and study flashcards and quizzes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="Import">
            <Upload className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleExportAll} title="Export All">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setIsCreateSetOpen(true)}>
            <Layers className="h-4 w-4 mr-2" />
            New Flashcard Set
          </Button>
          <Button onClick={() => setIsCreateQuizOpen(true)}>
            <FileQuestion className="h-4 w-4 mr-2" />
            New Quiz
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as "all" | "flashcards" | "quizzes")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="flashcards">Flashcards</SelectItem>
            <SelectItem value="quizzes">Quizzes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flashcard Sets */}
      {(filterType === "all" || filterType === "flashcards") && filteredSets.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Flashcard Sets ({filteredSets.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSets.map((set) => (
              <FlashcardSetCard
                key={set.id}
                set={set}
                cardCount={getCardsForSet(set.id).length}
                learnedCount={getLearnedCount(set.id)}
                subject={subjectMap.get(set.subjectId)}
                onStudy={() => handleStudySet(set)}
                onOpen={() => router.push(`/app/study/flashcards/${set.id}`)}
                onDelete={() => setDeleteConfirm({ type: "set", id: set.id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quizzes */}
      {(filterType === "all" || filterType === "quizzes") && filteredQuizzes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            Quizzes ({filteredQuizzes.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                subject={subjectMap.get(quiz.subjectId)}
                bestAttempt={studyService.getBestAttempt(quiz.id)}
                onTake={() => handleTakeQuiz(quiz)}
                onOpen={() => router.push(`/app/study/quizzes/${quiz.id}`)}
                onDelete={() => setDeleteConfirm({ type: "quiz", id: quiz.id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredSets.length === 0 && filteredQuizzes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No study materials yet</h3>
          <p className="text-sm mb-6">Create flashcard sets or quizzes to start studying</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setIsCreateSetOpen(true)}>
              <Layers className="h-4 w-4 mr-2" />
              Create Flashcard Set
            </Button>
            <Button onClick={() => setIsCreateQuizOpen(true)}>
              <FileQuestion className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialogs */}
      <CreateFlashcardSetDialog
        isOpen={isCreateSetOpen}
        onClose={() => setIsCreateSetOpen(false)}
        subjects={subjects}
        notes={notes}
        onSave={() => loadData()}
      />

      <CreateQuizDialog
        isOpen={isCreateQuizOpen}
        onClose={() => setIsCreateQuizOpen(false)}
        subjects={subjects}
        notes={notes}
        onSave={() => loadData()}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteConfirm?.type === "set" ? "Flashcard Set" : "Quiz"}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this{" "}
            {deleteConfirm?.type === "set" ? "flashcard set and all its cards" : "quiz"}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteConfirm?.type === "set" ? handleDeleteSet : handleDeleteQuiz}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
