import assert from "node:assert/strict";
import { test } from "node:test";
import { blockChoice, extractCodeBlocks, labelCodeBlocks } from "../src/code-blocks.ts";

const sample = [
	"Run this:",
	"```bash",
	"npm install",
	"npm test",
	"```",
	"",
	"Then:",
	"~~~ts",
	"const x = 1;",
	"~~~",
].join("\n");

test("extractCodeBlocks returns numbered blocks with language and code", () => {
	assert.deepEqual(extractCodeBlocks(sample), [
		{ index: 1, lang: "bash", code: "npm install\nnpm test" },
		{ index: 2, lang: "ts", code: "const x = 1;" },
	]);
});

test("extractCodeBlocks keeps shorter fences inside a longer fence", () => {
	const md = ["````md", "```bash", "echo hi", "```", "````"].join("\n");
	assert.deepEqual(extractCodeBlocks(md), [{ index: 1, lang: "md", code: "```bash\necho hi\n```" }]);
});

test("extractCodeBlocks includes an unclosed block (streaming)", () => {
	assert.deepEqual(extractCodeBlocks("```python\nprint(1)"), [{ index: 1, lang: "python", code: "print(1)" }]);
});

test("extractCodeBlocks uses an empty language when the fence has none", () => {
	assert.deepEqual(extractCodeBlocks("```\nplain\n```"), [{ index: 1, lang: "", code: "plain" }]);
});

test("extractCodeBlocks strips the fence indentation from list items", () => {
	const md = ["1. Step:", "   ```bash", "   ls -la", "   ```"].join("\n");
	assert.deepEqual(extractCodeBlocks(md), [{ index: 1, lang: "bash", code: "ls -la" }]);
});

test("labelCodeBlocks adds a numbered copy label above each block", () => {
	assert.equal(
		labelCodeBlocks(sample, "⌘⇧C"),
		[
			"Run this:",
			"📋 `/copy-code 1` (`⌘⇧C`) · bash",
			"```bash",
			"npm install",
			"npm test",
			"```",
			"",
			"Then:",
			"📋 `/copy-code 2` (`⌘⇧C`) · ts",
			"~~~ts",
			"const x = 1;",
			"~~~",
		].join("\n"),
	);
});

test("labelCodeBlocks keeps list indentation and omits a missing language", () => {
	const md = ["1. Step:", "   ```", "   ls", "   ```"].join("\n");
	assert.equal(labelCodeBlocks(md, "Ctrl+Shift+C"), ["1. Step:", "   📋 `/copy-code 1` (`Ctrl+Shift+C`)", "   ```", "   ls", "   ```"].join("\n"));
});

test("labelCodeBlocks leaves markdown without code blocks unchanged", () => {
	assert.equal(labelCodeBlocks("no code here"), "no code here");
});

test("blockChoice summarises a block for the selector", () => {
	assert.equal(blockChoice({ index: 2, lang: "bash", code: "\n  npm install\nnpm test" }), "2 · bash · npm install (2 lines)");
	assert.equal(blockChoice({ index: 1, lang: "", code: "x".repeat(80) }), `1 · text · ${"x".repeat(47)}… (1 line)`);
});
