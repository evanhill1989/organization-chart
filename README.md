# 🏗️ Org Chart Builder

An **interactive, real-time organizational chart builder** built as a full-stack demo project.

✨ Highlights:

- Recursive **tree rendering** of categories & tasks
- **Optimistic UI** with rollback for a snappy user experience
- **Direct Supabase integration** (no custom backend required)
- **Modern frontend stack** (React 19, Vite, TypeScript, Tailwind, shadcn/ui, React Query)

---

## 🎯 Why I Built This

I wanted to explore:

- How to model **hierarchical data** (trees) in a relational DB
- How to implement **optimistic updates** without race conditions
- How to leverage **React Query** for cache management
- How to combine **Supabase + Vite** into a purely client-side stack
- How to make the UI **clean, responsive, and intuitive**

The result is a production-style app that demonstrates skills in **frontend engineering, data modeling, and modern React tooling**.

---

## 🚀 Features

- **Tabbed categories** (Household, Finances, Job, etc.)
- **Nested tree UI** with expand/collapse
- **Instant optimistic node creation** (rollback on error)
- **Task detail modals**
- **Type-safe data models** shared between DB and frontend
- **Persistent Supabase backend**

---

## 🖼️ Demo

![Demo Screenshot](docs/screenshot.png)  
_(example screenshot — insert your own here)_

---

## 🛠️ Tech Stack

- **React 19** + **Vite** for modern fast dev experience
- **TypeScript** for type-safe data flow
- **Tailwind CSS** + **shadcn/ui** for styling and UI components
- **TanStack React Query** for fetching, caching, and optimistic updates
- **Supabase (Postgres + Auth)** as the backend
- No Node server, no ORMs — direct DB client calls for simplicity

---

## 🧩 Key Engineering Challenges Solved

### 1. Recursive Rendering

The org chart is rendered recursively — every node can have children, and the component calls itself to display nested levels. This keeps the code **scalable** and **declarative**.

### 2. Optimistic Updates

When a user adds a new node:

- `onMutate` injects a **temporary node** into the cached tree
- If the DB call succeeds, the temp node is replaced with the real one
- If it fails, the cache is **rolled back** to the last known good state

This provides **instant feedback** while maintaining data integrity.

### 3. Tree Building from Flat Data

Supabase returns a flat list of rows. I wrote a `buildOrgTree` function that transforms rows into a recursive data structure — the same shape that React renders. An `optimisticBuildTree` mirrors that logic for pending nodes.

---

## 📂 Project Structure

src/
components/ # UI components (OrgChartTab, AddNodeForm, etc.)
hooks/ # Custom React hooks (useAddOrgNode)
lib/ # Supabase + tree-building utilities
types/ # Shared TypeScript types (OrgNode, OrgNodeRow)

---

## 📌 Future Improvements

- [ ] Drag-and-drop reordering
- [ ] Node editing & deletion
- [ ] Supabase realtime channels for multi-user collaboration
- [ ] Deploy live demo (Vercel/Netlify)

---

## 🧑‍💻 About This Project

This project is part of my developer portfolio. It showcases:

- **Frontend engineering depth** (recursive rendering, state management, optimistic UI)
- **Modern stack adoption** (React 19, Supabase, React Query, Tailwind, shadcn/ui)
- **Practical architecture** (direct client → DB integration, type safety, modular hooks)

---

## 📜 License

MIT © 2025 Evan Hill
