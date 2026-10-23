import { useCallback, useEffect, useState } from "react";
import { getTasks, type Task } from "@/lib/tasks";

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export function useTasks() {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<TasksState>({
    tasks: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    getTasks()
      .then((tasks) => {
        if (active) setState({ tasks, loading: false, error: null });
      })
      .catch((requestError: unknown) => {
        if (active) {
          setState({
            tasks: [],
            loading: false,
            error:
              requestError instanceof Error
                ? requestError.message
                : "Unable to load tasks.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  return { ...state, refresh };
}
