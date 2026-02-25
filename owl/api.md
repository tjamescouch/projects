# api

Express.js REST API for notes.

## endpoints

- `GET /api/notes` — returns all notes as JSON array
- `GET /api/notes/:id` — returns a single note
- `POST /api/notes` — create a note (body: `{ title, body }`)
- `PUT /api/notes/:id` — update a note
- `DELETE /api/notes/:id` — delete a note

## data model

```
{
  id: string (uuid),
  title: string,
  body: string (markdown),
  createdAt: ISO timestamp,
  updatedAt: ISO timestamp
}
```

## storage

In-memory array. No database. This is a demo.

## requirements

- Express.js on port 3001
- CORS enabled for localhost:3000
- JSON body parsing
- Seed with 2 example notes on startup so the UI is not empty
