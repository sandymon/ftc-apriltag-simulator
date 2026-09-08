# FTC AprilTag Workshop Simulator — MVP Build Plan

## 1. Project Summary

Build a browser-based training simulator that teaches staff how to configure and program AprilTag detection for FTC robots using either:

- A Limelight 3A
- A standard webcam through FTC VisionPortal

The simulator will be hosted as a static application on GitHub Pages. It will use real FTC-style Java syntax, class names, imports, methods, and OpMode patterns. Physical hardware, Android services, USB devices, and camera processing will be replaced by browser-based simulated objects.

The objective is not to reproduce the complete FTC Robot Controller or create realistic robot physics. The objective is to let staff understand and practice the path from camera configuration to AprilTag data to robot behavior.

## 2. MVP Outcome

At the end of the MVP, a staff member can:

1. Select Limelight 3A or Webcam/VisionPortal.
2. Configure the virtual camera.
3. Write or modify FTC-style Java code.
4. Start a simulated OpMode.
5. Detect a simulated AprilTag.
6. Read tag ID, validity, `tx`, `ty`, `ta`, and latency.
7. Estimate distance using mounting geometry.
8. Use `tx` to rotate a simulated robot toward a tag.
9. Add tolerance, output limiting, tag filtering, and driver override.
10. View telemetry and useful configuration or code errors.
11. Copy the completed code into an FTC `TeamCode` project with minimal changes.

## 3. MVP Boundaries

### Included

- Static GitHub Pages deployment
- Desktop and Chromebook-compatible web interface
- FTC-style Java editor
- Syntax highlighting and basic autocomplete
- Controlled Java-like parser/interpreter
- Virtual `LinearOpMode` lifecycle
- Virtual hardware map
- Limelight 3A simulation
- Webcam/VisionPortal simulation
- AprilTag result simulation
- Telemetry panel
- Simple top-down robot and tag view
- Basic mecanum rotation response
- Guided workshop lessons
- Starter code, hints, reset, and expected outcomes
- Local browser progress storage
- Accessibility and keyboard operation

### Not Included

- Full Android FTC Robot Controller application
- APK compilation
- Real Control Hub communication
- Real USB webcam access
- Real Limelight networking
- Actual image processing or computer vision
- Full Java language support
- Every FTC SDK class
- Full drivetrain physics
- 3D robot or FTC field
- User accounts, cloud saving, database, or instructor dashboard
- Multiplayer or live collaboration
- Automatic deployment of code to a robot

## 4. Important Technical Constraint

The official `FtcRobotController` project cannot run directly in GitHub Pages. It is an Android Gradle project and depends on Android APIs, FTC Maven artifacts, Control Hub services, USB hardware, and native components.

The simulator should therefore use two separate layers:

1. **Official SDK reference** — a pinned copy or Git submodule used to verify real package names, classes, methods, examples, and licensing.
2. **Browser simulation SDK** — a small set of simulated FTC classes with compatible names and behavior for the workshop.

The browser simulation must be clearly described as a training environment, not a replacement for testing code on a real FTC robot.

## 5. Official FTC SDK Reference

Repository:

`https://github.com/FIRST-Tech-Challenge/FtcRobotController`

At the time this plan was written, the master branch referenced FTC SDK `11.2.1` and used Android Gradle Plugin `8.13.2`. The project is published under the BSD 3-Clause Clear License.

Add it to the simulator repository as a Git submodule:

```bash
git submodule add \
  https://github.com/FIRST-Tech-Challenge/FtcRobotController.git \
  upstream/FtcRobotController
```

Pin the submodule to a tested commit. Do not automatically track the newest master commit during production deployments.

Required licensing work:

- Preserve the FTC SDK copyright and license notice.
- Store the license under `LICENSES/FTC-SDK-LICENSE.txt`.
- Document the exact pinned FTC SDK commit in the simulator README.
- Do not imply that FIRST endorses the simulator.
- Review licenses for any separate Limelight, editor, parser, or runtime packages.

## 6. Recommended Technology Stack

### Application

- React
- TypeScript
- Vite
- CSS Modules or scoped application CSS
- Vitest
- React Testing Library
- Playwright for end-to-end testing

### Code editor

- Monaco Editor
- Custom Java language definitions for the supported FTC simulation API
- Custom autocomplete entries generated from the simulation SDK manifest

### Java-like code processing

Recommended MVP approach:

- Parse a controlled subset of Java.
- Validate supported imports, classes, variables, expressions, conditions, method calls, and loops.
- Convert supported statements into a safe internal representation.
- Execute that representation against the browser simulation SDK.
- Run parsing and execution inside a Web Worker.

