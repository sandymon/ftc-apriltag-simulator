import { courseFor } from "./course";
export const storageKey = "ftc-apriltag-course-v1";
export type Progress = { version: 2; lesson: string; completed: string[]; theme: string; reducedMotion: boolean };
export function readProgress(): Progress {
  const fallback: Progress = { version: 2, lesson: "welcome", completed: [], theme: "dark", reducedMotion: false };
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (!raw || (raw.version !== 1 && raw.version !== 2)) return fallback;
    const lessons = courseFor().flatMap(m => m.lessons), lessonIds = new Set(lessons.map(l => l.id));
    const savedLesson = ["ui-family", "ui-exposure", "ui-filter"].includes(raw.lesson) ? "ui-pipeline" : ["align-challenge", "override", "fault-challenge"].includes(raw.lesson) ? "explore-lab" : raw.lesson;
    return { ...fallback, lesson: lessonIds.has(savedLesson) ? savedLesson : "welcome", theme: raw.theme === "light" ? "light" : "dark",
      reducedMotion: raw.reducedMotion === true, completed: Array.isArray(raw.completed) ? [...new Set<string>(raw.completed.filter((id: unknown): id is string => typeof id === "string" && lessonIds.has(id)))] : [] };
  } catch { return fallback; }
}
export function writeProgress(progress: Progress) { try { localStorage.setItem(storageKey, JSON.stringify(progress)); return true; } catch { return false; } }


