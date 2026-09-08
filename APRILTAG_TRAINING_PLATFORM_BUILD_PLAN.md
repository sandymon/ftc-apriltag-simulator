> **Scope update — September 8, 2026:** The user specified a 30-minute training focused on LimelightOS, code explanation, and the simulator. [WORKSHOP_30_MINUTES.md](WORKSHOP_30_MINUTES.md) is the active delivery checklist. This original broad plan now describes optional reference material and possible extensions; its unchecked items are not all part of the timed workshop.

# FTC AprilTag Training Platform — Product and Build Plan

## 1. Product direction

Rebuild the current simulator as a guided, slide-like training platform for FTC staff. The learner moves through one focused concept at a time, with a persistent visual simulator used whenever a camera setting, detection value, coordinate, or robot command needs to be demonstrated.

The experience must teach two supported camera paths:

- Webcam using the FTC SDK `VisionPortal` and `AprilTagProcessor`
- Limelight 3A using LimelightOS pipelines and the FTC `Limelight3A` API

The course should begin with shared AprilTag concepts, branch into camera-specific setup, and then rejoin for detection data, telemetry, alignment, closed-loop control, and safe testing. The app remains a browser simulation; it does not connect to real FTC hardware or process a real camera stream.

## 2. Audience, purpose, and learning outcomes

### Audience

- FTC staff and workshop facilitators
- Rookie and intermediate FTC Java programmers
- Teams deciding between a USB webcam and Limelight 3A

### Purpose

- Give instructors a presentation they can teach from
- Give learners an interactive model of what each setting and code line changes
- Connect camera setup, reported values, and robot behavior
- Provide copyable FTC-style Java examples for both camera paths

### Learner outcomes

By the end, a learner should be able to:

- Explain what an AprilTag is, what a tag family and ID are, and why physical tag size matters
- Explain pose estimation and the camera-relative coordinate frame
- Choose between a webcam/VisionPortal workflow and a Limelight 3A workflow
- Configure a webcam in the Robot Configuration and initialize `AprilTagProcessor` and `VisionPortal`
- Mount, wire, configure, and register a Limelight 3A with the Control Hub
- Configure a Limelight AprilTag pipeline and explain every exposed training input
- Read and validate detections from either camera path
- Interpret `tx`, `ty`, `ta`, latency, tag ID, range, bearing, yaw, and field pose without mixing units or coordinate frames
- Turn a measurement into a bounded robot command
- Add target filtering, tolerance, maximum output, lost-target behavior, and driver override
- Identify the common causes of no detection, unstable pose, and unreliable alignment

## 3. Accuracy corrections to preserve throughout the app

- `tx` and `ty` are angular offsets in degrees, not physical horizontal or vertical distance.
- `ta` is the target area as a percentage of the image.
- Limelight latency is reported in milliseconds; distinguish capture, pipeline, and total latency when the API exposes them.
- A valid result means the active pipeline produced a usable target result. A non-null `LLResult` is not automatically valid.
- AprilTag marker size is entered in millimeters in LimelightOS. Do not call `165.1 mm` a universal FTC tag size. Use the official current-season field documentation or a measured custom tag and show the source next to the value.
- FTC uses the `tag36h11` family for its standard AprilTags. Label it consistently as `AprilTag Classic 36h11` where matching the Limelight UI.
- Resolution, exposure, gain, downscale, and cropping are tuning choices with tradeoffs. Do not present one value as correct for every venue, camera, mounting position, or task.
- Stream orientation changes the displayed stream and does not change Limelight results data.
- VisionPortal manages the camera stream and the processors attached to it. `AprilTagProcessor` analyzes frames and returns detections.
- A known tag with metadata can provide pose. An unknown ID may still be detected, but it does not have the library metadata required by examples such as drive-to-tag.
- Pose is an estimate affected by calibration, resolution, tag size, viewing angle, blur, light, and range.

## 4. Experience architecture

### Global shell

