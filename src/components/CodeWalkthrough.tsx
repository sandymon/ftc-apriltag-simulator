import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { examples, segmentLines } from "../course/examples";
import { walkthroughs } from "../course/codeOutline";
import { Icon } from "./Icon";
import { TankMotionDemo } from "./TankMotionDemo";
function JavaLine({ line }: { line: string }) {
  return <>{line.split(/("(?:[^"\\]|\\.)*"|\/\/.*|\b(?:public|private|class|extends|void|if|else|for|while|try|finally|return|new|boolean|double|int|true|false|null|static|final|continue)\b)/g).map((part, i) => <span key={i} className={part.startsWith("//") ? "syntax-comment" : part.startsWith('"') ? "syntax-string" : /^(public|private|class|extends|void|if|else|for|while|try|finally|return|new|boolean|double|int|true|false|null|static|final|continue)$/.test(part) ? "syntax-keyword" : ""}>{part}</span>)}</>;
}
export function CodeWalkthrough({ focus = "limelight:hardware", essentials = false, onDemonstrate }: { focus?: string; essentials?: boolean; onDemonstrate: (effect: string, camera: string) => void }) {
  const [prefix, target] = focus.split(":");
  const initial = essentials && prefix === "limelight" ? "quick" : target === "tank" ? "control" : prefix;
  const [exampleId, setExampleId] = useState(examples[initial] ? initial : "limelight");
  const example = examples[exampleId];
  const { steps, sections } = walkthroughs[exampleId];
  const [step, setStep] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState("");
  const active = steps[Math.min(step, steps.length - 1)];
  const range = segmentLines(example, active), scroller = useRef<HTMLDivElement>(null), lineRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { const el = lineRef.current, parent = scroller.current; if (el && parent) parent.scrollTop = Math.max(0, el.offsetTop - 60); }, [step, exampleId, expanded, zoom]);
  useEffect(() => {
    if (!expanded) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [expanded]);
  const change = (id: string) => { setExampleId(id); setStep(0); setCopied(""); };
  const copy = async () => { try { await navigator.clipboard.writeText(example.source); setCopied("Copied complete Java file"); } catch { setCopied("Clipboard unavailable. Use Download Java."); } };
  const tabs = essentials ? [["quick", "Limelight"], ["mecanum", "Mecanum assist"], ["webcam", "Webcam basics"], ["control", "Webcam tank"]] : [["limelight", "Limelight"], ["mecanum", "Mecanum assist"], ["webcam", "Webcam basics"], ["control", "Webcam tank"], ["align", "Limelight turn"]];
  const content = <section className="code-walkthrough" aria-label="Interactive Java walkthrough" style={{ "--code-font-size": `${12 * zoom / 100}px` } as CSSProperties}>
    <div className="code-tabs">{tabs.map(([id, label]) => <button key={id} aria-pressed={id === exampleId} onClick={() => change(id)}>{label}</button>)}</div>
    <div className="code-header"><span><Icon name="code" size={16}/>{example.file}</span><div className="code-view-controls"><button aria-label="Zoom out code" disabled={zoom <= 70} onClick={() => setZoom(value => value - 10)}>−</button><button aria-label="Reset code zoom" onClick={() => setZoom(100)}>{zoom}%</button><button aria-label="Zoom in code" disabled={zoom >= 180} onClick={() => setZoom(value => value + 10)}>+</button><button onClick={() => setExpanded(value => !value)}>{expanded ? "Close expanded view" : "Expand code"}</button><button onClick={copy}>Copy code</button></div></div>
    <nav className="code-sections" aria-label="Code sections">{sections.map((section, i) => <button key={section.title} aria-pressed={active.section === section.title} onClick={() => setStep(section.firstStep)}><small>{i + 1}</small> {section.title}</button>)}</nav>
    <div className="code-reading-layout">
    <div className="code-scroll" ref={scroller}>{example.source.split("\n").map((line, i) => {
      const matches = (s: typeof active) => { const r = segmentLines(example, s); return i >= r.start && i <= r.end; };
      let sIndex = steps.findIndex(s => !s.overview && matches(s));
      if (sIndex < 0) sIndex = steps.findIndex(matches);
      const selected = i >= range.start && i <= range.end;
      return <button ref={i === range.start ? lineRef : undefined} key={i} className={"code-line " + (selected ? "highlight" : "")} onClick={() => { if (sIndex >= 0) setStep(sIndex); }} tabIndex={sIndex >= 0 ? 0 : -1} aria-label={"Line " + (i + 1) + ": " + line.trim()}><span className="line-number">{i + 1}</span><code><JavaLine line={line || " "}/></code></button>;
    })}</div>
    <div className="code-explanation"><span className="eyebrow">{active.section} · {active.overview ? "OVERVIEW" : "INSIDE THE CODE"} · STEP {step + 1} / {steps.length}</span><h3>{active.title}</h3>{active.explanation.includes("\n") ? <ul className="step-summary">{active.explanation.split("\n").map(point => <li key={point}>{point}</li>)}</ul> : <p>{active.explanation}</p>}{exampleId === "control" && active.id === "mix" && <TankMotionDemo/>}<div className="button-row"><button className="button" disabled={step === 0} onClick={() => setStep(step - 1)}>← Step back</button><button className="button" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>{active.overview ? "Explore section →" : "Next step →"}</button>{active.effect && <button className="button primary" onClick={() => { setExpanded(false); onDemonstrate(active.effect, exampleId === "control" ? "webcam" : (exampleId === "align" || exampleId === "quick") ? "limelight" : exampleId); }}><Icon name="lab" size={15}/> Show in lab</button>}</div></div>
    </div>
    <div className="code-download"><a href={import.meta.env.BASE_URL + "examples/" + example.file} download><Icon name="download" size={15}/> Download Java</a><span role="status">{copied || (exampleId === "control" ? "FIRST sample · original license included" : "Workshop example · hardware validation required")}</span></div>
  </section>;
  return expanded ? createPortal(<dialog ref={dialog} role="dialog" className="code-expanded-dialog" aria-label="Expanded code walkthrough" onCancel={event => { event.preventDefault(); setExpanded(false); }}>{content}</dialog>, document.querySelector(".app") ?? document.body) : content;
}