Do not use `eval()` on participant code.

A complete in-browser Java compiler/JVM can be investigated after the MVP. It is not required to teach the target concepts and would substantially increase load time, complexity, and maintenance.

## 7. Repository Structure

```text
ftc-apriltag-simulator/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy-pages.yml
├── LICENSES/
│   └── FTC-SDK-LICENSE.txt
├── public/
│   ├── apriltags/
│   └── lesson-assets/
├── upstream/
│   └── FtcRobotController/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.ts
│   │   └── state.ts
│   ├── components/
│   │   ├── CameraConfiguration.tsx
│   │   ├── CodeEditor.tsx
│   │   ├── LessonNavigation.tsx
│   │   ├── RobotSimulator.tsx
│   │   ├── RunControls.tsx
│   │   ├── SensorValues.tsx
│   │   └── TelemetryPanel.tsx
│   ├── lessons/
│   │   ├── lesson-01-camera-setup.ts
│   │   ├── lesson-02-read-tag-id.ts
│   │   ├── lesson-03-read-values.ts
│   │   ├── lesson-04-distance.ts
│   │   ├── lesson-05-align.ts
│   │   └── lesson-06-safety.ts
│   ├── parser/
│   │   ├── tokenizer.ts
│   │   ├── parser.ts
│   │   ├── validator.ts
│   │   ├── interpreter.ts
│   │   ├── diagnostics.ts
│   │   └── worker.ts
│   ├── simulation/
│   │   ├── clock.ts
│   │   ├── field.ts
│   │   ├── physics.ts
│   │   ├── robot.ts
│   │   └── runtime.ts
│   ├── ftc-sim-sdk/
│   │   ├── opmode/
│   │   ├── hardware/
│   │   ├── telemetry/
│   │   ├── limelight/
│   │   ├── visionportal/
│   │   └── api-manifest.ts
│   ├── persistence/
│   │   └── local-storage.ts
│   └── test/
├── README.md
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## 8. Browser Simulation SDK

The simulation classes should expose FTC-compatible concepts while remaining intentionally small.

### Core OpMode classes

#### `LinearOpMode`

Required simulated members:

```java
hardwareMap
telemetry
gamepad1
gamepad2
waitForStart()
opModeIsActive()
isStopRequested()
sleep(long milliseconds)
```

MVP behavior:

- `waitForStart()` pauses until the Run button begins the simulation.
- `opModeIsActive()` is true while the simulator is running.
- The simulator enforces a maximum loop count and runtime.
- Stop immediately ends the virtual OpMode.

### Hardware map

#### `HardwareMap`

Required behavior:

```java
hardwareMap.get(DcMotor.class, "left_front_drive");
hardwareMap.get(Limelight3A.class, "limelight");
hardwareMap.get(WebcamName.class, "Webcam 1");
```

The virtual configuration should define available device names. Incorrect names should produce a familiar hardware-map error.

### Telemetry

Required methods:

```java
telemetry.addData(String caption, Object value);
telemetry.addLine(String line);
telemetry.clear();
telemetry.update();
```

Telemetry should appear in a console-like panel with timestamps or simulation ticks.

### Gamepad

Required MVP fields:

```java
left_stick_x
left_stick_y
right_stick_x
right_stick_y
a
b
x
y
dpad_left
dpad_right
```

Map controls to keyboard keys and optional on-screen inputs.

### DC motors

#### `DcMotor`

Required methods and enums:

```java
setPower(double power)
getPower()
setDirection(Direction direction)
setZeroPowerBehavior(ZeroPowerBehavior behavior)
```

Motor power should update the simple robot model. The MVP only needs enough mecanum behavior to demonstrate turning and basic driver override.

## 9. Limelight 3A Simulation

### `Limelight3A`

Required methods:

```java
setPollRateHz(int rate)
pipelineSwitch(int pipeline)
start()
stop()
getLatestResult()
```

Required configuration state:

- Device name
- Started/stopped
- Pipeline number
- Pipeline type
- Tag family
- Tag size
- ID filter
- Camera height
- Camera angle
- Camera orientation
- Poll rate

### `LLResult`

Required methods:

```java
isValid()
getTx()
getTy()
getTa()
getTl()
getFiducialResults()
```

### `LLResultTypes.FiducialResult`

Required method:

```java
getFiducialId()
```

The Limelight simulation should return invalid results when:

- The camera has not started.
- The selected pipeline is not configured for AprilTags.
- The visible tag is outside the camera view.
- The visible tag is excluded by the ID filter.
- The simulated image quality falls below a threshold.

## 10. Webcam and VisionPortal Simulation

### `WebcamName`

Represents the virtual webcam from `hardwareMap`.

### `VisionPortal`

Required builder operations:

```java
new VisionPortal.Builder()
    .setCamera(webcam)
    .addProcessor(aprilTag)
    .enableLiveView(true)
    .setAutoStopLiveView(false)
    .build();
