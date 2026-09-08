# FTC AprilTag Workshop Simulator

A browser-based training environment for learning how FTC robots configure cameras, read AprilTag results, and turn measurements into bounded robot commands. The simulator targets GitHub Pages and uses FTC-style Java while replacing hardware and Android services with deterministic browser simulations.

> This is a training simulation, not a replacement for testing on a physical FTC robot. FIRST does not endorse this project.

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
npm run build
```

The application is configured for the GitHub Pages base path `/ftc-apriltag-simulator/`.

## FTC SDK reference

The official FTC Robot Controller 11.2.1 source is pinned as a Git submodule at `upstream/FtcRobotController` at commit `26cd1fdd2a3c4b26173d9ff33a3279c27d1c7ad1`. The SDK remains subject to its own license in `LICENSES/FTC-SDK-LICENSE.txt`.

## Current status

Milestone 1 project shell: responsive three-panel workshop layout, Vite build, unit-test foundation, CI, and Pages deployment.
