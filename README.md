# AprilTag Lab — 30-minute FTC workshop

A slide-style staff workshop focused on LimelightOS, FTC Java, target measurements, and an interactive camera simulator. The default course has **18 lessons in seven timed sections**. The longer 99-lesson library is optional reference material, available from the Course view selector.

## Workshop agenda

| Time | Activity |
| --- | --- |
| 0–2 min | AprilTag basics; webcam/VisionPortal versus Limelight |
| 2–5 min | Connect Limelight, name it in Robot Configuration, open LimelightOS |
| 5–11 min | Pipeline/type, 36h11 family, measured size, exposure/gain, ID filters |
| 11–16 min | Interpret Limelight and AprilTagProcessor target values and units |
| 16–23 min | Highlight and explain Java initialization, result validity, tx, and the webcam equivalent |
| 23–28 min | Move a tag, observe the angle, try bounded turn assistance, test target loss |
| 28–30 min | Download examples, recap setup/result/control checks, take questions |

See [WORKSHOP_30_MINUTES.md](WORKSHOP_30_MINUTES.md) for the facilitator checklist and current implementation scope. This shorter workshop supersedes the original broad plan as the default experience.

## Run locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints, including `/ftc-apriltag-simulator/`. Vite may choose a different port if 5173 is occupied.

```bash
npm run lint
npm test
npm run build
```

The existing GitHub Pages base path and deployment workflow are retained. The production output is `dist/`. No backend, authentication, API keys, or robot connection is required.

## Using the app

- Follow Next/Previous or use the outline. Arrow keys navigate when focus is outside an interactive control.
- Presenter mode enlarges content, puts code beside its explanation, and offers expandable timed facilitator notes. Escape exits presenter mode.
- Select code lines or use Next step. Show in lab demonstrates the selected operation. Copy code and Download Java provide complete source files.
- Open camera lab from any lesson. Drag the robot/tags or use labeled position controls. Run OpMode starts the virtual camera; Stop and closing the lab halt automatic motion.
- Hold assist in Control to enable bounded commands. Release, loss of usable data, or window blur disables assistance.
- Lesson position, completion, course view, camera reference path, theme, and reduced-motion preference persist in this browser. Lab runtime and walkthrough steps reset on reload.
- The optional reference library contains the extra setup controls, pose-frame illustrations, full examples, quizzes, diagnostic trees, and printable checklist.

## Sources and assets

Official FTC and Limelight references are recorded in `src/course/sources.ts`, reviewed September 8, 2026. The FTC source reference is pinned at commit `26cd1fdd2a3c4b26173d9ff33a3279c27d1c7ad1` under `upstream/FtcRobotController`; its license is in `LICENSES/FTC-SDK-LICENSE.txt`.

The user confirmed permission to reuse the reference deck screenshots. Attribution, source slides, and the unknown LimelightOS-version status are recorded in `public/lesson-assets/manifest.json`. The supplied FIRST tank sample retains its complete original license. Tag image provenance remains in `public/apriltags/manifest.json`.

## Model and validation limits

The lab models 2D geometry plus height, angle signs, visibility, configuration failures, delayed/frozen captures, and bounded tank commands. Image quality and FPS are illustrative. It does not run Java, analyze camera pixels, connect to a robot, or implement a six-axis pose solver/MegaTag localization. Its movable field uses practice tags of 50.8 mm and is not an official season map.

Examples use checked FTC APIs but have not been compiled or exercised on physical FTC hardware. Before commanding motors, validate the SDK, hardware names, camera settings, tag selection, freshness, units, motor directions, output limits, and driver override. Reference screenshot values are historical examples, not recommended robot settings.

The workshop recommends the blue Control Hub USB 3.0 port for Limelight 3A; Limelight specifies it and REV's compatibility chart calls the camera “USB 3.0 only.” One reason to avoid USB 2.0 is its documented ESD vulnerability: it shares a bus with the Control Hub's Wi-Fi radio, so ESD or electrical interference can disconnect the Driver Hub. USB 3.0 also provides more bandwidth headroom.

Automated checks cover course/progress integrity, real code highlight locations, simulator signs/visibility/faults/bounds, closed-loop convergence, navigation, reference selection, camera startup, and assist release. Browser checks cover the normal desktop view, 1366×768 layout, 390×844 layout, code selection, screenshot lessons, and camera controls. This is not a formal accessibility certification or physical hardware qualification.
