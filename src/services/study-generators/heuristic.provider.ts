// Heuristic-based study material generator (no AI required)

import type { StudyGenerationProvider, GenerationRequest, GenerationResult, GeneratedFlashcard } from "./types";
import type { QuizQuestion } from "@/domain/types";
import { generateId } from "@/lib/ids";

/**
 * Extracts plain text from HTML content
 */
function stripHtml(html: string): string {
  const text = html.replace(/<[^>]*>/g, " ");
  const decoded = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return decoded.replace(/\s+/g, " ").trim();
}

/**
 * Extracts sentences from text
 */
function extractSentences(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  return sentences.map((s) => s.trim());
}

/**
 * Extracts key terms (bold, italic, highlighted)
 */
function extractKeyTerms(html: string): string[] {
  const terms: string[] = [];

  const boldMatch = html.match(/<(strong|b)>([^<]+)<\/(strong|b)>/gi);
  if (boldMatch) {
    boldMatch.forEach((match) => {
      const term = stripHtml(match);
      if (term.length > 2 && term.length < 50) terms.push(term);
    });
  }

  const italicMatch = html.match(/<(em|i)>([^<]+)<\/(em|i)>/gi);
  if (italicMatch) {
    italicMatch.forEach((match) => {
      const term = stripHtml(match);
      if (term.length > 2 && term.length < 50) terms.push(term);
    });
  }

  const highlightMatch = html.match(/<mark[^>]*>([^<]+)<\/mark>/gi);
  if (highlightMatch) {
    highlightMatch.forEach((match) => {
      const term = stripHtml(match);
      if (term.length > 2 && term.length < 100) terms.push(term);
    });
  }

  return [...new Set(terms)];
}

/**
 * Extracts list items
 */
function extractListItems(html: string): string[] {
  const items: string[] = [];
  const listMatch = html.match(/<li[^>]*>([^<]+)<\/li>/gi);
  if (listMatch) {
    listMatch.forEach((match) => {
      const item = stripHtml(match);
      if (item.length > 5 && item.length < 200) items.push(item);
    });
  }
  return items;
}

/**
 * Extracts headers/headings
 */
function extractHeadings(html: string): string[] {
  const headings: string[] = [];
  const headingMatch = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi);
  if (headingMatch) {
    headingMatch.forEach((match) => {
      const heading = stripHtml(match);
      if (heading.length > 3) headings.push(heading);
    });
  }
  return headings;
}

/**
 * Generates flashcards from extracted content
 */
function generateFlashcardsFromNote(noteContent: string, maxCards: number): GeneratedFlashcard[] {
  const flashcards: GeneratedFlashcard[] = [];

  const keyTerms = extractKeyTerms(noteContent);
  const plainText = stripHtml(noteContent);
  const sentences = extractSentences(plainText);
  const headings = extractHeadings(noteContent);
  const listItems = extractListItems(noteContent);

  // Create definition-style flashcards from key terms
  keyTerms.slice(0, Math.ceil(maxCards / 2)).forEach((term) => {
    const relatedSentence = sentences.find((s) => s.toLowerCase().includes(term.toLowerCase()));

    if (relatedSentence) {
      flashcards.push({
        question: `What is "${term}"?`,
        answer: relatedSentence,
        learned: false,
      });
    }
  });

  // Create explanations from headings
  headings.slice(0, Math.ceil(maxCards / 4)).forEach((heading) => {
    const headingIndex = plainText.indexOf(heading);
    if (headingIndex > -1) {
      const afterHeading = plainText.slice(headingIndex + heading.length);
      const firstSentence = extractSentences(afterHeading)[0];

      if (firstSentence) {
        flashcards.push({
          question: `Explain: ${heading}`,
          answer: firstSentence,
          learned: false,
        });
      }
    }
  });

  // Create list-based flashcards
  if (listItems.length >= 3) {
    const heading = headings[0] || "this topic";
    flashcards.push({
      question: `List key points about ${heading}`,
      answer: listItems
        .slice(0, 5)
        .map((item, i) => `${i + 1}. ${item}`)
        .join("\n"),
      learned: false,
    });
  }

  return flashcards.slice(0, maxCards);
}

/**
 * Generates quiz questions from extracted content
 */
