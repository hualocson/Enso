# ESLint + Prettier Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ESLint 10 (flat config) and Prettier 3 to the client as two separate, editor-integrated tools — no npm scripts, no hooks, no bulk reformat of existing files.

**Architecture:** Install ESLint + Prettier + supporting packages as devDependencies. Create an `eslint.config.js` flat config (ESM) combining `js.configs.recommended`, `tseslint.configs.recommended` (non-type-checked), react-hooks v7 flat recommended rules, react-refresh, and `eslint-config-prettier` last. Create `.prettierrc.json` (matching existing style: no semicolons, single quotes, 2-space, trailing commas) and `.prettierignore`. Add `.vscode/extensions.json` (committed) recommending the ESLint and Prettier VS Code extensions, plus `.vscode/settings.json` (local-only, gitignored) enabling format-on-save and ESLint autofix-on-save. Verify via `npx eslint` / `npx prettier` / `npm run build`. No source files are modified.

**Tech Stack:** ESLint 10, typescript-eslint 8, Prettier 3, ESLint flat config, VS Code.

**Spec:** `docs/superpowers/specs/2026-08-10-eslint-prettier-setup-design.md`

## Global Constraints

- **No source code changes.** Every task only adds config files or package.json devDependencies. No `.ts`/`.tsx`/`.css` files are edited.
- **No npm scripts and no git hooks** are added (editor-only decision). Verification runs tools via `npx`.
- **No bulk reformat.** Pre-existing lint/format findings (e.g., 4-space indented files like `src/utils/cn.ts`) are a baseline, NOT to be fixed in this plan.
- Repo commit message style uses conventional prefixes (`chore:`, `feat:`, `docs:`, `fix:`).
- `.vscode/settings.json` is gitignored by `.gitignore` (rule `.vscode/*` + `!.vscode/extensions.json`) — do not attempt to `git add` it; it is intentionally local-only.
- Config files use the repo's existing style: single quotes, no semicolons, 2-space indent (per spec decision, indentation target is 2 spaces even though AGENTS.md says 4).

---

### Task 1: Install dev dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the packages**

```bash
npm install -D eslint@^10 @eslint/js@^10 typescript-eslint@^8 eslint-plugin-react-hooks@^7 eslint-plugin-react-refresh@^0.5 eslint-config-prettier@^10 globals@^17 prettier@^3
```

- [ ] **Step 2: Verify installation**

```bash
npm list eslint prettier typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-config-prettier globals @eslint/js
```

Expected: all eight packages listed with `@^`-satisfying versions.

- [ ] **Step 3: Confirm no `scripts` were altered**

```bash
node -e "const p=require('./package.json'); console.log(JSON.stringify(p.scripts))"
```

Expected: `{"dev":"vite","build":"vite build","preview":"vite preview"}` — unchanged.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add eslint and prettier dev dependencies"
```

---

### Task 2: Create `eslint.config.js`

**Files:**
- Create: `eslint.config.js`

- [ ] **Step 1: Write the flat config**

`eslint.config.js`:

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  prettier,
)
```

Notes:
- `reactHooks.configs.flat.recommended.rules` is the official v7 flat-config rules object (verified against v7.1.1: `{ plugins, rules }`).
- `tseslint.configs.recommended` (NOT `recommendedTypeChecked`) — no project service, no tsconfig changes.
- `eslint-config-prettier` must be the LAST element so it overrides earlier style rules.
- `ignores: ['dist']` keeps the existing build output out of linting.

- [ ] **Step 2: Verify the config resolves without errors**

```bash
npx eslint --print-config src/App.tsx
```

Expected: prints the resolved flat config JSON for `src/App.tsx` (contains `ecmaVersion: 2020`, `react-hooks` and `react-refresh` plugins, and the prettier-disabled rules). No "config" or "Unable to load" errors.

- [ ] **Step 3: Commit**

```bash
git add eslint.config.js
git commit -m "chore: add eslint flat config"
```

---

### Task 3: Verify ESLint runs against the codebase

**Files:**
- None (verification only)

- [ ] **Step 1: Run ESLint over the project**

```bash
npx eslint .
```

Expected: ESLint exits (0 or 1) and reports findings on pre-existing files — these are the BASELINE, do not fix them. The gate is that the run completes without a config/parser error (no "config" / "Oops!" / "Failed to load" output). Record the baseline counts in the commit message of the next task if helpful; do not modify source.

- [ ] **Step 2: Spot-check a barrel file (expected source of `warn`)**

```bash
npx eslint src/pages/index.ts
```

Expected: runs without crashing; may print `react-refresh/only-export-components` warnings. Warnings are acceptable and expected (spec decision: non-blocking).

---

### Task 4: Create `.prettierrc.json`

**Files:**
- Create: `.prettierrc.json`

- [ ] **Step 1: Write the Prettier config**

`.prettierrc.json`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

Matches existing code style in `src/App.tsx` and `src/main.tsx` (no semicolons, single quotes, trailing commas).

- [ ] **Step 2: Commit**

```bash
git add .prettierrc.json
git commit -m "chore: add prettier config"
```

---

### Task 5: Create `.prettierignore`

**Files:**
- Create: `.prettierignore`

- [ ] **Step 1: Write the ignore file**

`.prettierignore`:

```
node_modules
dist
dist-ssr
package-lock.json
```

- [ ] **Step 2: Commit**

```bash
git add .prettierignore
git commit -m "chore: add prettier ignore rules"
```

---

### Task 6: Verify Prettier works

**Files:**
- None (verification only)

- [ ] **Step 1: Check the new config files format cleanly**

```bash
npx prettier --check eslint.config.js .prettierrc.json .prettierignore
```

Expected: prints `Checking formatting...` then `All matched files use Prettier code style!`

- [ ] **Step 2: Confirm the whole-repo check baseline (do NOT fix)**

```bash
npx prettier --check .
```

Expected: reports a list of unformatted files (pre-existing 4-space indented files like `src/utils/cn.ts`). This is the expected baseline per the no-bulk-reformat decision — do not run `--write`.

---

### Task 7: Add `.vscode/extensions.json` (committed)

**Files:**
- Create: `.vscode/extensions.json`

- [ ] **Step 1: Write the extensions recommendations**

`.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

Note: `.gitignore` explicitly un-ignores this file (`!.vscode/extensions.json`) — it is meant to be committed.

- [ ] **Step 2: Commit**

```bash
git add .vscode/extensions.json
git commit -m "chore: recommend eslint and prettier vscode extensions"
```

---

### Task 8: Add `.vscode/settings.json` (local-only, not committed)

**Files:**
- Create: `.vscode/settings.json`

- [ ] **Step 1: Write the editor settings**

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

- [ ] **Step 2: Confirm it is NOT tracked by git (expected)**

```bash
git status --short
```

Expected: `.vscode/settings.json` does NOT appear (rule `.vscode/*` in `.gitignore`). Do not `git add` or `git commit` it — local-only by design.

---

### Task 9: Final verification

**Files:**
- None (verification only)

- [ ] **Step 1: Confirm the production build is unaffected**

```bash
npm run build
```

Expected: `vite build` completes successfully (no source changed, so unchanged behavior).

- [ ] **Step 2: Confirm both tools still run**

```bash
npx eslint --print-config src/main.tsx >/dev/null && npx prettier --check .prettierrc.json
```

Expected: both commands succeed (config resolves; prettier check passes on the new config file).

- [ ] **Step 3: Confirm nothing unintended was committed**

```bash
git log --oneline -5 && git status --short
```

Expected: five `chore:` commits, working tree clean (`.vscode/settings.json` correctly absent from tracking).
