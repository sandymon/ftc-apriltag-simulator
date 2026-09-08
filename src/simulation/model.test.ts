import { describe, expect, it } from "vitest";
import { commands, detections, initialLab, modelStats, primary, tick, reported } from "./model";
const running = () => ({ ...initialLab(), running: true, phase: "Streaming" });
describe("camera geometry and result validity", () => {
  it("makes Limelight tx positive right and webcam bearing positive left", () => {
    const s = running(), d = detections(s)[0];
    expect(d.valid).toBe(true); expect(d.tx).toBeGreaterThan(0); expect(d.bearing).toBe(-d.tx);
    expect(d.range).toBeCloseTo(Math.hypot(23, 62));
    s.robot.heading = 70;
    expect(Math.abs(detections(s)[0].tx)).toBeLessThan(1);
  });
  it("keeps angles independent of marker size and stream orientation", () => {
    const s = running(), a = detections(s)[0];
    s.pipelines[0].size *= 2; s.pipelines[0].orientation = 180;
    const b = detections(s)[0]; expect(b.tx).toBe(a.tx); expect(b.ty).toBe(a.ty); expect(b.range).toBeCloseTo(a.range * 2);
  });
  it.each(["family", "filter", "hardware", "outside", "exposure", "crop", "processor"])("rejects unusable results: %s", fault => {
    const s = running();
    if (fault === "family") s.pipelines[0].family = "25h9";
    if (fault === "filter") s.pipelines[0].filter = "24";
    if (fault === "hardware") s.hardware = "Limelight";
    if (fault === "outside") s.robot.heading = -90;
    if (fault === "exposure") s.pipelines[0].exposure = .1;
    if (fault === "crop") s.pipelines[0].cropX = .1;
    if (fault === "processor") { s.camera = "webcam"; s.hardware = "Webcam 1"; s.attached = false; }
    expect(detections(s).every(d => !d.valid)).toBe(true);
  });
  it("preserves per-pipeline settings", () => { const s = running(); s.pipelines[0].filter = "20"; s.pipelines[1].filter = "21"; expect(s.pipelines[0].filter).toBe("20"); s.slot = 1; expect(primary(s)?.id).toBe(21); });
  it("models resolution/downscale tradeoffs without changing the physical lens", () => { const p = initialLab().pipelines[0], first = modelStats(p); p.resolution = 1280; expect(modelStats(p).fps).toBeLessThan(first.fps); expect(modelStats(p).fov).toBe(first.fov); p.downscale = 4; expect(modelStats(p).fps).toBe(first.fps); });
});
describe("assisted tank motion", () => {
  it("converges on an off-center target with bounded outputs", () => {
    let s = { ...running(), assist: true };
    const error = Math.abs(primary(s)!.tx);
    for (let i = 0; i < 180; i++) { s = tick(s); const c = commands(s, primary(s, reported(s))); expect(Math.abs(c.turn)).toBeLessThanOrEqual(.25); expect(Math.abs(c.left)).toBeLessThanOrEqual(1); }
    expect(Math.abs(primary(s)!.tx)).toBeLessThan(error);
    expect(Math.abs(primary(s)!.tx)).toBeLessThanOrEqual(2);
  });
  it("approaches the desired camera range", () => {
    let s = { ...running(), assist: true, mode: "Approach" };
    for (let i = 0; i < 650; i++) s = tick(s);
    expect(primary(s)?.valid).toBe(true);
    expect(Math.abs(primary(s)!.range - 12)).toBeLessThanOrEqual(1);
  });
  it("zeros commands on release, Stop, stale data, snapshots, and unknown webcam metadata", () => {
    const s = { ...running(), assist: true }, d = primary(s)!;
    expect(commands(s, d).turn).toBeLessThan(0);
    expect(commands({ ...s, assist: false }, d).turn).toBe(0);
    expect(commands({ ...s, running: false }, d).turn).toBe(0);
    expect(commands({ ...s, delay: 800 }, d).turn).toBe(0);
    expect(commands({ ...s, camera: "webcam" }, { ...d, tag: { ...d.tag, known: false } }).turn).toBe(0);
    s.pipelines[0].source = "Snapshot"; expect(commands(s, d).turn).toBe(0);
  });
  it("buffers delayed frames and freezes snapshots", () => {
    let s = tick(running()); const angle = reported(s)[0].tx;
    s = { ...s, robot: { ...s.robot, heading: 70 }, delay: 80 }; s = tick(s);
    expect(reported(s)[0].tx).toBe(angle);
    s.pipelines[0].source = "Snapshot"; const frozen = reported(s)[0].tx;
    s.robot.heading = 100; s = tick(s); expect(reported(s)[0].tx).toBe(frozen);
  });
});
