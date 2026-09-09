import type { Camera } from "../course/types";
export type Point = { x: number; y: number };
export type Tag = Point & { id: number; height: number; yaw: number; size: number; known: boolean };
export type Robot = Point & { heading: number };
export type Pipeline = {
  type: string; source: string; resolution: number; zoom: number; orientation: number;
  exposure: number; black: number; gain: number; flicker: number; red: number; blue: number;
  family: string; size: number; downscale: number; quality: number; filter: string;
  cropX: number; cropY: number; sort: string; full3d: boolean; mountForward: number;
  mountRight: number; mountHeight: number; mountYaw: number; mountPitch: number; poi: number; map: string;
};
export type LabState = {
  camera: Camera; robot: Robot; tags: Tag[]; selected: number; running: boolean;
  phase: string; hardware: string; slot: number; pipelines: Pipeline[];
  noise: boolean; delay: number; drops: boolean; blur: boolean; tick: number;
  assist: boolean; mode: string; turnGain: number; speedGain: number; maxTurn: number;
  maxSpeed: number; tolerance: number; desired: number; processor: boolean; attached: boolean;
  captures?: Detection[][];
};
export type Detection = {
  id: number; tag: Tag; tx: number; ty: number; bearing: number; range: number; trueRange: number;
  x: number; y: number; z: number; yaw: number; area: number; visible: boolean; valid: boolean; reason: string;
};
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const degrees = (r: number) => r * 180 / Math.PI;
export const radians = (d: number) => d * Math.PI / 180;
export const wrap = (n: number) => ((n + 180) % 360 + 360) % 360 - 180;
export function defaultPipeline(): Pipeline { return { type: "AprilTags", source: "Camera", resolution: 640, zoom: 1, orientation: 0, exposure: 6, black: 0, gain: 15, flicker: 60, red: 1, blue: 1, family: "36h11", size: 50.8, downscale: 2, quality: 2, filter: "", cropX: 1, cropY: 1, sort: "Largest", full3d: false, mountForward: 0, mountRight: 0, mountHeight: 0.25, mountYaw: 0, mountPitch: 0, poi: 0, map: "Practice" }; }
export function initialLab(camera: Camera = "limelight"): LabState { return { camera, robot: { x: -15, y: -38, heading: 90 }, tags: [{ id: 20, x: 8, y: 24, height: 0.3, yaw: -90, size: 50.8, known: true }, { id: 21, x: -30, y: 40, height: 0.5, yaw: -90, size: 50.8, known: true }], selected: 20, running: false, phase: "Ready", hardware: camera === "limelight" ? "limelight" : "Webcam 1", slot: 0, pipelines: Array.from({ length: 10 }, () => defaultPipeline()), noise: false, delay: 0, drops: false, blur: false, tick: 0, assist: false, mode: "Align", turnGain: 0.01, speedGain: 0.02, maxTurn: 0.25, maxSpeed: 0.5, tolerance: 2, desired: 12, processor: true, attached: true }; }
export function cameraPose(s: LabState) {
  const p = s.pipelines[s.slot], a = radians(s.robot.heading);
  return { x: s.robot.x + (p.mountForward * Math.cos(a) + p.mountRight * Math.sin(a)) / 0.0254,
    y: s.robot.y + (p.mountForward * Math.sin(a) - p.mountRight * Math.cos(a)) / 0.0254, heading: s.robot.heading + p.mountYaw };
}
export function modelStats(p: Pipeline) {
  return { fps: Math.round(clamp(30 * (640 / p.resolution) * (p.downscale / 2) / Math.max(.3, p.cropX * p.cropY), 5, 90)),
    brightness: clamp(p.exposure / 6 * (0.5 + p.gain / 30) - p.black / 40, 0.05, 2), fov: 54.5 / p.zoom };
}
export function detections(s: LabState): Detection[] {
  const p = s.pipelines[s.slot], cam = cameraPose(s), angle = radians(cam.heading), stats = modelStats(p);
  return s.tags.map(tag => {
    const dx = tag.x - cam.x, dy = tag.y - cam.y;
    const x = dx * Math.sin(angle) - dy * Math.cos(angle) + p.poi / .0254;
    const y = dx * Math.cos(angle) + dy * Math.sin(angle), z = (tag.height - p.mountHeight) / .0254;
    const trueRange = Math.hypot(x, y), rawTx = degrees(Math.atan2(x, y)), rawTy = degrees(Math.atan2(z, trueRange)) - p.mountPitch;
    const noise = (s.noise || p.gain > 35) ? Math.sin(s.tick * .81 + tag.id) * 1.5 : 0;
    const tx = rawTx + noise, ty = rawTy + noise * .3, scale = p.size / tag.size, range = trueRange * scale;
    const yaw = wrap(tag.yaw - cam.heading + 180);
    const area = clamp(Math.pow(tag.size / 25.4 / Math.max(1, trueRange), 2) * 125 * Math.max(.1, Math.cos(radians(yaw))), .01, 95);
    const visible = y > 0 && Math.abs(rawTx) < stats.fov / 2 && Math.abs(rawTy) < 21 / p.zoom && Math.abs(yaw) < 85;
    let reason = "Valid target";
    if (!s.running) reason = s.phase === "Closed" ? "Camera closed" : "Camera not started";
    else if (s.phase !== "Streaming") reason = s.phase;
    else if (s.hardware !== (s.camera === "limelight" ? "limelight" : "Webcam 1")) reason = "Hardware name mismatch";
    else if (s.camera === "webcam" && (!s.processor || !s.attached)) reason = "AprilTag processor not attached";
    else if (p.type !== "AprilTags") reason = "Pipeline does not detect AprilTags";
    else if (p.family !== "36h11") reason = "Wrong family";
    else if (!visible) reason = "Outside view or facing away";
    else if (Math.abs(tx) > stats.fov / 2 * p.cropX || Math.abs(ty) > 21 / p.zoom * p.cropY) reason = "Outside crop";
    else if (p.filter.trim() && !p.filter.split(",").map(t => t.trim()).includes(String(tag.id))) reason = "Filtered ID";
    else if (stats.brightness < .22 || stats.brightness > 1.95) reason = "Poor exposure";
    else if (s.blur && p.exposure > 8) reason = "Motion blur";
    else if (trueRange > 110 * (p.resolution / 640) * (2 / p.downscale)) reason = "Too small to detect";
    else if (p.quality > 8) reason = "Below illustrative quality threshold";
    else if (s.drops && s.tick % 16 < 6) reason = "Frame dropped";
    else if (s.delay > 500) reason = "Stale capture (>500 ms)";
    return { id: tag.id, tag, x: x * scale, y: y * scale, z: z * scale, tx, ty, bearing: -tx, range, trueRange, yaw, area, visible, valid: reason === "Valid target", reason };
  });
}
export function primary(s: LabState, list = detections(s)): Detection | undefined {
  const valid = list.filter(d => d.valid), p = s.pipelines[s.slot];
  if (p.sort === "Selected") return list.find(d => d.id === s.selected);
  if (!valid.length) return list.find(d => d.id === s.selected) ?? list[0];
  if (p.sort === "Group center") { const first = valid[0]; const avg = (key: "tx" | "ty" | "range") => valid.reduce((sum, d) => sum + d[key], 0) / valid.length;
    return { ...first, id: -1, tx: avg("tx"), ty: avg("ty"), bearing: -avg("tx"), range: avg("range") }; }
  return [...valid].sort((a, b) => p.sort === "Highest" ? b.ty - a.ty : p.sort === "Lowest" ? a.ty - b.ty : b.area - a.area)[0];
}
export function commands(s: LabState, d?: Detection) {
  const eligible = s.running && s.phase === "Streaming" && s.delay <= 500 && s.pipelines[s.slot].source !== "Snapshot" && s.assist && d?.valid && d.id !== -1 && (s.camera !== "webcam" || d.tag.known);
  if (!eligible || !d) return { drive: 0, turn: 0, left: 0, right: 0 };
  const turn = Math.abs(d.bearing) <= s.tolerance ? 0 : clamp(d.bearing * s.turnGain, -s.maxTurn, s.maxTurn), error = d.range - s.desired;
  const drive = s.mode === "Approach" && Math.abs(error) > 1 ? clamp(error * s.speedGain, -s.maxSpeed, s.maxSpeed) : 0;
  const denominator = Math.max(1, Math.abs(drive - turn), Math.abs(drive + turn));
  return { drive, turn, left: (drive - turn) / denominator, right: (drive + turn) / denominator };
}
export function reported(s: LabState): Detection[] {
  if (!s.running || s.phase !== "Streaming" || !s.captures?.length) return detections(s);
  const at = s.pipelines[s.slot].source === "Snapshot" ? 0 : Math.min(s.captures.length - 1, Math.round(s.delay / 80));
  return s.captures[at].map(d => s.delay > 500 ? { ...d, valid: false, reason: "Stale capture (>500 ms)" } : d);
}
export function tick(s: LabState) {
  const captures = s.pipelines[s.slot].source === "Snapshot" && s.captures?.length ? s.captures : [detections(s), ...(s.captures ?? [])].slice(0, 16);
  const captured = { ...s, captures };
  return advance(captured, primary(captured, reported(captured)));
}
export function advance(s: LabState, d?: Detection): LabState {
  const c = commands(s, d), a = radians(s.robot.heading);
  return { ...s, tick: s.tick + 1, robot: { x: clamp(s.robot.x + c.drive * Math.cos(a) * 2, -65, 65), y: clamp(s.robot.y + c.drive * Math.sin(a) * 2, -65, 65), heading: wrap(s.robot.heading + c.turn * 8) } };
}
