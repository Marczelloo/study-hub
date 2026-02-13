# AGENTS.md - Coding Agent Guidelines

Guidelines for AI coding agents working in this repository.

## Build / Dev / Lint Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run dev:webpack  # Start dev server with webpack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

No test framework is currently configured. If tests are added, prefer Vitest.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix primitives)
- **Icons**: lucide-react
- **Validation**: zod
- **State**: React Context + hooks, localStorage for persistence

## Architecture Overview

### Data Flow (CRITICAL)

UI components must NEVER access localStorage directly. Follow this flow:

```
page / feature component -> hook -> service -> repository -> storage
```

### Folder Structure

```
src/
  domain/        # Types, constants, interfaces
  data/
    storage/     # localStorage wrapper (single entry point)
    repositories/ # Repository interfaces
    local/       # LocalStorage repository implementations
  services/      # Business logic / use-cases
  features/      # Feature-specific UI + hooks (e.g., auth/)
  components/
    ui/          # shadcn/ui primitives
    layout/      # Shared layout components
    editor/      # Rich text editor components
  lib/           # Utilities (dates, ids, utils, demo-seed)
app/             # Next.js App Router pages and API routes
```

## Code Style Guidelines

### Imports

```typescript
// 1. React/Next imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. External libraries
import { SomeLibrary } from "external-lib";

// 3. Internal imports using @ alias
import { Button, Card } from "@/components/ui";
import { taskService } from "@/services";
import type { Task, Note } from "@/domain/types";

// 4. Relative imports (only within same feature)
import { useAuth } from "./use-auth";
```

- Use `import type` for type-only imports
- Use `@/` path alias for cross-module imports
- Barrel exports via `index.ts` files

### TypeScript

- Strict mode enabled - no implicit any
- Explicit return types for exported functions preferred
- Use `interface` for object types, `type` for unions/intersections
- Prefer `const` assertions for readonly arrays and objects

```typescript
// Good
export interface Task extends BaseEntity {
  title: string;
  priority: "low" | "med" | "high";
}

export const PRIORITY_LABELS = {
  low: "low",
  med: "medium",
  high: "high",
} as const;
```

### Naming Conventions

- **Components**: PascalCase (`TaskList.tsx`, `use-auth.ts`)
- **Functions**: camelCase (`generateId`, `formatDate`)
- **Constants**: SCREAMING_SNAKE_CASE for global, camelCase for local
- **Files**: kebab-case for utilities, PascalCase for components
- **Repository instances**: prefixed with `local` (`localTaskRepository`)
- **Service instances**: suffixed with `Service` (`taskService`)

### Components

- Add `"use client"` directive at top of client components
- Use `React.forwardRef` for UI primitives
- Prefer small, single-responsibility components
- Use shadcn/ui components consistently (Button, Card, Dialog, Sheet, etc.)
- Use `cn()` utility for conditional class merging

```typescript
"use client";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  title: string;
}

export function MyComponent({ className, title }: Props) {
  return <div className={cn("base-classes", className)}>{title}</div>;
}
```

### Error Handling

- Never crash on missing localStorage data - return defaults
- Use try/catch in storage operations
- Show user feedback via sonner toasts for errors
- Log errors with descriptive prefixes: `console.error("[ServiceName]", error)`

```typescript
// Storage pattern - always handle errors
get<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}
```

### Formatting

- No inline comments unless absolutely necessary
- Use self-documenting code and descriptive names
- Prefer early returns over nested conditionals
- Use optional chaining: `item?.property`

## Key Patterns

### Repository Pattern

All repositories implement CRUD: `list()`, `getById(id)`, `create(payload)`, `update(id, patch)`, `remove(id)`

```typescript
export const localNoteRepository = createLocalRepository<Note>(STORAGE_KEYS.NOTES);
```

### Service Layer

Services encapsulate business logic and may combine multiple repositories:

```typescript
export const noteService = {
  list(): Note[] { return localNoteRepository.list(); },
  listBySubject(subjectId: string): Note[] {
    return this.list().filter(note => note.subjectId === subjectId);
  },
};
```

### React Context + Hooks

Use Context for global state (auth, theme). Provide hooks for access:

```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

### Storage Keys

Namespaced with `student_helper.` prefix. Defined in `src/domain/constants.ts`.

## Important Constraints

- No T3 stack, tRPC, Prisma, or Redux
- No backend APIs unless explicitly requested
- AI calls must be server-side (`/app/api/*`)
- API keys must never be exposed to client
- All entities require: `id`, `createdAt`, `updatedAt`

## Reference

Full architecture details available in `.github/copilot-instructions.md`.
