"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Edit3,
  Trash2,
  Plus,
  Play,
  BookOpen,
  Check,
  X,
  Save,
  Shuffle,
  RotateCcw,
  ChevronRight,
  Download,
  FileQuestion,
  Star,
  ArrowLeft,
  ArrowRight,
  Keyboard,
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
import type { FlashcardSet, Flashcard, Subject } from "@/domain/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ==================== Stacked Flashcard View (Quizlet-style) ====================

function StackedFlashcardView({
  cards,
  onClose,
  onMarkLearned,
}: {
  cards: Flashcard[];
  onClose: () => void;
  onMarkLearned: (id: string, learned: boolean) => void;
}) {
  const [displayCards, setDisplayCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState<"all" | "unlearned" | "learned">("all");
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Initialize cards based on filter
  useEffect(() => {
    let filtered: Flashcard[];
    if (filter === "unlearned") {
      filtered = cards.filter((c) => !c.learned);
    } else if (filter === "learned") {
      filtered = cards.filter((c) => c.learned);
    } else {
      filtered = [...cards];
    }
    setDisplayCards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards, filter]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          setIsFlipped((f) => !f);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex((i) => i - 1);
            setIsFlipped(false);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentIndex < displayCards.length - 1) {
            setCurrentIndex((i) => i + 1);
            setIsFlipped(false);
          }
          break;
        case "s":
        case "S":
          e.preventDefault();
          if (displayCards[currentIndex]) {
            onMarkLearned(displayCards[currentIndex].id, !displayCards[currentIndex].learned);
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, displayCards, onClose, onMarkLearned]);

  const handleShuffle = () => {
    setDisplayCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success("Cards shuffled");
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < displayCards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const currentCard = displayCards[currentIndex];
  const learnedCount = cards.filter((c) => c.learned).length;
  const progress = displayCards.length > 0 ? ((currentIndex + 1) / displayCards.length) * 100 : 0;

  // Empty state
  if (displayCards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <BookOpen className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {filter === "unlearned" ? "All Cards Learned!" : filter === "learned" ? "No Learned Cards" : "No Cards"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {filter !== "all" ? "Try changing the filter to see more cards." : "Add some flashcards to get started."}
        </p>
        <div className="flex gap-2">
          {filter !== "all" && (
            <Button variant="outline" onClick={() => setFilter("all")}>
              Show All Cards
            </Button>
          )}
          <Button onClick={onClose}>Back to Set</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="font-medium">Flashcards</p>
            <p className="text-sm text-muted-foreground">
              {learnedCount}/{cards.length} learned
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as "all" | "unlearned" | "learned")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({cards.length})</SelectItem>
              <SelectItem value="unlearned">Unlearned ({cards.length - learnedCount})</SelectItem>
              <SelectItem value="learned">Learned ({learnedCount})</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleShuffle} title="Shuffle cards">
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts">
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 shrink-0">
        <Progress value={progress} className="h-1" />
        <p className="text-center text-sm text-muted-foreground mt-1">
          {currentIndex + 1} of {displayCards.length}
        </p>
      </div>

      {/* Stacked Cards Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-2xl" style={{ perspective: "1000px" }}>
          {/* Stack effect - cards behind */}
          {displayCards.slice(currentIndex + 1, currentIndex + 3).map((_, i) => (
            <div
              key={`stack-${i}`}
              className="absolute inset-0 bg-card border rounded-xl shadow-lg"
              style={{
                transform: `translateY(${(i + 1) * 8}px) scale(${1 - (i + 1) * 0.03})`,
                opacity: 0.5 - i * 0.2,
                zIndex: -i - 1,
              }}
            />
          ))}

          {/* Main card with 3D flip */}
          <div
            className="relative w-full cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.5s ease-in-out",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front (Question) */}
            <div
              className="w-full min-h-80 bg-card border rounded-xl shadow-xl p-8 flex flex-col items-center justify-center"
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              <Badge variant="outline" className="mb-4 text-xs">
                QUESTION
              </Badge>
              <p className="text-xl md:text-2xl font-semibold text-center leading-relaxed">{currentCard?.question}</p>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <span className="text-xs text-muted-foreground">Click or press Space to flip</span>
              </div>
              {currentCard?.learned && (
                <div className="absolute top-4 right-4">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
              )}
            </div>

            {/* Back (Answer) */}
            <div
              className="absolute inset-0 w-full min-h-80 bg-card border rounded-xl shadow-xl p-8 flex flex-col items-center justify-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <Badge variant="secondary" className="mb-4 text-xs">
                ANSWER
              </Badge>
              <p className="text-lg md:text-xl text-center leading-relaxed text-muted-foreground">
                {currentCard?.answer}
              </p>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <span className="text-xs text-muted-foreground">Click or press Space to flip back</span>
              </div>
              {currentCard?.learned && (
                <div className="absolute top-4 right-4">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="p-4 border-t shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="lg" onClick={goToPrevious} disabled={currentIndex === 0}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>
            <Button variant="outline" size="lg" onClick={goToNext} disabled={currentIndex === displayCards.length - 1}>
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
          <Button
            variant={currentCard?.learned ? "secondary" : "default"}
            size="lg"
            onClick={() => currentCard && onMarkLearned(currentCard.id, !currentCard.learned)}
          >
            <Star className={cn("h-4 w-4 mr-2", currentCard?.learned && "fill-current")} />
            {currentCard?.learned ? "Unmark" : "Mark Learned"}
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flip card</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Previous card</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">←</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next card</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">→</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toggle learned</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Close</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== Cards List View (for editing) ====================

function CardsListView({
  cards,
  onEdit,
  onDelete,
  onToggleLearned,
  onAdd,
}: {
  cards: Flashcard[];
  onEdit: (card: Flashcard) => void;
  onDelete: (id: string) => void;
  onToggleLearned: (id: string, learned: boolean) => void;
  onAdd: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No cards yet</h3>
        <p className="text-sm mb-4">Add some flashcards to start studying</p>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Card
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card, index) => (
        <Card
          key={card.id}
          className={cn(
            "p-4 transition-all",
            card.learned && "border-l-4 border-l-yellow-500",
            expandedId === card.id && "ring-2 ring-primary"
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-sm text-muted-foreground font-mono w-6">#{index + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="cursor-pointer" onClick={() => setExpandedId(expandedId === card.id ? null : card.id)}>
                <p className="font-medium">{card.question}</p>
                {expandedId === card.id && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-muted-foreground">{card.answer}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleLearned(card.id, !card.learned)}
                title={card.learned ? "Mark unlearned" : "Mark learned"}
              >
                <Star
                  className={cn("h-4 w-4", card.learned ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")}
                />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(card)}>
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(card.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ==================== Test Mode (Multiple Choice) ====================

function TestMode({ cards, onClose }: { cards: Flashcard[]; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selected: string; correct: boolean }>>({});
  const [showResult, setShowResult] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Array<{ card: Flashcard; options: string[] }>>([]);

  useEffect(() => {
    const allAnswers = cards.map((c) => c.answer);
    const questions = cards
      .map((card) => {
        const wrongAnswers = allAnswers
          .filter((a) => a !== card.answer)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        const options = [card.answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        return { card, options };
      })
      .sort(() => Math.random() - 0.5);
    setShuffledQuestions(questions);
  }, [cards]);

  const handleAnswer = (questionId: string, selectedAnswer: string, correctAnswer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { selected: selectedAnswer, correct: selectedAnswer === correctAnswer },
    }));
  };

  const score = Object.values(answers).filter((a) => a.correct).length;
  const percentage = shuffledQuestions.length > 0 ? Math.round((score / shuffledQuestions.length) * 100) : 0;
  const current = shuffledQuestions[currentIndex];

  if (shuffledQuestions.length < 4) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center">
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Not Enough Cards</h2>
        <p className="text-muted-foreground mb-4">You need at least 4 cards for test mode.</p>
        <Button onClick={onClose}>Back</Button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Test Results</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 mb-6 text-center">
              <h3 className="text-4xl font-bold mb-2">{percentage}%</h3>
              <p className="text-lg text-muted-foreground">
                {score} out of {shuffledQuestions.length} correct
              </p>
            </Card>
            <div className="space-y-4">
              {shuffledQuestions.map((q, i) => {
                const userAnswer = answers[q.card.id];
                return (
                  <Card
                    key={q.card.id}
                    className={cn("p-4", userAnswer?.correct ? "border-green-500/50" : "border-red-500/50")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-white text-sm",
                          userAnswer?.correct ? "bg-green-500" : "bg-red-500"
                        )}
                      >
                        {userAnswer?.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          {i + 1}. {q.card.question}
                        </p>
                        {userAnswer && !userAnswer.correct && (
                          <p className="text-sm text-red-500">Your answer: {userAnswer.selected}</p>
                        )}
                        <p className="text-sm text-green-500">Correct: {q.card.answer}</p>
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
                  setShowResult(false);
                  setCurrentIndex(0);
                  setAnswers({});
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
            <p className="font-medium">Test Mode</p>
            <p className="text-sm text-muted-foreground">
              {Object.keys(answers).length}/{shuffledQuestions.length} answered
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 py-2">
        <Progress value={((currentIndex + 1) / shuffledQuestions.length) * 100} className="h-1" />
        <p className="text-center text-sm text-muted-foreground mt-1">
          Question {currentIndex + 1} of {shuffledQuestions.length}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-medium">{current?.card.question}</h3>
          </Card>
          <div className="space-y-3">
            {current?.options.map((option, i) => {
              const isSelected = answers[current.card.id]?.selected === option;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(current.card.id, option, current.card.answer)}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-colors",
                    isSelected ? "border-primary bg-primary/10" : "hover:bg-accent"
                  )}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + i)}.</span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button variant="outline" onClick={() => setCurrentIndex((i) => i - 1)} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {currentIndex === shuffledQuestions.length - 1 ? (
            <Button
              onClick={() => setShowResult(true)}
              disabled={Object.keys(answers).length < shuffledQuestions.length}
            >
              Submit Test
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setCurrentIndex((i) => i + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== Dialogs ====================

function EditFlashcardDialog({
  flashcard,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: {
  flashcard: Flashcard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, question: string, answer: string) => void;
  onDelete: (id: string) => void;
}) {
  const [question, setQuestion] = useState(flashcard?.question || "");
  const [answer, setAnswer] = useState(flashcard?.answer || "");

  // Sync state when flashcard changes
  useEffect(() => {
    setQuestion(flashcard?.question || "");
    setAnswer(flashcard?.answer || "");
  }, [flashcard?.id, flashcard?.question, flashcard?.answer]);

  const handleSave = () => {
    if (!flashcard) return;
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    onSave(flashcard.id, question, answer);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => {
              if (flashcard) onDelete(flashcard.id);
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

function AddFlashcardDialog({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: string, answer: string) => void;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    onSave(question, answer);
    setQuestion("");
    setAnswer("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Flashcard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the question"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter the answer"
              rows={4}
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

// ==================== Main Page ====================

export default function FlashcardSetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.id as string;

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState("flashcards");

  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditSetOpen, setIsEditSetOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteCardConfirm, setDeleteCardConfirm] = useState<string | null>(null);

  const [mode, setMode] = useState<"none" | "study" | "test">("none");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadData = () => {
    const set = studyService.getFlashcardSetById(setId);
    if (!set) {
      router.push("/app/study");
      return;
    }
    setFlashcardSet(set);
    setFlashcards(studyService.getFlashcardsBySet(setId));
    setSubjects(subjectService.list());
    setEditTitle(set.title);
    setEditDescription(set.description || "");
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId]);

  const subject = useMemo(() => subjects.find((s) => s.id === flashcardSet?.subjectId), [subjects, flashcardSet]);

  const learnedCount = flashcards.filter((c) => c.learned).length;

  const handleSaveCard = (id: string, question: string, answer: string) => {
    studyService.updateFlashcard(id, { question, answer });
    toast.success("Flashcard updated");
    loadData();
  };

  const handleDeleteCard = (id: string) => {
    studyService.deleteFlashcard(id);
    toast.success("Flashcard deleted");
    setDeleteCardConfirm(null);
    loadData();
  };

  const handleAddCard = (question: string, answer: string) => {
    studyService.createFlashcard({ setId, question, answer, learned: false });
    toast.success("Flashcard added");
    loadData();
  };

  const handleMarkLearned = (id: string, learned: boolean) => {
    studyService.markFlashcardLearned(id, learned);
    loadData();
  };

  const handleSaveSet = () => {
    if (!editTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    studyService.updateFlashcardSet(setId, { title: editTitle, description: editDescription || undefined });
    toast.success("Set updated");
    setIsEditSetOpen(false);
    loadData();
  };

  const handleDeleteSet = () => {
    studyService.deleteFlashcardSet(setId);
    toast.success("Set deleted");
    router.push("/app/study");
  };

  const handleExport = () => {
    if (!flashcardSet) return;
    const exportData = {
      type: "flashcard_set",
      version: 1,
      data: {
        set: { title: flashcardSet.title, description: flashcardSet.description },
        cards: flashcards.map((c) => ({ question: c.question, answer: c.answer })),
      },
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${flashcardSet.title.replace(/[^a-z0-9]/gi, "_")}_flashcards.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Flashcard set exported");
  };

  if (!flashcardSet) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // Full-screen modes
  if (mode === "study") {
    return (
      <StackedFlashcardView
        cards={flashcards}
        onClose={() => {
          setMode("none");
          loadData();
        }}
        onMarkLearned={handleMarkLearned}
      />
    );
  }

  if (mode === "test") {
    return <TestMode cards={flashcards} onClose={() => setMode("none")} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/app/study")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{flashcardSet.title}</h1>
            {flashcardSet.description && <p className="text-sm text-muted-foreground">{flashcardSet.description}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {subject && (
                <Badge variant="outline" style={{ borderColor: subject.color }}>
                  {subject.name}
                </Badge>
              )}
              <Badge variant="secondary">{flashcards.length} cards</Badge>
              <Badge variant="secondary">{learnedCount} learned</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsEditSetOpen(true)}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setMode("study")} disabled={flashcards.length === 0}>
            <BookOpen className="h-4 w-4 mr-2" />
            Study
          </Button>
          <Button onClick={() => setMode("test")} disabled={flashcards.length < 4}>
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Learning Progress</span>
          <span className="text-sm font-medium">
            {flashcards.length > 0 ? Math.round((learnedCount / flashcards.length) * 100) : 0}%
          </span>
        </div>
        <Progress value={flashcards.length > 0 ? (learnedCount / flashcards.length) * 100 : 0} />
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="list">Cards List</TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>

        <TabsContent value="flashcards">
          {flashcards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No cards yet</h3>
              <p className="text-sm mb-4">Add some flashcards to start studying</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Card
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="relative w-64 h-40 mx-auto mb-6">
                  {/* Stack preview */}
                  <div className="absolute inset-0 bg-card border rounded-xl shadow-lg transform translate-y-4 scale-95 opacity-30" />
                  <div className="absolute inset-0 bg-card border rounded-xl shadow-lg transform translate-y-2 scale-[0.97] opacity-50" />
                  <div className="absolute inset-0 bg-card border rounded-xl shadow-xl flex items-center justify-center p-4">
                    <p className="text-lg font-medium text-center line-clamp-3">{flashcards[0].question}</p>
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">{flashcards.length} cards ready to study</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click Study to start with stacked flashcards. Use keyboard shortcuts for faster navigation.
                </p>
                <Button size="lg" onClick={() => setMode("study")}>
                  <BookOpen className="h-5 w-5 mr-2" />
                  Start Studying
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          <CardsListView
            cards={flashcards}
            onEdit={setEditingCard}
            onDelete={(id) => setDeleteCardConfirm(id)}
            onToggleLearned={handleMarkLearned}
            onAdd={() => setIsAddDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditFlashcardDialog
        flashcard={editingCard}
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSave={handleSaveCard}
        onDelete={(id) => {
          setEditingCard(null);
          setDeleteCardConfirm(id);
        }}
      />

      <AddFlashcardDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onSave={handleAddCard} />

      {/* Edit Set Dialog */}
      <Dialog open={isEditSetOpen} onOpenChange={setIsEditSetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flashcard Set</DialogTitle>
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
              Delete Set
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditSetOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSet}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Set Confirm */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flashcard Set</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this set and all its cards? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSet}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Card Confirm */}
      <Dialog open={!!deleteCardConfirm} onOpenChange={() => setDeleteCardConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flashcard</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete this flashcard?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCardConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteCardConfirm && handleDeleteCard(deleteCardConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
