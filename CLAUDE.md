# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive, real-time organizational chart builder with hierarchical task management. This is a full-stack demo showcasing recursive tree rendering, optimistic UI updates with rollback, and direct Supabase integration.

**Key Features:**
- Recursive tree rendering of categories and tasks
- Optimistic updates with automatic rollback on errors
- Dynamic urgency/importance visualization using GSAP animations
- Recurring task support with flexible scheduling
- Time availability reporting
- Mobile-responsive design

## Tech Stack

- **Frontend:** React 19, React Router v7, TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** TanStack React Query (v5) for server state
- **Database:** Supabase (PostgreSQL)
- **Animations:** GSAP with MotionPathPlugin
- **Build Tool:** Vite
- **Mode:** SPA (SSR disabled in react-router.config.ts)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Run TypeScript type checking
npm run typecheck

# Generate React Router types
npm run typegen

# Pre-deployment check (typecheck + lint + build)
npm run deploy:check
```

## Deployment

Before deploying to Vercel, always run:
```bash
npm run deploy:check
```

This ensures TypeScript, ESLint, and build all pass without errors. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete deployment guide and checklist.

## Architecture & Data Flow

### Database Schema

The app uses a single Supabase table `org_nodes` with the following key columns:
- `id`: Primary key
- `name`: Node display name
- `type`: "top_category" | "category" | "task"
- `root_category`: Tab name (Household, Finances, Cleo, Job, Social, Personal, Orphans)
- `parent_id`: References parent node for hierarchical structure
- `details`: Optional description
- `importance`: 1-10 scale (tasks only)
- `deadline`, `completion_time`, `unique_days_required`: For urgency calculation
- `is_completed`, `completed_at`, `completion_comment`: Completion tracking
- `recurrence_type`, `recurrence_interval`, `recurrence_day_of_week`, `recurrence_day_of_month`, `recurrence_end_date`: Recurring task configuration
- `is_recurring_template`, `recurring_template_id`: Links recurring instances

### Tree Building Process

1. **Fetch:** `fetchOrgTree(tabName)` queries Supabase for all nodes in a category (app/lib/fetchOrgTree.ts:6)
2. **Filter:** Completed tasks are excluded via `.not("is_completed", "is", true)` (app/lib/fetchOrgTree.ts:11)
3. **Build:** `buildOrgTree()` transforms flat rows into nested tree structure using parent_id relationships (app/lib/buildOrgTree.ts:4)
4. **Cache:** React Query caches trees by `["orgTree", tabName]` key

### Optimistic Updates

All mutations (add/edit/delete nodes) follow this pattern:

1. **onMutate:** Cancel in-flight queries, snapshot previous state, inject temporary optimistic node into cache
2. **onSuccess:** Replace optimistic data with server response
3. **onError:** Rollback to snapshot
4. **onSettled:** Invalidate queries to refetch server state

See `useAddOrgNode` (app/hooks/useAddOrgNode.tsx) as the reference implementation.

### Urgency & Importance Systems

**Urgency (calculated, not stored):**
- Computed from `deadline`, `completion_time`, `unique_days_required`
- Formula in `calculateUrgencyLevel()` (app/lib/urgencyUtils.ts:7)
- Returns 1-10 scale, displayed as animated orbital balls
- Categories inherit max urgency from descendant tasks

**Importance (user-defined):**
- Stored as 1-10 value on tasks
- Displayed as colored borders (cyan → purple gradient)
- Categories inherit max importance from descendant tasks

**Visualization:**
- Urgency balls orbit nodes using GSAP MotionPathPlugin along rounded rectangle SVG paths
- Speed and size increase with urgency level
- See `useOrgChartAnimations.tsx` (app/hooks/useOrgChartAnimations.tsx) for GSAP setup

### Recurring Tasks

Recurring tasks use a template-instance pattern:

1. Template task has `is_recurring_template: true` and recurrence config
2. On completion, `createRecurringInstance()` (app/lib/createRecurringInstance.ts) calculates next deadline via `calculateNextDeadline()` (app/lib/recurrenceUtils.ts:15)
3. New instance is created with `recurring_template_id` linking back to template
4. Instances do NOT inherit recurrence config (prevents infinite chains)
5. Supports: minutely, daily, weekly, monthly, yearly intervals

## File Organization

```
app/
├── components/          # React components
│   ├── tasks/          # Task-specific UI (modals, forms, tables)
│   └── ui/             # Reusable UI primitives
├── hooks/              # Custom React hooks (mutations, queries)
├── lib/                # Business logic & utilities
│   ├── consts/         # Constants (TABS)
│   ├── data/           # Supabase client
│   └── tasks/          # Task-specific data fetching
├── routes/             # React Router v7 file-based routes
├── styles/             # Global CSS
└── types/              # TypeScript type definitions
```

## Key Patterns & Conventions

### Type Safety

- **OrgNodeRow:** Raw Supabase response type (app/types/orgChart.ts:40)
- **OrgNode:** Frontend tree node with `children?: OrgNode[]` (app/types/orgChart.ts:10)
- **Task:** Specialized type for task nodes (app/types/orgChart.ts:83)

### React Query Keys

- `["orgTree", tabName]` - Hierarchical tree for a category
- `["urgentTaskCount"]` - Counts of critical/urgent tasks
- `["allTasks"]` - Flat list of all tasks
- `["categories"]` - All category nodes

### Tab Names

Defined in `TABS` constant (app/lib/consts/TABS.ts:1). Valid tabs: Household, Finances, Cleo, Job, Social, Personal, Orphans.

### Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `DATABASE_URL` (for direct Postgres access if needed)

## Common Tasks

### Adding a New Field to Nodes

1. Update `OrgNode` and `OrgNodeRow` types in app/types/orgChart.ts
2. Add field to `buildOrgTree()` mapping (app/lib/buildOrgTree.ts:24)
3. Update optimistic node creation in relevant hooks (e.g., app/hooks/useAddOrgNode.tsx:42)
4. Add field to mutation functions (e.g., `addOrgNode` in app/lib/addOrgNode.ts)

### Creating a New Mutation Hook

1. Follow the pattern in `useAddOrgNode` (app/hooks/useAddOrgNode.tsx)
2. Implement onMutate with snapshot and optimistic update
3. Use recursive helper functions to navigate tree structure
4. Always invalidate affected query keys in onSettled
5. Include error rollback in onError

### Working with GSAP Animations

- GSAP and MotionPathPlugin are registered globally in app/root.tsx:4
- Animation setup happens in `useOrgChartAnimations` hook
- Urgency ball paths are SVG paths generated by `createUrgencyOrbitalPath()` (app/lib/urgencyUtils.ts:204)
- Use `gsap.to()` with MotionPath plugin for orbital motion

## Mobile vs Desktop

- Responsive breakpoint managed by `useIsMobile()` hook (app/hooks/useIsMobile.tsx)
- Mobile: Hamburger menu, modal-based time reports, simplified navigation
- Desktop: Sidebar navigation, inline time report (commented out in current version)
- Navigation components: `MobileNav` and `DesktopNav`

## Important Notes

- **No SSR:** Project runs in SPA mode (ssr: false in react-router.config.ts:5)
- **Direct Supabase:** No backend API layer, frontend talks directly to Supabase
- **Filtering:** Completed tasks are filtered at query time, not in React
- **Tree Mutations:** Always work with immutable updates to preserve React Query cache integrity
- **Recurrence:** Instance tasks do NOT copy recurrence config from templates (prevents infinite loops)
