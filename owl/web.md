# web

Single-page markdown notes editor with live preview.

## tech

- Vanilla HTML/CSS/JS. No frameworks, no build step.
- Serve with a simple static file server or from the API.

## layout

Left sidebar (note list) + right pane (split: editor top, preview bottom).

## features

- Sidebar lists all notes by title
- Clicking a note loads it into the editor
- Editor is a `<textarea>` for raw markdown
- Preview renders markdown to HTML below the editor in real time (on keyup)
- "New Note" button creates a blank note
- "Delete" button removes the selected note
- Auto-saves to the API 1 second after the user stops typing (debounce)

## markdown rendering

Use a simple regex-based renderer. Must handle:
- `# headings` (h1-h3)
- `**bold**` and `*italic*`
- `- list items`
- `` `inline code` ``
- Paragraphs (double newline)

Do NOT import an external markdown library. Write a small render function (~30 lines).

## style

- Dark theme: background #1a1a2e, sidebar #16213e, text #e0e0e0
- Monospace font in the editor (Consolas, monospace)
- Sans-serif in the preview and sidebar (system-ui)
- Subtle border between panels, no heavy chrome