- [ ] Replace the current three-panel workshop screen with a course player.
- [ ] Add a left course outline with modules, lesson titles, completion state, and camera-path badges.
- [ ] Add a central slide stage containing one concept, diagram, screenshot, code fragment, or interaction at a time.
- [ ] Add an optional right-side simulator drawer for field, camera preview, telemetry, and controls.
- [ ] Add Back, Next, module progress, lesson progress, and keyboard navigation.
- [ ] Add a presenter mode with larger text, minimal controls, and persistent speaker notes.
- [ ] Add a learner mode with prompts, checks for understanding, and interactive tasks.
- [ ] Add a “Choose camera path” control that can show Webcam, Limelight, or Compare Both.
- [ ] Preserve progress in local storage and include a clear “Reset course progress” action.
- [ ] Keep all training usable with keyboard navigation and visible focus states.
- [ ] Provide captions and alt text for every image, screenshot, diagram, and simulator control.
- [ ] Design for desktop, Chromebook, and a projected 16:9 display.

### Slide types

- [ ] Title slide
- [ ] Learning objectives slide
- [ ] Concept plus diagram slide
- [ ] Hardware photo plus callouts slide
- [ ] Numbered setup procedure slide
- [ ] UI screenshot with clickable hotspots slide
- [ ] Side-by-side webcam versus Limelight comparison slide
- [ ] Code walkthrough slide with synchronized explanation
- [ ] Simulator challenge slide
- [ ] Knowledge check slide
- [ ] Troubleshooting decision slide
- [ ] Recap and resource slide

### Simulator behavior

- [ ] Let the learner move or rotate a robot and move AprilTags on a top-down FTC field.
- [ ] Render an approximate camera field of view from the selected camera and mounting pose.
- [ ] Show visible, filtered, unknown, and out-of-frame tags with distinct states.
- [ ] Update detection values deterministically as the robot, tag, camera, or settings change.
- [ ] Simulate noise, latency, missed frames, motion blur, bad exposure, and false-positive risk as teaching toggles.
- [ ] Let instructors pause the simulation and reveal measurement vectors and coordinate axes.
- [ ] Synchronize the active slide, highlighted UI input, highlighted code, simulator state, and telemetry.
- [ ] Clearly label every simulated value as simulated.

## 5. Course outline and slide inventory

### Module 0 — Welcome and orientation

- [ ] 0.1 Title: FTC AprilTag Camera Lab
- [ ] 0.2 What staff will learn
- [ ] 0.3 What the browser simulator can and cannot do
- [ ] 0.4 Hardware paths: Webcam/VisionPortal and Limelight 3A
- [ ] 0.5 Pre-work and equipment checklist
- [ ] 0.6 Navigation and presenter controls

### Module 1 — What AprilTags are

- [ ] 1.1 AprilTag as a visual fiducial with a numeric ID
- [ ] 1.2 Tag anatomy: white margin, black border, data cells, and family
- [ ] 1.3 Why FTC uses `tag36h11`
- [ ] 1.4 Tag ID versus tag metadata versus tag pose
- [ ] 1.5 How tag size is measured
- [ ] 1.6 Detection versus pose estimation
- [ ] 1.7 Camera-relative axes and the FTC field coordinate system
- [ ] 1.8 Accuracy factors: size, range, angle, resolution, calibration, light, and blur
- [ ] 1.9 Simulator activity: move a tag and observe visibility and pose
- [ ] 1.10 Knowledge check: ID, family, size, and pose

### Module 2 — Choose a camera path

- [ ] 2.1 Comparison of processing location, wiring, setup UI, result API, and cost
- [ ] 2.2 Webcam path: camera frames are processed by the Control Hub through VisionPortal
- [ ] 2.3 Limelight path: the smart camera runs its own pipeline and the OpMode reads results
- [ ] 2.4 Decision guide based on workshop goal, robot resources, tuning needs, and localization needs
- [ ] 2.5 Camera-path selector that changes later examples without losing course position

### Module 3A — Webcam and VisionPortal setup

- [ ] 3A.1 Required equipment and USB connection
- [ ] 3A.2 Add and name the webcam in FTC Robot Configuration
- [ ] 3A.3 Explain exact, case-sensitive `hardwareMap` names
- [ ] 3A.4 Define a vision processor and why it is separate from the camera manager
- [ ] 3A.5 Create `AprilTagProcessor` with defaults
- [ ] 3A.6 Create `AprilTagProcessor` with `Builder` for custom configuration
- [ ] 3A.7 Define VisionPortal: opens the camera, manages streaming, preview, and processors
- [ ] 3A.8 Create VisionPortal with `easyCreateWithDefaults`
- [ ] 3A.9 Create VisionPortal with `Builder`
- [ ] 3A.10 Explain `.setCamera(...)`, `.addProcessor(...)`, `.setCameraResolution(...)`, `.setStreamFormat(...)`, and `.build()`
- [ ] 3A.11 Explain LiveView and camera stream preview
- [ ] 3A.12 Explain camera states and why exposure controls wait for streaming
- [ ] 3A.13 Exposure, gain, focus, white balance, and camera-specific support
- [ ] 3A.14 Processor enable/disable, stream stop/resume, and portal close
- [ ] 3A.15 CPU and USB bandwidth tradeoffs, including YUY2 versus MJPEG
- [ ] 3A.16 Webcam setup simulator: build the processor and portal in the right order
- [ ] 3A.17 Troubleshooting: name mismatch, no stream, no calibration, no detection, and overloaded USB

