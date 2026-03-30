import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "result"
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "id", toolName, args, state, result: "ok" };
  }
  return { toolCallId: "id", toolName, args, state };
}

// str_replace_editor labels
test("shows 'Creating' for str_replace_editor create command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "src/components/Button.tsx",
      })}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor str_replace command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "str_replace",
        path: "src/App.tsx",
      })}
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor insert command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "insert",
        path: "src/App.tsx",
      })}
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("shows 'Viewing' for str_replace_editor view command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "view",
        path: "src/App.tsx",
      })}
    />
  );
  expect(screen.getByText("Viewing App.tsx")).toBeDefined();
});

test("shows 'Undoing edit in' for str_replace_editor undo_edit command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "undo_edit",
        path: "src/App.tsx",
      })}
    />
  );
  expect(screen.getByText("Undoing edit in App.tsx")).toBeDefined();
});

// file_manager labels
test("shows 'Renaming' for file_manager rename command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "rename",
        path: "src/OldName.tsx",
        new_path: "src/NewName.tsx",
      })}
    />
  );
  expect(screen.getByText("Renaming OldName.tsx")).toBeDefined();
});

test("shows 'Deleting' for file_manager delete command", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", {
        command: "delete",
        path: "src/OldName.tsx",
      })}
    />
  );
  expect(screen.getByText("Deleting OldName.tsx")).toBeDefined();
});

// Fallback for unknown tools
test("shows raw tool name for unknown tool", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("some_unknown_tool", { command: "run" })}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

// State indicators
test("shows green dot when state is result", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "src/Button.tsx",
      })}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("shows spinner when state is call (pending)", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "src/Button.tsx" },
        "call"
      )}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});
