import axios from "axios";
import { apiClient } from "@/lib/axios";

export interface Task {
  id: number | string;
  uuid: string;
  description: string;
  status: string;
  project?: string;
  modified?: string;
  urgency?: number;
  parent?: string;
  parent_uuid?: string;
  details: Record<string, unknown>;
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

  for (const field of ["project", "modified", "parent", "parent_uuid"] as const) {
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
