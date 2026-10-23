"use client";

import { useEffect } from "react";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import type { Task } from "@/lib/tasks";

interface TaskDetailsProps {
  uuid: string;
  onClose: () => void;
}

function displayValue(value: unknown): string {
  if (typeof value === "string") return value || "—";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(displayValue).join(", ") || "—";
  }
  if (value !== null && typeof value === "object") {
    return JSON.stringify(value);
  }
  return "—";
}

function fieldLabel(field: string): string {
  return field.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function TaskFacts({ task }: { task: Task }) {
  const details = Object.entries(task.details).sort(([first], [second]) =>
    first.localeCompare(second),
  );

  return (
    <dl className="detail-facts">
      <div className="detail-fact">
        <dt>ID</dt>
        <dd>{task.id}</dd>
      </div>
      {details.map(([field, value]) => (
        <div className="detail-fact" key={field}>
          <dt>{fieldLabel(field)}</dt>
          <dd>{displayValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TaskDetails({ uuid, onClose }: TaskDetailsProps) {
  const { task, loading, error } = useTaskDetails(uuid);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="detail-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <header className="detail-header">
          <div>
            <p className="workspace-kicker">TASK DETAILS</p>
            <h2 id="detail-title">{task?.description ?? "Task"}</h2>
          </div>
          <button
            type="button"
            className="detail-close"
            onClick={onClose}
            aria-label="Close task details"
            autoFocus
          >
            ×
          </button>
        </header>

        {loading && <p className="detail-message">Loading task details…</p>}
        {error && <p className="detail-message detail-error" role="alert">{error}</p>}
        {task && (
          <>
            <div className="detail-identity">
              <span className={`task-status status-${task.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                <span className="task-status-dot" />
                {task.status}
              </span>
              <code>{task.uuid}</code>
            </div>
            <TaskFacts task={task} />
          </>
        )}
      </section>
    </div>
  );
}
