import { useEffect, useRef, useState } from "react";
import { examples, segmentLines } from "../course/examples";
import { Icon } from "./Icon";
function JavaLine({ line }: { line: string }) {
  return <>{line.split(/("(?:[^"\\]|\\.)*"|\/\/.*|\b(?:public|private|class|extends|void|if|else|for|while|try|finally|return|new|boolean|double|int|true|false|null|static|final|continue)\b)/g).map((part, i) => <span key={i} className={part.startsWith("//") ? "syntax-comment" : part.startsWith('"') ? "syntax-string" : /^(public|private|class|extends|void|if|else|for|while|try|finally|return|new|boolean|double|int|true|false|null|static|final|continue)$/.test(part) ? "syntax-keyword" : ""}>{part}</span>)}</>;
}
export function CodeWalkthrough({ focus = "limelight:hardware", essentials = false, onDemonstrate }: { focus?: string; essentials?: boolean; onDemonstrate: (effect: string, camera: string) => void }) {
  const [prefix, target] = focus.split(":");
  const initial = essentials && prefix === "limelight" ? "quick" : target === "tank" ? "control" : prefix;
  const [exampleId, setExampleId] = useState(examples[initial] ? initial : "limelight");
  const example = examples[exampleId];
  const [step, setStep] = useState(Math.max(0, example.segments.findIndex(s => s.id === target)));
  const [copied, setCopied] = useState("");
  const active = example.segments[Math.min(step, example.segments.length - 1)];
  const range = segmentLines(example, active), scroller = useRef<HTMLDivElement>(null), lineRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { const el = lineRef.current, parent = scroller.current; if (el && parent) parent.scrollTop = Math.max(0, el.offsetTop - 90); }, [step, exampleId]);
  const change = (id: string) => { setExampleId(id); setStep(0); setCopied(""); };
  const copy = async () => { try { await navigator.clipboard.writeText(example.source); setCopied("Copied complete Java file"); } catch { setCopied("Clipboard unavailable. Use Download Java."); } };
  const tabs = essentials ? [["quick", "Limelight"], ["webcam", "VisionPortal"]] : [["limelight", "Limelight"], ["webcam", "VisionPortal"], ["align", "Limelight turn"], ["control", "FIRST tank sample"]];
  return <section className="code-walkthrough" aria-label="Interactive Java walkthrough">
    <div className="code-tabs">{tabs.map(([id, label]) => <button key={id} aria-pressed={id === exampleId} onClick={() => change(id)}>{label}</button>)}</div>
    <div className="code-header"><span><Icon name="code" size={16}/>{example.file}</span><button onClick={copy}>Copy code</button></div>
    <div className="code-scroll" ref={scroller}>{example.source.split("\n").map((line, i) => {
      const sIndex = example.segments.findIndex(s => { const r = segmentLines(example, s); return i >= r.start && i <= r.end; });
      const selected = i >= range.start && i <= range.end;
      return <button ref={i === range.start ? lineRef : undefined} key={i} className={"code-line " + (selected ? "highlight" : "")} onClick={() => { if (sIndex >= 0) setStep(sIndex); }} tabIndex={sIndex >= 0 ? 0 : -1} aria-label={"Line " + (i + 1) + ": " + line.trim()}><span className="line-number">{i + 1}</span><code><JavaLine line={line || " "}/></code></button>;
    })}</div>
    <div className="code-explanation"><span className="eyebrow">STEP {step + 1} / {example.segments.length}</span><h3>{active.title}</h3><p>{active.explanation}</p><div className="button-row"><button className="button" disabled={step === 0} onClick={() => setStep(step - 1)}>← Step back</button><button className="button" disabled={step === example.segments.length - 1} onClick={() => setStep(step + 1)}>Next step →</button><button className="button primary" onClick={() => onDemonstrate(active.effect, exampleId === "control" ? "webcam" : (exampleId === "align" || exampleId === "quick") ? "limelight" : exampleId)}><Icon name="lab" size={15}/> Show in lab</button></div></div>
    <div className="code-download"><a href={import.meta.env.BASE_URL + "examples/" + example.file} download><Icon name="download" size={15}/> Download Java</a><span role="status">{copied || (exampleId === "control" ? "FIRST sample · original license included" : "Workshop example · hardware validation required")}</span></div>
  </section>;
}