### Module 3B — Limelight 3A physical and FTC setup

- [ ] 3B.1 Limelight 3A capabilities and limitations relevant to FTC
- [ ] 3B.2 Equipment checklist: camera, mounting hardware, and USB-C to USB-A cable
- [ ] 3B.3 Mount with at least two appropriate screws; explain rigid mounting and unobstructed view
- [ ] 3B.4 Record camera position and orientation relative to robot center
- [ ] 3B.5 Connect to the Control Hub USB 3.0 port
- [ ] 3B.6 Interpret status light behavior
- [ ] 3B.7 Access `http://limelight.local:5801` or use Limelight Hardware Manager
- [ ] 3B.8 Set the FTC team number and restart the vision client
- [ ] 3B.9 Configure or update LimelightOS only when required; back up pipelines first
- [ ] 3B.10 Open FTC Driver Station Robot Configuration, scan, find the Ethernet Device, and name it `limelight`
- [ ] 3B.11 Explain why that name must match `hardwareMap.get(Limelight3A.class, "limelight")`
- [ ] 3B.12 Physical setup simulator with correct and incorrect wiring/mounting choices
- [ ] 3B.13 Troubleshooting: interface unavailable, device absent from scan, wrong name, and no target light

### Module 4 — LimelightOS interface and AprilTag pipeline

- [ ] 4.1 Annotated overview of Settings, pipeline tabs, Input, Standard/Configuration, Advanced, and 3D Visualization
- [ ] 4.2 Explain the ten stored pipelines and pipeline index range `0–9`
- [ ] 4.3 Explain user/code pipeline switching and the current UI control for ignoring code-driven pipeline selection
- [ ] 4.4 Select a pipeline and set Pipeline Type to Fiducial Markers/AprilTags
- [ ] 4.5 Input tab: Source Image
- [ ] 4.6 Input tab: Resolution and zoom, with speed/accuracy tradeoff
- [ ] 4.7 Input tab: Stream Orientation
- [ ] 4.8 Input tab: Exposure and motion blur tradeoff
- [ ] 4.9 Input tab: Black Level Offset
- [ ] 4.10 Input tab: Sensor Gain and image-noise tradeoff
- [ ] 4.11 Input tab: Flicker correction when present in the installed LimelightOS version
- [ ] 4.12 Input tab: Red Balance and Blue Balance/white balance
- [ ] 4.13 Standard tab: AprilTag Classic 36h11 family
- [ ] 4.14 Standard tab: Marker Size in millimeters, sourced per season or measured tag
- [ ] 4.15 Standard tab: Detector Downscale and frame-rate/range tradeoff
- [ ] 4.16 Standard tab: Quality Threshold, using the exact installed UI meaning and range
- [ ] 4.17 Standard tab: ID Filters, single ID and comma-separated IDs
- [ ] 4.18 Standard tab: Cropping and its performance/field-of-view tradeoff
- [ ] 4.19 Multi-target sorting and grouping; show which target produces base `tx`, `ty`, and `ta`
- [ ] 4.20 Advanced tab: Full 3D targeting
- [ ] 4.21 Enter camera pose relative to robot center in meters and define each axis/sign
- [ ] 4.22 Upload/select the official current-season FTC field map
- [ ] 4.23 Compare target-in-robot, robot-in-target, robot-in-field, target-in-camera, camera-in-target, and top-down views
- [ ] 4.24 Optional extension: 3D point-of-interest offset
- [ ] 4.25 UI simulator: changing each input immediately changes image quality, detection rate, or reported pose
- [ ] 4.26 Checkpoint: configure a reliable single-tag pipeline from an intentionally bad starting state

