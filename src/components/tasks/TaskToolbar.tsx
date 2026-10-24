type ViewMode = "boxes" | "list";

interface TaskToolbarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onRefresh: () => void;
  loading: boolean;
  onCreate: () => void;
}

export function TaskToolbar({
  view,
  onViewChange,
  onRefresh,
  loading,
  onCreate,
}: TaskToolbarProps) {
  return (
    <div className="task-toolbar">
      <div className="toolbar-caption">
        <span className="toolbar-indicator" />
        <span>TASK LIST</span>
      </div>
      <div className="toolbar-actions">
        <button className="primary-action toolbar-create" type="button" onClick={onCreate}>＋ NEW TASK</button>
        <button
          className="refresh-button"
          type="button"
          onClick={onRefresh}
          disabled={loading}
        >
          <span aria-hidden="true">↻</span>
          REFRESH
        </button>
        <span className="toolbar-divider" aria-hidden="true" />
        <div className="view-switch" role="group" aria-label="Task layout">
          <button
            type="button"
            aria-label="Box view"
            aria-pressed={view === "boxes"}
            className={view === "boxes" ? "selected" : ""}
            onClick={() => onViewChange("boxes")}
          >
            ▦
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === "list"}
            className={view === "list" ? "selected" : ""}
            onClick={() => onViewChange("list")}
          >
            ☷
          </button>
        </div>
      </div>
    </div>
  );
}
