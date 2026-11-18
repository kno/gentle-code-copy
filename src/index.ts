import { copyToClipboard, type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { blockChoice, type CodeBlock, extractCodeBlocks, labelCodeBlocks } from "./code-blocks.ts";

interface TextPart {
	type?: unknown;
	text?: unknown;
}

/** Text of the most recent assistant message on the current branch. */
function lastAssistantText(ctx: ExtensionContext): string {
	const branch = ctx.sessionManager.getBranch();
	for (let i = branch.length - 1; i >= 0; i--) {
		const entry = branch[i] as { type?: string; message?: { role?: string; content?: unknown } };
		if (entry.type !== "message" || entry.message?.role !== "assistant") continue;
		const content = entry.message.content;
		if (typeof content === "string") return content;
		if (!Array.isArray(content)) return "";
		return (content as TextPart[])
			.filter((part) => part.type === "text" && typeof part.text === "string")
			.map((part) => part.text as string)
			.join("\n\n");
	}
	return "";
}

async function copyBlock(block: CodeBlock, ctx: ExtensionContext): Promise<void> {
	try {
		await copyToClipboard(block.code);
		const lines = block.code.split("\n").length;
		ctx.ui.notify(`Copied code block ${block.index} (${block.lang || "text"}, ${lines} ${lines === 1 ? "line" : "lines"})`, "info");
	} catch (error) {
		ctx.ui.notify(`Could not copy code block ${block.index}: ${error instanceof Error ? error.message : String(error)}`, "error");
	}
}

export default function (pi: ExtensionAPI) {
	// Display-only: the session and the model context keep the original text.
	pi.registerMarkdownTransformer((markdown) => labelCodeBlocks(markdown), { messageTypes: ["assistant"] });

	pi.registerCommand("copy-code", {
		description: "Copy a code block from the last response: /copy-code [N]",
		handler: async (args, ctx) => {
			const blocks = extractCodeBlocks(lastAssistantText(ctx));
			if (blocks.length === 0) {
				ctx.ui.notify("The last response has no code blocks", "warning");
				return;
			}

			const arg = args.trim();
			if (arg) {
				const block = /^\d+$/.test(arg) ? blocks[Number(arg) - 1] : undefined;
				if (!block) {
					ctx.ui.notify(`No code block ${arg}: the last response has ${blocks.length} (1-${blocks.length})`, "error");
					return;
				}
				await copyBlock(block, ctx);
				return;
			}

			if (!ctx.hasUI) {
				ctx.ui.notify("Usage: /copy-code N", "error");
				return;
			}
			const choices = blocks.map(blockChoice);
			const choice = await ctx.ui.select("Copy which code block?", choices);
			if (choice === undefined) return;
			await copyBlock(blocks[choices.indexOf(choice)], ctx);
		},
	});
}