### Module 5 — Understanding camera results

- [ ] 5.1 Result lifecycle: camera frame → processor/pipeline → result → validation → telemetry/control
- [ ] 5.2 `tx`: horizontal angular offset in degrees
- [ ] 5.3 `ty`: vertical angular offset in degrees
- [ ] 5.4 `ta`: target area percentage
- [ ] 5.5 Target/pipeline latency in milliseconds
- [ ] 5.6 Tag ID and the difference between filtering and selecting a result
- [ ] 5.7 VisionPortal `AprilTagDetection` fields: `id`, `metadata`, `center`, and `ftcPose`
- [ ] 5.8 `ftcPose.range`, `bearing`, `elevation`, `yaw`, `pitch`, and `roll`
- [ ] 5.9 Limelight `LLResult`, base targeting values, fiducial result lists, and bot pose
- [ ] 5.10 Camera pose, target pose, robot pose, and field pose: never mix frames silently
- [ ] 5.11 Simulator overlays for angles, distance, axes, latency, and selected target
- [ ] 5.12 Knowledge check: choose the correct value for centering, distance, filtering, and localization

### Module 6 — Limelight FTC Java walkthrough

- [ ] 6.1 Show the complete minimal OpMode before breaking it into segments
- [ ] 6.2 Highlight `Limelight3A limelight` and explain object/reference state
- [ ] 6.3 Highlight `hardwareMap.get(Limelight3A.class, "limelight")` and explain type plus configured name
- [ ] 6.4 Highlight `telemetry.setMsTransmissionInterval(...)` and explain update cadence
- [ ] 6.5 Highlight `setPollRateHz(...)` and separate polling rate from camera frame rate
- [ ] 6.6 Highlight `pipelineSwitch(0)` and explain the pipeline index and fire-and-forget behavior
- [ ] 6.7 Highlight `start()` and explain that it starts result polling
- [ ] 6.8 Highlight `waitForStart()` and OpMode lifecycle placement
- [ ] 6.9 Highlight `while (opModeIsActive())` and explain repeated control updates
- [ ] 6.10 Highlight `getLatestResult()` and explain stale/latest result considerations
- [ ] 6.11 Highlight `result != null` and explain missing result objects
- [ ] 6.12 Highlight `result.isValid()` and explain target validity
- [ ] 6.13 Highlight `getTx()`, `getTy()`, `getTa()`, latency accessors, and units
- [ ] 6.14 Highlight telemetry output and `telemetry.update()`
- [ ] 6.15 Add no-target telemetry and stop/cleanup behavior
- [ ] 6.16 Code player interaction: clicking a concept highlights code and animates the matching simulator effect

### Module 7 — Webcam/VisionPortal FTC Java walkthrough

- [ ] 7.1 Use the pasted official `RobotAutoDriveToAprilTagTank` sample as the advanced source example
- [ ] 7.2 Begin with a smaller detection-only OpMode before showing drive control
- [ ] 7.3 Explain `AprilTagProcessor` and `VisionPortal` member variables
- [ ] 7.4 Explain `AprilTagProcessor.easyCreateWithDefaults()` and the Builder alternative
- [ ] 7.5 Explain `.setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))`
- [ ] 7.6 Explain `.addProcessor(aprilTag)` and `.build()`
- [ ] 7.7 Explain `aprilTag.getDetections()` and iteration over detections
- [ ] 7.8 Explain `detection.metadata != null`
- [ ] 7.9 Explain tag ID filtering and `desiredTag`
- [ ] 7.10 Explain `ftcPose.range` and `ftcPose.bearing`
- [ ] 7.11 Explain waiting for `VisionPortal.CameraState.STREAMING`
- [ ] 7.12 Explain manual exposure and gain controls for supported webcams
- [ ] 7.13 Explain processor/stream cleanup at the end of an OpMode
- [ ] 7.14 Code player interaction mirroring the Limelight walkthrough structure

### Module 8 — From detection to robot control

