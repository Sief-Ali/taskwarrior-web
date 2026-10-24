import axios from "axios";
import { apiClient } from "@/lib/axios";

export interface Task {
  id: number | string;
  uuid: string;
  description: string;
  status: string;
  project?: string;
  due?: string;
  modified?: string;
  urgency?: number;
  parent?: string;
  parent_uuid?: string;
  details: Record<string, unknown>;
}

export type TaskPriority = "H" | "M" | "L";
export interface TaskCreateInput {
  description: string;
  project?: string;
  priority?: TaskPriority;
  due?: string;
  tags?: string[];
}
export interface TaskUpdateInput {
  description?: string;
  project?: string;
  priority?: TaskPriority;
  due?: string;
  addTags?: string[];
  removeTags?: string[];
}

function mutationError(error: unknown): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error("The task action failed.");
  }
  const status = error.response?.status;
  const body = error.response?.data as { code?: unknown } | undefined;
  const code = typeof body?.code === "string" ? body.code : "";
  if (code === "TASK_NOT_FOUND") return new Error("This task no longer exists. Refresh the task list and try again.");
  if (code === "INVALID_UUID") return new Error("The task identifier is invalid. Refresh the task list and try again.");
  if (code === "INVALID_INPUT") return new Error("Some task fields are invalid. Review the values and try again.");
  if (status === 502 || status === 503 || status === 504) return new Error("Taskwarrior could not complete this action. Try again shortly.");
  if (status) return new Error(`The task action failed (HTTP ${status}).`);
  return new Error("Unable to reach the TaskWarrior API.");
}

async function mutate(request: () => Promise<unknown>): Promise<void> {
  try {
    await request();
  } catch (error) {
    throw mutationError(error);
  }
}

export function createTask(input: TaskCreateInput): Promise<void> {
  return mutate(() => apiClient.post("/tasks", input));
}

export function updateTask(uuid: string, input: TaskUpdateInput): Promise<void> {
  return mutate(() => apiClient.patch(`/tasks/${encodeURIComponent(uuid)}`, input));
}

export function completeTask(uuid: string): Promise<void> {
  return mutate(() => apiClient.post(`/tasks/${encodeURIComponent(uuid)}/complete`));
}

export function deleteTask(uuid: string): Promise<void> {
  return mutate(() => apiClient.delete(`/tasks/${encodeURIComponent(uuid)}`));
}

export function startTask(uuid: string): Promise<void> {
  return mutate(() => apiClient.post(`/tasks/${encodeURIComponent(uuid)}/start`));
}

export function stopTask(uuid: string): Promise<void> {
  return mutate(() => apiClient.post(`/tasks/${encodeURIComponent(uuid)}/stop`));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTask(value: unknown): Task {
  if (
    !isRecord(value) ||
    (typeof value.id !== "number" && typeof value.id !== "string") ||
    typeof value.uuid !== "string" ||
    typeof value.description !== "string" ||
    typeof value.status !== "string"
  ) {
    throw new Error("The tasks API returned a task with an invalid shape.");
  }

  const task: Task = {
    id: value.id,
    uuid: value.uuid,
    description: value.description,
    status: value.status,
    details: Object.fromEntries(
      Object.entries(value).filter(
        ([key]) => !["id", "uuid", "description"].includes(key),
      ),
    ),
  };

  for (const field of [
    "project",
    "due",
    "modified",
    "parent",
    "parent_uuid",
  ] as const) {
    if (typeof value[field] === "string") task[field] = value[field];
  }
  if (typeof value.urgency === "number" && Number.isFinite(value.urgency)) {
    task.urgency = value.urgency;
  }

  return task;
}

export async function getTasks(): Promise<Task[]> {
  try {
    const { data } = await apiClient.get<unknown>("/tasks");
    if (!Array.isArray(data)) {
      throw new Error("The tasks API returned an invalid list response.");
    }
    return data.map(parseTask);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status) {
        throw new Error(`The TaskWarrior API returned HTTP ${status}.`);
      }
      throw new Error("Unable to reach the TaskWarrior API.");
    }
    throw error;
  }
}

export async function getTaskByUuid(uuid: string): Promise<Task> {
  try {
    const { data } = await apiClient.get<unknown>(
      `/tasks/${encodeURIComponent(uuid)}`,
    );
    return parseTask(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("This task could not be found.");
      }
      if (error.response?.status) {
        throw new Error(
          `The TaskWarrior API returned HTTP ${error.response.status}.`,
        );
      }
      throw new Error("Unable to reach the TaskWarrior API.");
    }
    throw error;
  }
}
