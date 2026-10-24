import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const clientRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = existsSync(resolve(clientRoot, "../pnpm-workspace.yaml"))
  ? resolve(clientRoot, "..")
  : clientRoot;

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: workspaceRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  allowedDevOrigins: ["127.0.0.1:3000", "localhost:3000"],
};

export default nextConfig;
