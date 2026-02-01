// Demo seed data generator

import { storage } from "@/data/storage";
import { STORAGE_KEYS, STORAGE_VERSION, SUBJECT_COLORS } from "@/domain/constants";
import type { Semester, Subject, Note, Task, CalendarEvent, FlashcardSet, Flashcard, Quiz } from "@/domain/types";
import { generateId, generateTimestamp } from "@/lib/ids";
import { addDays } from "@/lib/dates";

export function generateDemoData(): void {
  const now = new Date();
  const timestamp = generateTimestamp();

  // Create current semester
  const semester: Semester = {
    id: generateId(),
    name: "Fall 2026",
    startDate: new Date(2026, 0, 1).toISOString(),
    endDate: new Date(2026, 5, 30).toISOString(),
    isCurrent: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // Create subjects
  const subjects: Subject[] = [
    {
      id: generateId(),
      name: "Data Structures & Algorithms",
      semesterId: semester.id,
      color: SUBJECT_COLORS[0],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      name: "Operating Systems",
      semesterId: semester.id,
      color: SUBJECT_COLORS[1],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      name: "Database Systems",
      semesterId: semester.id,
      color: SUBJECT_COLORS[2],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      name: "Computer Networks",
      semesterId: semester.id,
      color: SUBJECT_COLORS[3],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      name: "Software Engineering",
      semesterId: semester.id,
      color: SUBJECT_COLORS[4],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  // Create notes
  const notes: Note[] = [
    {
      id: generateId(),
      title: "Big O Notation",
      content: `# Big O Notation

Big O notation is used to describe the performance or complexity of an algorithm.

## Common Time Complexities

- **O(1)** - Constant time
- **O(log n)** - Logarithmic time
- **O(n)** - Linear time
- **O(n log n)** - Linearithmic time
- **O(n²)** - Quadratic time

## Example: Binary Search

\`\`\`javascript
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}
\`\`\`

Time complexity: O(log n)`,
      subjectId: subjects[0].id,
      semesterId: semester.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "Process States",
      content: `# Process States

A process can be in one of several states:

1. **New** - Process is being created
2. **Ready** - Process is waiting to be assigned to a processor
3. **Running** - Instructions are being executed
4. **Waiting** - Process is waiting for some event to occur
5. **Terminated** - Process has finished execution

## State Transitions

- New → Ready: Admitted
- Ready → Running: Scheduler dispatch
- Running → Ready: Interrupt
- Running → Waiting: I/O or event wait
- Waiting → Ready: I/O or event completion
- Running → Terminated: Exit`,
      subjectId: subjects[1].id,
      semesterId: semester.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "SQL Joins",
      content: `# SQL Joins

## Types of Joins

### INNER JOIN
Returns records that have matching values in both tables.

\`\`\`sql
SELECT * FROM orders
INNER JOIN customers ON orders.customer_id = customers.id;
\`\`\`

### LEFT JOIN
Returns all records from the left table, and matched records from the right table.

### RIGHT JOIN
Returns all records from the right table, and matched records from the left table.

### FULL OUTER JOIN
Returns all records when there is a match in either table.`,
      subjectId: subjects[2].id,
      semesterId: semester.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  // Create tasks
  const tasks: Task[] = [
    {
      id: generateId(),
      title: "Process Scheduling Lab Report",
      description: "Write report on FCFS, SJF, and Round Robin scheduling algorithms",
      subjectId: subjects[1].id,
      dueDate: addDays(now, -7).toISOString(),
      priority: "high",
      status: "todo",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "Implement Binary Search Tree",
      description: "Complete BST implementation with insert, delete, and search operations",
      subjectId: subjects[0].id,
      dueDate: addDays(now, -6).toISOString(),
      priority: "high",
      status: "todo",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "SQL Query Practice",
      description: "Practice complex SQL queries with joins and subqueries",
      subjectId: subjects[2].id,
      dueDate: addDays(now, -5).toISOString(),
      priority: "med",
      status: "todo",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "Read Chapter 5: Transport Layer",
      description: "Read and summarize the transport layer chapter",
      subjectId: subjects[3].id,
      dueDate: addDays(now, -4).toISOString(),
      priority: "low",
      status: "todo",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "UML Class Diagram for Project",
      description: "Create UML class diagram for the course project",
      subjectId: subjects[4].id,
      dueDate: addDays(now, -3).toISOString(),
      priority: "med",
      status: "todo",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "Review Sorting Algorithms",
      description: "Review and compare different sorting algorithms",
      subjectId: subjects[0].id,
      dueDate: addDays(now, -8).toISOString(),
      priority: "med",
      status: "done",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  // Create calendar events
  const events: CalendarEvent[] = [
    {
      id: generateId(),
      title: "Data Structures Midterm Exam",
      description: "Covers arrays, linked lists, trees, and graphs",
      type: "exam",
      startAt: addDays(now, 5).toISOString().replace(/T.*/, "T09:00:00.000Z"),
      endAt: addDays(now, 5).toISOString().replace(/T.*/, "T11:00:00.000Z"),
      subjectId: subjects[0].id,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "Database Systems Exam",
      description: "SQL, normalization, and ER diagrams",
      type: "exam",
      startAt: addDays(now, 10).toISOString().replace(/T.*/, "T09:00:00.000Z"),
      endAt: addDays(now, 10).toISOString().replace(/T.*/, "T11:00:00.000Z"),
      subjectId: subjects[2].id,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "Computer Networks Quiz",
      description: "Quiz on TCP/IP protocols",
      type: "exam",
      startAt: addDays(now, -7).toISOString().replace(/T.*/, "T14:00:00.000Z"),
      endAt: addDays(now, -7).toISOString().replace(/T.*/, "T15:00:00.000Z"),
      subjectId: subjects[3].id,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "Software Engineering Project",
      description: "Sprint 1 delivery",
      type: "project",
      startAt: addDays(now, -6).toISOString().replace(/T.*/, "T10:00:00.000Z"),
      subjectId: subjects[4].id,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "Study Group - Algorithms",
      description: "Weekly study group session",
      type: "personal",
      startAt: addDays(now, -5).toISOString().replace(/T.*/, "T16:00:00.000Z"),
      endAt: addDays(now, -5).toISOString().replace(/T.*/, "T18:00:00.000Z"),
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "Database Design Assignment",
      description: "Submit ER diagram and schema",
      type: "assignment",
      startAt: addDays(now, -2).toISOString().replace(/T.*/, "T23:59:00.000Z"),
      subjectId: subjects[2].id,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "OS Project Demo",
      description: "Present process scheduler implementation",
      type: "project",
      startAt: now.toISOString().replace(/T.*/, "T14:00:00.000Z"),
      endAt: now.toISOString().replace(/T.*/, "T16:00:00.000Z"),
      subjectId: subjects[1].id,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  // Create sample flashcard sets
  const flashcardSets: FlashcardSet[] = [
    {
      id: generateId(),
      title: "Big O Notation Basics",
      description: "Essential time complexity concepts",
      subjectId: subjects[0].id,
      noteIds: [notes[0].id],
      source: "generated",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      title: "Process States",
      description: "Operating system process lifecycle",
      subjectId: subjects[1].id,
      noteIds: [notes[1].id],
      source: "manual",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  // Create flashcards for each set
  const flashcards: Flashcard[] = [
    {
      id: generateId(),
      setId: flashcardSets[0].id,
      question: "What is the time complexity of Binary Search?",
      answer: "O(log n) - Binary search halves the search space with each comparison.",
      learned: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      setId: flashcardSets[0].id,
      question: "What is O(1) time complexity?",
      answer: "Constant time - the operation takes the same amount of time regardless of input size.",
      learned: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      setId: flashcardSets[0].id,
      question: "What is O(n²) time complexity?",
      answer: "Quadratic time - often seen in nested loops, grows rapidly with input size.",
      learned: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      setId: flashcardSets[1].id,
      question: "List the 5 process states",
      answer: "1. New\n2. Ready\n3. Running\n4. Waiting\n5. Terminated",
      learned: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId(),
      setId: flashcardSets[1].id,
      question: "What triggers a Ready → Running transition?",
      answer: "Scheduler dispatch - the process is selected by the CPU scheduler.",
      learned: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  // Create sample quiz
  const quizzes: Quiz[] = [
    {
      id: generateId(),
      subjectId: subjects[0].id,
      noteIds: [notes[0].id],
      title: "Big O Notation Quiz",
      questions: [
        {
          id: generateId(),
          type: "mcq",
          prompt: "What is the time complexity of Binary Search?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correctAnswer: "O(log n)",
          explanation: "Binary search divides the search space in half with each iteration.",
        },
        {
          id: generateId(),
          type: "truefalse",
          prompt: "O(n log n) is more efficient than O(n²) for large inputs.",
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "For large inputs, n log n grows much slower than n².",
        },
        {
          id: generateId(),
          type: "short",
          prompt: "Explain what O(1) time complexity means.",
          correctAnswer: "Constant time - the operation takes the same time regardless of input size.",
        },
      ],
      source: "generated",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  // Save to storage
  storage.set(STORAGE_KEYS.VERSION, STORAGE_VERSION);
  storage.set(STORAGE_KEYS.SEMESTERS, [semester]);
  storage.set(STORAGE_KEYS.SUBJECTS, subjects);
  storage.set(STORAGE_KEYS.NOTES, notes);
  storage.set(STORAGE_KEYS.TASKS, tasks);
  storage.set(STORAGE_KEYS.EVENTS, events);
  storage.set(STORAGE_KEYS.FLASHCARD_SETS, flashcardSets);
  storage.set(STORAGE_KEYS.FLASHCARDS, flashcards);
  storage.set(STORAGE_KEYS.QUIZZES, quizzes);
}

export function hasDemoData(): boolean {
  const semesters = storage.get(STORAGE_KEYS.SEMESTERS, []);
  return Array.isArray(semesters) && semesters.length > 0;
}
