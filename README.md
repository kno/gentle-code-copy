# gentle-code-copy

Copy any code block from a Pi / Gentle Shell response without selecting it by
hand.

The extension numbers every code block in the agent's responses and adds a
`/copy-code` command that copies one of them to the clipboard.

## What you see

When the agent answers with a code block, a label appears right above it:

~~~text
📋 `/copy-code 1` (`⌘⇧C`)
```bash
npm install
npm test
```
~~~

The number identifies the block inside that response. The shortcut appears
beside the command (Cmd+Shift+C on macOS, Ctrl+Shift+C on Windows). The
language is already shown by the block's own fence, so the label does not
repeat it. Syntax highlighting is Pi's own; this extension only adds the label.

## Usage

| Command | What it does |
| --- | --- |
| `/copy-code 2` | Copies block 2 of the last response. |
| `/copy-code` | Opens a list of the blocks in the last response; pick one to copy it. |

The keyboard shortcut is **Cmd+Shift+C** on macOS and **Ctrl+Shift+C** on
Windows. After activating it, press a single digit (1–9) to copy that block,
press Enter to open the selector, or press Escape to cancel. Blocks numbered
10 or higher can be selected from the list. Other platforms use Ctrl+Shift+C.
Some terminals may intercept these shortcuts; macOS terminals must forward the
Super modifier to Pi.

After copying, a notification confirms it, for example
`Copied code block 2 (ts, 12 lines)`. Asking for a block that does not exist
shows how many there are, for example
`No code block 9: the last response has 2 (1-2)`.

Pi's built-in `/copy` (or `ctrl+x`) still copies the whole response.

## Install

```bash
pi install npm:gentle-code-copy
```

Then restart Pi or run `/reload`.

## Good to know

- **Last response only.** Numbers restart in every response, and `/copy-code`
  always reads the most recent one.
- **Keyboard, not mouse.** Pi does not let extensions add clickable buttons
  inside a response, so copying goes through the command.
- **Display only.** The labels are added when Pi draws the response. The
  saved session and what the model sees keep the original text.

## Develop

```bash
npm test     # unit tests for src/code-blocks.ts
pi -e .      # try it in a Pi session
```

| File | Role |
| --- | --- |
| `src/index.ts` | Pi wiring: label transformer, shortcut, `/copy-code` command, clipboard. |
| `src/code-blocks.ts` | Pure fence parsing and labelling, covered by `tests/`. |
| `src/copy-shortcut.ts` | Platform shortcut and key-input handling, covered by `tests/`. |

## License

MIT
