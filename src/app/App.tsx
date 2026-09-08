import { useEffect, useMemo, useRef, useState } from "react";
import lightFieldImage from "../../decode-custom-field-images-meepmeep-compatible-printer-v0-9m6dg4eqoonf1.webp";
import darkFieldImage from "../../decode-custom-field-images-meepmeep-compatible-printer-v0-nlvmv6rqoonf1.webp";

type Point = { x: number; y: number };
type Tag = Point & { id: number };
const SIZE = 141, HALF = SIZE / 2;
const steps = [
  ["Choose a camera", "Limelight reports tx/ty angles. VisionPortal reports an AprilTag pose in your selected distance unit."],
  ["Match the hardware name", "This case-sensitive name must exactly match the Robot Configuration: “limelight” or “Webcam 1” in this workshop."],
  ["Select an AprilTag pipeline", "Pipeline 0 recognizes the FTC 36h11 family. A color or neural pipeline cannot return fiducials."],
  ["Set tag size and ID filter", "Size is measured edge-to-edge. The optional filter ignores every tag except the IDs your robot needs."],
  ["Start and verify", "Run the OpMode. A valid result requires a started camera, correct pipeline, and a visible allowed tag."],
];
const code = `@TeleOp(name = "AprilTag Workshop")
public class AprilTagWorkshop extends LinearOpMode {
  @Override public void runOpMode() {
    Limelight3A limelight = hardwareMap.get(
      Limelight3A.class, "limelight");
    limelight.pipelineSwitch(0);
    limelight.start();
    waitForStart();

    while (opModeIsActive()) {
      LLResult result = limelight.getLatestResult();
      if (result != null && result.isValid()) {
        telemetry.addData("tx", result.getTx());
      }
      telemetry.update();
    }
  }
}`;

const Metric = ({ label, value, unit = "" }: { label: string; value: string; unit?: string }) => <div className="metric"><span>{label}</span><strong>{value}<small>{unit}</small></strong></div>;

function Field({ robot, tags, selectedId, setRobot, setTag, select, dark, setDark, addTag, removeTag, tagToAdd, setTagToAdd }: { robot: Point; tags: Tag[]; selectedId: number; setRobot: (p: Point) => void; setTag: (id: number, p: Point) => void; select: (id: number) => void; dark: boolean; setDark: (dark: boolean) => void; addTag: () => void; removeTag: () => void; tagToAdd: number; setTagToAdd: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<"robot" | number | null>(null);
  const css = (p: Point) => ({ left: `${(p.x + HALF) / SIZE * 100}%`, top: `${(HALF - p.y) / SIZE * 100}%` });
  const move = (x: number, y: number) => {
    if (drag === null || !ref.current) return;
    const b = ref.current.getBoundingClientRect();
    const p = { x: Math.max(-HALF, Math.min(HALF, (x - b.left) / b.width * SIZE - HALF)), y: Math.max(-HALF, Math.min(HALF, HALF - (y - b.top) / b.height * SIZE)) };
    if (drag === "robot") setRobot(p);
    else setTag(drag, p);
  };
  return <div className="field-shell">
    <div className="ruler ruler-x"><span>-70.5</span><span>-47</span><span>-23.5</span><b>0</b><span>23.5</span><span>47</span><span>70.5 in</span></div>
    <div className="ruler ruler-y"><span>+70.5</span><span>+47</span><span>+23.5</span><b>0</b><span>-23.5</span><span>-47</span><span>-70.5</span></div>
    <div className="field" ref={ref} onPointerMove={e => move(e.clientX, e.clientY)} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)} role="application" aria-label="Interactive 141 inch FTC field">
      <img className="field-image" src={dark ? darkFieldImage : lightFieldImage} alt="" draggable="false" />
      <div className="field-origin"><i className="axis-x"/><i className="axis-y"/><span>0,0</span></div><div className="alliance red-alliance">RED WALL</div><div className="alliance blue-alliance">BLUE WALL</div>
      <button className="robot" style={css(robot)} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setDrag("robot"); }} aria-label={`Robot X ${robot.x.toFixed(1)}, Y ${robot.y.toFixed(1)}`}><i/><span>ROBOT</span></button>
      {tags.map(t => <button key={t.id} className={`tag ${t.id === selectedId ? "selected" : ""}`} style={css(t)} onClick={() => select(t.id)} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); select(t.id); setDrag(t.id); }} aria-label={`AprilTag ${t.id} X ${t.x.toFixed(1)}, Y ${t.y.toFixed(1)}`}><img src={`${import.meta.env.BASE_URL}apriltags/tag-${t.id}-36h11.png`} alt="" draggable="false"/><span>{t.id}</span><small>CENTER</small></button>)}
    </div><div className="field-caption"><span>Inside: <b>141 × 141 in</b></span><span>Origin: <b>field center</b></span><button className="field-theme" onClick={() => setDark(!dark)} aria-pressed={dark}>{dark ? "☾ Dark field" : "☀ Light field"}</button></div>
    <div className="tag-controls"><span><b>{tags.length}</b> TAG{tags.length === 1 ? "" : "S"} · SELECTED <b>{tags.length ? selectedId : "NONE"}</b></span><label>TAG TO ADD<select aria-label="Tag to add" value={tagToAdd} onChange={e => setTagToAdd(Number(e.target.value))}>{[20,21,22,23,24].map(id => <option key={id} value={id} disabled={tags.some(tag => tag.id === id)}>ID {id}{tags.some(tag => tag.id === id) ? " · on field" : ""}</option>)}</select></label><button onClick={addTag} disabled={tags.some(tag => tag.id === tagToAdd)}>＋ Add <kbd>A</kbd></button><button className="remove-tag" onClick={removeTag} disabled={tags.length === 0}>− Remove <kbd>Del / ⌫</kbd></button></div>
  </div>;
}

