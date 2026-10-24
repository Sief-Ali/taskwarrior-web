import { useCallback, useEffect, useState } from "react";
import { getTaskByUuid, type Task } from "@/lib/tasks";

interface TaskDetailState {
  uuid: string | null;
  task: Task | null;
  loading: boolean;
  error: string | null;
}

export function useTaskDetails(uuid: string | null) {
  const [state, setState] = useState<TaskDetailState>({
    uuid: null,
    task: null,
    loading: false,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!uuid) return;

    let active = true;

    getTaskByUuid(uuid)
      .then((task) => {
        if (active) setState({ uuid, task, loading: false, error: null });
      })
      .catch((requestError: unknown) => {
        if (active) {
          setState({
            uuid,
            task: null,
            loading: false,
            error:
              requestError instanceof Error
                ? requestError.message
                : "Unable to load task details.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [uuid, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return uuid === null
    ? { uuid: null, task: null, loading: false, error: null, refresh }
    : state.uuid === uuid
    ? { ...state, refresh }
    : { uuid, task: null, loading: true, error: null, refresh };
}
