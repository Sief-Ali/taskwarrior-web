"use client";

import { useState } from "react";
import { createTask, type TaskPriority } from "@/lib/tasks";

export function TaskForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [due, setDue] = useState("");
  const [tags, setTags] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim()) { setMessage("Enter a task description."); return; }
    setPending(true); setMessage("");
    try {
      await createTask({
        description: description.trim(),
        ...(project.trim() ? { project: project.trim() } : {}),
        ...(priority ? { priority } : {}),
        ...(due ? { due } : {}),
        ...(tags.trim() ? { tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) } : {}),
      });
      onCreated();
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create task.");
    } finally { setPending(false); }
  }

  return <div className="detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
    <section className="detail-panel form-panel" role="dialog" aria-modal="true" aria-labelledby="create-title">
      <header className="detail-header"><div><p className="workspace-kicker">NEW TASK</p><h2 id="create-title">Create a task</h2></div>
        <button type="button" className="detail-close" aria-label="Close create task form" onClick={onClose} disabled={pending}>×</button>
      </header>
      <form className="task-form" onSubmit={submit}>
        <label>Description<input autoFocus required maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label>Project <span className="optional-label">(optional)</span><input value={project} onChange={(e) => setProject(e.target.value)} /></label>
        <label>Priority <span className="optional-label">(optional)</span><select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority | "")}><option value="">None</option><option value="H">High</option><option value="M">Medium</option><option value="L">Low</option></select></label>
        <label>Due date <span className="optional-label">(optional)</span><input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
        <label>Tags <span className="optional-label">(optional, comma separated)</span><input value={tags} onChange={(e) => setTags(e.target.value)} /></label>
        {message && <p className="form-message" role="alert">{message}</p>}
        <div className="form-actions"><button type="button" className="secondary-action" onClick={onClose} disabled={pending}>Cancel</button><button className="primary-action" disabled={pending}>{pending ? "Creating…" : "Create task"}</button></div>
      </form>
    </section>
  </div>;
}
