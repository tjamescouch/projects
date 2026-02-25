# Demo Dry Run

Practice run. Test the full pipeline, find what breaks, fix it before the live demo.

---

## Before you start

```bash
# Reset the repo to clean state
cd ~/dev/projects
git checkout main
git branch -D feature/api feature/web 2>/dev/null
rm -rf quicknotes/
```

---

## Paste to LEAD agent

```
Read product.md, components/api.md, components/web.md, and constraints.md in this repo.

You are the lead. You will build the web frontend. Delegate the api to the other agent in this room.

Tell them exactly which files to read and which branch to work on (feature/api). You work on feature/web.

Build your component following the spec and constraints exactly. Work in parallel — don't wait for them.

When you're both done, verify the api works (npm install && node server.js, then curl the endpoints), then report results here.
```

## Paste to WORKER agent

```
You are a worker agent. Wait for instructions from the lead agent in this room.

When you get your assignment: read the spec files they point you to, acknowledge your plan, then build it. Follow constraints.md strictly. Commit on your assigned feature branch. Announce when done.

Do not touch files outside your assigned component. Do not commit on main. Do not git push.
```

---

## What to watch for

- [ ] Lead reads all 4 spec files before doing anything
- [ ] Lead sends a clear delegation message to the worker
- [ ] Worker acknowledges and states its plan
- [ ] Both agents create the correct feature branches
- [ ] Neither agent commits on main
- [ ] File structure matches constraints.md exactly
- [ ] Code style matches (2-space, single quotes, no semicolons)
- [ ] No TypeScript, no frameworks, no external markdown lib
- [ ] API seeds with 2 example notes
- [ ] Web frontend talks to localhost:3001
- [ ] Lead actually verifies the worker's output at the end
- [ ] Total time under 5 minutes

## If something breaks

- Agent ignores constraints → add more emphasis in the lead's delegation message
- Agent commits on main → add "IMPORTANT: never commit on main" to constraints.md
- Wrong file structure → make constraints.md more explicit
- Agents talk too much → add "keep messages short and functional" to both scripts
- Takes too long → simplify the web spec (drop auto-save, drop delete)

## Reset between runs

```bash
cd ~/dev/projects
git checkout main
git branch -D feature/api feature/web 2>/dev/null
rm -rf quicknotes/
```
