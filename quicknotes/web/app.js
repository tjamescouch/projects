const API = 'http://localhost:3001/api/notes'

let notes = []
let activeId = null
let saveTimer = null

// --- Markdown renderer (~30 lines) ---
function renderMarkdown(md) {
  let html = md
    // headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // wrap consecutive <li> blocks in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>')
    // paragraphs: double newline → <p>
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim()
      if (!block) return ''
      if (/^<(h[1-3]|ul|li)/.test(block)) return block
      return '<p>' + block.replace(/\n/g, ' ') + '</p>'
    })
    .join('\n')
  return html
}

// --- API helpers ---
async function fetchNotes() {
  const res = await fetch(API)
  notes = await res.json()
}

async function createNote() {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Untitled', body: '' })
  })
  return res.json()
}

async function saveNote(id, title, body) {
  await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body })
  })
}

async function deleteNote(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' })
}

// --- DOM helpers ---
const noteList = document.getElementById('note-list')
const editor = document.getElementById('editor')
const preview = document.getElementById('preview')
const titleDisplay = document.getElementById('note-title-display')

function renderSidebar() {
  noteList.innerHTML = ''
  notes.forEach(note => {
    const li = document.createElement('li')
    li.textContent = note.title || 'Untitled'
    li.dataset.id = note.id
    if (note.id === activeId) li.classList.add('active')
    li.addEventListener('click', () => loadNote(note.id))
    noteList.appendChild(li)
  })
}

function loadNote(id) {
  activeId = id
  const note = notes.find(n => n.id === id)
  if (!note) return
  editor.value = note.body
  titleDisplay.textContent = note.title
  preview.innerHTML = renderMarkdown(note.body)
  renderSidebar()
}

function extractTitle(body) {
  const firstLine = body.split('\n')[0].replace(/^#+\s*/, '').trim()
  return firstLine || 'Untitled'
}

function scheduleSave() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    if (!activeId) return
    const body = editor.value
    const title = extractTitle(body)
    await saveNote(activeId, title, body)
    const note = notes.find(n => n.id === activeId)
    if (note) {
      note.body = body
      note.title = title
    }
    titleDisplay.textContent = title
    renderSidebar()
  }, 1000)
}

// --- Event listeners ---
editor.addEventListener('keyup', () => {
  preview.innerHTML = renderMarkdown(editor.value)
  scheduleSave()
})

document.getElementById('btn-new').addEventListener('click', async () => {
  const note = await createNote()
  notes.unshift(note)
  renderSidebar()
  loadNote(note.id)
})

document.getElementById('btn-delete').addEventListener('click', async () => {
  if (!activeId) return
  if (!confirm('Delete this note?')) return
  await deleteNote(activeId)
  notes = notes.filter(n => n.id !== activeId)
  activeId = null
  editor.value = ''
  preview.innerHTML = ''
  titleDisplay.textContent = ''
  renderSidebar()
  if (notes.length > 0) loadNote(notes[0].id)
})

// --- Init ---
async function init() {
  await fetchNotes()
  renderSidebar()
  if (notes.length > 0) loadNote(notes[0].id)
}

init()
