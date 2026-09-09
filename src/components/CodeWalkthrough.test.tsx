import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { CodeWalkthrough } from "./CodeWalkthrough";
afterEach(cleanup);

describe("code reading controls", () => {
  it("retains section and zoom through expansion and closes when demonstrating in the lab", () => {
    const demonstrate = vi.fn();
    render(<div className="app"><CodeWalkthrough focus="webcam:processor" onDemonstrate={demonstrate}/></div>);
    fireEvent.click(screen.getByRole("button", { name: "Zoom out code" }));
    expect(screen.getByRole("button", { name: "Reset code zoom" })).toHaveTextContent("90%");
    fireEvent.click(screen.getByRole("button", { name: /Helper · initAprilTag/ }));
    fireEvent.click(screen.getByRole("button", { name: "Expand code" }));
    const dialog = screen.getByRole("dialog", { name: "Expanded code walkthrough" });
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByRole("heading", { name: "Helper · initAprilTag()" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Reset code zoom" })).toHaveTextContent("90%");
    fireEvent.click(within(dialog).getByRole("button", { name: "Explore section →" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Show in lab" }));
    expect(demonstrate).toHaveBeenCalledWith("processor", "webcam");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(screen.getByRole("heading", { name: "Build the same AprilTag processor" })).toBeInTheDocument();
  });
});
