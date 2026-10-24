# TaskWarrior Web v0.3.1

This release upgrades the web client from a read-only task viewer to a client
for the TaskWarrior API v0.2.0 task mutation routes.

## Task CRUD

- **Create:** Add a task from the task list with a required description and
  optional project, priority, due date, and comma-separated tags.
- **Read:** Continue viewing the API-backed task list and task details in box
  or list layout, including parent and child tasks and localized Taskwarrior
  timestamps.
- **Update:** Edit a task's description, project, priority, due date, and tags.
  Tag changes are sent as `addTags` and `removeTags`, and unchanged fields are
  omitted from the request.
- **Delete:** Soft-delete a task from its details panel. The confirmation and
  result message explain that Taskwarrior marks the task deleted and it can be
  recovered; the task is not purged.

## Lifecycle actions

Task details provide **Start**, **Stop**, and **Complete** actions. Start and
stop update Taskwarrior's work-start state, while completing changes the task's
status. Each successful mutation refreshes task data from the API; `204 No
Content` responses are not treated as task objects, and the client does not
guess a newly created task's UUID.

The client URL-encodes task UUIDs and presents actionable messages for invalid
input, missing tasks, API availability problems, and Taskwarrior operation
failures. It does not display adapter diagnostics.

## Security and verification

The API mutation routes do not provide authentication or authorization. Protect
the API with deployment or network controls before exposing it to untrusted
clients; CORS does not provide access control.

ESLint, TypeScript, and a production build using Next.js's webpack builder
passed during implementation. Unit tests and live API integration verification
were not run; the client has no configured unit-test runner, and integration
verification requires an API v0.2.0 instance with isolated Taskwarrior data.
