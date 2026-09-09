export type Motion = "straight" | "angle";
export const motionScenes = {
  straight: { label: "Tag straight ahead", tag: [150, 60], path: "M150 240 L150 120", description: "The tag is centered. Both sides drive equally toward the 12-inch stop line." },
  angle: { label: "Tag at a slight angle", tag: [180, 240 - 90 * Math.sqrt(3)], path: `M90 240 L150 ${240 - 60 * Math.sqrt(3)}`, description: "The tag starts a little to the right, inside the robot's view. First, turn until the tag is centered in the POV. Then drive straight toward it and stop at 12 inches." },
} as const;

export function motionPose(motion: Motion, progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const stopped = p === 1;
  const turning = motion === "angle" && p < 0.3;
  let x = 150, y = 240 - 120 * p, heading = 0;
  if (motion === "angle") {
    const approach = Math.max(0, (p - 0.3) / 0.7);
    x = 90 + 60 * approach;
    y = 240 - 60 * Math.sqrt(3) * approach;
    heading = Math.PI / 6 * Math.min(1, p / 0.3);
  }
  const [tagX, tagY] = motionScenes[motion].tag;
  const dx = tagX - x, dy = tagY - y;
  const lateral = (dx * Math.cos(heading) + dy * Math.sin(heading)) / 5;
  const forward = (dx * Math.sin(heading) - dy * Math.cos(heading)) / 5;
  const range = Math.hypot(dx, dy) / 5;
  const bearing = Math.atan2(lateral, forward) * 180 / Math.PI;
  const drive = stopped || turning ? 0 : 0.5;
  const yaw = stopped ? 0 : turning ? -0.2 : 0;
  return { x, y, heading: heading * 180 / Math.PI, lateral, range, bearing, drive, yaw, left: drive - yaw, right: drive + yaw, stopped, turning };
}
