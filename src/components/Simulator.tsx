import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LabState, Pipeline, Detection } from "../simulation/model";
import { cameraPose, clamp, commands, detections, initialLab, modelStats, primary, radians, reported } from "../simulation/model";
import { Icon } from "./Icon";
import darkField from "../../decode-custom-field-images-meepmeep-compatible-printer-v0-nlvmv6rqoonf1.webp";
import lightField from "../../decode-custom-field-images-meepmeep-compatible-printer-v0-9m6dg4eqoonf1.webp";
type Props = { state: LabState; setState: Dispatch<SetStateAction<LabState>>; focus?: string; onClose: () => void };
export function NumberField({ label, value, onChange, min = -70, max = 70, step = 1 }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number }) {
  return <label className="lab-label">{label}<input type="number" value={Number(value.toFixed(3))} min={min} max={max} step={step} onChange={e => { if (Number.isFinite(e.target.valueAsNumber)) onChange(clamp(e.target.valueAsNumber, min, max)); }}/></label>;
}
function Field({ state: s, setState, list }: Omit<Props, "onClose"> & { list: Detection[] }) {
  const ref = useRef<HTMLDivElement>(null), [drag, setDrag] = useState<string | number | null>(null), [dark, setDark] = useState(true);
  const pose = cameraPose(s), fov = modelStats(s.pipelines[s.slot]).fov;
  const xy = (x: number, y: number) => ({ left: ((x + 70.5) / 141 * 100) + "%", top: ((70.5 - y) / 141 * 100) + "%" });
  const move = (clientX: number, clientY: number) => { if (drag === null || !ref.current) return; const b = ref.current.getBoundingClientRect(); const x = clamp((clientX - b.left) / b.width * 141 - 70.5, -68, 68), y = clamp(70.5 - (clientY - b.top) / b.height * 141, -68, 68);
    setState(old => drag === "robot" ? { ...old, robot: { ...old.robot, x, y } } : { ...old, tags: old.tags.map(t => t.id === drag ? { ...t, x, y } : t) });
  };
  const ray = (angle: number) => (pose.x + 70.5 + 180 * Math.cos(radians(angle))) + "," + (70.5 - pose.y - 180 * Math.sin(radians(angle)));
  const selected = s.tags.find(t => t.id === s.selected);
  return <div className="field-wrap"><div className="lab-section-title"><span>TOP-DOWN FIELD</span><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle field background"><Icon name="sun" size={15}/></button></div>
    <div className="practice-field" ref={ref} onPointerMove={e => move(e.clientX, e.clientY)} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} aria-label="Interactive practice field">
      <img className="field-image" src={dark ? darkField : lightField} alt="DECODE field illustration used as a movable practice layout" draggable={false}/>
      <svg className="field-overlay" viewBox="0 0 141 141" aria-hidden="true"><polygon points={(pose.x + 70.5) + "," + (70.5 - pose.y) + " " + ray(pose.heading - fov / 2) + " " + ray(pose.heading + fov / 2)} fill="#6ef6c51d" stroke="#9bdac377" strokeWidth=".4"/><path d="M0 70.5H141M70.5 0V141" stroke="#abc4ce66" strokeDasharray="1 2" strokeWidth=".3"/>{selected && <line x1={pose.x + 70.5} y1={70.5 - pose.y} x2={selected.x + 70.5} y2={70.5 - selected.y} stroke="#e7c276" strokeDasharray="2 2" strokeWidth=".5"/>}<text x="118" y="69" fill="#fff" fontSize="4">+X</text><text x="72" y="7" fill="#fff" fontSize="4">+Y</text></svg>
      <button className="field-robot" style={{ ...xy(s.robot.x, s.robot.y), transform: "translate(-50%,-50%) rotate(" + (90 - s.robot.heading) + "deg)" }} aria-label="Move robot" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setDrag("robot"); }}><span>↑</span></button>
      {s.tags.map(t => { const d = list.find(item => item.id === t.id); return <button key={t.id} className={"field-tag " + (t.id === s.selected ? "selected " : "") + (d?.valid ? "detected" : "")} style={xy(t.x, t.y)} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(t.id); setState(old => ({ ...old, selected: t.id })); }} onClick={() => setState(old => ({ ...old, selected: t.id }))} aria-label={"Select AprilTag " + t.id}><img src={import.meta.env.BASE_URL + "apriltags/tag-" + t.id + "-36h11.png"} alt=""/><span>{t.id}</span></button>; })}
    </div><div className="field-caption"><span>141 × 141 in · practice layout</span><span>Drag robot or tags</span></div>
  </div>;
}
function CameraPreview({ s, list }: { s: LabState; list: Detection[] }) {
  const p = s.pipelines[s.slot], stats = modelStats(p), chosen = primary(s, list);
  return <div className="camera-panel"><div className="lab-section-title"><span>CAMERA PREVIEW</span><span>{p.source === "Snapshot" ? "FROZEN FRAME" : stats.fps + " modeled FPS"}</span></div>
    <div className="camera-preview"><div className="camera-scene" style={{ transform: "rotate(" + p.orientation + "deg)", filter: "brightness(" + stats.brightness + ") blur(" + (s.blur && p.exposure > 8 ? 2 : 0) + "px)" }}>
      <div className="camera-grid"/>{list.filter(d => d.visible).map(d => { const size = clamp(180 / Math.max(6, d.trueRange) * 15, 14, 85); return <div className={"preview-tag " + (d.valid ? "detected" : "rejected")} key={d.id} style={{ left: (50 + d.tx / stats.fov * 100) + "%", top: (50 - d.ty / (42 / p.zoom) * 100) + "%", width: size + "px" }}><img src={import.meta.env.BASE_URL + "apriltags/tag-" + d.id + "-36h11.png"} alt={"Tag " + d.id + ": " + d.reason}/><span>{d.id}</span></div>; })}
      <div className="white-balance" style={{ background: "rgba(" + Math.round(255 * p.red / 2) + ",70," + Math.round(255 * p.blue / 2) + ",.13)" }}/>
      <div className="crop-box" style={{ width: (p.cropX * 100) + "%", height: (p.cropY * 100) + "%" }}/>
      {p.flicker !== 60 && <div className="flicker-bands"/>}
    </div><div className="camera-crosshair">+</div>{chosen?.valid && <div className="result-crosshair" style={{ left: (50 + chosen.tx / stats.fov * 100) + "%", top: (50 - chosen.ty / (42 / p.zoom) * 100) + "%" }}>+</div>}<span className="preview-label">SIMULATED</span></div>
  </div>;
}
export function PipelineControls({ state: s, setState, focus }: Omit<Props, "onClose">) {
  const p = s.pipelines[s.slot], set = <K extends keyof Pipeline>(key: K, value: Pipeline[K]) => setState(old => ({ ...old, pipelines: old.pipelines.map((item, i) => i === old.slot ? { ...item, [key]: value } : item) }));
  const n = (key: keyof Pipeline, label: string, min: number, max: number, step = 1) => <NumberField label={label} value={p[key] as number} min={min} max={max} step={step} onChange={value => set(key, value)}/>;
  const sel = (key: keyof Pipeline, label: string, values: (string | number)[]) => <label className="lab-label">{label}<select value={String(p[key])} onChange={e => set(key, typeof p[key] === "number" ? Number(e.target.value) : e.target.value)}>{values.map(v => <option key={v} value={v}>{v}</option>)}</select></label>;
  const section = (id: string, content: React.ReactNode) => <div className={"control-group " + (focus === id ? "focus-control" : "")} data-control={id}>{content}</div>;
  return <div className="pipeline-controls">
    {section("pipeline", <NumberField label="Pipeline slot" value={s.slot} min={0} max={9} onChange={slot => setState(old => ({ ...old, slot: Math.round(slot), captures: [] }))}/>)}
    {section("type", sel("type", "Pipeline type", ["AprilTags", "Color"]))}
    {section("source", sel("source", "Source image", ["Camera", "Snapshot"]))}
    {section("resolution", <>{sel("resolution", "Resolution width (px)", [640, 960, 1280])}{n("zoom", "Sensor zoom (×)", 1, 3)}</>)}
    {section("orientation", sel("orientation", "Stream orientation (°)", [0, 90, 180, 270]))}
    {section("exposure", n("exposure", "Exposure (ms)", .1, 20, .1))}
    {section("black", n("black", "Black level offset", 0, 50))}
    {section("gain", n("gain", "Sensor gain (illustrative)", 0, 50))}
    {section("flicker", sel("flicker", "Flicker correction (Hz)", [0, 50, 60]))}
    {section("balance", <>{n("red", "Red balance (relative)", .5, 2, .1)}{n("blue", "Blue balance (relative)", .5, 2, .1)}</>)}
    {section("family", sel("family", "Tag family", ["36h11", "25h9"]))}
    {section("size", n("size", "Marker size (mm)", 10, 250, .1))}
    {section("downscale", n("downscale", s.camera === "webcam" ? "Decimation" : "Detector downscale", 1, 4))}
    {section("quality", <>{n("quality", "Min. confidence (illustrative)", 0, 1, .1)}<small>Not the version-specific Limelight quality score.</small></>)}
    {section("filter", <label className="lab-label">ID filter<input placeholder="Blank = all; e.g. 20,21" value={p.filter} onChange={e => set("filter", e.target.value)}/></label>)}
    {section("crop", <>{n("cropX", "Centered X crop (fraction)", .1, 1, .1)}{n("cropY", "Centered Y crop (fraction)", .1, 1, .1)}</>)}
    {section("sort", sel("sort", "Target selection", ["Largest", "Highest", "Lowest", "Group center", "Selected"]))}
    {section("full3d", <label className="check-label"><input type="checkbox" checked={p.full3d} onChange={e => set("full3d", e.target.checked)}/> Full 3D pose inspector</label>)}
    {section("mount", <>{n("mountForward", "Camera forward (m)", -.5, .5, .01)}{n("mountRight", "Camera right (m)", -.5, .5, .01)}{n("mountHeight", "Camera height (m)", .05, 1, .01)}{n("mountYaw", "Mount yaw CCW (°)", -180, 180)}{n("mountPitch", "Mount pitch up (°)", -45, 45)}</>)}
    {section("map", sel("map", "Known map", ["Practice", "None"]))}
    {section("poi", n("poi", "POI right in camera frame (m)", -.5, .5, .01))}
    <p className="lab-fineprint">Teaching controls use explicit units and a simplified camera model. Match your installed LimelightOS labels and camera-specific ranges on hardware.</p>
  </div>;
}
export function Simulator({ state: s, setState, focus, onClose }: Props) {
  const [tab, setTab] = useState("Field"), [frame, setFrame] = useState("Target in camera"), [tagToAdd, setTagToAdd] = useState(22);
  const p = s.pipelines[s.slot], list = reported(s), live = detections(s), selected = primary(s, list), c = commands(s, selected);
  const patch = (value: Partial<LabState>) => setState(old => ({ ...old, ...value }));
  const setTag = (key: "x" | "y" | "yaw" | "height" | "known", value: number | boolean) => setState(old => ({ ...old, tags: old.tags.map(t => t.id === old.selected ? { ...t, [key]: value } : t) }));
  const tag = s.tags.find(t => t.id === s.selected);
  const pose = cameraPose(s);
  const start = () => patch({ running: true, phase: "Opening camera", captures: [], assist: false });
  const value = (n: number | undefined, unit: string, known = true) => selected?.valid && known && n !== undefined ? n.toFixed(1) + unit : "—";
  return <aside className="lab-panel" aria-label="Interactive camera lab">
    <div className="lab-heading"><div><span className="eyebrow">EXPERIMENT & OBSERVE</span><h2>Camera lab <span className="live-dot"/></h2></div><button className="icon-button" aria-label="Close lab" onClick={onClose}><Icon name="close"/></button></div>
    <div className="lab-camera-switch"><select aria-label="Lab camera" value={s.camera} onChange={e => setState(initialLab(e.target.value as "webcam" | "limelight"))}><option value="limelight">Limelight 3A</option><option value="webcam">Webcam / VisionPortal</option></select><span className="small-badge">SIMULATED</span></div>
    <div className="lab-tabs">{["Field", "Settings", "Control"].map(t => <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>)}</div>
    <div className="lab-body">
      {tab === "Field" && <><Field state={s} setState={setState} list={live}/><CameraPreview s={s} list={list}/>
        <div className="lab-section-title"><span>POSITION CONTROLS</span><span>in / degrees</span></div><div className="lab-grid">
          <NumberField label="Robot X (in)" value={s.robot.x} onChange={x => patch({ robot: { ...s.robot, x } })}/>
          <NumberField label="Robot Y (in)" value={s.robot.y} onChange={y => patch({ robot: { ...s.robot, y } })}/>
          <NumberField label="Heading CCW (°)" value={s.robot.heading} min={-180} max={180} onChange={heading => patch({ robot: { ...s.robot, heading } })}/>
          <label className="lab-label">Selected tag<select value={s.selected} disabled={!s.tags.length} onChange={e => patch({ selected: Number(e.target.value) })}>{s.tags.map(t => <option key={t.id} value={t.id}>ID {t.id}</option>)}</select></label>
          {tag && <><NumberField label="Tag X (in)" value={tag.x} onChange={n => setTag("x", n)}/><NumberField label="Tag Y (in)" value={tag.y} onChange={n => setTag("y", n)}/><NumberField label="Tag face yaw (°)" value={tag.yaw} min={-180} max={180} onChange={n => setTag("yaw", n)}/><NumberField label="Tag height (m)" value={tag.height} min={0} max={1} step={.01} onChange={n => setTag("height", n)}/><label className="check-label"><input type="checkbox" checked={tag.known} onChange={e => setTag("known", e.target.checked)}/> Known metadata</label></>}
        </div><div className="button-row tag-edit"><select aria-label="Tag to add" value={tagToAdd} onChange={e => setTagToAdd(Number(e.target.value))}>{[20,21,22,23,24].map(id => <option key={id} value={id}>ID {id}</option>)}</select><button className="button" disabled={s.tags.some(t => t.id === tagToAdd)} onClick={() => patch({ tags: [...s.tags, { id: tagToAdd, x: 0, y: 32, height: .3, yaw: -90, size: 50.8, known: true }], selected: tagToAdd })}>Add tag</button><button className="button" disabled={!tag} onClick={() => { const tags = s.tags.filter(t => t.id !== s.selected); patch({ tags, selected: tags[0]?.id ?? 20 }); }}>Remove tag</button></div></>}
      {tab === "Settings" && <><label className="lab-label">Hardware name<input value={s.hardware} onChange={e => patch({ hardware: e.target.value })}/></label>{s.camera === "webcam" && <div className="portal-assembly"><label className="check-label"><input type="checkbox" checked={s.processor} onChange={e => patch({ processor: e.target.checked, attached: e.target.checked && s.attached })}/> AprilTagProcessor created</label><label className="check-label"><input type="checkbox" disabled={!s.processor} checked={s.attached} onChange={e => patch({ attached: e.target.checked })}/> Processor attached to portal</label></div>}<PipelineControls state={s} setState={setState} focus={focus}/></>}
      {tab === "Control" && <><div className="lab-grid"><label className="lab-label">Control mode<select value={s.mode} onChange={e => patch({ mode: e.target.value })}><option>Align</option><option>Approach</option></select></label><NumberField label="Turn gain" value={s.turnGain} min={0} max={.1} step={.005} onChange={turnGain => patch({ turnGain })}/><NumberField label="Speed gain" value={s.speedGain} min={0} max={.1} step={.005} onChange={speedGain => patch({ speedGain })}/><NumberField label="Maximum turn" value={s.maxTurn} min={0} max={.5} step={.05} onChange={maxTurn => patch({ maxTurn })}/><NumberField label="Maximum speed" value={s.maxSpeed} min={0} max={.5} step={.05} onChange={maxSpeed => patch({ maxSpeed })}/><NumberField label="Angle tolerance (°)" value={s.tolerance} min={0} max={5} step={.5} onChange={tolerance => patch({ tolerance })}/><NumberField label="Desired range (in)" value={s.desired} min={6} max={60} onChange={desired => patch({ desired })}/></div>
        <button className={"button assist-button " + (s.assist ? "active" : "")} disabled={!s.running} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); patch({ assist: true }); }} onPointerUp={() => patch({ assist: false })} onPointerCancel={() => patch({ assist: false })} onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); patch({ assist: true }); } }} onKeyUp={() => patch({ assist: false })} onBlur={() => patch({ assist: false })}>Hold assist · release to stop</button>
        <div className="command-bars">{Object.entries(c).map(([label, n]) => <div key={label}><span>{label}</span><meter min={-1} max={1} value={n}/><code>{n.toFixed(2)}</code></div>)}</div>
        <p className="lab-fineprint">Tank mixer: left = drive − turn; right = drive + turn. Positive turn is CCW. Approach uses the lab's geometric range estimate. Unknown webcam metadata, grouped targets, snapshots and stale data disable assistance.</p>
        <div className="lab-section-title"><span>TEACHING FAULTS</span></div>{(["noise", "drops", "blur"] as const).map(key => <label className="check-label" key={key}><input type="checkbox" checked={s[key]} onChange={e => patch({ [key]: e.target.checked })}/>{key === "noise" ? "Noisy angles" : key === "drops" ? "Drop frames" : "Motion blur (with long exposure)"}</label>)}<NumberField label="Simulated capture delay (ms)" value={s.delay} min={0} max={960} step={80} onChange={delay => patch({ delay })}/>
      </>}
      <section className="lab-telemetry"><div className="lab-section-title"><span>MEASUREMENTS</span><span className={selected?.valid ? "valid-text" : ""}>{selected?.valid ? "● VALID" : "○ NO RESULT"}</span></div><div className="metric-grid">
        {[["Target", selected?.valid ? selected.id === -1 ? "Group" : String(selected.id) : "—"],[s.camera === "webcam" ? "Bearing" : "tx", value(s.camera === "webcam" ? selected?.bearing : selected?.tx, "°", s.camera !== "webcam" || !!selected?.tag.known)],[s.camera === "webcam" ? "Elevation (model)" : "ty", value(selected?.ty, "°", s.camera !== "webcam" || !!selected?.tag.known)],[s.camera === "webcam" ? "Area (model)" : "Area", value(selected?.area, "%")],["Range", value(selected?.range, " in", s.camera !== "webcam" || !!selected?.tag.known)],["Capture delay", String(s.delay) + " ms"]].map(([label, val]) => <div key={label}><span>{label}</span><strong>{val}</strong></div>)}
      </div><p role="status">{s.tags.length ? selected?.reason ?? "Waiting for a result" : "No tags on the field. Add a tag to continue."}{selected?.valid && s.camera === "webcam" && !selected.tag.known ? " · ID decoded; no library pose" : ""}</p></section>
      {p.full3d && <section className="frame-inspector"><label className="lab-label">Pose expressed as<select value={frame} onChange={e => setFrame(e.target.value)}>{["Target in camera", "Target in robot", "Camera in target", "Robot in target", "Robot in field", "Camera in field"].map(f => <option key={f}>{f}</option>)}</select></label>
        <FrameValues state={s} frame={frame} pose={pose} detection={selected}/><small>Ground-truth frame illustration · 2D field + height; not a six-axis pose solver.</small></section>}
    </div>
    <div className="lab-runbar"><button className="button primary" disabled={s.running} onClick={start}><Icon name="play" size={15}/> Run OpMode</button><button className="button" disabled={!s.running} onClick={() => patch({ running: false, phase: "Stopped", assist: false })}>Stop</button><button className="icon-button" aria-label="Reset lab" onClick={() => setState(initialLab(s.camera))}><Icon name="reset" size={16}/></button></div><div className="lab-status">{s.phase} · virtual {s.camera === "webcam" ? "VisionPortal" : "Limelight"}</div>
  </aside>;
}
function FrameValues({ state: s, frame, pose, detection: d }: { state: LabState; frame: string; pose: { x: number; y: number; heading: number }; detection?: Detection }) {
  if (!d || (frame.includes("field") && s.pipelines[s.slot].map === "None")) return <p>No reference map or target.</p>;
  let x: number, y: number;
  if (frame === "Target in camera") { x = d.x * .0254; y = d.y * .0254; }
  else if (frame === "Robot in field") { x = s.robot.x * .0254; y = s.robot.y * .0254; }
  else if (frame === "Camera in field") { x = pose.x * .0254; y = pose.y * .0254; }
  else {
    const origin = frame === "Target in robot" ? s.robot : d.tag;
    const target = frame === "Target in robot" ? d.tag : frame === "Camera in target" ? pose : s.robot;
    const angle = radians(frame === "Target in robot" ? s.robot.heading : d.tag.yaw), dx = (target.x - origin.x) * .0254, dy = (target.y - origin.y) * .0254;
    x = dx * Math.sin(angle) - dy * Math.cos(angle); y = dx * Math.cos(angle) + dy * Math.sin(angle);
  }
  return <div className="frame-values"><code>X {x.toFixed(3)} m</code><code>Y {y.toFixed(3)} m</code><span>{frame.includes("field") ? "Field axes" : "+X right · +Y forward"}</span></div>;
}
