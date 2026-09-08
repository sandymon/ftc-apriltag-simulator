import { allLessons, courseFor } from "./course";
import type { Path } from "./types";
export const storageKey = "ftc-apriltag-course-v1";
export type Progress = { version: 1; mode: "workshop" | "reference"; lesson: string; path: Path; completed: string[]; theme: string; reducedMotion: boolean };
export function readProgress(): Progress {
  const fallback: Progress = { version: 1, mode: "workshop", lesson: "welcome", path: "both", completed: [], theme: "dark", reducedMotion: false };
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (!raw || raw.version !== 1) return fallback;
    const path: Path = ["webcam", "limelight", "both"].includes(raw.path) ? raw.path : "both";
    const mode = raw.mode === "reference" ? "reference" : "workshop";
    const lessons = courseFor(path, mode).flatMap(m => m.lessons);
    return { ...fallback, mode, path, lesson: lessons.some(l => l.id === raw.lesson) ? raw.lesson : "welcome", theme: raw.theme === "light" ? "light" : "dark",
      reducedMotion: raw.reducedMotion === true, completed: Array.isArray(raw.completed) ? [...new Set<string>(raw.completed.filter((id: unknown) => allLessons.some(l => l.id === id)))] : [] };
  } catch { return fallback; }
}
export function writeProgress(progress: Progress) { try { localStorage.setItem(storageKey, JSON.stringify(progress)); return true; } catch { return false; } }
