# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup       # First-time setup: install deps, generate Prisma client, run migrations
npm run dev         # Start dev server (Next.js + Turbopack)
npm run build       # Production build
npm run lint        # ESLint
npm run test        # Run all Vitest tests
npm run test -- --reporter=verbose src/path/to/file.test.ts  # Run a single test file
npx prisma migrate dev --name <name>   # Create a new DB migration
npx prisma studio                      # Open Prisma DB GUI
```

Environment variable required: `ANTHROPIC_API_KEY` in `.env`. Without it, the app falls back to a `MockLanguageModel` that returns static example components.

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat interface; Claude generates/edits files in a virtual file system; those files are transpiled and rendered in a sandboxed iframe.

### Request Flow

1. User sends a chat message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. Server calls Claude via Vercel AI SDK `streamText` with two tools:
   - **`str_replace_editor`** (`src/lib/tools/str-replace.ts`): create/view/edit files
   - **`file_manager`** (`src/lib/tools/file-manager.ts`): rename/delete files
3. Tool calls stream back to the client and are executed against the **virtual file system**
4. File system changes trigger re-render of the **preview iframe**

### Virtual File System (`src/lib/file-system.ts`)

The `VirtualFileSystem` class is the core data structure — an in-memory tree with no disk I/O. It's serialized to JSON for persistence in Prisma's `data` column.

### State Management

Two React contexts wrap the app:
- **`ChatProvider`** (`src/lib/contexts/chat-context.tsx`): owns the Vercel AI SDK `useChat()` hook, conversation history, and wires tool execution to the file system
- **`FileSystemProvider`** (`src/lib/contexts/file-system-context.tsx`): owns the selected file, tree state, and auto-triggers preview refresh on changes

### Preview Rendering (`src/components/preview/PreviewFrame.tsx`)

The iframe sandbox works by:
1. Running JSX/TSX through **Babel standalone** (`src/lib/transform/jsx-transformer.ts`)
2. Generating an **import map** that maps npm package names to esm.sh CDN URLs
3. Injecting Tailwind CSS and the transpiled scripts into a sandboxed HTML document

### UI Layout (`src/app/main-content.tsx`)

`ResizablePanelGroup` splits the screen:
- **Left 35%**: Chat (`src/components/chat/`)
- **Right 65%**: Tabs — Preview iframe or Monaco code editor + file tree (`src/components/editor/`)

### Auth & Persistence

- JWT sessions in HTTP-only cookies, validated in `src/middleware.ts`
- Server actions in `src/actions/` handle auth and project CRUD via Prisma
- Anonymous work is tracked in localStorage (`src/lib/anon-work-tracker.ts`) and migrated on sign-in
- Database: SQLite at `prisma/dev.db` with two models: `User` and `Project`
- The database schema is defined in the @prisma/schema.prisma file. Reference it anytime you need to understand the structure of data stored in the database.

### Language Model Provider (`src/lib/provider.ts`)

Returns a Vercel AI SDK-compatible model. Defaults to **Claude Haiku 4.5** via the Anthropic SDK; falls back to `MockLanguageModel` if `ANTHROPIC_API_KEY` is absent.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

## Code Style

Use comments sparingly — only for genuinely complex logic.
