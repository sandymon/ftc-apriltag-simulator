import { useState } from "react";
import { Icon } from "./Icon";
export function TagDiagram() {
  const [part, setPart] = useState(0);
  return <div className="tag-diagram">
    <div className="diagram-label"><span className="live-dot"/> VISION TARGET <span>36h11 / ID 20</span></div>
    <div className={"tag-board part-" + part}><div className="tag-bracket top-left"/><div className="tag-bracket top-right"/><div className="tag-bracket bottom-left"/><div className="tag-bracket bottom-right"/><img src={import.meta.env.BASE_URL + "apriltags/tag-20-36h11.png"} alt="Actual 36h11 AprilTag with encoded ID 20"/><span className="tag-dimension">← black-border width →</span></div>
    <div className="diagram-chips">{["White margin", "Black border", "Encoded ID"].map((p, i) => <button key={p} aria-pressed={i === part} onClick={() => setPart(i)}><span>{i + 1}</span>{p}</button>)}</div>
    <p className="diagram-caption">{["The white margin separates the pattern from the background.", "Measure the physical width across this outer black boundary.", "The pattern encodes a number. Field position comes from a separate map."][part]}</p>
  </div>;
}
export function FlowDiagram({ webcam = false }: { webcam?: boolean }) {
  const items = webcam ? [["Camera", "Captures pixels"], ["VisionPortal", "Manages the stream"], ["AprilTagProcessor", "Analyzes frames"], ["Your OpMode", "Validates & acts"]] : [["Camera", "Capture an image"], ["Detection", "Decode & estimate"], ["Validation", "ID, pose, freshness"], ["Robot", "Bounded commands"]];
  return <div className="flow-diagram" aria-label="Vision data flow">{items.map(([title, detail], i) => <div className="flow-step" key={title}><span className="flow-number">0{i + 1}</span><Icon name={i === 3 ? "code" : "target"} size={28}/><strong>{title}</strong><span>{detail}</span>{i < 3 && <i><Icon name="arrow"/></i>}</div>)}</div>;
}
export function AxesDiagram() {
  return <figure className="axes-diagram"><svg viewBox="0 0 480 265" role="img" aria-label="FTC camera frame: X right, Y forward, Z up; bearing positive left">
    <defs><marker id="axis-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="context-stroke"/></marker></defs>
    <path d="M85 208 345 208M135 235 240 65" stroke="var(--border)" strokeDasharray="3 7"/>
    <path d="M170 195h200" stroke="#ed736b" strokeWidth="3" markerEnd="url(#axis-arrow)"/>
    <path d="m170 195 100-125" stroke="#7bbc88" strokeWidth="3" markerEnd="url(#axis-arrow)"/>
    <path d="M170 195V45" stroke="#74aafa" strokeWidth="3" markerEnd="url(#axis-arrow)"/>
    <path d="M208 145Q170 110 130 126" fill="none" stroke="#8bdad1" strokeWidth="2" markerEnd="url(#axis-arrow)"/>
    <circle cx="170" cy="195" r="10" fill="#8bdad1"/>
    <text x="380" y="200" fill="#ed736b">+X right</text><text x="280" y="65" fill="#7bbc88">+Y forward</text><text x="175" y="35" fill="#74aafa">+Z up</text><text x="50" y="105" fill="#8bdad1">+ bearing</text><text x="103" y="225" fill="var(--muted)">camera lens</text>
  </svg><figcaption>FTC camera-relative frame · distances originate at the lens</figcaption></figure>;
}
export function Comparison() {
  return <div className="comparison"><div className="comparison-head"><span>THE SAME GOAL</span><h3>Which path fits your robot?</h3></div><table><thead><tr><th>Concept</th><th>Webcam + VisionPortal</th><th>Limelight 3A</th></tr></thead><tbody>{[
    ["Image processing", "On the Control Hub", "On the smart camera"],
    ["Camera connection", "USB webcam", "USB-C → blue Hub USB 3.0*"],
    ["Setup", "Robot Configuration + Java", "LimelightOS UI + Robot Configuration"],
    ["Frame management", "VisionPortal", "LimelightOS"],
    ["Detection API", "AprilTagProcessor", "Limelight3A → LLResult"],
    ["Centering angle", "ftcPose.bearing (+ left)", "getTx() (+ right)"],
    ["Pose", "Camera-relative ftcPose", "Target poses / mapped field botpose"],
  ].map(row => <tr key={row[0]}>{row.map((cell, i) => i === 0 ? <th key={i}>{cell}</th> : <td key={i}>{cell}</td>)}</tr>)}</tbody></table><p className="comparison-note">* Recommended configuration. USB 2.0 shares the Control Hub's Wi-Fi bus and has a documented ESD-related disconnect risk.</p></div>;
}
