import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_TASKWARRIOR_API_URL ?? "http://localhost:5000/v1";

export const apiClient = axios.create({
  baseURL: baseURL.replace(/\/+$/, ""),
  headers: { Accept: "application/json" },
  timeout: 10_000,
});
