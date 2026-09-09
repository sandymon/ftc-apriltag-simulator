import { beforeEach, describe, expect, it } from "vitest";
import { allLessons, archivedModules, courseFor, workshopModules } from "./course";
import { examples, segmentLines } from "./examples";
import { readProgress, storageKey, writeProgress } from "./progress";
import { sources } from "./sources";
import { inputGuidance, inputs } from "./inputs";
beforeEach(() => localStorage.clear());
describe("course structure and examples", () => {
  it("has reachable lessons, valid sources, and complete assessments", () => {
    expect(archivedModules.length).toBe(12); expect(allLessons.length).toBe(99);
    expect(new Set(allLessons.map(l => l.id)).size).toBe(allLessons.length);
    for (const lesson of allLessons) { expect(sources[lesson.source]).toBeDefined(); expect(lesson.title.length).toBeGreaterThan(3); if (lesson.quiz) expect(lesson.quiz.options[lesson.quiz.answer]).toBeTruthy(); }
  });
  it("only exposes the current workshop course", () => {
    expect(courseFor()).toBe(workshopModules);
    expect(courseFor().flatMap(m => m.lessons)).toHaveLength(13);
  });
  it("fits the default workshop into 30 minutes and 13 valid lessons", () => {
    expect(workshopModules.reduce((sum, m) => sum + m.minutes, 0)).toBe(30);
    const lessons = courseFor().flatMap(m => m.lessons);
    expect(lessons).toHaveLength(13);
    for (const lesson of lessons) { expect(lesson.id).toBeTruthy(); expect(sources[lesson.source]).toBeDefined(); }
  });
  it("provides practical guidance for every LimelightOS Input setting", () => {
    const coreSettings = inputs.filter(input => input.group === "Input" || input.group === "Configuration");
    expect(coreSettings).toHaveLength(17);
    for (const input of coreSettings) {
      const guidance = inputGuidance[input.id];
      expect(guidance?.recommendation.length, input.label).toBeGreaterThan(20);
      expect(guidance?.pros.length, input.label).toBeGreaterThan(20);
      expect(guidance?.cons.length, input.label).toBeGreaterThan(20);
    }
  });
  it("every code highlight resolves to real lines", () => {
    for (const example of Object.values(examples)) for (const segment of example.segments) {
      const range = segmentLines(example, segment); expect(range.start, example.file + ": " + segment.id).toBeGreaterThanOrEqual(0);
      expect(range.end).toBeLessThan(example.source.split("\n").length);
    }
  });
  it("recovers from corrupt and incompatible saved progress", () => {
    localStorage.setItem(storageKey, "{broken"); expect(readProgress().lesson).toBe("welcome");
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, path: "webcam", lesson: "ll-code-start", completed: ["missing", "welcome", "welcome"] }));
    expect(readProgress()).toMatchObject({ version: 2, lesson: "welcome", completed: ["welcome"] });
    const p = readProgress(); writeProgress({ ...p, lesson: "frames" }); expect(readProgress().lesson).toBe("welcome");
  });
});


