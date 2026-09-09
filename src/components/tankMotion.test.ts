import { describe, expect, it } from "vitest";
import { motionPose, type Motion } from "./tankMotion";

describe("AprilTag movement geometry", () => {
  for (const motion of ["straight", "angle"] as Motion[]) {
    it(`${motion} approaches the stop boundary and finishes facing the tag with zero power`, () => {
      let previousRange = Infinity;
      for (let i = 0; i <= 100; i++) {
        const pose = motionPose(motion, i / 100);
        expect(pose.range).toBeLessThanOrEqual(previousRange + 1e-8);
        expect(pose.range).toBeGreaterThanOrEqual(12 - 1e-8);
        previousRange = pose.range;
      }
      const end = motionPose(motion, 1);
      expect(end.range).toBeCloseTo(12);
      expect(end.bearing).toBeCloseTo(0);
      expect(end.lateral).toBeCloseTo(0);
      expect([end.drive, end.yaw, end.left, end.right]).toEqual([0, 0, 0, 0]);
    });
    it(`${motion} travels in the direction its front points`, () => {
      const a = motionPose(motion, 0.6), b = motionPose(motion, 0.60001);
      const direction = Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI;
      expect(direction).toBeCloseTo(a.heading, 2);
    });
  }
  it("turns in place before translating toward the right-side tag", () => {
    const start = motionPose("angle", 0), turning = motionPose("angle", 0.2), driving = motionPose("angle", 0.7);
    expect(turning.x).toBe(start.x);
    expect(turning.y).toBe(start.y);
    expect(turning.bearing).toBeLessThan(start.bearing);
    expect(turning.drive).toBe(0);
    expect(driving.range).toBeLessThan(start.range);
    expect(driving.yaw).toBe(0);
  });
});

