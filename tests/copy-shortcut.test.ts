import assert from "node:assert/strict";
import { test } from "node:test";
import { shortcutForPlatform, shortcutInputAction, shortcutLabelForPlatform } from "../src/copy-shortcut.ts";

test("shortcutForPlatform uses Cmd on macOS and Ctrl on Windows", () => {
	assert.equal(shortcutForPlatform("darwin"), "super+shift+c");
	assert.equal(shortcutForPlatform("win32"), "ctrl+shift+c");
});

test("shortcutForPlatform uses Ctrl as the fallback", () => {
	assert.equal(shortcutForPlatform("linux"), "ctrl+shift+c");
});

test("shortcutLabelForPlatform displays the platform-specific shortcut", () => {
	assert.equal(shortcutLabelForPlatform("darwin"), "⌘⇧C");
	assert.equal(shortcutLabelForPlatform("win32"), "Ctrl+Shift+C");
});

test("shortcutInputAction copies a valid single-digit block", () => {
	assert.deepEqual(shortcutInputAction("2", 3), { type: "copy", index: 2 });
	assert.deepEqual(shortcutInputAction("\u001b[50u", 3), { type: "copy", index: 2 });
});

test("shortcutInputAction ignores Kitty key releases without ending the armed flow", () => {
	assert.deepEqual(shortcutInputAction("\u001b[99;1:3u", 3), { type: "release" });
});

test("shortcutInputAction reports an unavailable block as invalid", () => {
	assert.deepEqual(shortcutInputAction("4", 3), { type: "invalid", input: "4" });
});

test("shortcutInputAction opens the selector on Enter", () => {
	assert.deepEqual(shortcutInputAction("\r", 3), { type: "select" });
	assert.deepEqual(shortcutInputAction("\n", 3), { type: "select" });
	assert.deepEqual(shortcutInputAction("\u001b[13u", 3), { type: "select" });
});

test("shortcutInputAction cancels on Escape and ignores other input", () => {
	assert.deepEqual(shortcutInputAction("\u001b", 3), { type: "cancel" });
	assert.deepEqual(shortcutInputAction("\u001b[27u", 3), { type: "cancel" });
	assert.deepEqual(shortcutInputAction("x", 3), { type: "ignore" });
});
