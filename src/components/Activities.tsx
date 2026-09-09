import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LabState } from "../simulation/model";
import { commands, primary, reported } from "../simulation/model";
import { inputGuidance, inputs } from "../course/inputs";
import { sources } from "../course/sources";

import { Icon } from "./Icon";
type Shared = { state: LabState; setState: Dispatch<SetStateAction<LabState>>; onOpen: () => void };
export function UIExplainer({ focus = "pipeline", essentials = false }: { focus?: string; essentials?: boolean }) {
  const [active, setActive] = useState(focus);
  const input = inputs.find(i => i.id === active) ?? inputs[0];
  const group = input.group, image = group === "Input" ? "input" : group === "Configuration" ? "configuration" : "advanced";
  const asset = import.meta.env.BASE_URL + "lesson-assets/limelight-" + image + ".png";
  const workshopInput = ["pipeline", "type", "source", "resolution", "orientation", "exposure", "gain", "flicker"];
  const items = inputs.filter(i => i.group === group && (!essentials || group === "Configuration" || workshopInput.includes(i.id)));
  const guidance = inputGuidance[input.id];
  return <section className="ui-explainer"><div className="lab-tabs">{(essentials ? ["Input", "Configuration"] : ["Input", "Configuration", "Advanced"]).map(g => <button key={g} aria-pressed={group === g} onClick={() => setActive(inputs.find(i => i.group === g)!.id)}>{g}</button>)}</div>
    <div className={"ui-reference image-" + image}><a href={asset} target="_blank" rel="noreferrer" title="Open full-size reference screenshot"><img src={asset} alt={"LimelightOS " + group + " tab from the supplied Spring 2026 training deck"}/></a></div>
    <p className="asset-caption">Reference UI · Spring 2026 deck · OS version unspecified · <a href={asset} target="_blank" rel="noreferrer">View full size ↗</a></p>
    <div className="hotspot-list" aria-label="Explain a UI control">{items.map((item, i) => <button key={item.id} aria-pressed={active === item.id} onClick={() => setActive(item.id)}><span>{i + 1}</span>{item.label}</button>)}</div>
    <div className="input-explanation"><div><span className="eyebrow">{group.toUpperCase()} / {input.unit}</span><h3>{input.label}</h3><p>{input.meaning}</p>{guidance && <div className="setting-guidance"><section><h4>Recommended starting point</h4><p>{guidance.recommendation}</p></section><div className="pros-cons"><section><h4>Advantages</h4><p>{guidance.pros}</p></section><section><h4>Tradeoffs</h4><p>{guidance.cons}</p></section></div>{guidance.choices && <div className="choice-guide"><h4>Options</h4>{guidance.choices.map(choice => <div key={choice.option}><strong>{choice.option}</strong><span>{choice.useWhen}</span><small>{choice.tradeoff}</small></div>)}</div>}</div>}<p className="input-caution"><strong>Watch for:</strong> {input.mistake}</p></div></div>
    {active === "map" && <figure className="ui-reference"><img src={import.meta.env.BASE_URL + "lesson-assets/limelight-visualizer.png"} alt="Limelight field visualizer reference showing robot, camera, and tag coordinate frames"/><figcaption className="asset-caption">Field visualizer reference from the approved training deck. A known map and measured camera mounting pose connect these coordinate frames.</figcaption></figure>}
    <p className="lab-fineprint">Screenshot values are examples from the source deck, not recommended settings for your robot.</p>
  </section>;
}
export function Challenge({ focus = "visible", state: s, setState, onOpen, onComplete }: Shared & { focus?: string; onComplete: () => void }) {
  const [feedback, setFeedback] = useState(""), [passed, setPassed] = useState(false), [assembly, setAssembly] = useState(0);
  const hasHeld = useRef(false);
  useEffect(() => { if (s.assist) hasHeld.current = true; }, [s.assist]);
  const d = primary(s, reported(s)), p = s.pipelines[s.slot], c = commands(s, d);
  const check = () => {
    let success: boolean, reason: string;
    if (focus === "assembly") { success = assembly === 3; reason = "Create the processor, attach it, then build the portal."; }
    else if (focus === "size") { success = !!d?.valid && Math.abs(p.size - 50.8) > 5; reason = "Run the camera, then change Marker size away from 50.8 mm and inspect the estimated range."; }
    else if (focus === "filter") { success = !!d?.valid && d.id === 20 && p.filter.trim() === "20"; reason = "Set ID filter to 20 and get a valid result."; }
    else if (focus === "align" || focus === "angles") { success = !!d?.valid && Math.abs(d.tx) <= 2; reason = "Bring the horizontal angle within 2° of zero."; }
    else if (focus === "approach") { success = !!d?.valid && Math.abs(d.bearing) <= 2 && Math.abs(d.range - 12) <= 1; reason = "Reach 12 inches ±1 inch and a heading error within 2°."; }
    else if (focus === "fault") { success = s.running && !d?.valid && c.drive === 0 && c.turn === 0; reason = "While running, create a lost/invalid target and verify zero automatic outputs."; }
    else if (focus === "gain") { success = !!d?.valid && s.turnGain !== .01 && s.turnGain > 0; reason = "Get a valid target and change Turn gain from the starting value of 0.01."; }
    else if (focus === "assist") { success = hasHeld.current && s.running && !s.assist && c.turn === 0 && c.drive === 0; reason = "Run the camera, hold assistance, then release to return commands to zero."; }
    else { success = !!d?.valid && d.id === 20; reason = "Run the camera and get a valid result for tag 20."; }
    setPassed(success); setFeedback(success ? "Challenge complete. Explain the observed behavior to a partner." : reason); if (success) onComplete();
  };
  const assemble = (n: number) => {
    if (n !== assembly) { setFeedback("That step needs the previous component first. Start with AprilTagProcessor."); return; }
    setAssembly(n + 1); setFeedback("");
    if (n === 0) setState(old => ({ ...old, camera: "webcam", hardware: "Webcam 1", processor: true, attached: false, running: false, phase: "Processor ready" }));
    if (n === 1) setState(old => ({ ...old, attached: true, phase: "Processor attached" }));
    if (n === 2) setState(old => ({ ...old, running: true, phase: "Opening camera" }));
    onOpen();
  };
  return <section className="challenge-card"><div className="challenge-heading"><Icon name="lab" size={24}/><div><span className="eyebrow">YOUR TURN</span><h3>Make it happen in the lab.</h3></div></div>
    {focus === "assembly" ? <div className="assembly-steps">{["Create processor", "Attach to camera", "Build portal"].map((text, i) => <button className="button" key={text} disabled={assembly > i} onClick={() => assemble(i)}>{assembly > i ? "✓" : i + 1} {text}</button>)}</div> : <><p>Open the lab. The field and live values stay visible while you use the Position, Settings, and Control tabs.</p><div className="challenge-live"><span>{d?.valid ? "● Target " + d.id : "○ No valid target"}</span><span>Angle {d?.valid ? d.tx.toFixed(1) + "°" : "—"}</span><span>Range {d?.valid ? d.range.toFixed(1) + " in" : "—"}</span></div></>}
    <div className="button-row"><button className="button" onClick={onOpen}>Open camera lab</button><button className="button primary" onClick={check}><Icon name="check" size={16}/> Check my result</button></div>{feedback && <p role="status" className={passed ? "feedback success" : "feedback"}>{feedback}</p>}
  </section>;
}
const faultTrees: Record<string, { q: string; yes: string; no: string }[]> = {
  detection: [
    { q: "Is the camera stream visible?", no: "Check the USB data cable, active Robot Configuration, and exact hardware name. Start VisionPortal or tell the robot to begin requesting Limelight results. Look for a camera ERROR state.", yes: "Inspect the image before tuning the detector." },
    { q: "Is a sharp, complete tag inside the image?", no: "Remove obstructions. Move closer. Tune exposure and gain. Make the tag face the camera; include the complete black border and margin.", yes: "Now check pipeline configuration." },
    { q: "Do pipeline type, family, ID filter, and crop admit this tag?", no: "Select AprilTags / 36h11, remove an unintended ID filter, and restore the crop. Verify the returned pipeline index.", yes: "Try a known test tag, lower detector downscale, and inspect stream rate and lighting." },
  ],
  pose: [
    { q: "Is physical marker size correct?", no: "Measure across the black border. Enter millimeters in Limelight or the correct size/unit in the FTC tag library.", yes: "Check calibration and the image." },
    { q: "Does calibration match the camera and resolution?", no: "Use the correct lens intrinsics for this camera/resolution. Avoid changing zoom without considering calibration.", yes: "Check rigidity, motion blur, and viewing angle." },
    { q: "Is only field-space robot position wrong?", no: "Inspect pose noise while stationary, then reduce blur and recheck tag flatness.", yes: "Verify field-map season/origin/units, camera mounting pose, and any IMU orientation input." },
  ],
  turn: [
    { q: "Do positive powers move both wheels forward?", no: "Correct motor direction settings before testing turn commands.", yes: "Now verify the turning convention." },
    { q: "Does positive turn rotate counterclockwise in your mixer?", no: "Document the actual mixer convention and adjust the heading-error sign to match.", yes: "Use bearing for VisionPortal, and -tx for the centered upright Limelight example." },
    { q: "Does it now turn toward a stationary target?", no: "Check camera mounting yaw, selected target, crosshair, and whether you accidentally used tag yaw instead of bearing.", yes: "Add low limits and a deadband, then test target loss and driver override." },
  ],
};
export function Troubleshooter({ focus = "detection" }: { focus?: string }) {
  const [step, setStep] = useState(0), [answer, setAnswer] = useState<string | null>(null);
  const nodes = faultTrees[focus] ?? faultTrees.detection, node = nodes[step];
  return <section className="troubleshooter"><span className="eyebrow">DIAGNOSTIC {step + 1} / {nodes.length}</span><h3>{node.q}</h3><div className="button-row"><button className="button" onClick={() => setAnswer("no")}>No</button><button className="button" onClick={() => setAnswer("yes")}>Yes</button></div>{answer && <div className="feedback"><p>{answer === "yes" ? node.yes : node.no}</p>{step < nodes.length - 1 && <button className="button" onClick={() => { setStep(step + 1); setAnswer(null); }}>Next diagnostic →</button>}</div>}<button className="text-button" onClick={() => { setStep(0); setAnswer(null); }}>Restart diagnostic</button></section>;
}
const checklist = ["Camera mount and cable are secure.", "Robot Configuration is active; names match Java exactly.", "Pipeline, 36h11 family, desired ID, and crop are correct.", "Printed size and camera calibration/resolution are verified.", "Exposure and gain work under venue lighting.", "Telemetry signs and units match known target movement.", "Speed/turn limits and tolerance are set.", "Stop, lost-target fallback, and driver override are tested."];
export function Checklist() { const [checked, setChecked] = useState<string[]>([]); return <section className="field-checklist"><span className="eyebrow">BEFORE THE ROBOT MOVES</span>{checklist.map(text => <label className="check-label" key={text}><input type="checkbox" checked={checked.includes(text)} onChange={e => setChecked(old => e.target.checked ? [...old, text] : old.filter(t => t !== text))}/>{text}</label>)}<button className="button" onClick={() => window.print()}><Icon name="download" size={16}/> Print field checklist</button></section>; }
const downloads = [
  ["AprilTagWorkshop.java", "Workshop: Limelight", "The short, telemetry-only example explained in the 30-minute workshop."],
  ["WebcamWorkshop.java", "Workshop: VisionPortal", "Build a portal, select a known tag, and read its pose."],
  ["LimelightWorkshop.java", "Extended Limelight detection", "Inspect IDs, result age, pipeline selection, and latency."],
  ["LimelightAlignTank.java", "Limelight turn assist", "Select a fiducial, bound turn power, and release to stop."],
  ["RobotAutoDriveToAprilTagTank.java", "FIRST tank sample", "The supplied sample with its original license and exposure controls."],
];
export function Resources() {
  return <section className="resources">
    <div className="download-grid">{downloads.slice(0, 2).map(([file, title, copy]) => <a key={file} download href={import.meta.env.BASE_URL + "examples/" + file}><Icon name="code" size={24}/><strong>{title}</strong><span>{copy}</span><small>Download .java <Icon name="download" size={13}/></small></a>)}</div>
    <details className="source-details"><summary>Official references & course sources</summary><div className="resource-links">{Object.values(sources).map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={15}/></a>)}</div></details>
    <p className="lab-fineprint">Java examples use verified FTC APIs but have not been compiled or driven on your physical robot. The supplied tank sample is disabled and uses the external.samples package; follow its comments to adapt it into TeamCode.</p>
  </section>;
}