function App() {
  const [camera, setCamera] = useState("Limelight 3A"), [name, setName] = useState("limelight"), [pipeline, setPipeline] = useState(0), [tagSize, setTagSize] = useState(2), [filter, setFilter] = useState(""), [running, setRunning] = useState(false), [step, setStep] = useState(0);
  const [robot, setRobot] = useState<Point>({ x: -28, y: -30 }), [tags, setTags] = useState<Tag[]>([{id:20,x:42,y:48},{id:21,x:-48,y:48},{id:22,x:0,y:50},{id:23,x:-45,y:-48},{id:24,x:43,y:-48}]), [selectedId, select] = useState(20), [darkField, setDarkField] = useState(true), [tagToAdd, setTagToAdd] = useState(20);
  const tag = tags.find(t => t.id === selectedId);
  const dx = (tag?.x ?? robot.x) - robot.x, dy = (tag?.y ?? robot.y) - robot.y, distance = Math.hypot(dx,dy), tx = Math.atan2(dx,dy)*180/Math.PI;
  const configured = name === (camera === "Limelight 3A" ? "limelight" : "Webcam 1") && pipeline === 0 && tagSize > 0;
  const allowed = !filter.trim() || filter.split(",").map(Number).includes(selectedId), valid = running && configured && allowed && Boolean(tag);
  const message = useMemo(() => !running ? "Complete the setup, then run the OpMode." : !tag ? "No AprilTag is on the field. Choose an ID and press A to add one." : !configured ? "Configuration mismatch — review the highlighted lesson step." : !allowed ? `Tag ${selectedId} is excluded by the ID filter.` : `Camera started. Tag ${selectedId} center detected.`, [running,tag,configured,allowed,selectedId]);
  const setTag = (id:number,p:Point) => setTags(old => old.map(t => t.id === id ? {...t,...p}:t));
  const addTag = () => {
    const id = tagToAdd;
    if (tags.some(tag => tag.id === id)) return;
    const offset = tags.length * 8 - 16;
    setTags(old => [...old, { id, x: offset, y: offset }]);
    select(id);
  };
  const removeTag = () => {
    if (tags.length === 0) return;
    const remaining = tags.filter(item => item.id !== selectedId);
    setTags(remaining);
    setTagToAdd(selectedId);
    if (remaining.length) select(remaining[0].id);
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if ((target instanceof Element && target.matches("input, select, textarea, [contenteditable='true']")) || event.ctrlKey || event.metaKey || event.altKey) return;
      if ((event.key === "Delete" || event.key === "Backspace") && tags.length > 0) {
        event.preventDefault();
        removeTag();
      } else if (event.key.toLowerCase() === "a" && !tags.some(item => item.id === tagToAdd)) {
        event.preventDefault();
        addTag();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
  return <main>
    <header className="topbar"><div><p className="eyebrow">FTC STAFF WORKSHOP · LESSON 1 OF 6</p><h1>AprilTag Camera Lab</h1></div><div className={`status ${running ? "live":""}`}><i/>{running ? "OPMODE RUNNING":"CONFIGURATION MODE"}</div></header>
    <div className="lesson-progress">{["CAMERA","TAG ID","VALUES","DISTANCE","ALIGN","SAFETY"].map((x,i)=><span key={x} className={i===0?"active":""}>{i+1}<small>{x}</small></span>)}</div>
    <section className="workspace">
      <aside className="panel lesson-panel"><div className="panel-heading"><span>01</span><div><p>GUIDED LESSON</p><h2>Configure the camera</h2></div></div>
        <div className="step-list">{steps.map((s,i)=><button key={s[0]} className={step===i?"current":step>i?"done":""} onClick={()=>setStep(i)}><b>{step>i?"✓":i+1}</b><span>{s[0]}</span></button>)}</div>
        <div className="coach-card"><p>STEP {step+1} EXPLAINED</p><h3>{steps[step][0]}</h3><span>{steps[step][1]}</span></div>
        <label className={step===0?"focus-field":""}>Camera type<select value={camera} onChange={e=>{setCamera(e.target.value);setName(e.target.value==="Limelight 3A"?"limelight":"Webcam 1")}}><option>Limelight 3A</option><option>Webcam / VisionPortal</option></select><small>{camera==="Limelight 3A"?"Network-connected smart camera":"USB camera processed by Control Hub"}</small></label>
        <label className={step===1?"focus-field":""}>Hardware name<input value={name} onChange={e=>setName(e.target.value)}/><small>Case-sensitive Robot Configuration name</small></label>
        <div className="form-row"><label className={step===2?"focus-field":""}>Pipeline<input type="number" value={pipeline} onChange={e=>setPipeline(Number(e.target.value))}/><small>0 = AprilTag 36h11</small></label><label>Tag family<select><option>36h11</option></select><small>FTC standard family</small></label></div>
        <div className="form-row"><label className={step===3?"focus-field":""}>Tag size (in)<input type="number" min=".1" step=".1" value={tagSize} onChange={e=>setTagSize(Number(e.target.value))}/></label><label className={step===3?"focus-field":""}>ID filter<input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Blank = all"/></label></div>
        <div className="lesson-actions"><button disabled={!step} onClick={()=>setStep(s=>s-1)}>← Back</button><button className="next" disabled={step===4} onClick={()=>setStep(s=>s+1)}>Next step →</button></div>
      </aside>
      <section className="panel editor-panel"><div className="panel-heading"><span>JAVA</span><div><p>TEAMCODE · LIVE PREVIEW</p><h2>AprilTagWorkshop.java</h2></div></div><pre className="editor" tabIndex={0}><code>{code}</code></pre><div className="runbar"><button className="run" onClick={()=>{setRunning(true);setStep(4)}} disabled={running}>▶ Run OpMode</button><button onClick={()=>setRunning(false)} disabled={!running}>■ Stop</button><button className="reset" onClick={()=>{setRunning(false);setRobot({x:-28,y:-30})}}>↻ Reset</button></div></section>
      <aside className="right-column">
        <section className="panel sim-panel"><div className="panel-heading"><span>FIELD</span><div><p>FTC COORDINATE SYSTEM</p><h2>Interactive field simulator</h2></div></div><Field robot={robot} tags={tags} selectedId={selectedId} setRobot={setRobot} setTag={setTag} select={select} dark={darkField} setDark={setDarkField} addTag={addTag} removeTag={removeTag} tagToAdd={tagToAdd} setTagToAdd={setTagToAdd}/></section>
        <section className="panel data-panel"><div className="data-heading"><h2>Camera measurements</h2><span className={valid?"valid":"waiting"}>{valid?"● VALID":"○ NO RESULT"}</span></div><div className="metrics"><Metric label="TAG ID" value={valid?String(selectedId):"—"}/><Metric label="TX · CENTER" value={valid?tx.toFixed(1):"—"} unit="°"/><Metric label="TY" value={valid?"-3.1":"—"} unit="°"/><Metric label="AREA" value={valid?Math.min(99,9000/(distance*distance)).toFixed(1):"—"} unit="%"/><Metric label="LATENCY" value={valid?"14":"—"} unit="ms"/><Metric label="DISTANCE" value={valid?distance.toFixed(1):"—"} unit="in"/></div></section>
        <section className="panel telemetry"><div className="data-heading"><h2>Coach & telemetry</h2><span>{configured?"CONFIG OK":"CHECK SETUP"}</span></div><p className={valid?"success":""}><b>{valid?"SUCCESS":"STATUS"}</b> {message}</p></section>
      </aside>
    </section><footer>FTC coordinates use the field center as (0,0). Measurements target the center of the selected AprilTag.</footer>
  </main>;
}
export default App;
