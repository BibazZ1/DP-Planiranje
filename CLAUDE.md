# DP-Planiranje — instructions for AI assistants

## Workflow rules (MANDATORY for every AI on this repo)

1. **Always push to `main`.** The owner reviews changes in the deployed app online, not
   locally. Never leave code changes only on disk or on a side branch. At the end of every
   task that touches code: commit to `main` and `git push origin main`. (Production deploy
   is then done by the owner via `DEPLOY.bat` — pushing to `main` does NOT auto-deploy, so
   pushing is safe.) Do not do "local-only" work.

2. **Never push broken or untested code.** Before EVERY push you MUST, in order:
   - Syntax-check: `node --check static/app.js` and
     `.venv\Scripts\python.exe -m py_compile app.py database.py`
   - Run the full E2E suite and confirm `REZULTAT: N PASS / 0 FAIL` (see below).
   - Re-read your diff for obvious bugs: missing DB migrations, half-wired filters,
     fields referenced but not created, etc. If unsure, analyze — don't push a guess.
   Add/extend an E2E test for every new feature or bugfix.

3. **Verify by actually running it — never by claiming.** "It should work" is not
   verification. Drive the real app (E2E run, and a Playwright element screenshot when a
   visual change matters) and confirm the behaviour before reporting it done.

## Running + verifying locally (the E2E suite)

ALWAYS in this order — resetting the DB while the server is running causes transient
`database "DP-PLANIRANJE-TEST" does not exist` 500s that flake the next run:

1. Stop any listener on port 5070, then reset the isolated test DB (never touches prod):
   `.venv\Scripts\python.exe tools_testdb.py`
2. Start the dev server against it (DEV_FAKE_USER bypasses Azure-AD login):
   `$env:POSTGRES_DATABASE="DP-PLANIRANJE-TEST"; $env:PORT="5070"; $env:DEV_FAKE_USER="e.uzunovic@gfcbh.ba"; .venv\Scripts\python.exe app.py`
3. Run the suite (Playwright/chromium is borrowed from the sibling ULAZNE-FAKTURE repo):
   `$env:NODE_PATH="C:\Users\Admin\Documents\GitHub\ULAZNE-FAKTURE\node_modules"; node tools_e2e.js`
   Must end with `0 FAIL`.

## Design conventions
- **No emoji in the UI.** Use inline SVG icons (stroke, `currentColor`). The
  `tools_e2e.js` "UI bez emojija" test enforces this — only `✕ ▾ − →` are allowed.
- Commit messages in Bosnian, matching the existing `git log` style.
- The app is multilingual (BS / EN / DE) — every user-facing string goes through the
  `t(...)` i18n dictionaries in `static/app.js` (all three languages), never hardcoded.