- [ ] 8.1 Start with a centered-target goal and visual error arrow
- [ ] 8.2 Calculate heading error from Limelight `tx` or VisionPortal `ftcPose.bearing`
- [ ] 8.3 Calculate range error when a trustworthy distance estimate is available
- [ ] 8.4 Apply proportional gain: output = error × gain
- [ ] 8.5 Clip output to a maximum speed/turn value
- [ ] 8.6 Add a tolerance/deadband to stop hunting around zero
- [ ] 8.7 Add lost-target behavior that returns control safely to the driver
- [ ] 8.8 Add driver hold-to-enable override, following the pasted sample’s left-bumper pattern
- [ ] 8.9 Normalize tank or mecanum motor powers
- [ ] 8.10 Show the effect of too-small and too-large gains
- [ ] 8.11 Show latency, blur, and noisy estimates causing oscillation
- [ ] 8.12 Challenge: tune a stable turn-to-tag controller
- [ ] 8.13 Challenge: approach a tag to a desired distance
- [ ] 8.14 Compare equivalent Webcam and Limelight implementations side by side

### Module 9 — Testing and troubleshooting

- [ ] 9.1 Bench-test sequence before motors are enabled
- [ ] 9.2 Confirm correct camera, hardware name, pipeline, family, size, and filter
- [ ] 9.3 Confirm the tag is in frame and the image is not blurred or badly exposed
- [ ] 9.4 Confirm units and coordinate signs by moving the target in known directions
- [ ] 9.5 Confirm telemetry before using values for motor power
- [ ] 9.6 Test no-target and wrong-target cases
- [ ] 9.7 Test maximum outputs and driver override
- [ ] 9.8 Test under field lighting and realistic robot motion
- [ ] 9.9 Troubleshooting decision tree for no detection
- [ ] 9.10 Troubleshooting decision tree for unstable pose
- [ ] 9.11 Troubleshooting decision tree for robot turning the wrong direction
- [ ] 9.12 Final practical assessment

### Module 10 — Recap and next steps

- [ ] 10.1 Camera path recap
- [ ] 10.2 Setup-to-code-to-control flow recap
- [ ] 10.3 Printable field checklist
- [ ] 10.4 Copyable Webcam example
- [ ] 10.5 Copyable Limelight example
- [ ] 10.6 Official documentation and source links
- [ ] 10.7 Instructor discussion prompts and optional advanced topics

## 6. Limelight UI input dictionary

Each simulated input needs a label, unit, safe range, effect, visual demonstration, common mistake, and official-source link.

| Input | Meaning to teach | Simulator response |
| --- | --- | --- |
| Pipeline index | Selects one of ten saved vision configurations | Swap the complete simulated pipeline state |
| Pipeline type | Chooses the vision task, including fiducial/AprilTag tracking | Enable or disable AprilTag controls and results |
| Source image | Uses live camera or a saved snapshot for tuning | Freeze or resume the scene |
| Resolution | Pixel dimensions used by capture/processing | Trade frame rate for range and pose stability |
| Zoom | Uses a smaller sensor region on supported modes | Narrow field of view without stretching |
| Stream orientation | Rotates the displayed stream | Rotate preview only; keep results unchanged |
| Exposure | Sensor exposure time | Change brightness and motion blur |
| Black level offset | Changes the sensor black level | Darken image and suppress bright background detail |
| Sensor gain | Amplifies brightness and noise | Brighten the image while increasing noise |
| Flicker correction | Compensates for lighting frequency when available | Add/remove banding in a teaching animation |
| Red/blue balance | Adjusts white balance | Shift preview color without changing geometric truth |
| Family | Selects AprilTag encoding family | Only matching-family tags are detected |
| Marker size | Expected physical tag size in millimeters | Change pose scale; wrong size produces wrong distance |
| Detector downscale | Reduces detector work | Raise FPS while reducing effective range |
| Quality threshold | Rejects weak candidates according to the installed UI definition | Change rejection and false-positive behavior |
| ID filters | Limits accepted tag IDs | Mark excluded tags and suppress their base target values |
| X/Y crop | Restricts the processed region | Mask the preview and ignore tags outside the region |
| Sort/group mode | Chooses or groups targets for base target values | Move the crosshair to the selected target/group center |
| Full 3D targeting | Enables pose/localization outputs | Reveal 3D axes and pose values |
| Camera pose | Camera translation/rotation relative to robot center | Offset displayed robot pose from camera pose |
| Field map | Defines tag poses in field coordinates | Enable field-space robot localization |
| Point-of-interest offset | Moves the target reference point | Shift reported target-space pose to the chosen object |

## 7. Code content and highlighting model

### Required Limelight example

