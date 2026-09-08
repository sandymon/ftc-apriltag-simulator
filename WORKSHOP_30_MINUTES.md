# FTC AprilTag workshop — 30 minutes

Updated September 8, 2026 following the user's direction to prioritize the simulator, essential LimelightOS settings, target data, and code explanation. The default app is 18 slides, not the full reference library.

## Timed facilitator checklist

### 0–2 minutes · The essentials

- [x] Show an actual AprilTag and distinguish ID from metric pose.
- [x] Explain that physical size is measured across the black border.
- [x] Explain VisionPortal: camera stream management, with AprilTagProcessor analyzing webcam frames on the Control Hub.
- [x] Contrast Limelight's on-camera processing and result API.

### 2–5 minutes · Connect and configure

- [x] Explain USB data connection and secure mounting.
- [x] Keep the official blue USB 3.0 recommendation visible.
- [x] Warn that REV lists Limelight 3A as USB 3.0 only and that USB 2.0 shares the Control Hub Wi-Fi bus and carries an ESD-related disconnect risk.
- [x] Show the Robot Configuration scan/name/save flow; use the exact name `limelight`.
- [x] Explain how to open LimelightOS from a laptop and set the FTC team number.

### 5–11 minutes · LimelightOS essentials

- [x] Use the approved Input and Configuration screenshots from the reference deck.
- [x] Explain pipeline index versus pipeline type versus tag ID.
- [x] Configure AprilTags / 36h11 and measured marker size.
- [x] Explain exposure and gain, including the difference between screenshot units and lab units.
- [x] Explain ID filters; use tag 20 in the practice simulator.
- [x] Let participants change a teaching control and observe the result in the camera lab.

### 11–16 minutes · Understand target data

- [x] Explain Limelight validity, `tx`, `ty`, `ta`, tag ID, freshness, and latency.
- [x] State the unit for each value and distinguish image measurements from physical distance.
- [x] Explain AprilTagProcessor ID, pixel center, metadata, camera-relative pose, range, bearing, elevation, and rotation.
- [x] Focus the practical driving subset on ID, range, bearing, and yaw.

### 16–23 minutes · Explain the code

- [x] Start with the short `AprilTagWorkshop.java` telemetry example.
- [x] Individually highlight `Limelight3A`, `hardwareMap.get`, `pipelineSwitch`, `start`, and `waitForStart`.
- [x] Explain `getLatestResult`, the result variable, null checking, and `isValid`.
- [x] Explain `getTx` as horizontal angular offset in degrees, and `telemetry.update`.
- [x] Compare webcam processor/portal construction and `ftcPose.bearing`.
- [x] Supply Copy code, Download Java, and Show in lab actions.

### 23–28 minutes · Simulator exercises

- [x] Move a tag or robot; predict the sign and magnitude of tx, then center the target.
- [x] Hold a bounded turn assist; release to zero automatic output.
- [x] Lose the target, verify zero automatic commands, then recover detection.
- [x] Keep optional faults, approach control, and pose-frame exploration out of the timed agenda.

### 28–30 minutes · Wrap up

- [x] Download the two workshop examples.
- [x] Recap correct setup, valid measurements, and bounded control with fallback.
- [x] Offer the longer reference library as optional follow-up reading.
- [x] Include timing prompts in expandable presenter notes.

## Included reference material

The optional 99-lesson library retains the original modules, remaining UI settings, extended Limelight and webcam examples, original licensed FIRST tank sample, turn-assist example, quizzes, pose-frame illustrations, troubleshooting, and printable checklist. It is not expected to be delivered in 30 minutes.

## Verification and remaining hardware work

- [x] Lint, TypeScript/production build, and automated interaction/model checks.
- [x] Desktop and phone browser checks, including real screenshot rendering, code highlighting, and lab controls.
- [x] Source links and screenshot reuse metadata included.
- [ ] Mentor-run rehearsal to confirm the pace with the actual audience.
- [ ] Compile the downloaded Java examples against the team's installed FTC SDK.
- [ ] Run both camera paths on physical hardware before describing them as robot-ready.
- [ ] Confirm the installed LimelightOS version and any version-specific control ranges.

The simulator uses illustrative geometry and image-quality behavior. It does not run Java, process camera pixels, connect to hardware, or solve full 6DoF localization. Lab runtime is deliberately paused/reset on reload; learning progress persists.
