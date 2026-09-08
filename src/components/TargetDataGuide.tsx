type ValueRow = { code: string; name: string; unit: string; meaning: string; caution: string };

const limelightValues: ValueRow[] = [
  { code: "result.isValid()", name: "Valid target", unit: "boolean", meaning: "True when the active pipeline has a usable target result.", caution: "Still check that result is not null and that the data is fresh enough for your task." },
  { code: "result.getTx()", name: "tx", unit: "degrees", meaning: "Horizontal angle from the configured crosshair to the primary target. Positive is right; negative is left.", caution: "tx is an angle, not sideways distance or tag yaw." },
  { code: "result.getTy()", name: "ty", unit: "degrees", meaning: "Vertical angle from the configured crosshair to the primary target—how far up or down it appears.", caution: "ty is not target height or forward distance." },
  { code: "result.getTa()", name: "ta", unit: "% of image", meaning: "How much of the image the primary target occupies. A closer or larger-looking target usually produces a larger value.", caution: "ta is apparent image area, not a calibrated physical area or reliable distance by itself." },
  { code: "tag.getFiducialId()", name: "Tag ID", unit: "integer", meaning: "The number encoded inside one detected AprilTag.", caution: "When several tags are visible, read the matched fiducial's values instead of assuming the parent tx belongs to your desired ID." },
  { code: "result.getStaleness()", name: "Staleness", unit: "milliseconds", meaning: "How long the Control Hub has held this received result object.", caution: "It is not the complete age of the camera image. Treat old data as unusable for motion." },
  { code: "getCaptureLatency() / getTargetingLatency()", name: "Latency", unit: "milliseconds", meaning: "Capture and pipeline-processing delays reported separately by Limelight.", caution: "They do not include every delay between physical motion and your motor command." },
];

const processorValues: ValueRow[] = [
  { code: "detection.id", name: "Tag ID", unit: "integer", meaning: "The number decoded from the tag pattern.", caution: "An ID can be decoded even when metadata and metric pose are unavailable." },
  { code: "detection.center", name: "Image center", unit: "pixels", meaning: "The detected tag center in the camera image.", caution: "Pixel coordinates depend on image resolution and are not physical distances." },
  { code: "detection.metadata", name: "Metadata", unit: "object / null", meaning: "Known information from the tag library, such as name and physical size.", caution: "Check for null before using ftcPose. Pose scale needs a known tag size." },
  { code: "ftcPose.x / y / z", name: "Position", unit: "chosen distance unit", meaning: "+X is right, +Y is forward from the camera lens, and +Z is up.", caution: "These values are camera-relative unless you explicitly transform them into another frame." },
  { code: "ftcPose.range", name: "Range", unit: "chosen distance unit", meaning: "Planar camera-to-tag distance calculated from the X and Y position values.", caution: "It is an estimate affected by tag size, calibration, blur, and viewing angle." },
  { code: "ftcPose.bearing", name: "Bearing", unit: "degrees", meaning: "How far the camera must turn left or right to point at the tag center. Positive is left/counterclockwise.", caution: "Bearing aims toward the tag; it does not say whether the tag face is square to the camera." },
  { code: "ftcPose.elevation", name: "Elevation", unit: "degrees", meaning: "How far the camera must tilt up or down to point at the tag center. Positive is up.", caution: "Elevation is an angle, not the Z height value." },
  { code: "ftcPose.pitch / roll / yaw", name: "Tag rotation", unit: "degrees", meaning: "The tag's rotation about the FTC X, Y, and Z axes. Yaw describes how the tag face is turned.", caution: "Yaw is different from bearing. Use bearing to point toward the tag; use yaw when square alignment matters." },
];

export function TargetDataGuide({ camera }: { camera: "limelight" | "webcam" }) {
  const limelight = camera === "limelight";
  const rows = limelight ? limelightValues : processorValues;
  return <section className="data-guide" aria-label={limelight ? "Limelight target values" : "AprilTagProcessor target values"}>
    <div className="data-guide-head"><span>{limelight ? "LIMELIGHT · LLResult" : "WEBCAM · AprilTagDetection"}</span><strong>{limelight ? "Angles and image measurements" : "Identity, pixels, and camera-relative pose"}</strong></div>
    <div className="data-value-list">{rows.map(row => <article key={row.code}>
      <div><code>{row.code}</code><h3>{row.name}</h3><span>{row.unit}</span></div>
      <p>{row.meaning}</p><small>{row.caution}</small>
    </article>)}</div>
    <div className="data-rule"><strong>Always ask:</strong><span>What is the unit?</span><span>Which coordinate frame?</span><span>Which target?</span><span>Is the result valid and fresh?</span></div>
  </section>;
}
