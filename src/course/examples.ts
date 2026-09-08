import limelight from "../../public/examples/LimelightWorkshop.java?raw";
import webcam from "../../public/examples/WebcamWorkshop.java?raw";
import tank from "../../public/examples/RobotAutoDriveToAprilTagTank.java?raw";
import align from "../../public/examples/LimelightAlignTank.java?raw";
import quick from "../../public/examples/AprilTagWorkshop.java?raw";
export type Segment = { id: string; title: string; start: string; count: number; explanation: string; effect: string };
export type Example = { file: string; source: string; segments: Segment[] };
const segment = (id: string, title: string, start: string, count: number, explanation: string, effect = id): Segment => ({ id, title, start, count, explanation, effect });
export const examples: Record<string, Example> = {
  quick: { file: "AprilTagWorkshop.java", source: quick, segments: [
    segment("hardware", "Get a configured device", "Limelight3A limelight =", 2, "Limelight3A is the device class. limelight is our variable. hardwareMap.get finds the device named limelight in the active Robot Configuration. Names must match exactly."),
    segment("pipeline", "Choose the saved pipeline", "limelight.pipelineSwitch", 1, "Select slot 0, which you already configured as an AprilTag pipeline in LimelightOS. This number is not the tag ID."),
    segment("start", "Start reading camera results", "limelight.start", 1, "Start SDK polling so the robot can receive results from Limelight. The camera does the image processing."),
    segment("wait", "Wait for the driver to press Start", "waitForStart", 1, "The initialization above happens first. This line waits for the Driver Station Start button before the loop continues."),
    segment("loop", "Repeat until Stop", "while (opModeIsActive", 1, "Each loop reads the latest available result and updates telemetry. Pressing Stop ends the loop."),
    segment("result", "Ask for the newest result", "LLResult result =", 1, "getLatestResult asks Limelight for its newest detection data. The variable named result holds that data during this loop. Sometimes there is no result, so the value can be null. Calling it again can return data from the same camera image."),
    segment("valid", "Check before using", "if (result != null", 1, "First check that an object exists. Then isValid checks whether the pipeline has a valid target. The && operator avoids calling a method on null."),
    segment("tx", "Read the horizontal angle", 'telemetry.addData("tx', 1, "getTx returns horizontal crosshair offset in degrees: positive right, negative left. Zero means centered on the crosshair. It is an angle, not a physical distance."),
    segment("telemetry", "Show it on the Driver Station", "telemetry.update", 2, "addData stages the value. update sends it to the Driver Station. sleep gives a short pause between loop iterations."),
    segment("stop", "Stop polling when finished", "} finally {", 3, "finally stops polling even if execution exits unexpectedly. This example only displays telemetry; motor control additionally needs a desired ID, freshness, limits, and override.", "stop"),
  ] },
  align: { file: "LimelightAlignTank.java", source: align, segments: [
    segment("id", "Choose the per-tag result", "LLResultTypes.FiducialResult desired", 11, "Check received-result age, pipeline index, and ID. The matched tag supplies the actual control angle; primary tx may belong to another tag.", "result"),
    segment("sign", "Turn toward the target", "double tx =", 4, "Positive tx is right. This mixer is positive CCW, so use -tx. Stop turning inside the 2° tolerance and clip output to ±0.25.", "align"),
    segment("override", "Driver override and target loss", "if (gamepad1.left_bumper)", 13, "Hold the bumper to align. If the target disappears while held, automatic commands remain zero. Release the bumper to return to manual control.", "assist"),
    segment("mix", "Normalize wheel powers", "double leftPower =", 5, "Combine forward and turn, then scale both wheel powers together to stay inside ±1.", "align"),
    segment("stop", "Stop motors and polling", "} finally {", 5, "Always set both motor powers to zero and stop polling when leaving the OpMode.", "stop"),
  ] },
  limelight: { file: "LimelightWorkshop.java", source: limelight, segments: [
    segment("hardware", "Get a configured device", "Limelight3A limelight =", 2, "Limelight3A names the class. limelight holds a reference to the device. hardwareMap.get takes its type and exact Robot Configuration name."),
    segment("poll", "Request results; publish telemetry", "limelight.setPollRateHz", 2, "Poll at 100 requests per second; publish telemetry every 100 ms. These independent cadences do not change the camera frame rate."),
    segment("pipeline", "Switch to slot 0", "limelight.pipelineSwitch", 1, "This requests a saved pipeline asynchronously. The result's pipeline index is checked later; slot 0 is not inherently an AprilTag pipeline."),
    segment("start", "Start result polling", "limelight.start", 1, "Starts SDK polling. This call does not press the Driver Station Start button."),
    segment("wait", "Wait for the driver", "waitForStart", 1, "Initialization is complete. The OpMode waits until Start is pressed."),
    segment("loop", "Run until Stop", "while (opModeIsActive", 1, "Run a short loop repeatedly. Stop ends this loop, then finally releases the device."),
    segment("result", "Ask for the newest result", "LLResult result =", 1, "getLatestResult asks Limelight for its newest detection data. The variable named result holds that data during this loop. Sometimes there is no result, so the value can be null. Calling it again can return data from the same camera image."),
    segment("valid", "Check before using", "if (result != null", 3, "Short-circuit && protects isValid() from null. Also verify pipeline index and age. getStaleness is age since receipt on the Control Hub, not full image age."),
    segment("tx", "Read values with units", 'telemetry.addData("Primary tx', 7, "tx/ty are crosshair-relative angles in degrees. ta is image coverage in percent. Capture and targeting latency are separate values in milliseconds."),
    segment("fiducials", "Inspect each tag", "for (LLResultTypes.FiducialResult", 6, "Each fiducial result has its own ID and angle. Use a matching tag's value when selecting an ID; parent tx may refer to another target."),
    segment("telemetry", "Send the telemetry", "telemetry.update", 2, "addData stages values; update publishes them. sleep briefly yields time between iterations."),
    segment("stop", "Clean up on every exit", "} finally {", 3, "finally runs even when an exception or early exit leaves the try block. stop releases SDK polling.", "stop"),
  ] },
  webcam: { file: "WebcamWorkshop.java", source: webcam, segments: [
    segment("processor", "Create the detector", "AprilTagProcessor aprilTag =", 3, "Builder creates an AprilTagProcessor and explicitly chooses inches and degrees for output. It has not opened the camera yet."),
    segment("portal", "Attach and open the camera", "VisionPortal visionPortal =", 4, "The portal selects Webcam 1, attaches the processor, and opens streaming after build(). The name must match Robot Configuration."),
    segment("wait", "Wait for Start", "waitForStart", 1, "Streaming can already be running during INIT. This wait controls when the OpMode proceeds."),
    segment("detections", "Read a list", "for (AprilTagDetection", 1, "getDetections may return the same frame again. getFreshDetections returns null when no new processed frame is available, unlike an empty list for a new frame without tags."),
    segment("id", "Choose the desired ID", "if (detection.id !=", 1, "continue skips other tag IDs. The desired ID must exist in the installed tag library to get the expected pose."),
    segment("metadata", "Require a known pose", "if (detection.metadata", 2, "A decoded tag ID can exist without metadata. Check the pose object as well before dereferencing it."),
    segment("pose", "Use the camera frame", 'telemetry.addData("Range', 3, "range is planar camera-to-tag distance, bearing is positive left, and yaw describes the tag face. Yaw is not the centering angle."),
    segment("telemetry", "Explain no-target states", "if (!found)", 3, "Show a useful message when the desired known tag is absent. Publish telemetry and yield the loop."),
    segment("close", "Close the camera", "} finally {", 3, "close() releases VisionPortal and the camera; hiding LiveView alone is a different operation.", "stop"),
  ] },
  control: { file: "RobotAutoDriveToAprilTagTank.java", source: tank, segments: [
    segment("target", "Find a known desired tag", "List<AprilTagDetection> currentDetections", 12, "Search detections, require metadata, match the desired ID, and keep the first matching result.", "result"),
    segment("limit", "Scale and clip the error", "double  rangeError", 8, "Subtract the desired distance, scale range/bearing error by gains, then clip speed and turn independently.", "align"),
    segment("override", "Hold for assistance", "if (gamepad1.left_bumper", 19, "The original sample returns to manual joystick control when the bumper is released OR the target is lost. The teaching lab instead zeros its automatic commands.", "assist"),
    segment("mix", "Mix tank wheel powers", "double leftPower", 14, "Forward minus turn drives the left wheel; forward plus turn drives the right. Normalize both if either exceeds magnitude 1.", "align"),
    segment("exposure", "Wait before camera controls", "if (visionPortal.getCameraState()", 10, "Wait for STREAMING while honoring Stop. After that, obtain supported ExposureControl and GainControl interfaces.", "portal"),
    segment("gain", "Set manual exposure and gain", "ExposureControl exposureControl =", 11, "The supplied sample uses camera-specific example values. The low exposure reduces blur, while gain recovers brightness.", "exposure"),
  ] },
};
export function segmentLines(example: Example, s: Segment) {
  const start = example.source.split("\n").findIndex(line => line.includes(s.start));
  return { start, end: start + s.count - 1 };
}
