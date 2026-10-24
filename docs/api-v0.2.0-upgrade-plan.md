# Frontend Upgrade Plan for TaskWarrior API v0.2.0

**Current frontend:** `0.3.0`, task creation, editing, and lifecycle actions
**Backend target:** TaskWarrior API `v0.2.0`
**Proposed frontend target:** `0.3.0`

## Goal

Extend TaskWarrior Web from a read-only task viewer into a client for the API
v0.2.0 task creation, modification, and lifecycle endpoints. Keep Taskwarrior
as the source of truth; the browser should refresh task data after a successful
mutation rather than treating a `204 No Content` response as a task object.

The existing box/list views, parent-child display, task details panel, and
Taskwarrior UTC timestamp parsing remain supported.

## API contract to follow

| Operation | Request | Successful response |
|---|---|---|
| Create | `POST /tasks` with description and optional project, priority, due, and tags | `204 No Content` |
| Modify | `PATCH /tasks/:uuid` with one or more supported fields and/or `addTags` / `removeTags` | `204 No Content` |
| Complete | `POST /tasks/:uuid/complete` | `204 No Content` |
| Soft-delete | `DELETE /tasks/:uuid` | `204 No Content` |
| Start | `POST /tasks/:uuid/start` | `204 No Content` |
| Stop | `POST /tasks/:uuid/stop` | `204 No Content` |

The configured Axios base URL already includes `/v1`; task functions should use
relative `/tasks` paths. UUIDs must be URL-encoded. A valid UUID not found by a
mutation returns `404` with `code: "TASK_NOT_FOUND"`. Invalid inputs return
`400` (`INVALID_UUID` or `INVALID_INPUT`). Taskwarrior failures use the API's
mapped `502`, `503`, and `504` responses. Do not expose or expect adapter
diagnostic details in browser responses.

Create and mutation responses contain no task representation. After success,
refresh the list; reopen or refresh task details when necessary. The API does
not return the created task's UUID, so the client must not infer it from CLI
output or assume the newly created task can be selected immediately.

## Phased implementation and commit plan

Each phase should be implemented and validated in a focused commit. Update this
plan and the README as scope changes. Do not add authentication in the client:
the API has no authentication or authorization, so deployment/network controls
must protect mutation access.

### 1. Mutation API client and error handling

- Add typed functions in `src/lib/tasks.ts` (or a closely related task API
  module) for create, modify, complete, soft-delete, start, and stop.
- Model API payloads and supported fields explicitly; avoid arbitrary
  Taskwarrior filter/command input.
- Handle `204` as success with no response body.
- Convert known API errors into actionable, stable user messages while keeping
  unknown errors visible as failures.
- Add unit tests for URL construction, payloads, `204` handling, and error
  responses.

### 2. Task creation

- Add an accessible create-task form reachable from the task list.
- Support required description and optional project, priority, due date, and
  tags.
- Validate client-side for fast feedback, but treat backend validation as
  authoritative.
- Show submitting/success/error states and refresh tasks after success.
- Cover valid submission, invalid fields, request failure, and refresh behavior.

### 3. Task editing

- Add an edit action to the task detail panel.
- Edit description, project, priority, due date, and individual tag changes
  using the API's `addTags` and `removeTags` payload shape.
- Require at least one change, prevent contradictory add/remove tag selections,
  and preserve omitted fields.
- Refresh task data after success; retain the form and show the API error on
  failure.

### 4. Lifecycle actions

- Add complete, start, stop, and soft-delete actions to task details.
- Confirm destructive soft-delete and make clear that it marks a task deleted
  rather than purging it.
- Reflect Taskwarrior semantics: starting/stopping work changes the start time;
  completing changes status; deleting is recoverable Taskwarrior soft-delete.
- Refresh after successful actions and handle stale/missing tasks (`404`).

### 5. UX, accessibility, and release readiness

- Standardize pending, success, and failure feedback for all mutations.
- Prevent duplicate submissions while a request is in progress.
- Preserve keyboard access, focus behavior, and clear labels for forms and
  actions.
- Verify both box and list layouts, responsive widths, task detail dates, and
  empty/loading/error states with mutation flows.
- Update screenshots and documentation to describe read/write behavior and the
  unauthenticated API boundary.
- Run lint, production build, unit tests, and an integration pass against API
  `v0.2.0` with isolated Taskwarrior data.
- Bump the frontend to `0.3.0`, commit, tag, and publish a stable release only
  after the full flow is verified.

## Acceptance checklist

- [ ] All six API mutations use the published `v0.2.0` routes and exact payloads.
- [ ] A `204` response is handled without trying to parse JSON.
- [ ] Successful mutations refresh the authoritative API-backed task state.
- [ ] Invalid input and `TASK_NOT_FOUND` are presented without losing user
  context.
- [ ] Soft-delete is explicitly identified as non-purging.
- [ ] No API adapter diagnostics are expected or displayed.
- [ ] Existing read-only views and Taskwarrior timestamp formatting continue
  working.
- [ ] Automated checks pass and end-to-end verification uses non-production
  Taskwarrior data.

## Security note

Task mutation endpoints are unauthenticated. CORS is not authentication or
access control. Do not expose the API to untrusted clients; apply appropriate
network or deployment-level protection before enabling the mutation UI in a
reachable deployment.

## Implementation status

The client now includes all six mutation routes, create and edit forms,
lifecycle actions, stable mutation error messages, and API refreshes after
successful mutations. Unit tests and live integration verification remain
pending: this client has no test runner configured, and integration verification
requires an API v0.2.0 instance with isolated Taskwarrior data. Do not commit,
tag, or publish the release until that verification is complete.
