'use strict'

const API = 'http://localhost:3001/api/notes'

// ── Markdown renderer (~30 lines) ────────────────────────────────────────────

function renderMarkdown(md) {
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // List items
    .replace(/^- (.+)$/gm, '<li>$1</li>')

  // Wrap consecutive <li> blocks in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/gs, match => `<ul>${match}</ul>`)

  // Paragraphs: double newline → paragraph break
  html = html
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim()
      if (!block) return ''
      if (/^<(h[1-3]|ul|li)/.test(block)) return block
      return `<p>${block.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')

  return html
}

// ── State ────────────────────────────────────────────────────────────────────

let notes = []
let activeId = null
let saveTimer = null

// ── DOM refs ─────────────────────────────────────────────────────────────────

const noteList = document.getElementById('note-list')
const editor = document.getElementById('editor')
const preview = document.getElementById('preview')
const btnNew = document.getElementById('btn-new')
const btnDelete = document.getElementById('btn-delete')
const titleDisplay = document.getElementById('note-title-display')

// ── API helpers ───────────────────────────────────────────────────────────────

async function fetchNotes() {
  const res = await fetch(API)
  notes = await res.json()
  renderList()
  if (notes.length && !activeId) selectNote(notes[0].id)
}

async function createNote() {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Untitled', body: '' })
  })
  const note = await res.json()
  notes.unshift(note)
  renderList()
  selectNote(note.id)
}

async function saveNote(id, body) {
  const note = notes.find(n => n.id === id)
  if (!note) return
  const title = extractTitle(body) || 'Untitled'
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body })
  })
  const updated = await res.json()
  const idx = notes.findIndex(n => n.id === id)
  if (idx !== -1) notes[idx] = updated
  renderList()
  if (activeId === id) titleDisplay.textContent = title
}

async function deleteNote(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' })
  notes = notes.filter(n => n.id !== id)
  renderList()
  if (activeId === id) {
    activeId = null
    editor.value = ''
    preview.innerHTML = ''
    titleDisplay.textContent = ''
    btnDelete.disabled = true
    if (notes.length) selectNote(notes[0].id)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractTitle(body) {
  const match = body.match(/^#+ (.+)/m) || body.match(/^(.+)/)
  return match ? match[1].trim().slice(0, 60) : 'Untitled'
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderList() {
  noteList.innerHTML = ''
  if (!notes.length) {
    const li = document.createElement('li')
    li.textContent = 'No notes yet'
    li.className = 'empty-state'
    noteList.appendChild(li)
    return
  }
  for (const note of notes) {
    const li = document.createElement('li')
    li.textContent = note.title || 'Untitled'
    li.dataset.id = note.id
    if (note.id === activeId) li.classList.add('active')
    li.addEventListener('click', () => selectNote(note.id))
    noteList.appendChild(li)
  }
}

function selectNote(id) {
  activeId = id
  const note = notes.find(n => n.id === id)
  if (!note) return
  editor.value = note.body
  preview.innerHTML = renderMarkdown(note.body)
  titleDisplay.textContent = note.title || 'Untitled'
  btnDelete.disabled = false
  renderList()
}

// ── Events ────────────────────────────────────────────────────────────────────

btnNew.addEventListener('click', createNote)

btnDelete.addEventListener('click', () => {
  if (activeId) deleteNote(activeId)
})

editor.addEventListener('keyup', () => {
  if (!activeId) return
  preview.innerHTML = renderMarkdown(editor.value)
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveNote(activeId, editor.value), 1000)
})

// ── Boot ──────────────────────────────────────────────────────────────────────

fetchNotes()
