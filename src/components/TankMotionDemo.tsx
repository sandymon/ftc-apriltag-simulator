import { useEffect, useId, useState } from "react";
import { motionPose, motionScenes, type Motion } from "./tankMotion";

export function TankMotionDemo() {
  const coneId = useId();
  const [motion, setMotion] = useState<Motion>("straight");
  const [run, setRun] = useState(0);
  const [progress, setProgress] = useState(0);
  const selected = motionScenes[motion];
  const pose = motionPose(motion, progress);
  useEffect(() => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      setProgress(reducedMotion ? 1 : Math.min(1, (now - started) / 6000));
      if (!reducedMotion && now - started < 6000) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [motion, run]);
  const choose = (next: Motion) => { setProgress(0); setMotion(next); setRun(value => value + 1); };
  const visible = Math.abs(pose.bearing) <= 35;
  const tagSize = 300 / pose.range;
  const cameraX = 90 + Math.tan(pose.bearing * Math.PI / 180) / Math.tan(35 * Math.PI / 180) * 70;
  const signed = (n: number) => `${n > 0.05 ? "+" : ""}${Math.abs(n) < 0.05 ? "0.0" : n.toFixed(1)}`;
  return <section className="tank-motion-demo" aria-label="Tank movement animation">
    <div className="motion-heading"><div><span className="eyebrow">2D APRILTAG MOVEMENT</span><h4>Watch the robot approach and stop</h4></div><button className="button" onClick={() => { setProgress(0); setRun(value => value + 1); }}>↻ Replay</button></div>
    <div className="motion-options">{(Object.keys(motionScenes) as Motion[]).map(id => <button key={id} aria-pressed={motion === id} onClick={() => choose(id)}>{motionScenes[id].label}</button>)}</div>
    <svg className="motion-field" viewBox="0 0 440 300" role="img" aria-label={`${selected.label}: ${selected.description}`}>
      <defs><linearGradient id={coneId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#71e1b5" stopOpacity="0.02"/><stop offset="100%" stopColor="#71e1b5" stopOpacity="0.22"/></linearGradient></defs>
      <path className="field-grid" d="M0 60H440M0 120H440M0 180H440M0 240H440M80 0V300M160 0V300M240 0V300M320 0V300M400 0V300"/>
      <path className="motion-path" d={selected.path}/>
      <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.heading})`}>
        <path className="motion-view-cone" d="M0 0 L-147 -210 L147 -210 Z" fill={`url(#${coneId})`}/>
        <path className="motion-heading-arrow" d="M0 0V-64M-7 -55L0 -64L7 -55"/>
      </g>
      <line className="tag-sightline" x1={pose.x} y1={pose.y} x2={selected.tag[0]} y2={selected.tag[1]}/>
      <g className="motion-tag" transform={`translate(${selected.tag[0]} ${selected.tag[1]})`}>
        <rect x="-17" y="-17" width="34" height="34" rx="2"/><path d="M-12-12H-2V-2H-12ZM2-12H12V-2H2ZM-12 2H-2V12H-12ZM2 2H7V7H12V12H2Z"/>
        <text x="0" y="28">APRILTAG</text>
      </g>
      <g className="motion-robot" transform={`translate(${pose.x} ${pose.y}) rotate(${pose.heading})`}>
        <rect className="robot-body" x="-21" y="-24" width="42" height="48" rx="5"/>
        <rect className="robot-wheel" x="-27" y="-18" width="7" height="36" rx="2"/><rect className="robot-wheel" x="20" y="-18" width="7" height="36" rx="2"/>
        <path className="robot-front" d="M0 -17V9M0 -17L-8 -8M0 -17L8 -8"/>
        <circle cx="0" cy="0" r="3" fill="white"/><text x="0" y="20">ROBOT</text>
      </g>
      <text className="field-label" x="12" y="284">TOP VIEW · GREEN = FRONT · GOLD DASHES = TAG DIRECTION</text>
      <svg className="motion-pov-overlay" x="286" y="12" width="144" height="96" viewBox="0 0 180 120" role="img" aria-label={visible ? `Tag ${Math.abs(pose.bearing) < 0.1 ? "centered" : "to the right"} in robot POV` : "Tag outside camera view to the right"}>
        <rect className="pov-backdrop" x="1" y="1" width="178" height="118" rx="9"/>
        <text x="12" y="19" className="pov-title">ROBOT POV</text>
        <path d="M90 29V90M14 60H166" className="pov-crosshair"/>
        {visible ? <g className="motion-tag" transform={`translate(${cameraX} 60) scale(${tagSize / 34})`}><rect x="-17" y="-17" width="34" height="34"/><path d="M-12-12H-2V-2H-12ZM2-12H12V-2H2ZM-12 2H-2V12H-12ZM2 2H7V7H12V12H2Z"/></g> : <text x="90" y="60" textAnchor="middle" className="pov-offscreen">Tag to the right →</text>}
        <text x="90" y="108" textAnchor="middle" className="pov-caption">{pose.stopped ? "At target · 12 in" : pose.turning ? "Turn to center the tag →" : "Centered · drive forward"}</text>
      </svg>
    </svg>
    <div className="tag-reading"><strong>Live geometry:</strong><span>ftcPose.x = {signed(pose.lateral)} in</span><span>bearing = {signed(pose.bearing)}°</span><span>range = {pose.range.toFixed(1)} in</span><span>desired = 12 in</span><b className={pose.stopped ? "motion-stopped" : ""}>{pose.stopped ? "STOPPED AT TARGET" : pose.turning ? "1. TURN TO FACE TAG" : motion === "angle" ? "2. DRIVE TO STOP LINE" : "APPROACHING"}</b></div>
    <div className="motion-math">
      <span><small>drive x</small><strong>{pose.drive.toFixed(2)}</strong></span><span><small>turn yaw</small><strong>{pose.yaw.toFixed(2)}</strong></span>
      <span><small>left = x − yaw</small><strong>{pose.left.toFixed(2)}</strong></span><span><small>right = x + yaw</small><strong>{pose.right.toFixed(2)}</strong></span>
    </div>
    <p className="motion-description"><strong>Controller response:</strong> {selected.description} <em>Illustrative movement sequence. Distance is measured from the robot center; the POV assumes a camera at that center. At 12 inches, drive and turn power both become zero.</em></p>
  </section>;
}

