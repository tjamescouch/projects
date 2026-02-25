# QuickNotes

A minimal notes app — REST API + browser frontend. No database, no build step.

## Stack

- **API** — Node.js + Express, in-memory store, `uuid` for IDs
- **Web** — Vanilla JS/HTML/CSS, live Markdown preview, auto-save

## Running

```bash
# API (port 3001)
cd quicknotes/api
npm install
node server.js

# Web (any static server, port 3000)
cd quicknotes/web
npx serve . -p 3000
# or: python3 -m http.server 3000
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notes` | List all notes |
| GET | `/api/notes/:id` | Get one note |
| POST | `/api/notes` | Create note `{title, body}` |
| PUT | `/api/notes/:id` | Update note `{title, body}` |
| DELETE | `/api/notes/:id` | Delete note |

## Config

Set `window.QUICKNOTES_API` before loading `app.js` to point at a non-default API host:

```html
<script>window.QUICKNOTES_API = 'https://your-api-host/api/notes'</script>
<script src="app.js"></script>
```

## Constraints

- API deps: `express`, `uuid` only
- No frontend build tools or bundlers
- CORS handled inline (no `cors` package)
