# TaskWarrior Web v0.4.2

This release makes the dark appearance optional and keeps the light theme as the default.

## Theme options

- Added a visible theme control in the top bar to switch between light and dark themes.
- Saved the selected theme in browser storage so the choice is restored on later visits.
- Applied the Taskwarrior gray accent and accessible status colors across both themes.
- Kept the header control compact on narrow screens.

## Also included

- Turbopack uses the parent pnpm workspace as its root when the client is inside the monorepo, so it can resolve workspace-linked Next.js dependencies. Standalone client checkouts continue to use their own directory as the root.
- The official Taskwarrior SVG mark, task CRUD, and lifecycle actions remain available.
