const express = require('express')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')

const app = express()
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

const notes = []

function now () {
  return new Date().toISOString()
}

// seed two example notes
notes.push({
  id: uuidv4(),
  title: 'First note',
  body: '# Hello\nThis is the first seeded note',
  createdAt: now(),
  updatedAt: now()
})
notes.push({
  id: uuidv4(),
  title: 'Second note',
  body: 'This is another example note',
  createdAt: now(),
  updatedAt: now()
})

app.get('/api/notes', (req, res) => {
  res.json(notes)
})

app.get('/api/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id)
  if (!note) return res.status(404).json({ error: 'not found' })
  res.json(note)
})

app.post('/api/notes', (req, res) => {
  const { title, body } = req.body
  const note = {
    id: uuidv4(),
    title: title || '',
    body: body || '',
    createdAt: now(),
    updatedAt: now()
  }
  notes.push(note)
  res.status(201).json(note)
})

app.put('/api/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id)
  if (!note) return res.status(404).json({ error: 'not found' })
  const { title, body } = req.body
  if (typeof title === 'string') note.title = title
  if (typeof body === 'string') note.body = body
  note.updatedAt = now()
  res.json(note)
})

app.delete('/api/notes/:id', (req, res) => {
  const idx = notes.findIndex(n => n.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'not found' })
  notes.splice(idx, 1)
  res.status(204).end()
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log('quicknotes API listening on port', port)
})

