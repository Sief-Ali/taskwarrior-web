"use client";

import { TaskList } from "@/components/tasks/TaskList";
import { TaskToolbar } from "@/components/tasks/TaskToolbar";
import { useTasks } from "@/hooks/useTasks";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function Home() {
  const { tasks, loading, error, refresh } = useTasks();
  const [view, setView] = useState<"boxes" | "list">("boxes");
  const [creating, setCreating] = useState(false);
  const pendingCount = tasks.filter((task) => task.status === "pending").length;

  return (
    <main className="app-shell">
      <header className="app-topbar">
        <Link className="app-brand" href="/" aria-label="TaskWarrior home">
          <Image
            className="app-logo"
            src="https://taskwarrior.org/images/tw.svg"
            alt=""
            aria-hidden="true"
            width={34}
            height={34}
            unoptimized
          />
          <span>taskwarrior</span>
        </Link>
        <div className="api-status">
          <span className={`api-status-dot ${error ? "offline" : ""}`} />
          {error ? "API offline" : loading ? "Syncing tasks" : "API connected"}
        </div>
      </header>

      <div className="workspace">
        <section className="workspace-heading">
          <div>
            <p className="workspace-kicker">TASK MANAGER</p>
            <h1>Tasks <span className="heading-count">{tasks.length}</span></h1>
          </div>
          <div className="task-totals" aria-label="Task summary">
            <div><strong>{tasks.length}</strong><span>ALL TASKS</span></div>
            <div><strong>{pendingCount}</strong><span>PENDING</span></div>
          </div>
        </section>

        <TaskToolbar
          view={view}
          onViewChange={setView}
          onRefresh={refresh}
          loading={loading}
          onCreate={() => setCreating(true)}
        />

        <TaskList
          tasks={tasks}
          view={view}
          loading={loading}
          error={error}
          onRetry={refresh}
          onMutated={refresh}
        />
      </div>
      {creating && <TaskForm onClose={() => setCreating(false)} onCreated={refresh} />}
    </main>
  );
}