```

Required method:

```java
close()
```

### `AprilTagProcessor`

Required operations:

```java
new AprilTagProcessor.Builder().build();
getDetections();
```

### `AprilTagDetection`

Required fields:

```java
id
ftcPose.x
ftcPose.y
ftcPose.z
ftcPose.range
ftcPose.bearing
ftcPose.elevation
```

Important teaching difference:

- Limelight `tx` is an angular offset in degrees.
- VisionPortal `ftcPose.x` represents a positional offset in the selected distance unit.
- Gains and tolerances should not be copied between those measurements without adjustment.

## 11. Simulated AprilTag Environment

The 2D environment should contain:

- One robot rectangle
- Camera position and facing direction
- One or more draggable AprilTag markers
- Tag ID displayed on every marker
- Camera field-of-view indicator
- Optional target-to-camera line
- Position controls for mouse, touch, and keyboard

The environment calculates:

- Whether a tag is in view
- Horizontal angle (`tx`)
- Vertical angle (`ty`) using simplified height geometry
- Apparent target area (`ta`)
- Distance
- Bearing
- Validity
- Simulated latency

The model should be deterministic. The same positions and configuration should produce the same values, which makes instruction and testing easier.

## 12. Robot Behavior Model

The MVP does not need realistic physics.

Required state:

```text
x position
y position
heading
left-front motor power
left-back motor power
right-front motor power
right-back motor power
```

Required behavior:

- Apply clipped motor powers from `-1.0` through `1.0`.
- Convert mecanum motor values into approximate forward, strafe, and turn motion.
- Animate robot heading changes.
- Stop when the OpMode stops or an execution limit is reached.
- Allow simulation speed to be slowed for instruction.

## 13. Supported Java Subset

The first parser should support only what the workshop requires.

### Syntax

- Imports
- Class declaration
- Fields and local variables
- Primitive types: `boolean`, `int`, `double`, `long`
- Selected object types from the simulation SDK
- Assignment
- Arithmetic operators
- Comparison operators
- Boolean operators
- Method calls
- Field access
- `if`, `else`
- `while`
- Basic `for` loops if needed
- `return`
- Comments
- Selected `Math` methods
- Selected `List` operations

### Initially unsupported

- Threads
- Reflection
- File access
- Networking
- Arbitrary Android APIs
- Custom dependencies
- Generics beyond supplied SDK patterns
- Lambda expressions
- Recursion
- Unbounded loops
- Dynamic class loading

Unsupported features should produce a specific diagnostic rather than failing silently.

## 14. Execution Safety

Participant code must run inside a Web Worker.

Required limits:

- Maximum statements per tick
- Maximum OpMode runtime
- Maximum loop iterations
- Maximum telemetry rows
- Maximum stored code size
- Stop button that terminates the worker
- No browser DOM access from participant code
- No network access from participant code
- No `eval()` or `new Function()` using participant input

If a loop exceeds the limit, display an instructional message such as:

> The OpMode exceeded the simulator’s loop limit. Check whether the loop can stop or whether `opModeIsActive()` is being used correctly.

## 15. User Interface

### Main layout

Desktop layout:

- Left: lesson instructions and camera configuration
- Center: code editor and run controls
- Right: robot simulation, sensor values, and telemetry

Narrow screens:

- Stack the panels vertically.
- Keep Run and Stop visible near the editor.
- Avoid requiring horizontal scrolling for lesson instructions.

### Required controls

- Lesson selector
- Camera selector
- Run
- Stop
- Reset code
- Reset simulation
- Hint
- Show expected behavior
- Camera configuration fields
- Draggable tag
- Gamepad inputs

### Required status information

- Current lesson
- Camera type
- Pipeline
- OpMode status
- Tag validity
- Tag ID
- `tx`
- `ty`
- `ta`
- Latency
- Estimated distance where applicable
- Motor powers
- Parser or runtime errors

## 16. Workshop Lessons

### Lesson 1: Configure the camera

Staff configure:

- Camera type
- Hardware name
- Pipeline
- AprilTag mode
- Tag family
- Tag size
- ID filter

Success condition:

- The camera starts and returns a valid result for the visible tag.

### Lesson 2: Read a tag ID

Concepts:

- Get the latest result.
- Check for null.
- Check validity.
- Access fiducial results or detections.
- Read the tag ID.

Success condition:

- Telemetry displays the correct visible tag ID.

### Lesson 3: Read camera measurements

Concepts:

- `tx`
- `ty`
- `ta`
- Latency
- Difference between an angle and a physical offset

Success condition:

- Telemetry updates correctly as the tag moves.

### Lesson 4: Estimate distance

Concepts:

- Camera height
- Tag height
- Mounting angle
- `ty`
- Degree-to-radian conversion
- Geometry limitations

Success condition:

- The calculated distance is within an allowed tolerance of the simulator’s known distance.

### Lesson 5: Align to the AprilTag

Concepts:

- Desired alignment
- Error
- Proportional gain
- Output clipping
- Motor turn direction

Success condition:

- The robot turns toward the selected tag and stops close to the desired alignment.

### Lesson 6: Add reliability and driver control

Concepts:

- Tag ID filter
- Range condition
- Alignment tolerance
- Driver-turn override
- Target loss
- Safe fallback behavior

Success condition:

- The robot assists only under valid conditions and stops correcting when the driver overrides it or the target disappears.

## 17. Starter Code Requirements

Every lesson should provide:

- A complete starter OpMode
- One clearly identified task
- No more than three missing or incorrect code sections
- A Run-ready baseline whenever possible
- One hint
- A second, more specific hint
- An instructor solution
- A short explanation of why the solution works
- A direct link or file reference to comparable real FTC code

Starter code should use the same hardware names across lessons unless the lesson specifically teaches configuration errors.

## 18. Diagnostics and Feedback

Required configuration errors:

- Camera device not found
- Camera not started
- Pipeline not found
- Pipeline not configured for AprilTags
- Tag family mismatch
- Tag ID filtered out
- Invalid tag size
- Tag outside field of view

Required code errors:

- Unsupported import
- Unknown class
- Unknown method
- Incorrect hardware name
- Variable not defined
- Type mismatch for supported types
- Missing null check warning
- Missing validity check warning
- Motor power outside expected range warning
- Loop limit exceeded

Required behavioral feedback:

- Robot is turning away from the target; check correction sign.
- Gain is causing repeated overshoot.
- Correction is being limited by `maxTurn`.
- Error is inside the tolerance.
- Driver override is active.
- Target was lost; correction set to zero.

## 19. State and Persistence

Use browser `localStorage` for:

- Current lesson
- Camera selection
- Participant code for each lesson
- Completed lessons
- Simulator preferences

Required behavior:

- Save automatically after code or configuration changes.
- Provide a clear “Reset lesson” action.
- Do not store personal information.
- Allow the complete workshop state to be cleared.

## 20. Accessibility Requirements

- Entire workshop operable by keyboard
- Visible focus indicators
- Proper labels for all controls
- No meaning communicated by color alone
- Text alternative for the simulated robot state
- `aria-live` region for telemetry summaries and errors
- Pause or reduce motion when the operating system requests reduced motion
- Touch targets appropriate for Chromebooks and tablets
- Minimum readable editor and interface text sizes
- High contrast in light and dark modes

## 21. GitHub Pages Deployment

The application must build to static HTML, JavaScript, CSS, and asset files.

Vite configuration must use the repository base path:

```ts
export default defineConfig({
  base: "/ftc-apriltag-simulator/",
});
```

The deployment workflow should:

1. Check out the repository and submodules.
2. Install the pinned Node version.
3. Run `npm ci`.
4. Run linting and tests.
5. Build the application.
6. Upload the `dist` directory as the Pages artifact.
7. Deploy the artifact to GitHub Pages.

Do not place secrets in the application. Everything published through GitHub Pages is publicly downloadable.

## 22. Development Milestones

### Milestone 1: Project shell

- Create React, TypeScript, and Vite application.
- Add responsive three-panel layout.
- Add GitHub Pages workflow.
- Add CI workflow.
- Add the FTC SDK as a pinned submodule.
- Add license notices.

Completion test:

- A placeholder application deploys successfully to GitHub Pages.

### Milestone 2: Static simulator

- Add draggable tag.
- Add robot rectangle.
- Calculate visible tag, ID, `tx`, `ty`, `ta`, and distance.
- Display live sensor values.

Completion test:

- Moving the tag produces deterministic sensor values.

### Milestone 3: FTC simulation SDK

- Implement OpMode lifecycle.
- Implement hardware map.
- Implement telemetry.
- Implement gamepad.
- Implement motors.
- Implement Limelight result objects.
- Implement VisionPortal result objects.

Completion test:

- Hard-coded lesson commands can operate the simulator using the simulation SDK.

### Milestone 4: Code editor and parser

- Add Monaco Editor.
- Add supported FTC API autocomplete.
- Add tokenizer and parser.
- Add validator and diagnostics.
- Add Web Worker execution.
- Add Run, Stop, and Reset.

Completion test:

- Staff can edit supported FTC-style Java and see the simulation respond.

### Milestone 5: Guided lessons

- Add the six MVP lessons.
- Add starter code.
- Add hints and solutions.
- Add success checks.
- Add progress saving.

Completion test:

- A staff member can complete the full workshop without modifying application source code.

### Milestone 6: Quality and pilot

- Add unit tests.
- Add end-to-end tests.
- Test keyboard accessibility.
- Test current Chrome and Edge on Windows and ChromeOS.
- Test Safari on macOS if it will be used by staff.
- Run a pilot with at least two staff members unfamiliar with the implementation.
- Record confusing instructions and unsupported code patterns.

Completion test:

- Pilot participants can complete tag reading, distance, and alignment tasks with only the provided instructions and hints.

## 23. Testing Requirements

### Unit tests

- `tx` calculation
- `ty` calculation
- `ta` approximation
- Distance calculation
- Field-of-view visibility
- ID filtering
- Pipeline validity
- Output clipping
- Mecanum turn calculation
- OpMode lifecycle
- Loop limits
- Parser diagnostics

### Integration tests

- Limelight startup through valid result
- VisionPortal startup through detection
- Telemetry output
- Tag loss behavior
- Wrong ID behavior
- Driver override
- Code reset and state restore

### End-to-end tests

- Complete every workshop lesson
- Refresh and restore saved progress
- Stop a long-running OpMode
- Use keyboard-only controls
- Deploy and load from the GitHub Pages subdirectory path

## 24. MVP Acceptance Criteria

The MVP is complete when all of the following are true:

- The application is publicly accessible through GitHub Pages.
- No backend service is required.
- Staff can choose Limelight or Webcam/VisionPortal.
- The editor recognizes the supported FTC simulation API.
- Supported FTC-style code executes without using browser `eval()`.
- A tag can be moved and its simulated measurements update.
- The robot can rotate in response to code.
- Telemetry shows tag and control data.
- Invalid configurations produce understandable errors.
- Infinite or excessive loops are safely stopped.
- All six lessons have starter code, hints, solutions, and automatic success checks.
- Progress persists locally.
- Core interactions work with keyboard and screen reader labels.
- The repository includes FTC SDK attribution and all required licenses.
- The README explains the difference between simulation and real hardware.

## 25. Decisions Needed Before Implementation

1. Final repository name and GitHub Pages URL.
2. Whether the repository will be public.
3. Exact FTC SDK commit or release to pin.
4. Exact Limelight API version to model.
5. Whether the MVP must support complete `LinearOpMode` class syntax or lesson-sized code sections only.
6. Whether staff should type all code or primarily modify starter code.
7. Whether multiple AprilTags are required in the MVP.
8. Whether basic robot translation is required or rotation alone is enough.
9. Which browsers and devices will be available during the workshop.
10. Workshop duration and whether lessons must fit into one session.

## 26. Recommended MVP Decisions

To keep the first release achievable:

- Use a public repository named `ftc-apriltag-simulator`.
- Pin the FTC SDK submodule to the currently tested `11.2.1` project state.
- Support complete-looking `LinearOpMode` starter files, but interpret only the required language subset.
- Have staff modify starter code instead of writing every import and class from scratch.
- Support up to three visible tags.
- Simulate rotation and simple forward/strafe movement, but prioritize rotation.
- Target current Chrome and Edge first.
- Design the six lessons for one 90-minute staff workshop.

## 27. Post-MVP Possibilities

- Full browser Java compilation
- Additional FTC sensors
- Autonomous path simulation
- Multiple cameras
- Camera noise and latency controls
- Field maps and robot localization
- Shareable workshop-state links
- Instructor-created lessons
- Export code directly as a `.java` file
- Import an existing OpMode for compatibility analysis
- Integration with Blocks-style programming
- Offline Progressive Web App support
- Multiple FTC game field configurations

## 28. Definition of Success

The simulator succeeds when staff stop seeing AprilTag programming as an unexplained block of vision code and can clearly trace this sequence:

```text
Camera configuration
→ valid AprilTag result
→ tag ID and measurements
→ calculated error
→ bounded robot command
→ observed robot behavior
```

After completing the workshop, staff should be able to repeat the same sequence on a physical FTC robot and understand which values, hardware names, and settings must be changed for that robot.
