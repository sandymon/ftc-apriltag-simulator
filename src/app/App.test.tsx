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
  it("filters camera-specific modules and safely rejoins shared content", () => {
    render(<App/>); fireEvent.change(screen.getByLabelText("Course view"), { target: { value: "reference" } }); fireEvent.click(screen.getByRole("button", { name: /03B Set up Limelight/ }));
    fireEvent.click(screen.getByRole("button", { name: "Webcam" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Two cameras.");
    expect(screen.queryByRole("button", { name: /03B Set up Limelight/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /03A Set up VisionPortal/ })).toBeInTheDocument();
  });
  it("records a quiz only after the correct answer", () => {
    render(<App/>); fireEvent.change(screen.getByLabelText("Course view"), { target: { value: "reference" } }); fireEvent.click(screen.getByRole("button", { name: /02 Choose your camera/ })); fireEvent.click(screen.getByRole("button", { name: "Follow the pixels" }));
    fireEvent.click(screen.getByRole("button", { name: /AVisionPortal by itself/ }));
    expect(JSON.parse(localStorage.getItem(storageKey)!).completed).not.toContain("path-check");
    fireEvent.click(screen.getByRole("button", { name: /BAprilTagProcessor attached/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Correct.");
    expect(JSON.parse(localStorage.getItem(storageKey)!).completed).toContain("path-check");
  });
  it("switches code examples and demonstrates initialization", () => {
    render(<App/>); fireEvent.click(screen.getByRole("button", { name: "05 Explain the Java" }));
    expect(screen.getByText("Get a configured device")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "VisionPortal" }));
    fireEvent.click(screen.getByRole("button", { name: "Show in lab" }));
    const lab = screen.getByRole("complementary", { name: "Interactive camera lab" });
    expect(within(lab).getByLabelText("Lab camera")).toHaveValue("webcam");
    expect(within(lab).getByText(/Processor ready/)).toBeInTheDocument();
  });
  it("can remove every tag and provides a recovery path", () => {
    render(<App/>); fireEvent.click(screen.getByRole("button", { name: "Open camera lab" }));
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
    const assist = screen.getByRole("button", { name: /Hold assist/ });
    fireEvent.keyDown(assist, { key: " " }); expect(assist).toHaveClass("active");
    fireEvent.keyUp(assist, { key: " " }); expect(assist).not.toHaveClass("active");
    fireEvent.click(screen.getByRole("button", { name: "Close lab" }));
    fireEvent.click(screen.getByRole("button", { name: "Open camera lab" }));
    expect(screen.getByRole("button", { name: "Stop" })).toBeDisabled();
  });
  it("keeps the workshop focused and makes reference material optional", () => {
    render(<App/>); expect(screen.getByText("0 of 18 lessons complete")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "03 LimelightOS essentials" }));
    expect(screen.getAllByText(/A pipeline is one saved set of camera and detection settings/)).toHaveLength(2);
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
    expect(screen.queryByRole("button", { name: "Advanced" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Course view"), { target: { value: "reference" } });
    expect(screen.getByText("0 of 99 lessons complete")).toBeInTheDocument();
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
