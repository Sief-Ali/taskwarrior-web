"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import type { Task } from "@/lib/tasks";
import { parseTaskwarriorTimestamp } from "@/lib/taskwarriorTime";
import { TaskwarriorTime } from "@/components/tasks/TaskwarriorTime";
import { completeTask, deleteTask, startTask, stopTask, updateTask, type TaskPriority } from "@/lib/tasks";

interface TaskDetailsProps {
  uuid: string;
  onClose: () => void;
  onMutated: () => void;
}

const DATE_FIELDS = new Set([
  "due",
  "end",
  "entry",
  "modified",
  "scheduled",
  "start",
  "until",
  "wait",
]);

function displayValue(value: unknown, field?: string): ReactNode {
  if (typeof value === "string") {
    if (field && DATE_FIELDS.has(field)) {
      const date = parseTaskwarriorTimestamp(value);
      if (date) {
        return <TaskwarriorTime value={value} />;
      }
    }
    return value || "—";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => displayValue(item)).join(", ") || "—";
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
          <dd>{displayValue(value, field)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TaskDetails({ uuid, onClose, onMutated }: TaskDetailsProps) {
  const { task, loading, error, refresh } = useTaskDetails(uuid);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [editError, setEditError] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [due, setDue] = useState("");
  const [tags, setTags] = useState("");

  function beginEdit() {
    if (!task) return;
    setDescription(task.description);
    setProject(task.project ?? "");
    setPriority((typeof task.details.priority === "string" ? task.details.priority : "") as TaskPriority | "");
    const rawDue = task.due ?? "";
    setDue(/^\d{8}T/.test(rawDue) ? `${rawDue.slice(0, 4)}-${rawDue.slice(4, 6)}-${rawDue.slice(6, 8)}` : rawDue.slice(0, 10));
    setTags(Array.isArray(task.details.tags) ? task.details.tags.filter((tag): tag is string => typeof tag === "string").join(", ") : "");
    setEditError("");
    setEditing(true);
  }

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  async function runAction(action: () => Promise<void>, success: string) {
    setPending(true); setActionMessage("");
    try { await action(); setActionMessage(success); refresh(); onMutated(); }
    catch (failure) { setActionMessage(failure instanceof Error ? failure.message : "The task action failed."); }
    finally { setPending(false); }
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!task) return;
    const payload: Parameters<typeof updateTask>[1] = {};
    if (description.trim() !== task.description) payload.description = description.trim();
    if (project.trim() && project.trim() !== task.project) payload.project = project.trim();
    if (priority && priority !== task.details.priority) payload.priority = priority;
    if (due && due !== (task.due?.slice(0, 4) + "-" + task.due?.slice(4, 6) + "-" + task.due?.slice(6, 8))) payload.due = `${due.replaceAll("-", "")}T000000Z`;
    const existing = Array.isArray(task.details.tags) ? task.details.tags.filter((tag): tag is string => typeof tag === "string") : [];
    const desired = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    const addTags = desired.filter((tag) => !existing.includes(tag));
    const removeTags = existing.filter((tag) => !desired.includes(tag));
    if (addTags.length) payload.addTags = addTags;
    if (removeTags.length) payload.removeTags = removeTags;
    if (!Object.keys(payload).length) { setEditError("Make at least one change before saving."); return; }
    setPending(true); setEditError("");
    try { await updateTask(uuid, payload); setEditing(false); setActionMessage("Changes saved."); refresh(); onMutated(); }
    catch (failure) { setEditError(failure instanceof Error ? failure.message : "Unable to save changes."); }
    finally { setPending(false); }
  }

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
            <div className="detail-actions">
              <h3>Task actions</h3>
              {editing ? <form className="task-form compact-form" onSubmit={saveEdit}>
                <label>Description<input required value={description} onChange={(e) => setDescription(e.target.value)} /></label>
                <label>Project<input value={project} onChange={(e) => setProject(e.target.value)} /></label>
                <label>Priority<select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority | "")}><option value="">Unchanged / none</option><option value="H">High</option><option value="M">Medium</option><option value="L">Low</option></select></label>
                <label>Due date<input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
                <label>Tags <span className="optional-label">(comma separated)</span><input value={tags} onChange={(e) => setTags(e.target.value)} /></label>
                {editError && <p className="form-message" role="alert">{editError}</p>}
                <div className="form-actions"><button type="button" className="secondary-action" disabled={pending} onClick={() => { setEditing(false); setEditError(""); }}>Cancel</button><button className="primary-action" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button></div>
              </form> : <div className="action-buttons">
                <button className="secondary-action" disabled={pending} onClick={beginEdit}>Edit task</button>
                {task.status === "pending" && <button className="secondary-action" disabled={pending} onClick={() => void runAction(() => startTask(uuid), "Work started.")}>Start</button>}
                {task.status === "pending" && typeof task.details.start === "string" && <button className="secondary-action" disabled={pending} onClick={() => void runAction(() => stopTask(uuid), "Work stopped.")}>Stop</button>}
                {task.status === "pending" && <button className="primary-action" disabled={pending} onClick={() => void runAction(() => completeTask(uuid), "Task completed.")}>Complete</button>}
                {task.status !== "deleted" && task.status !== "completed" && <button className="danger-action" disabled={pending} onClick={() => { if (window.confirm("Delete this task? It will be marked deleted in Taskwarrior and can be recovered; it will not be purged.")) void runAction(() => deleteTask(uuid), "Task marked deleted. It was not purged."); }}>Soft-delete…</button>}
              </div>}
              {actionMessage && <p className="form-message" role="status">{actionMessage}</p>}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
