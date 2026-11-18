# gentle-code-copy

Pi / Gentle Shell extension that makes code blocks in responses easy to copy.

Every fenced code block in an assistant response gets a numbered label:

```text
📋 /copy-code 1 · bash
  npm install
```

- `/copy-code N` copies block N of the **last response** to the clipboard.
- `/copy-code` opens a selector with every block of the last response.

Syntax highlighting is Pi's own (highlight.js with your theme colours); this
extension only adds the labels and the command. Labels are display-only: the
session and the model context keep the original text.

Pi's built-in `/copy` (and `ctrl+x`) still copies the whole response.

## Limitations

- Pi does not let extensions add clickable elements inside a response, so
  copying is keyboard-driven.
- Numbers restart in every response; `/copy-code` always targets the last
  one.

## Install

```bash
pi install npm:gentle-code-copy
```

## Develop

```bash
npm test        # unit tests for src/code-blocks.ts
pi -e .         # try it in a Pi session
```

- `src/index.ts` — Pi wiring (markdown transformer, command, clipboard).
- `src/code-blocks.ts` — pure fence parsing and labelling, covered by `tests/`.

## License

MIT
