// Pure logic: no Pi imports, so it is unit-testable with node --test.

export interface CodeBlock {
	/** 1-based position of the block in the markdown. */
	index: number;
	/** First word of the fence info string, or "" when absent. */
	lang: string;
	code: string;
}

interface Fence {
	indent: string;
	char: string;
	length: number;
	lang: string;
}

const OPENING = /^(\s*)(`{3,}|~{3,})\s*([^`\s]*)[^`]*$/;

function openingFence(line: string): Fence | null {
	const match = OPENING.exec(line);
	if (!match) return null;
	const [, indent, fence, lang] = match;
	return { indent, char: fence[0], length: fence.length, lang };
}

function closesFence(line: string, fence: Fence): boolean {
	const trimmed = line.trim();
	return trimmed.length >= fence.length && trimmed === fence.char.repeat(trimmed.length);
}

function stripIndent(line: string, indent: string): string {
	return line.startsWith(indent) ? line.slice(indent.length) : line.trimStart();
}

/**
 * Walk the markdown and call `onBlock` with each fenced code block and the
 * line number of its opening fence. Unclosed blocks run to the end, so a
 * streaming message still exposes its last block.
 */
function walk(lines: readonly string[], onBlock: (block: CodeBlock, fence: Fence, openLine: number) => void): void {
	let index = 0;
	for (let i = 0; i < lines.length; i++) {
		const fence = openingFence(lines[i]);
		if (!fence) continue;
		const openLine = i;
		const body: string[] = [];
		for (i++; i < lines.length && !closesFence(lines[i], fence); i++) {
			body.push(stripIndent(lines[i], fence.indent));
		}
		index++;
		onBlock({ index, lang: fence.lang, code: body.join("\n") }, fence, openLine);
	}
}

export function extractCodeBlocks(markdown: string): CodeBlock[] {
	const blocks: CodeBlock[] = [];
	walk(markdown.split("\n"), (block) => blocks.push(block));
	return blocks;
}

/** Insert a numbered copy command and optional shortcut above every code block; the fence already shows the language. */
export function labelCodeBlocks(markdown: string, shortcutLabel = ""): string {
	const lines = markdown.split("\n");
	const labels = new Map<number, string>();
	walk(lines, (block, fence, openLine) => {
		const shortcut = shortcutLabel ? ` (\`${shortcutLabel}\`)` : "";
		labels.set(openLine, `${fence.indent}📋 \`/copy-code ${block.index}\`${shortcut}`);
	});
	if (labels.size === 0) return markdown;
	return lines.flatMap((line, i) => (labels.has(i) ? [labels.get(i)!, line] : [line])).join("\n");
}

const PREVIEW_WIDTH = 48;

/** One-line summary used by the /copy-code selector. */
export function blockChoice(block: CodeBlock): string {
	const lines = block.code.split("\n").filter((line) => line.trim() !== "");
	const first = (lines[0] ?? "").trim();
	const preview = first.length > PREVIEW_WIDTH ? `${first.slice(0, PREVIEW_WIDTH - 1)}…` : first;
	const count = `${lines.length} ${lines.length === 1 ? "line" : "lines"}`;
	return `${block.index} · ${block.lang || "text"} · ${preview} (${count})`;
}
