import { decodeKittyPrintable, isKeyRelease, matchesKey } from "@earendil-works/pi-tui";

export type ShortcutInputAction =
	| { type: "copy"; index: number }
	| { type: "release" }
	| { type: "select" }
	| { type: "cancel" }
	| { type: "invalid"; input: string }
	| { type: "ignore" };

type CopyShortcut = "super+shift+c" | "ctrl+shift+c";

/** Platform-specific shortcut: Cmd+Shift+C on macOS, Ctrl+Shift+C elsewhere. */
export function shortcutForPlatform(platform: string): CopyShortcut {
	return platform === "darwin" ? "super+shift+c" : "ctrl+shift+c";
}

/** Human-readable shortcut shown beside each copy command label. */
export function shortcutLabelForPlatform(platform: string): string {
	return platform === "darwin" ? "⌘⇧C" : "Ctrl+Shift+C";
}

/** Interpret the one key pressed after the copy shortcut is activated. */
export function shortcutInputAction(input: string, blockCount: number): ShortcutInputAction {
	if (isKeyRelease(input)) return { type: "release" };
	if (matchesKey(input, "enter")) return { type: "select" };
	if (matchesKey(input, "escape")) return { type: "cancel" };

	const digit = decodeKittyPrintable(input) ?? input;
	if (!/^[0-9]$/.test(digit)) return { type: "ignore" };

	const index = Number(digit);
	return index > 0 && index <= blockCount ? { type: "copy", index } : { type: "invalid", input: digit };
}
