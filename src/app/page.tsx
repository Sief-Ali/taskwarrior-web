"use client";

import { TaskList } from "@/components/tasks/TaskList";
import { TaskToolbar } from "@/components/tasks/TaskToolbar";
import { useTasks } from "@/hooks/useTasks";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { TaskForm } from "@/components/tasks/TaskForm";

type Theme = "light" | "dark";

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("taskwarrior-theme-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("taskwarrior-theme-change", onChange);
  };
}

function getThemeSnapshot(): Theme {
  return window.localStorage.getItem("taskwarrior-theme") === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

export default function Home() {
  const { tasks, loading, error, refresh } = useTasks();
  const [view, setView] = useState<"boxes" | "list">("boxes");
  const [creating, setCreating] = useState(false);
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  const pendingCount = tasks.filter((task) => task.status === "pending").length;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    window.localStorage.setItem("taskwarrior-theme", nextTheme);
    window.dispatchEvent(new Event("taskwarrior-theme-change"));
  }

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
        <div className="header-controls">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            aria-pressed={theme === "dark"}
          >
            {theme === "light" ? "◐ Dark theme" : "☀ Light theme"}
          </button>
          <div className="api-status">
            <span className={`api-status-dot ${error ? "offline" : ""}`} />
            {error ? "API offline" : loading ? "Syncing tasks" : "API connected"}
          </div>
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
