# constraints

## language & runtime

- Node.js 20+. No TypeScript — plain JavaScript only.
- No build tools (no webpack, no vite, no esbuild).
- Minimal dependencies. Only `express` and `uuid` for the API. Zero npm deps for the web frontend.

## file structure

```
quicknotes/
  api/
    server.js
    package.json
  web/
    index.html
    style.css
    app.js
```

Do not deviate from this structure.

## git workflow

- Never commit on `main`.
- Create a feature branch: `feature/<component-name>`
- Make small, focused commits with clear messages.
- Do not run `git push` — automation handles sync.

## code style

- 2-space indent
- Single quotes for strings
- No semicolons
- `const` by default, `let` only when mutation is needed

## what NOT to do

- No TypeScript
- No React, Vue, Svelte, or any framework
- No external markdown parser (marked, showdown, etc.)
- No database (SQLite, Postgres, etc.)
- No Docker for this project
- No `.env` files — there are no secrets
