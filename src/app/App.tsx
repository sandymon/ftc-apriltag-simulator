import { useEffect, useRef, useState } from "react";
import { courseFor } from "../course/course";
import { readProgress, writeProgress } from "../course/progress";
import type { Path } from "../course/types";
import { sources } from "../course/sources";
import { TagDiagram, FlowDiagram, AxesDiagram, Comparison } from "../components/Diagrams";
import { Icon } from "../components/Icon";
import { Simulator } from "../components/Simulator";
import { CodeWalkthrough } from "../components/CodeWalkthrough";
import { TargetDataGuide } from "../components/TargetDataGuide";
import { Challenge, Checklist, Resources, Troubleshooter, UIExplainer } from "../components/Activities";
import { initialLab, tick } from "../simulation/model";

export default function App() {
  const [progress, setProgress] = useState(readProgress);
  const [presenter, setPresenter] = useState(false), [outline, setOutline] = useState(false);
  const [reset, setReset] = useState(false), [answer, setAnswer] = useState<number | null>(null);
  const [lab, setLab] = useState(() => initialLab());
  const [labOpen, setLabOpen] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [endMessage, setEndMessage] = useState(false);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const workshop = progress.mode === "workshop";
  const visibleModules = courseFor(progress.path, progress.mode), lessons = visibleModules.flatMap(m => m.lessons);
  const index = Math.max(0, lessons.findIndex(l => l.id === progress.lesson)), lesson = lessons[index];
  const module = visibleModules.find(m => m.lessons.includes(lesson))!;
  const [expanded, setExpanded] = useState(module.id);
  const minuteStart = visibleModules.slice(0, visibleModules.indexOf(module)).reduce((n, m) => n + m.minutes, 0);
  const count = lessons.filter(l => progress.completed.includes(l.id)).length, percent = Math.round(count / lessons.length * 100);
  const complete = () => setProgress(p => ({ ...p, completed: [...new Set([...p.completed, lesson.id])] }));
  const navigate = (id: string) => {
    const destination = visibleModules.find(m => m.lessons.some(l => l.id === id));
    setProgress(p => ({ ...p, lesson: id })); setExpanded(destination?.id ?? "");
    setAnswer(null); setEndMessage(false); setOutline(false);
    setLab(s => destination && destination.path !== "shared" && destination.path !== s.camera ? initialLab(destination.path) : { ...s, assist: false });
    heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0 });
  };
  const next = () => { if (lesson.kind !== "quiz" && lesson.kind !== "challenge") complete(); if (index < lessons.length - 1) navigate(lessons[index + 1].id); else setEndMessage(true); };
  const changePath = (path: Path) => { const ids = courseFor(path).flatMap(m => m.lessons).map(l => l.id); setProgress(p => ({ ...p, path, lesson: ids.includes(p.lesson) ? p.lesson : "compare" })); setAnswer(null); setEndMessage(false); setLab(s => path !== "both" && path !== s.camera ? initialLab(path) : { ...s, assist: false }); };
  const changeMode = (mode: "workshop" | "reference") => {
    setProgress(p => ({ ...p, mode, lesson: "welcome" })); setExpanded("welcome");
    setAnswer(null); setEndMessage(false); setLabOpen(false); setLab(s => ({ ...s, running: false, assist: false, phase: "Paused" }));
  };
  useEffect(() => { if (!writeProgress(progress)) queueMicrotask(() => setStorageWarning(true)); }, [progress]);
  useEffect(() => {
    if (!lab.running) return;
    const timer = window.setInterval(() => setLab(s => tick(s)), 80);
    return () => window.clearInterval(timer);
  }, [lab.running]);
  useEffect(() => {
    if (!lab.running || lab.phase !== "Opening camera") return;
    const timer = window.setTimeout(() => setLab(s => ({ ...s, phase: "Streaming" })), 400);
    return () => window.clearTimeout(timer);
  }, [lab.running, lab.phase]);
  useEffect(() => {
    const release = () => setLab(s => ({ ...s, assist: false }));
    window.addEventListener("blur", release); document.addEventListener("visibilitychange", release);
    return () => { window.removeEventListener("blur", release); document.removeEventListener("visibilitychange", release); };
  }, []);
  useEffect(() => { if (reset) resetDialog.current?.showModal(); else resetDialog.current?.close(); }, [reset]);
  const closeLab = () => { setLabOpen(false); setLab(s => ({ ...s, assist: false, running: false, phase: "Paused" })); };
  const openLab = () => {
    const desiredCamera = module.path === "shared" ? lab.camera : module.path;
    if (desiredCamera !== lab.camera) setLab(initialLab(desiredCamera));
    setLabOpen(true);
  };
  const demonstrate = (effect: string, camera: string) => {
    setLabOpen(true);
    setLab(old => {
      const nextLab = old.camera === camera ? { ...old, assist: false } : initialLab(camera === "webcam" ? "webcam" : "limelight");
      if (effect === "stop") return { ...nextLab, running: false, phase: "Closed", assist: false };
      if (effect === "hardware") return { ...nextLab, hardware: nextLab.camera === "webcam" ? "Webcam 1" : "limelight", phase: "Hardware mapped", running: false };
      if (effect === "processor") return { ...nextLab, processor: true, attached: false, phase: "Processor ready", running: false };
      if (effect === "portal") return { ...nextLab, processor: true, attached: true, phase: "Opening camera", running: true };
      if (effect === "wait") return { ...nextLab, phase: "Waiting for Start", running: false };
      if (effect === "pipeline") return { ...nextLab, slot: 0, captures: [], phase: "Pipeline 0 selected", running: false };
      return { ...nextLab, running: true, phase: "Streaming", processor: true, attached: true };
    });
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setPresenter(false); setOutline(false); setReset(false); return; }
      if (e.ctrlKey || e.metaKey || e.altKey || (e.target instanceof Element && e.target.closest("input,select,textarea,button,[role=dialog]"))) return;
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft" && index > 0) { e.preventDefault(); navigate(lessons[index - 1].id); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });
  const source = sources[lesson.source];
  return <div className={"app " + progress.theme + (presenter ? " presenter" : "") + (progress.reducedMotion ? " reduce-motion" : "")}>
    <a href="#lesson" className="skip-link">Skip to lesson</a>
    <header className="app-header">
      <button className="icon-button mobile-menu" aria-label="Toggle course outline" onClick={() => setOutline(!outline)}><Icon name="menu"/></button>
      <a className="brand" href="#welcome" onClick={e => { e.preventDefault(); navigate("welcome"); }}><span className="brand-mark"><Icon name="target" size={26}/></span><span>AprilTag <b>Lab</b><small>FTC STAFF WORKSHOP</small></span></a>
      <div className="header-center"><span className="header-divider"/><Icon name="book" size={16}/><span>{workshop ? "30 minutes · camera to code" : "Optional reference library"}</span></div>
      <div className="header-actions"><button className="icon-button" aria-label="Toggle light theme" onClick={() => setProgress(p => ({ ...p, theme: p.theme === "dark" ? "light" : "dark" }))}><Icon name="sun"/></button><button className={presenter ? "button active" : "button"} onClick={() => setPresenter(!presenter)} aria-pressed={presenter}><Icon name="screen" size={17}/>{presenter ? "Exit presenter" : "Presenter mode"}</button></div>
    </header>
    <div className={"app-layout " + (labOpen ? "with-lab" : "")}>
      <aside className={"course-sidebar " + (outline ? "open" : "")} aria-label="Course outline">
        <div className="sidebar-heading"><span className="eyebrow">{workshop ? "THE 30-MINUTE WORKSHOP" : "OPTIONAL REFERENCE"}</span><span className="small-badge">{visibleModules.length} modules</span></div>
        <div className="course-mode"><label htmlFor="course-mode">Course view</label><select id="course-mode" value={progress.mode} onChange={e => changeMode(e.target.value as "workshop" | "reference")}><option value="workshop">Workshop · 30 minutes</option><option value="reference">Reference library · optional</option></select></div>
        {!workshop && <div className="path-tabs" aria-label="Camera path">{(["both", "webcam", "limelight"] as Path[]).map(path => <button key={path} aria-pressed={progress.path === path} onClick={() => changePath(path)}>{path === "both" ? "Both" : path === "webcam" ? "Webcam" : "Limelight"}</button>)}</div>}
        <nav className="module-list">{visibleModules.map(m => { const open = expanded === m.id; const finished = m.lessons.every(l => progress.completed.includes(l.id)); return <div className={"module-item " + (module.id === m.id ? "current" : "")} key={m.id}>
          <button className="module-button" aria-label={m.label + " " + m.title} aria-expanded={open} onClick={() => { if (module.id === m.id) setExpanded(open ? "" : m.id); else navigate(m.lessons[0].id); }}><span className={"module-number " + (finished ? "finished" : "")}>{finished ? <Icon name="check" size={15}/> : m.label}</span><span><strong>{m.title}</strong><small>{m.lessons.length} {m.lessons.length === 1 ? "lesson" : "lessons"} · {m.minutes} min</small></span><Icon name="chevron" size={14}/></button>
          {open && <div className="lesson-links">{m.lessons.map(l => <button key={l.id} aria-current={lesson.id === l.id ? "step" : undefined} onClick={() => navigate(l.id)}><span className={"lesson-dot " + (progress.completed.includes(l.id) ? "finished" : "")}>{progress.completed.includes(l.id) ? "✓" : ""}</span>{l.title}</button>)}</div>}
        </div>; })}</nav>
        <div className="sidebar-bottom"><div className="progress-label"><span>Your progress</span><strong>{percent}%</strong></div><progress value={count} max={lessons.length}/><small>{count} of {lessons.length} lessons complete</small><button className="text-button" onClick={() => setReset(true)}><Icon name="reset" size={14}/> Reset progress</button></div>
      </aside>
      <main className="course-main">
        <div className="course-topline"><span>THE WORKSHOP <Icon name="chevron" size={12}/> {module.title}</span><button className={"button " + (labOpen ? "active" : "")} onClick={labOpen ? closeLab : openLab} aria-pressed={labOpen}><Icon name="lab" size={16}/>{labOpen ? "Hide lab" : "Open camera lab"}</button></div>
        {storageWarning && <p className="feedback">Browser storage is unavailable. Progress will last for this session only.</p>}
        <div className="lesson-layout"><article className={"lesson-stage kind-" + lesson.kind} id="lesson">
          <div className="slide-meta"><span className="eyebrow">{workshop ? minuteStart + "–" + (minuteStart + module.minutes) + " MIN" : "MODULE " + module.label} <i/> {lesson.kind === "code" ? "CODE WALKTHROUGH" : lesson.kind === "challenge" ? "HANDS-ON LAB" : "GUIDED LESSON"}</span><span>{String(module.lessons.indexOf(lesson) + 1).padStart(2, "0")} / {String(module.lessons.length).padStart(2, "0")}</span></div>
          <h1 ref={heading} tabIndex={-1}>{lesson.title}</h1><p className="lesson-subtitle">{lesson.subtitle}</p>
          <div className="lesson-visual">{lesson.kind === "tag" ? <TagDiagram/> : lesson.kind === "axes" ? <AxesDiagram/> : lesson.kind === "compare" ? <Comparison/> : lesson.kind === "flow" ? <FlowDiagram webcam={module.path === "webcam"}/> : null}</div>
          {lesson.kind === "code" && <CodeWalkthrough key={lesson.id} essentials={workshop} focus={lesson.focus} onDemonstrate={demonstrate}/>}
          {lesson.kind === "measurements" && <TargetDataGuide camera={lesson.focus === "webcam" ? "webcam" : "limelight"}/>}
          {lesson.kind === "ui" && <UIExplainer key={lesson.id} focus={lesson.focus} essentials={workshop} state={lab} setState={setLab} onOpen={openLab}/>}
          {lesson.kind === "challenge" && <Challenge key={lesson.id} focus={lesson.focus} state={lab} setState={setLab} onOpen={openLab} onComplete={complete}/>}
          {lesson.kind === "troubleshoot" && <Troubleshooter key={lesson.id} focus={lesson.focus}/>}
          {lesson.kind === "checklist" && <Checklist key={lesson.id}/>}
          {lesson.kind === "resources" && <Resources essentials={workshop} onReference={() => changeMode("reference")}/>}
          {lesson.id === "ll-hardware" && <aside className="usb-warning" role="note" aria-label="USB port recommendation"><strong>Recommendation: use the blue USB 3.0 port</strong><p>Limelight specifies USB 3.0, and REV lists Limelight 3A as “USB 3.0 only.” One reason to avoid the Control Hub's USB 2.0 port is its documented ESD vulnerability: that port shares a bus with the internal Wi-Fi radio, so an ESD event or electrical interference can disconnect the Driver Hub. USB 3.0 also provides more bandwidth headroom.</p><div><a href="https://docs.limelightvision.io/docs/docs-limelight/getting-started/limelight-3a" target="_blank" rel="noreferrer">Limelight wiring guidance <Icon name="external" size={12}/></a><a href="https://docs.revrobotics.com/duo-control/sensors/5v-sensors/sensor-compatibility-chart" target="_blank" rel="noreferrer">REV compatibility table <Icon name="external" size={12}/></a><a href="https://ftc-docs.firstinspires.org/en/latest/tech_tips/tech-tips/tech-tip-hub-tips/tech-tip-hub-tips.html" target="_blank" rel="noreferrer">FTC USB/ESD note <Icon name="external" size={12}/></a></div></aside>}
          {lesson.quiz ? <section className="quiz"><h2>{lesson.quiz.question}</h2>{lesson.quiz.options.map((option, i) => <button key={option} className={answer === i ? "selected" : ""} onClick={() => { setAnswer(i); if (i === lesson.quiz!.answer) complete(); }}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}{answer !== null && <p role="status" className={answer === lesson.quiz.answer ? "feedback success" : "feedback"}>{answer === lesson.quiz.answer ? "Correct. " + lesson.quiz.explanation : "Not quite. Try another answer."}</p>}</section> : <div className="lesson-points">{lesson.points.map((point, i) => <div key={point}><span className="point-number">{String(i + 1).padStart(2, "0")}</span><p>{point}</p></div>)}</div>}
          <div className="takeaway"><Icon name="target" size={20}/><div><span>TAKE THIS WITH YOU</span><p>{lesson.takeaway}</p></div></div>
          {presenter && <details className="speaker-notes"><summary className="eyebrow">FACILITATOR NOTES</summary><p>{lesson.note}</p></details>}
          <div className="slide-source"><span>REFERENCE</span><a href={source.url} target="_blank" rel="noreferrer">{source.title} <Icon name="external" size={12}/></a></div>
        </article>{labOpen && <Simulator state={lab} setState={setLab} focus={lesson.focus} onClose={closeLab}/>}</div>
        <footer className="lesson-footer"><button className="button previous" disabled={index === 0} onClick={() => navigate(lessons[index - 1].id)}><span className="rotate"><Icon name="arrow" size={18}/></span> Previous</button><div className="footer-progress"><span>LESSON {index + 1} OF {lessons.length}</span><span>{progress.completed.includes(lesson.id) ? "✓ Completed" : "Go at your own pace"}</span></div><button className="button primary" onClick={next}>{index === lessons.length - 1 ? "Finish lesson" : "Next lesson"}<Icon name="arrow" size={18}/></button></footer>
        <div className="course-footnote"><span>Built for learning. Test on your robot.</span><label><input type="checkbox" checked={progress.reducedMotion} onChange={e => setProgress(p => ({ ...p, reducedMotion: e.target.checked }))}/> Reduce motion</label></div>
        {endMessage && <p role="status" className="feedback success">{count === lessons.length ? "Course complete. Your examples and checklist are ready to take to the robot." : "You reached the end. Revisit unfinished quizzes and challenges in the outline to complete your path."}</p>}
      </main>
    </div>
    <dialog ref={resetDialog} aria-labelledby="reset-title" className="modal" onCancel={() => setReset(false)}><h2 id="reset-title">Start this course again?</h2><p>This clears lesson completion on this browser.</p><div className="button-row"><button autoFocus className="button" onClick={() => setReset(false)}>Keep progress</button><button className="button danger" onClick={() => { setProgress(p => ({ ...p, completed: [], lesson: "welcome" })); setAnswer(null); setReset(false); }}>Reset course</button></div></dialog>
  </div>;
}
