"use client";

import { useSyncExternalStore } from "react";
import {
  formatTaskwarriorTimestamp,
  parseTaskwarriorTimestamp,
} from "@/lib/taskwarriorTime";

interface TaskwarriorTimeProps {
  value: string;
  prefix?: string;
}

function subscribeToTimeZoneChange() {
  return () => {};
}

function getClientFormatSettings() {
  return `${navigator.language}|${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
}

function getServerFormatSettings() {
  return "en-US|UTC";
}

export function TaskwarriorTime({ value, prefix }: TaskwarriorTimeProps) {
  const date = parseTaskwarriorTimestamp(value);
  const settings = useSyncExternalStore(
    subscribeToTimeZoneChange,
    getClientFormatSettings,
    getServerFormatSettings,
  );
  const settingsSeparator = settings.indexOf("|");
  const locale = settings.slice(0, settingsSeparator);
  const timeZone = settings.slice(settingsSeparator + 1);
  const formatted =
    formatTaskwarriorTimestamp(value, locale, timeZone) ?? value;

  return (
    <time
      dateTime={date?.toISOString()}
      title={`Taskwarrior UTC: ${value}`}
    >
      {prefix ? `${prefix} ` : ""}
      {formatted}
    </time>
  );
}
