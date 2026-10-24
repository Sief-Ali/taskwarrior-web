import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDetails } from "@/components/tasks/TaskDetails";
import type { Task } from "@/lib/tasks";
import { useState } from "react";

type ViewMode = "boxes" | "list";
interface TaskNode {
  task: Task;
  children: TaskNode[];
}

interface TaskListProps {
  tasks: Task[];
  view: ViewMode;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onMutated: () => void;
}

function buildTaskTree(tasks: Task[]): TaskNode[] {
  const nodes = tasks.map((task) => ({ task, children: [] as TaskNode[] }));
  const byIdentifier = new Map<string, TaskNode>();
  nodes.forEach((node) => {
    byIdentifier.set(node.task.uuid, node);
    byIdentifier.set(String(node.task.id), node);
  });

  const parents = new Map<TaskNode, TaskNode>();
  nodes.forEach((node) => {
    const parentId = node.task.parent ?? node.task.parent_uuid;
    const parent = parentId ? byIdentifier.get(parentId) : undefined;
    if (parent && parent !== node) parents.set(node, parent);
  });

  nodes.forEach((node) => {
    const ancestors = new Set([node]);
    let parent = parents.get(node);
    while (parent && !ancestors.has(parent)) {
      ancestors.add(parent);
      parent = parents.get(parent);
    }
    if (parent) parents.delete(node);
  });

  const roots: TaskNode[] = [];
  nodes.forEach((node) => {
    const parent = parents.get(node);
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
}

function TaskBranch({
  node,
  view,
  depth,
  onSelect,
}: {
  node: TaskNode;
  view: ViewMode;
  depth: number;
  onSelect: (uuid: string) => void;
}) {
  return (
    <TaskCard
      task={node.task}
      view={view}
      depth={depth}
      onSelect={onSelect}
    >
      {node.children.length > 0 && (
        <div className="task-children">
          {node.children.map((child) => (
            <TaskBranch
              key={child.task.uuid}
              node={child}
              view={view}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </TaskCard>
  );
}

export function TaskList({
  tasks,
  view,
  loading,
  error,
  onRetry,
  onMutated,
}: TaskListProps) {
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

  if (error) {
    return (
      <div className="task-state task-error" role="alert">
        <div>
          <h2>Could not load tasks</h2>
          <p>{error}</p>
        </div>
        <button type="button" onClick={onRetry}>TRY AGAIN</button>
      </div>
    );
  }

  if (loading && tasks.length === 0) {
    return (
      <div className={`task-grid ${view === "list" ? "list-view" : ""}`} aria-label="Loading tasks">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="task-skeleton" key={index} aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-state">
        <h2>No tasks yet</h2>
        <p>Tasks from your TaskWarrior API will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`task-grid ${view === "list" ? "list-view" : ""}`}>
        {buildTaskTree(tasks).map((node) => (
          <TaskBranch
            key={node.task.uuid}
            node={node}
            view={view}
            depth={0}
            onSelect={setSelectedUuid}
          />
        ))}
      </div>
      {selectedUuid && (
        <TaskDetails
          uuid={selectedUuid}
          onClose={() => setSelectedUuid(null)}
          onMutated={onMutated}
        />
      )}
    </>
  );
}
