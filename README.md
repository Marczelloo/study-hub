# StudyHub - Student Organizer

A modern, local-first student organizer web app built with Next.js, shadcn/ui, and TypeScript. Manage your notes, tasks, calendar events, and study materials with a beautiful dark-mode interface.

## Features

- **Dashboard**: Get an overview of your tasks, deadlines, and upcoming events
- **Notes**: Create and organize notes by subject with Markdown support
- **Calendar**: View and manage your academic schedule with month/week/day views
- **Tasks**: Track assignments and to-dos with priority levels and due dates
- **Study**: Create and study flashcards and quizzes
  - **Flashcard Sets**: Quizlet-style stacked card view with 3D flip animations
  - **Keyboard Shortcuts**: Space/Enter to flip, Arrow keys to navigate, S to mark learned
  - **Test Mode**: Multiple choice quizzes generated from your flashcards
  - **Progress Tracking**: Track learned vs unlearned cards
  - **Import/Export**: Share flashcard sets and quizzes as JSON files
- **Settings**: Customize appearance, notifications, and manage data

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix primitives)
- **Icons**: Lucide React
- **Validation**: Zod
- **Storage**: Local-first (localStorage)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/study-hub.git
cd study-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Data

1. Login with any email and password
2. Go to Settings → Data Management
3. Click "Load Demo" to populate sample data

## Project Structure

```text
study-hub/
├── app/                    # Next.js App Router pages
│   ├── api/study/         # AI generation endpoints
│   ├── login/             # Login page
│   └── app/               # Protected routes
│       ├── dashboard/     # Dashboard page
│       ├── notes/         # Notes management
│       ├── calendar/      # Calendar view
│       ├── tasks/         # Task management
│       ├── study/         # Flashcards & quizzes
│       │   ├── flashcards/[id]/  # Flashcard set detail
│       │   └── quizzes/[id]/     # Quiz detail
│       └── settings/      # User settings
├── src/
│   ├── domain/            # Types and constants
│   ├── data/              # Data layer
│   │   ├── storage/       # localStorage abstraction
│   │   ├── repositories/  # Repository interfaces
│   │   └── local/         # localStorage implementations
│   ├── services/          # Business logic / use-cases
│   ├── features/          # Feature modules (auth, etc.)
│   ├── components/        # Shared UI components
│   │   ├── ui/           # shadcn/ui primitives
│   │   └── layout/       # Layout components
│   └── lib/              # Utilities and helpers
└── public/               # Static assets
```

## Architecture

The app follows a layered architecture that separates concerns:

```text
UI Components → Hooks → Services → Repositories → Storage
```

- **UI Components**: Never access localStorage directly
- **Hooks**: Provide data and actions to components
- **Services**: Contain business logic and use-cases
- **Repositories**: Define data access contracts
- **Storage**: Handle localStorage read/write operations

This design allows easy replacement of the storage layer with a database/API implementation without changing UI code.

## Data Storage

All data is stored locally in the browser's localStorage under the `student_helper.*` namespace:

- `student_helper.version` - Storage version for migrations
- `student_helper.session` - User session
- `student_helper.settings` - User preferences
- `student_helper.semesters` - Semester data
- `student_helper.subjects` - Subject data
- `student_helper.notes` - Notes
- `student_helper.tasks` - Tasks
- `student_helper.events` - Calendar events
- `student_helper.flashcard_sets` - Flashcard sets
- `student_helper.flashcards` - Individual flashcards
- `student_helper.quizzes` - Quizzes

## Replacing Local Storage with Database/API

To switch from localStorage to a database or API:

1. Create new repository implementations in `src/data/api/` or `src/data/db/`
2. Implement the same interfaces defined in `src/data/repositories/`
3. Update the imports in services to use the new implementations

Example:

```typescript
// src/data/api/notes.repository.ts
import type { Repository } from "@/data/repositories";
import type { Note } from "@/domain/types";

export const apiNoteRepository: Repository<Note> = {
  async list() {
    const response = await fetch("/api/notes");
    return response.json();
  },
  // ... other methods
};
```

## Export/Import Data

- **Export**: Settings → Export - Downloads a JSON backup
- **Import**: Settings → Import - Restores from a JSON backup
- **Reset**: Settings → Reset - Clears all data

## Study Module

### Flashcard Sets

Create flashcard sets manually or import from JSON. Each set contains:

- Title and description
- Associated subject
- Multiple flashcards with question/answer pairs

### Study Mode (Quizlet-style)

- **Stacked Cards**: Visual stack effect showing cards behind
- **3D Flip Animation**: Click or press Space/Enter to flip cards
- **Navigation**: Arrow keys or buttons to move between cards
- **Filters**: View all, unlearned, or learned cards only
- **Shuffle**: Randomize card order
- **Mark Learned**: Press S or click button to track progress

### Test Mode

- Multiple choice questions generated from flashcard answers
- Requires at least 4 cards
- Shows score and review after completion
- Retry option to practice again

### Keyboard Shortcuts (Study Mode)

| Key           | Action           |
| ------------- | ---------------- |
| Space / Enter | Flip card        |
| ←             | Previous card    |
| →             | Next card        |
| S             | Toggle learned   |
| Esc           | Close study mode |

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## License

MIT
