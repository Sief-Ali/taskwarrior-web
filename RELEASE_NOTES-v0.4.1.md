# TaskWarrior Web v0.4.1

This patch release fixes Next.js module resolution when running the client from the parent pnpm workspace.

## Fixes

- Set Turbopack's root to the parent workspace when the client is inside the monorepo. This lets Turbopack resolve dependencies linked from the workspace-level `node_modules`, including `next/package.json`.
- Keep the client directory as the Turbopack root when the client is used as a standalone repository.
- Retain the v0.4.0 dark theme, gray accent, official Taskwarrior SVG branding, and task CRUD and lifecycle actions.