function generateQuizQuestions(
  noteContent: string,
  maxQuestions: number,
  questionTypes: QuizQuestion["type"][]
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const keyTerms = extractKeyTerms(noteContent);
  const plainText = stripHtml(noteContent);
  const sentences = extractSentences(plainText);
  const headings = extractHeadings(noteContent);

  // Generate true/false questions
  if (questionTypes.includes("truefalse")) {
    sentences.slice(0, 3).forEach((sentence) => {
      if (sentence.length > 30 && sentence.length < 150) {
        questions.push({
          id: generateId(),
          type: "truefalse",
          prompt: `True or False: ${sentence}`,
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "This statement is directly from the notes.",
        });
      }
    });
  }

  // Generate MCQ
  if (questionTypes.includes("mcq") && keyTerms.length >= 4) {
    keyTerms.slice(0, 2).forEach((term) => {
      const relatedSentence = sentences.find((s) => s.toLowerCase().includes(term.toLowerCase()));

      if (relatedSentence) {
        const wrongTerms = keyTerms.filter((t) => t !== term).slice(0, 3);
        const options = [term, ...wrongTerms].sort(() => Math.random() - 0.5);

        questions.push({
          id: generateId(),
          type: "mcq",
          prompt: `Which term best relates to: "${relatedSentence.slice(0, 100)}..."?`,
          options,
          correctAnswer: term,
          explanation: `The correct answer is "${term}" based on the note content.`,
        });
      }
    });
  }

  // Generate short answer
  if (questionTypes.includes("short")) {
    headings.slice(0, 2).forEach((heading) => {
      questions.push({
        id: generateId(),
        type: "short",
        prompt: `Briefly explain: ${heading}`,
        correctAnswer: sentences[0] || "Answer based on your understanding.",
        explanation: "Open-ended question to test understanding.",
      });
    });
  }

  return questions.slice(0, maxQuestions);
}

export const heuristicProvider: StudyGenerationProvider = {
  type: "basic",
  name: "Basic Generator",

  async isAvailable(): Promise<boolean> {
    return true;
  },

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const {
      notes,
      subjectId,
      title,
      mode,
      maxFlashcards = 10,
      maxQuizQuestions = 5,
      questionTypes = ["mcq", "truefalse", "short"],
    } = request;

    const allFlashcards: GeneratedFlashcard[] = [];
    const allQuizQuestions: QuizQuestion[] = [];
    const warnings: string[] = [];

    if (notes.length === 0) {
      warnings.push("No notes selected. Please select at least one note.");
      return { flashcardSet: null, quiz: null, warnings };
    }

    // Process each note
    for (const note of notes) {
      const content = note.content || "";

      if (content.length < 50) {
        warnings.push(`Note "${note.title}" has very little content.`);
        continue;
      }

      if (mode === "flashcards" || mode === "both") {
        const cardsFromNote = generateFlashcardsFromNote(content, Math.ceil(maxFlashcards / notes.length));
        allFlashcards.push(...cardsFromNote);
      }

      if (mode === "quiz" || mode === "both") {
        const questionsFromNote = generateQuizQuestions(
          content,
          Math.ceil(maxQuizQuestions / notes.length),
          questionTypes
        );
        allQuizQuestions.push(...questionsFromNote);
      }
    }

    // Build flashcard set
    let flashcardSet: GenerationResult["flashcardSet"] = null;
    if (allFlashcards.length > 0) {
      flashcardSet = {
        set: {
          title: title || `Flashcards from ${notes.length} note${notes.length > 1 ? "s" : ""}`,
          subjectId,
          noteIds: notes.map((n) => n.id),
          source: "generated",
        },
        cards: allFlashcards.slice(0, maxFlashcards),
      };
    }

    // Build quiz
    let quiz: GenerationResult["quiz"] = null;
    if (allQuizQuestions.length > 0) {
      quiz = {
        subjectId,
        noteIds: notes.map((n) => n.id),
        title: title || `Quiz from ${notes.length} note${notes.length > 1 ? "s" : ""}`,
        questions: allQuizQuestions.slice(0, maxQuizQuestions),
        source: "generated",
      };
    }

    if (allFlashcards.length === 0 && allQuizQuestions.length === 0) {
      warnings.push(
        "Could not extract enough content. Try adding more formatted content (headings, lists, bold text)."
      );
    }

    return {
      flashcardSet,
      quiz,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  },
};
