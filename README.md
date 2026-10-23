# TaskWarrior Web

A single-page web interface for viewing Taskwarrior tasks from the [TaskWarrior API](../server/README.md). Built with Next.js, React, TypeScript, and Axios.

![TaskWarrior Web home page](./assets/home.png)

> **Status:** Early development  
> **Current scope:** Read-only task access

## Features

- Fetch and display tasks from the TaskWarrior API.
- Switch between box and list layouts.
- Display subtasks beneath their parent when the API includes a `parent` or `parent_uuid` field.
- Show task status, project, and urgency when available.
- Refresh tasks and view loading, empty, and error states.
- Responsive layout with bold JetBrains Mono typography and readable system-font fallbacks.

The web client is read-only. It does not create, edit, or delete tasks.

## Requirements

- Node.js compatible with the project's dependencies.
- pnpm `12.14.0`.
- The TaskWarrior API running and accessible from the browser.

## Installation

From the repository root, install the workspace dependencies:

```bash
pnpm install
```

Or, if dependencies have already been installed at the repository root, run the client commands below.

## Configuration

The client defaults to `http://localhost:5000/v1` as its API base URL. To use another API URL, set `NEXT_PUBLIC_TASKWARRIOR_API_URL` in `client/.env.local`:

```dotenv
NEXT_PUBLIC_TASKWARRIOR_API_URL=http://localhost:5000/v1
```

The value is the API base URL; the client appends `/tasks` when requesting the task list. Restart the Next.js server after changing this setting.

The API must allow requests from the web client's origin. The backend allows `http://localhost:3000` and `http://127.0.0.1:3000` by default.

## Running the Web App

From the repository root:

```bash
pnpm --filter client dev
```

Or from the client directory:

```bash
cd client
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser. Start the backend as well so the page can load tasks.

To start both applications together from the repository root, use:

```bash
pnpm dev
```

## API

The web app uses the read-only `GET /tasks` endpoint and expects a JSON array. A task must include an `id`, `uuid`, `description`, and `status`. It can also include fields such as `project`, `urgency`, `modified`, and `parent` or `parent_uuid`.

For the complete API setup, configuration, and endpoint documentation, see the [TaskWarrior API README](https://github.com/Sief-Ali/taskwarrior-api). The interactive API reference is available at `http://localhost:5000/v1/api-docs/` when using the backend's `/v1` prefix.

## Project Structure

```text
src/
├── app/                 # Next.js page, layout, and global styles
├── components/tasks/    # Task list, task cards, and view toolbar
├── hooks/               # React hooks for task data
└── lib/                 # Axios client and task API functions
```

## Scripts

Run these from `client/`, or prefix them with `pnpm --filter client` from the repository root.

| Command | Description |
|---|---|
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
