import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import type { Task } from "@/lib/tasks";

interface TaskCardProps {
  task: Task;
  view: "boxes" | "list";
  depth: number;
  children?: ReactNode;
}

export function TaskCard({ task, view, depth, children }: TaskCardProps) {
  const status = task.status.toLowerCase();
  const statusClass = status.replace(/[^a-z0-9]+/g, "-");

  return (
    <div className={`task-branch ${view === "list" ? "list-branch" : ""}`}>
      <article
        className={`task-card ${view === "list" ? "task-row" : ""} ${depth > 0 ? "is-child" : ""}`}
        style={view === "list" ? { "--depth": depth } as CSSProperties : undefined}
      >
        <div className="task-card-top">
          <span className={`task-status status-${statusClass}`}>
            <span className="task-status-dot" />
            {task.status}
          </span>
          <span className="task-number">#{task.id}</span>
        </div>
        <h2>{task.description || "Untitled task"}</h2>
        <div className="task-card-bottom">
          <div className="task-metadata">
            {task.project && <span className="task-project">{task.project}</span>}
            {typeof task.urgency === "number" && (
              <span className="task-urgency">URGENCY {task.urgency.toFixed(1)}</span>
            )}
          </div>
        </div>
      </article>
      {children}
    </div>
  );
}
