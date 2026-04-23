"use client";

export type Theme = "dark";

export function useTheme() {
  return { theme: "dark" as Theme, toggle: () => {} };
}
