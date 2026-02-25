const API = window.QUICKNOTES_API || 'http://localhost:3001/api/notes'

let notes = []
let activeId = null
let saveTimer = null

// --- Markdown renderer (~30 lines, no external deps) ---
const renderMd = (md) => {
  if (!md) return ''
  let html = md
    // headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')

  // wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)

  // paragraphs: double newline → <p>
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim()
      if (!block) return ''
      if (/^<(h[1-3]|ul|li)/.test(block)) return block
      return `<p>${block.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')

  return html
}

// --- Error display ---
const showError = (msg) => {
  console.error('[quicknotes]', msg)
  const toolbar = document.getElementById('toolbar')
  const existing = document.getElementById('error-banner')
  if (existing) existing.remove()
  const banner = document.createElement('div')
  banner.id = 'error-banner'
  banner.style.cssText = 'background:#5c1010;color:#ffaaaa;padding:6px 16px;font-size:0.8rem;'
  banner.textContent = msg
  toolbar.insertAdjacentElement('afterend', banner)
  setTimeout(() => banner.remove(), 4000)
}

// --- API helpers ---
const fetchNotes = async () => {
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error(`GET /api/notes ${res.status}`)
    notes = await res.json()
    renderList()
    if (notes.length > 0 && !activeId) loadNote(notes[0].id)
  } catch (e) {
    showError(`Could not load notes: ${e.message}`)
  }
}

const createNote = async () => {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Untitled', body: '' }),
    })
    if (!res.ok) throw new Error(`POST /api/notes ${res.status}`)
    const note = await res.json()
    notes.unshift(note)
    renderList()
    loadNote(note.id)
  } catch (e) {
    showError(`Could not create note: ${e.message}`)
  }
}

const saveNote = async (id, body) => {
  const note = notes.find((n) => n.id === id)
  if (!note) return
  const firstLine = body.split('\n')[0].replace(/^#+\s*/, '').trim()
  const title = firstLine || 'Untitled'
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    })
    if (!res.ok) throw new Error(`PUT /api/notes/${id} ${res.status}`)
    const updated = await res.json()
    const idx = notes.findIndex((n) => n.id === id)
    notes[idx] = updated
    renderList()
    document.getElementById('note-title-display').textContent = updated.title
  } catch (e) {
    showError(`Could not save note: ${e.message}`)
  }
}

const deleteNote = async (id) => {
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`DELETE /api/notes/${id} ${res.status}`)
    notes = notes.filter((n) => n.id !== id)
    activeId = null
    renderList()
    if (notes.length > 0) {
      loadNote(notes[0].id)
    } else {
      document.getElementById('editor').value = ''
      document.getElementById('preview').innerHTML = ''
      document.getElementById('note-title-display').textContent = ''
    }
  } catch (e) {
    showError(`Could not delete note: ${e.message}`)
  }
}

// --- UI ---
const renderList = () => {
  const ul = document.getElementById('note-list')
  ul.innerHTML = ''
  notes.forEach((note) => {
    const li = document.createElement('li')
    li.textContent = note.title || 'Untitled'
    li.dataset.id = note.id
    if (note.id === activeId) li.classList.add('active')
    li.addEventListener('click', () => loadNote(note.id))
    ul.appendChild(li)
  })
}

const loadNote = (id) => {
  activeId = id
  const note = notes.find((n) => n.id === id)
  if (!note) return
  document.getElementById('editor').value = note.body || ''
  document.getElementById('preview').innerHTML = renderMd(note.body || '')
  document.getElementById('note-title-display').textContent = note.title || 'Untitled'
  renderList()
}

// --- Events ---
document.getElementById('btn-new').addEventListener('click', createNote)

document.getElementById('btn-delete').addEventListener('click', () => {
  if (activeId) deleteNote(activeId)
})

document.getElementById('editor').addEventListener('keyup', (e) => {
  const body = e.target.value
  document.getElementById('preview').innerHTML = renderMd(body)
  clearTimeout(saveTimer)
  if (activeId) {
    saveTimer = setTimeout(() => saveNote(activeId, body), 1000)
  }
})

// --- Boot ---
fetchNotes()
