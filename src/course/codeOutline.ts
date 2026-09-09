import { examples, segmentLines, type Example, type Segment } from "./examples";

export type WalkthroughStep = Segment & { section: string; overview?: boolean };
export type CodeSection = { title: string; firstStep: number };
const fieldDescriptions: Record<string, string> = {
  "WebcamWorkshop.java": "DESIRED_TAG_ID is a constant: -1 accepts any known tag.\nvisionPortal and aprilTag are instance variables shared by the methods.\nThey start without camera objects; initAprilTag() assigns them before the loop uses them.",
  "RobotAutoDriveToAprilTagTank.java": "DESIRED_DISTANCE, the gains, and power limits are fixed tuning values.\nUSE_WEBCAM and DESIRED_TAG_ID choose the camera and target.\nleftDrive, rightDrive, visionPortal, and aprilTag hold device references. desiredTag remembers the selected detection.",
  "MecanumAimAssistLimelight.java": "Motor and limelight fields remember the configured devices.\nThe final constants set allowed tag IDs, gain, limits, and tolerance.\nassistEnabled and previousA remember the toggle state; desiredTxDeg is the target angle.",
  "LimelightAlignTank.java": "DESIRED_TAG_ID selects tag 20.\nTURN_GAIN, MAX_TURN, and TOLERANCE_DEG tune the correction.\nThese final constants stay fixed. Camera and motor variables are local to runOpMode().",
};
const helperDetails: Record<string, string> = {
  initDrive: "hardwareMap.get finds each motor by its configured name.\nsetDirection reverses the left motors to match this drivetrain.\nThe for loop applies BRAKE to all four motors.",
  stopDrive: "Each setPower(0) commands one motor to stop.\nAll four motors receive zero before this helper returns.",
  clip: "Math.min(max, value) removes anything above the maximum.\nMath.max(min, ...) then removes anything below the minimum.\nThe return statement sends that bounded value back to the caller.",
};
const helperDescriptions: Record<string, string> = {
  initAprilTag: "Called during setup, before the main loop.\nCreates the AprilTag processor, then connects it to a camera through VisionPortal.\nAfter this helper finishes, execution returns to runOpMode().",
  findDesiredTag: "Called once each time through the main loop.\nChecks detections and returns the first known tag with an allowed ID.\nReturns null when no usable tag exists; runOpMode() decides what to display.",
  moveRobot: "Called from the main loop with drive and turn power.\nMixes the two requests into left and right wheel power, limits them, then sends them to the motors.",
  setManualExposure: "Called during webcam setup.\nWaits for streaming, then sets exposure and gain to make moving tags clearer.",
  calculateAssistTurn: "Called from the main loop with the driver's turn request.\nChecks override and target validity, selects a tag, then returns a bounded turn correction.\nReturning zero means no automatic correction.",
  updateAssistToggle: "Called at the start of each main-loop pass.\nChanges assistEnabled only on a new A-button press, then remembers the button state.",
  initDrive: "Called once during setup.\nFinds the four configured motors, sets their directions, and enables braking at zero power.",
  driveMecanum: "Called from the main loop with forward, strafe, and turn requests.\nCombines them into four wheel powers and scales them together before sending them to the motors.",
  stopDrive: "Called during cleanup.\nSets all four drive motors to zero power.",
  clip: "A small helper used when calculating power.\nReturns the value inside the given minimum and maximum limits.",
};

function structure(example: Example) {
  // Ignore comments and literals while counting braces; retain every newline.
  const clean = example.source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, match => match.replace(/[^\n]/g, " ")).split("\n");
  const methods: { name: string; start: number; end: number }[] = [];
  for (let i = 0; i < clean.length; i++) {
    const declaration = clean[i].match(/\b(?:public|private|protected)\s+(?:static\s+)?\w+\s+(\w+)\s*\(/);
    if (!declaration) continue;
    let depth = 0, opened = false, end = i;
    for (; end < clean.length; end++) {
      for (const char of clean[end]) {
        if (char === "{") { depth++; opened = true; }
        if (char === "}") depth--;
      }
      if (opened && depth === 0) break;
    }
    methods.push({ name: declaration[1], start: i, end });
    i = end;
  }
  return { methods, clean };
}

export function buildWalkthrough(example: Example) {
  const { methods, clean } = structure(example);
  const lines = example.source.split("\n");
  const classLine = clean.findIndex(line => /public class /.test(line));
  const firstMethod = methods[0].start;
  const fields = clean.slice(classLine + 1, firstMethod).some(line => line.includes(";"));
  const steps: WalkthroughStep[] = [];
  const sections: CodeSection[] = [];
  const overview = (section: string, id: string, start: number, end: number, explanation: string) => {
    sections.push({ title: section, firstStep: steps.length });
    steps.push({ id, title: section, section, overview: true, start: lines[start].trim(), count: end - start + 1, explanation, effect: "" });
  };
  overview("Variables & constants", "structure-fields", classLine, firstMethod - 1, fieldDescriptions[example.file] ?? (fields
    ? "These declarations belong to the class, outside its methods.\nInstance variables remember devices and state across method calls.\nConstants use final: their assigned values stay fixed. Read the names and values before following runOpMode()."
    : "This small example has no instance variables or named constants.\nIts camera variable is local to runOpMode(); result is local to the loop body.\nStart by noticing where variables are declared, then follow the main method."));
  steps.push(...example.segments.filter(s => segmentLines(example, s).start < firstMethod).map(s => ({ ...s, section: "Variables & constants" })));
  const main = methods.find(m => m.name === "runOpMode")!;
  const helpers = methods.filter(m => m !== main).sort((a, b) => Number(b.name.startsWith("init")) - Number(a.name.startsWith("init")) || a.start - b.start);
  for (const method of [main, ...helpers]) {
    const section = method === main ? "Main · runOpMode()" : `Helper · ${method.name}()`;
    overview(section, `structure-${method.name}`, method.start, method.end, method === main
      ? `FTC enters runOpMode() when you initialize the OpMode.\nSetup runs first; waitForStart() waits for the driver.\nThe while (opModeIsActive()) loop repeats the robot's work until Stop.${helpers.length ? "\nHelper calls run their named method, then return here. We explore each helper after the main method." : "\nThis example keeps its work inside runOpMode(); it has no separate helper methods."}`
      : helperDescriptions[method.name] ?? "This helper performs one part of the program, then returns to its caller.");
    const inside = example.segments.filter(s => { const r = segmentLines(example, s); return r.start >= method.start && r.start <= method.end; });
    if (helperDetails[method.name]) inside.push({ id: `inside-${method.name}`, title: `Inside ${method.name}()`, start: lines[method.start + 1].trim(), count: method.end - method.start - 1, explanation: helperDetails[method.name], effect: "" });
    if (method === main && !inside.some(s => s.id === "loop")) {
      const loopStart = lines.findIndex((line, i) => i >= method.start && i <= method.end && line.includes("while (opModeIsActive())"));
      if (loopStart >= 0) inside.push({ id: "loop", title: "Inside the main loop", start: lines[loopStart].trim(), count: 3, explanation: "This block repeats while the OpMode is active.\nEach pass reads the current inputs and target data, then updates telemetry or motor commands.\nA helper call runs that function and returns before the next line continues.", effect: "" });
    }
    inside.sort((a, b) => segmentLines(example, a).start - segmentLines(example, b).start);
    steps.push(...inside.map(s => ({ ...s, section })));
  }
  return { steps, sections };
}
export const walkthroughs = Object.fromEntries(Object.entries(examples).map(([id, example]) => [id, buildWalkthrough(example)]));