```java
@TeleOp(name = "AprilTag Workshop")
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
      } else {
        telemetry.addData("Limelight", "No valid target");
      }
      telemetry.update();
    }

    limelight.stop();
  }
}
```

### Highlight behavior

- [ ] Store examples as structured segments with stable IDs, line ranges, titles, explanations, and simulator actions.
- [ ] Highlight only the lines being explained; dim the rest without making it unreadable.
- [ ] Allow instructors to advance line by line using keyboard or presenter controls.
- [ ] Show parameter tooltips for object type, configured name, pipeline index, units, and return type.
- [ ] Animate control flow through initialization, wait-for-start, loop, result check, telemetry, and cleanup.
- [ ] Provide a Compare Both mode that aligns equivalent concepts across APIs.
- [ ] Include copy buttons for the complete code examples and preserve required license notices for copied samples.
- [ ] Clearly distinguish pseudocode, simplified workshop code, and code intended to compile in TeamCode.

### Webcam example progression

- [ ] Example 1: initialize processor and portal
- [ ] Example 2: list detections and print IDs
- [ ] Example 3: filter a desired ID and require metadata
- [ ] Example 4: print range and bearing
- [ ] Example 5: wait for streaming and set manual exposure/gain
- [ ] Example 6: calculate bounded drive and turn commands
- [ ] Example 7: left-bumper enable and manual driver fallback

### Limelight example progression

- [ ] Example 1: get hardware, select pipeline, start, and validate a result
- [ ] Example 2: print `tx`, `ty`, `ta`, and latency
- [ ] Example 3: inspect fiducial results and tag IDs
- [ ] Example 4: center on a tag using `tx`
- [ ] Example 5: configure robot orientation and read MegaTag field pose as an optional advanced lesson
- [ ] Example 6: add bounded output, tolerance, lost-target behavior, and driver override

## 8. Content and asset plan

### Assets to source

- [ ] Limelight 3A product/hardware image from the official quick-start page
- [ ] Limelight 3A mechanical drawing from the official quick-start page
- [ ] Mounting and wiring diagrams created specifically for this app
- [ ] Current LimelightOS full-interface screenshots covering Settings, Input, Standard, Advanced, and 3D Visualization
- [ ] VisionPortal architecture diagram created from official FTC documentation
- [ ] FTC LiveView screenshot or an original simulator reconstruction
- [ ] AprilTag anatomy and size-measurement diagram created for the app
- [ ] Coordinate-frame diagrams created for camera, tag, robot, and field frames
- [ ] Webcam/Control Hub wiring diagram created for the app
- [ ] Screenshots from the linked “Copy of Limelight 3A Tutorial” deck only after confirming reuse rights for every embedded image

### Asset rules

- [ ] Prefer official first-party images and original diagrams.
- [ ] Record source URL, author/owner, retrieval date, license or permission status, and required attribution in an asset manifest.
- [ ] Do not hotlink production images; store approved copies under `public/lesson-assets/`.
- [ ] Do not copy a screenshot from the reference deck until its original source and reuse permission are known.
- [ ] Fit UI screenshots without cropping important controls or stretching the image.
- [ ] Add numbered callouts as separate HTML overlays so they remain readable and accessible.
- [ ] Provide text equivalents for every screenshot-based instruction.
- [ ] Capture installed LimelightOS version with each UI screenshot because labels can change between versions.

### Proposed asset manifest fields

- `id`
- `localPath`
- `sourceUrl`
- `sourceTitle`
- `owner`
- `license`
- `permissionStatus`
- `retrievedAt`
- `limelightOsVersion`
- `altText`
- `usedInLessons`

## 9. Content model and implementation structure

### Suggested repository structure

```text
src/
  app/
  course/
    course-manifest.ts
    modules/
    glossary.ts
    sources.ts
  components/
    CourseOutline.tsx
    SlideStage.tsx
    PresenterControls.tsx
    CameraPathSelector.tsx
    CodeWalkthrough.tsx
    KnowledgeCheck.tsx
    SimulatorDrawer.tsx
  simulation/
    camera-model.ts
    detection-model.ts
    field-model.ts
    control-model.ts
    scenarios.ts
  examples/
    limelight/
    visionportal/
  assets/
    manifest.ts
public/
  lesson-assets/
```

### Lesson schema

