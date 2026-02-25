// quicknotes API test suite — Node stdlib only, no test framework
// Run: node test.js (starts its own server instance on port 3099)

const http = require('http')
const assert = require('assert')
const { execFile } = require('child_process')
const path = require('path')

const PORT = 3099
const BASE = `http://localhost:${PORT}/api/notes`

let passed = 0
let failed = 0

// --- helpers ---

const request = (method, url, body) => new Promise((resolve, reject) => {
  const opts = Object.assign(new URL(url), { method })
  opts.headers = { 'Content-Type': 'application/json' }
  const req = http.request(opts, (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      let json = null
      try { json = JSON.parse(data) } catch (_) {}
      resolve({ status: res.statusCode, body: json, raw: data })
    })
  })
  req.on('error', reject)
  if (body !== undefined) req.write(JSON.stringify(body))
  req.end()
})

const ok = async (name, fn) => {
  try {
    await fn()
    console.log('ok -', name)
    passed++
  } catch (e) {
    console.log('FAIL -', name, '\n  ', e.message)
    failed++
  }
}

// --- boot server ---

const startServer = () => new Promise((resolve, reject) => {
  const env = Object.assign({}, process.env, { PORT: String(PORT) })
  const child = require('child_process').spawn(
    process.execPath,
    [path.join(__dirname, 'server.js')],
    { env, stdio: ['ignore', 'pipe', 'pipe'] }
  )
  child.stdout.once('data', () => setTimeout(resolve, 100, child))
  child.stderr.on('data', (d) => { if (!String(d).includes('listening')) reject(new Error(String(d))) })
  child.on('error', reject)
})

// --- tests ---

const run = async () => {
  const server = await startServer()

  await ok('GET /api/notes returns array with 2 seeded notes', async () => {
    const r = await request('GET', BASE)
    assert.strictEqual(r.status, 200)
    assert(Array.isArray(r.body), 'body should be array')
    assert(r.body.length >= 2, 'should have at least 2 seeded notes')
  })

  await ok('seeded notes have required fields', async () => {
    const r = await request('GET', BASE)
    const note = r.body[0]
    for (const field of ['id', 'title', 'body', 'createdAt', 'updatedAt']) {
      assert(field in note, `missing field: ${field}`)
    }
  })

  let createdId = null
  await ok('POST /api/notes creates a note', async () => {
    const r = await request('POST', BASE, { title: 'Test Note', body: '# Hello' })
    assert.strictEqual(r.status, 201)
    assert.strictEqual(r.body.title, 'Test Note')
    assert.strictEqual(r.body.body, '# Hello')
    assert(r.body.id, 'should have id')
    createdId = r.body.id
  })

  await ok('GET /api/notes/:id returns the created note', async () => {
    const r = await request('GET', `${BASE}/${createdId}`)
    assert.strictEqual(r.status, 200)
    assert.strictEqual(r.body.id, createdId)
    assert.strictEqual(r.body.title, 'Test Note')
  })

  await ok('PUT /api/notes/:id updates title and body', async () => {
    const r = await request('PUT', `${BASE}/${createdId}`, { title: 'Updated', body: 'new body' })
    assert.strictEqual(r.status, 200)
    assert.strictEqual(r.body.title, 'Updated')
    assert.strictEqual(r.body.body, 'new body')
  })

  await ok('PUT /api/notes/:id updates updatedAt', async () => {
    const before = await request('GET', `${BASE}/${createdId}`)
    await new Promise(r => setTimeout(r, 10))
    await request('PUT', `${BASE}/${createdId}`, { body: 'changed again' })
    const after = await request('GET', `${BASE}/${createdId}`)
    assert(after.body.updatedAt >= before.body.updatedAt, 'updatedAt should advance')
  })

  await ok('GET /api/notes/:id returns 404 for unknown id', async () => {
    const r = await request('GET', `${BASE}/no-such-id`)
    assert.strictEqual(r.status, 404)
  })

  await ok('PUT /api/notes/:id returns 404 for unknown id', async () => {
    const r = await request('PUT', `${BASE}/no-such-id`, { title: 'x' })
    assert.strictEqual(r.status, 404)
  })

  await ok('DELETE /api/notes/:id removes the note', async () => {
    const r = await request('DELETE', `${BASE}/${createdId}`)
    assert.strictEqual(r.status, 204)
    const check = await request('GET', `${BASE}/${createdId}`)
    assert.strictEqual(check.status, 404)
  })

  await ok('DELETE /api/notes/:id returns 404 for unknown id', async () => {
    const r = await request('DELETE', `${BASE}/no-such-id`)
    assert.strictEqual(r.status, 404)
  })

  await ok('POST with empty body defaults title and body to empty string', async () => {
    const r = await request('POST', BASE, {})
    assert.strictEqual(r.status, 201)
    assert.strictEqual(r.body.title, '')
    assert.strictEqual(r.body.body, '')
  })

  await ok('CORS header present on GET', async () => {
    const r = await new Promise((resolve) => {
      const req = http.request(new URL(BASE), { method: 'GET' }, (res) => {
        resolve({ headers: res.headers })
        res.resume()
      })
      req.end()
    })
    assert(r.headers['access-control-allow-origin'], 'missing CORS header')
  })

  server.kill()

  console.log(`\n# ${passed + failed} tests: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((e) => {
  console.error('fatal:', e.message)
  process.exit(1)
})
