import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { storageKey } from "../course/progress";
beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe("course workflows", () => {
  it("navigates, saves completion, and restores position", () => {
    const view = render(<App/>); expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("30 minutes");
    fireEvent.click(screen.getByRole("button", { name: "Next lesson" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Two cameras");
    expect(JSON.parse(localStorage.getItem(storageKey)!).completed).toContain("welcome");
    view.unmount(); render(<App/>); expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Two cameras");
  });
  it("does not expose archived lessons or a course-view switch", () => {
    render(<App/>);
    expect(screen.queryByLabelText("Course view")).not.toBeInTheDocument();
    expect(screen.queryByText(/reference library/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /03A Set up VisionPortal/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /03B Set up Limelight/ })).not.toBeInTheDocument();
  });
  it("switches code examples and demonstrates initialization", () => {
    render(<App/>); fireEvent.click(screen.getByRole("button", { name: "05 Explain the Java" }));
    expect(screen.getByRole("heading", { name: "Variables & constants" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Webcam basics" }));
    fireEvent.click(screen.getByRole("button", { name: /Helper · initAprilTag/ }));
    fireEvent.click(screen.getByRole("button", { name: "Explore section →" }));
    expect(screen.getByText("Build the same AprilTag processor")).toBeInTheDocument();
    expect(screen.queryByText("LINE-BY-LINE")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show in lab" }));
    const lab = screen.getByRole("complementary", { name: "Interactive camera lab" });
    expect(within(lab).getByLabelText("Lab camera")).toHaveValue("webcam");
    expect(within(lab).getByText(/Processor ready/)).toBeInTheDocument();
  });
  it("can remove every tag and provides a recovery path", () => {
    render(<App/>); fireEvent.click(screen.getByRole("button", { name: "Open camera lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Position" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove tag" })); fireEvent.click(screen.getByRole("button", { name: "Remove tag" }));
    expect(screen.getByText(/No tags on the field/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add tag" }));
    expect(screen.getByRole("button", { name: "Select AprilTag 22" })).toBeInTheDocument();
  });
  it("starts the virtual camera, releases assist, and stops on close", () => {
    render(<App/>); fireEvent.click(screen.getByRole("button", { name: "Open camera lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Run OpMode" }));
    expect(screen.getByText(/Opening camera · virtual/)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(480));
    expect(screen.getByText(/Streaming · virtual/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Control" }));
    expect(screen.getByText(/Range error × gain = requested drive power/)).toBeInTheDocument();
    expect(screen.getByText(/Caps automatic turn power/)).toBeInTheDocument();
    expect(screen.getByText(/centered zone around 0°/)).toBeInTheDocument();
    const assist = screen.getByRole("button", { name: /Hold assist/ });
    fireEvent.keyDown(assist, { key: " " }); expect(assist).toHaveClass("active");
    fireEvent.keyUp(assist, { key: " " }); expect(assist).not.toHaveClass("active");
    fireEvent.click(screen.getByRole("button", { name: "Close lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Open camera lab" }));
    expect(screen.getByRole("button", { name: "Stop" })).toBeDisabled();
  });
  it("provides a detailed mecanum aim-assist walkthrough", () => {
    render(<App/>); fireEvent.click(screen.getByRole("button", { name: "05 Explain the Java" }));
    fireEvent.click(screen.getByRole("button", { name: "Mecanum assist" }));
    expect(screen.getByText("MecanumAimAssistLimelight.java")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore section →" }));
    expect(screen.getByText("Name every tuning decision")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next step →" }));
    expect(screen.getByRole("heading", { name: "Main · runOpMode()" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore section →" }));
    expect(screen.getByText("Initialize the drive and camera")).toBeInTheDocument();
  });
  it("includes the supplied FIRST webcam tank example", () => {
    render(<App/>); fireEvent.click(screen.getByRole("button", { name: "05 Explain the Java" }));
    fireEvent.click(screen.getByRole("button", { name: "Webcam tank" }));
    expect(screen.getByText("RobotAutoDriveToAprilTagTank.java")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore section →" }));
    expect(screen.getByText("Set the controller goals and limits")).toBeInTheDocument();

    expect(screen.getByText(/FIRST sample · original license included/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Helper · moveRobot/ }));
    fireEvent.click(screen.getByRole("button", { name: "Explore section →" }));
    expect(screen.getByText("Understand x and yaw in moveRobot")).toBeInTheDocument();
    expect(screen.getByText(/They are not the AprilTag's ftcPose.x/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Tank movement animation" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tag at a slight angle" }));
    expect(screen.getByText(/turn until the tag is centered/)).toBeInTheDocument();
    expect(screen.getByText("ftcPose.x = +18.0 in")).toBeInTheDocument();
    expect(screen.getByText("bearing = +30.0°")).toBeInTheDocument();
    expect(screen.getByText("range = 36.0 in")).toBeInTheDocument();
    expect(screen.getByText("desired = 12 in")).toBeInTheDocument();
  });
  it("expands the lab and rotates the robot from the field", () => {
    render(<App/>); fireEvent.click(screen.getByRole("button", { name: "Open camera lab" }));
    const lab = screen.getByRole("complementary", { name: "Interactive camera lab" });
    fireEvent.click(within(lab).getByRole("button", { name: "Full screen" }));
    expect(lab).toHaveClass("lab-fullscreen");
    fireEvent.click(within(lab).getByRole("button", { name: "Rotate robot left 15 degrees" }));
    expect(within(lab).getByLabelText("Robot rotation (degrees)")).toHaveValue("105");
    fireEvent.click(within(lab).getByRole("button", { name: "Exit full screen" }));
    expect(lab).not.toHaveClass("lab-fullscreen");
  });
  it("keeps the workshop focused", () => {
    render(<App/>); expect(screen.getByText("0 of 13 lessons complete")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "03 LimelightOS essentials" }));
    expect(screen.getByText(/A pipeline is one saved set of camera and detection settings/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Resolution & zoom/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Stream orientation/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Black level offset/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Red & blue balance/ })).not.toBeInTheDocument();
    expect(screen.getByText("Recommended starting point")).toBeInTheDocument();
    expect(screen.getByText("Advantages")).toBeInTheDocument();
    expect(screen.getByText("Tradeoffs")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Resolution & zoom/ }));
    expect(screen.getByText(/does not remove motion blur/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Flicker correction/ }));
    expect(screen.getByText(/accounts for the rapid on-and-off cycle of powered light sources/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Detector downscale/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Configuration" }));
    fireEvent.click(screen.getByRole("button", { name: /Detector downscale/ }));
    expect(screen.getByText(/gives the detector fewer pixels to search/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Quality threshold/ }));
    expect(screen.getByText(/Begin with the installed LimelightOS default/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Quality threshold (whole number)")).not.toBeInTheDocument();
    expect(screen.queryByText("TRY THE TEACHING CONTROL")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Advanced" })).not.toBeInTheDocument();
    expect(screen.getByText("0 of 13 lessons complete")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next lesson" }));
    expect(screen.getByRole("heading", { name: "What does Limelight return?" })).toBeInTheDocument();
  });
  it("shows the USB 3.0 recommendation and USB 2.0 cautions", () => {
    render(<App/>); fireEvent.click(screen.getByRole("button", { name: "02 Connect & configure" }));
    const note = screen.getByRole("note", { name: "USB port recommendation" });
    expect(note).toHaveTextContent("Recommendation: use the blue USB 3.0 port");
    expect(note).toHaveTextContent("USB 3.0 only");
    expect(note).toHaveTextContent("shares a bus with the internal Wi-Fi radio");
  });
  it("explains Limelight and AprilTagProcessor target values", () => {
    render(<App/>); fireEvent.click(screen.getByRole("button", { name: "04 Understand target data" }));
    expect(screen.getByRole("region", { name: "Limelight target values" })).toHaveTextContent("result.getTx()");
    expect(screen.getByText(/tx is an angle, not sideways distance/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /What does AprilTagProcessor return/ }));
    const guide = screen.getByRole("region", { name: "AprilTagProcessor target values" });
    expect(guide).toHaveTextContent("ftcPose.range"); expect(guide).toHaveTextContent("ftcPose.bearing"); expect(guide).toHaveTextContent("ftcPose.pitch / roll / yaw");
  });
});