- [ ] `id`, module ID, title, estimated time, and objectives
- [ ] camera path: shared, webcam, Limelight, or compare
- [ ] slide type and ordered content blocks
- [ ] speaker notes and learner instructions
- [ ] source citations at the claim or setting level
- [ ] asset IDs and alt text
- [ ] code example ID and highlighted segment ID
- [ ] simulator scenario and initial state
- [ ] completion rule and optional knowledge-check answer
- [ ] next, previous, branch, and rejoin destinations

### State model

- [ ] Current module, lesson, and slide
- [ ] Selected camera path
- [ ] Presenter versus learner mode
- [ ] Completed lessons and knowledge checks
- [ ] Simulator robot, camera, tag, field, pipeline, and runtime state
- [ ] Code walkthrough step
- [ ] Reduced-motion and theme preferences
- [ ] Schema version for safe local-storage migrations

## 10. Milestones

### Milestone 1 — Course shell and content architecture

- [ ] Implement course routing, outline, slide stage, progress, and navigation
- [ ] Add structured lesson and source schemas
- [ ] Convert current Lesson 1 into the new slide format as a proof of concept
- [ ] Add presenter and learner modes
- [ ] Verify keyboard and projected-display usability

### Milestone 2 — Shared AprilTag foundations

- [ ] Build Modules 0–2
- [ ] Create AprilTag anatomy, size, axes, and pose diagrams
- [ ] Integrate the existing field simulator as a drawer
- [ ] Add first knowledge checks

### Milestone 3 — Webcam/VisionPortal path

- [ ] Build Module 3A and the Webcam portions of Modules 5 and 7
- [ ] Add processor/portal construction simulator
- [ ] Add VisionPortal detection and camera-state simulation
- [ ] Add the simplified example and the licensed drive-to-tag sample walkthrough

### Milestone 4 — Limelight setup and UI simulator

- [ ] Build Modules 3B and 4
- [ ] Source approved current Limelight images and screenshots
- [ ] Recreate interactive pipeline inputs with accurate labels and units
- [ ] Add mount, hardware-map, filtering, and 3D camera-pose activities

### Milestone 5 — Code walkthroughs and robot control

- [ ] Build Modules 5–8
- [ ] Implement synchronized line highlighting, telemetry, and simulator actions
- [ ] Add compare-both-camera mode
- [ ] Add bounded turn and approach challenges

### Milestone 6 — Troubleshooting, assessment, and delivery

- [ ] Build Modules 9–10
- [ ] Add troubleshooting decision trees and final practical assessment
- [ ] Add printable checklist and downloadable examples
- [ ] Complete content, accessibility, mobile/Chromebook, and projector QA
- [ ] Validate every technical statement against pinned official sources
- [ ] Run lint, tests, production build, and GitHub Pages path verification

## 11. Acceptance criteria

- [ ] A first-time learner can complete the shared introduction and either camera path without instructor intervention.
- [ ] An instructor can present the course from a 16:9 display using only keyboard controls.
- [ ] Every setup control explains its meaning, unit, effect, and common failure mode.
- [ ] Every code concept named in the request is individually highlightable: `Limelight3A`, `hardwareMap`, `pipelineSwitch`, `start`, `getLatestResult`, `isValid`, and `getTx`.
- [ ] Both Webcam/VisionPortal and Limelight lessons end with working, copyable FTC-style Java examples.
- [ ] The simulator visually connects settings and code to detection values and robot behavior.
- [ ] Units and coordinate frames are always visible beside values.
- [ ] No lesson describes `tx` or `ty` as physical distance.
- [ ] Marker size values are sourced per season or clearly labeled as examples.
- [ ] No copied image is shipped without known reuse status and attribution metadata.
- [ ] Learner progress survives refresh and can be reset.
- [ ] The app meets WCAG-oriented keyboard, focus, contrast, alt-text, and reduced-motion requirements.
- [ ] Lint, unit tests, interaction tests, and production build pass.

## 12. Validation plan

### Content validation

- [ ] Review FTC terminology against the pinned FTC SDK and official FTC Docs.
- [ ] Review Limelight UI labels against the exact LimelightOS version shown in screenshots.
- [ ] Verify all values and units with at least one first-party source.
- [ ] Have an FTC mentor run both code paths on physical hardware before labeling examples “robot-ready.”

### Functional validation

