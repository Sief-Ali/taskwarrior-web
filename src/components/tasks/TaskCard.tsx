import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import type { Task } from "@/lib/tasks";
import { parseTaskwarriorTimestamp } from "@/lib/taskwarriorTime";
import { TaskwarriorTime } from "@/components/tasks/TaskwarriorTime";

interface TaskCardProps {
  task: Task;
  view: "boxes" | "list";
  depth: number;
  onSelect: (uuid: string) => void;
  children?: ReactNode;
}

export function TaskCard({ task, view, depth, onSelect, children }: TaskCardProps) {
  const status = task.status.toLowerCase();
  const statusClass = status.replace(/[^a-z0-9]+/g, "-");
  const dueDate = task.due ? parseTaskwarriorTimestamp(task.due) : null;

  return (
    <div className={`task-branch ${view === "list" ? "list-branch" : ""}`}>
      <article
        className={`task-card ${view === "list" ? "task-row" : ""} ${depth > 0 ? "is-child" : ""}`}
        style={view === "list" ? { "--depth": depth } as CSSProperties : undefined}
        role="button"
        tabIndex={0}
        aria-label={`View details for task ${task.id}: ${task.description}`}
        onClick={() => onSelect(task.uuid)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(task.uuid);
          }
        }}
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
            {dueDate && task.due && (
              <span className="task-due">
                <TaskwarriorTime value={task.due} prefix="DUE" />
              </span>
            )}
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
