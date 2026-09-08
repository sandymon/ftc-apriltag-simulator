import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

afterEach(cleanup);

describe("App", () => {
  it("starts and stops the simulated OpMode", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /run opmode/i }));
    expect(screen.getByText("OPMODE RUNNING")).toBeInTheDocument();
    expect(screen.getByText("● VALID")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /apriltag 24/i }));
    expect(screen.getByText(/tag 24 center detected/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Backspace" });
    expect(screen.queryByRole("button", { name: /apriltag 24/i })).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: "a" });
    expect(screen.getByRole("button", { name: /apriltag 24/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /stop/i }));
    expect(screen.getByText("CONFIGURATION MODE")).toBeInTheDocument();
  });

  it("allows every AprilTag to be removed", () => {
    render(<App />);
    for (let index = 0; index < 5; index += 1) fireEvent.keyDown(window, { key: "Backspace" });
    expect(screen.queryByRole("button", { name: /apriltag \d+/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /run opmode/i }));
    expect(screen.getByText(/no apriltag is on the field/i)).toBeInTheDocument();
  });
});