- [ ] Navigation, branching, resume, and reset tests
- [ ] Code highlight-to-explanation mapping tests
- [ ] Simulator tests for sign, units, visibility, filtering, and bounded output
- [ ] No-target, unknown-tag, wrong-family, wrong-size, bad-exposure, and high-latency scenarios
- [ ] Keyboard-only course completion
- [ ] Responsive checks at common Chromebook and projector sizes

### Visual validation

- [ ] Every slide has one clear teaching objective.
- [ ] Screenshots remain legible without browser zoom.
- [ ] Simulator labels do not overlap at supported sizes.
- [ ] Code does not require horizontal scrolling in presenter mode.
- [ ] Source notes are readable but visually secondary.

## 13. Source register

Use these as the initial authoritative source set and pin retrieval dates in the content source file.

- [FIRST Tech Challenge — AprilTag Introduction](https://ftc-docs.firstinspires.org/en/latest/apriltag/vision_portal/apriltag_intro/apriltag-intro.html)
- [FIRST Tech Challenge — VisionPortal Overview](https://ftc-docs.firstinspires.org/en/latest/apriltag/vision_portal/visionportal_overview/visionportal-overview.html)
- [FIRST Tech Challenge — Vision Processor Initialization](https://ftc-docs.firstinspires.org/en/latest/apriltag/vision_portal/vision_processor_init/vision-processor-init.html)
- [FIRST Tech Challenge — VisionPortal Initialization](https://ftc-docs.firstinspires.org/en/latest/apriltag/vision_portal/visionportal_init/visionportal-init.html)
- [FIRST Tech Challenge — VisionPortal CPU and Bandwidth](https://ftc-docs.firstinspires.org/en/latest/apriltag/vision_portal/visionportal_cpu_and_bandwidth/visionportal-cpu-and-bandwidth.html)
- [FIRST Tech Challenge — VisionPortal Camera Controls](https://ftc-docs.firstinspires.org/en/latest/apriltag/vision_portal/visionportal_camera_controls/visionportal-camera-controls.html)
- [FIRST Tech Challenge — `RobotAutoDriveToAprilTagTank`](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/RobotAutoDriveToAprilTagTank.java)
- [FIRST Tech Challenge — `SensorLimelight3A`](https://github.com/FIRST-Tech-Challenge/FtcRobotController/blob/master/FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/SensorLimelight3A.java)
- [Limelight — Limelight 3A Quick-Start](https://docs.limelightvision.io/docs/docs-limelight/getting-started/limelight-3a)
- [Limelight — Pipeline Setup](https://docs.limelightvision.io/docs/docs-limelight/getting-started/pipelines)
- [Limelight — Tracking AprilTags](https://docs.limelightvision.io/docs/docs-limelight/pipeline-apriltag/apriltags)
- [Limelight — FTC Java & Blockly Programming Guide](https://docs.limelightvision.io/docs/docs-limelight/apis/ftc-programming)
- [Reference deck — Copy of Limelight 3A Tutorial](https://docs.google.com/presentation/d/1v-s8sG60iSbBq0LetFFla8qH7atbK3frAVOAXwSYgKI/edit?slide=id.g393d58e6a2b_4_105#slide=id.g393d58e6a2b_4_105)

## 14. Open decisions before implementation

- [ ] Confirm the target workshop duration and whether modules are delivered in one session or several.
- [ ] Confirm whether presenter mode needs instructor-only notes or an exported facilitator guide.
- [ ] Confirm which FTC season and official field map the first release targets.
- [ ] Confirm the exact LimelightOS version used for workshop hardware and screenshots.
- [ ] Confirm whether learners use Java only or need Blocks equivalents.
- [ ] Confirm whether MegaTag localization is core content or an optional advanced module.
- [ ] Confirm permission to reuse any non-original image from the reference deck.
- [ ] Confirm which physical webcam model will be used for hardware validation.

## 15. First implementation slice

- [ ] Create the course manifest and slide schema.
- [ ] Build the course outline, slide stage, Back/Next controls, and presenter mode.
- [ ] Implement Modules 0 and 1 with original diagrams.
- [ ] Add the camera-path comparison and selector from Module 2.
- [ ] Adapt the current field simulator into a collapsible teaching drawer.
- [ ] Add one synchronized code walkthrough for the minimal Limelight example.
- [ ] Add one VisionPortal initialization walkthrough.
- [ ] Add citations and an asset manifest from the start.
- [ ] Validate this slice with an FTC instructor before producing all remaining lessons.
