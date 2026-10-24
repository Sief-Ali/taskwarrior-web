# TaskWarrior Web v0.4.0

This release refreshes the client with a dark interface and official Taskwarrior branding while retaining the task management features introduced in v0.3.1.

## Style update

- Replaced the light canvas with layered charcoal surfaces, muted borders, and high contrast text for a consistent dark appearance across the task board, list view, details panel, and task forms.
- Shifted the interface accent to neutral gray tones inspired by the official Taskwarrior mark. Gray accents are used for primary actions, selection states, focus outlines, status indicators, and interactive highlights.
- Kept warning and error colors distinct so waiting tasks, due dates, API errors, and destructive actions remain easy to identify against the dark surfaces.
- Added the original Taskwarrior SVG mark (`https://taskwarrior.org/images/tw.svg`) to the application header and browser tab icon.

## Task management

- Retains task creation and editing, including descriptions, project, priority, due date, and tags.
- Retains task lifecycle actions: start, stop, complete, and soft delete.
- Keeps box and list layouts, task details, subtasks, loading and error states, and API refresh behavior.

## Compatibility

- Requires the TaskWarrior API v0.2.0 endpoints for task mutations.
- The client version is now `0.4.0`.
