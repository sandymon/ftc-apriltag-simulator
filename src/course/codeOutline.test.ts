import { describe, expect, it } from "vitest";
import { examples, segmentLines } from "./examples";
import { walkthroughs } from "./codeOutline";

describe("code section walkthrough", () => {
  for (const [id, example] of Object.entries(examples)) {
    it(`${id} starts with declarations and retains every original explanation in its section`, () => {
      const { steps, sections } = walkthroughs[id];
      expect(sections[0].title).toBe("Variables & constants");
      expect(sections[1].title).toBe("Main · runOpMode()");
      expect(steps[0].overview).toBe(true);
      for (const original of example.segments) expect(steps.filter(s => s.id === original.id)).toHaveLength(1);
      for (const step of steps) {
        const range = segmentLines(example, step);
        expect(range.start, step.id).toBeGreaterThanOrEqual(0);
        expect(range.end, step.id).toBeLessThan(example.source.split("\n").length);
        expect(range.end).toBeGreaterThanOrEqual(range.start);
      }
    });
  }
  it("covers webcam main flow before entering initialization and detection helpers", () => {
    const { steps, sections } = walkthroughs.webcam;
    expect(sections.map(s => s.title)).toEqual(["Variables & constants", "Main · runOpMode()", "Helper · initAprilTag()", "Helper · findDesiredTag()"]);
    expect(steps.findIndex(s => s.id === "loop")).toBeLessThan(steps.findIndex(s => s.id === "processor"));
    expect(steps.find(s => s.id === "processor")?.section).toBe("Helper · initAprilTag()");
  });
});
