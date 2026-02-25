'use strict'

const express = require('express')
const { v4: uuidv4 } = require('uuid')

const app = express()
const PORT = 3001

app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// ── In-memory store ───────────────────────────────────────────────────────────

let notes = [
  {
    id: uuidv4(),
    title: 'Welcome to QuickNotes',
    body: '# Welcome to QuickNotes\n\nThis is a **markdown** notes app.\n\n- Write notes in the editor\n- See a *live preview* below\n- Auto-saves every second\n',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Markdown cheatsheet',
    body: '# Markdown cheatsheet\n\n## Headings\n\n# H1\n## H2\n### H3\n\n## Emphasis\n\n**bold** and *italic*\n\n## Lists\n\n- item one\n- item two\n- item three\n\n## Code\n\nUse `backticks` for inline code.\n',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/api/notes', (req, res) => {
  res.json(notes)
})

app.get('/api/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id)
  if (!note) return res.status(404).json({ error: 'Note not found' })
  res.json(note)
})

app.post('/api/notes', (req, res) => {
  const { title = 'Untitled', body = '' } = req.body
  const now = new Date().toISOString()
  const note = { id: uuidv4(), title, body, createdAt: now, updatedAt: now }
  notes.unshift(note)
  res.status(201).json(note)
})

app.put('/api/notes/:id', (req, res) => {
  const idx = notes.findIndex(n => n.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Note not found' })
  const { title, body } = req.body
  const note = notes[idx]
  if (title !== undefined) note.title = title
  if (body !== undefined) note.body = body
  note.updatedAt = new Date().toISOString()
  res.json(note)
})

app.delete('/api/notes/:id', (req, res) => {
  const idx = notes.findIndex(n => n.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Note not found' })
  notes.splice(idx, 1)
  res.status(204).send()
})

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`QuickNotes API running on http://localhost:${PORT}`)
})
