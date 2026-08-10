# ESLint + Prettier Setup Design

## Overview
Add ESLint (flat config, ESLint 10) and Prettier 3 to the Vite + React + TypeScript client as two separate tools. ESLint handles code quality; Prettier handles formatting. Editor-integrated only — no npm scripts, no pre-commit hooks, no bulk reformat of existing files.

## Decisions (confirmed with user)
- **No bulk reformat**: tooling only; lint/format applies to files touched going forward.
- **Vite template standard ruleset**: `js.configs.recommended` + `tseslint.configs.recommended` + react-hooks + react-refresh, with `eslint-config-prettier` last.
- **Separate tools**: Prettier runs independently (editor formatter); `eslint-config-prettier` disables conflicting ESLint style rules.
- **Editor-only**: no `lint`/`format` npm scripts, no husky/lint-staged. Verification uses `npx eslint` / `npx prettier` directly.
- **Indentation target: 2 spaces** (matches `App.tsx`/`main.tsx`; Prettier default). Note: some existing files use 4-space (`cn.ts`) and will not be reformatted by this change.

## Architecture

### Dependencies (devDependencies)
| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | ^10 | Linter |
| `@eslint/js` | ^10 | `js.configs.recommended` |
| `typescript-eslint` | ^8 | TS parser + `tseslint.configs.recommended` (non-type-checked) |
| `eslint-plugin-react-hooks` | ^7 | Hooks rules (`configs.flat.recommended`) |
| `eslint-plugin-react-refresh` | ^0.5 | Fast-refresh rules |
| `eslint-config-prettier` | ^10 | Disable ESLint rules that clash with Prettier |
| `globals` | ^17 | `globals.browser` for browser env |
| `prettier` | ^3 | Formatter |

### `eslint.config.js` (flat config, ESM)
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'

export default defineConfig(
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
- `reactHooks.configs.flat.recommended` is the v7 official flat config object (`{ plugins, rules }`); spreading `.rules` into the same block keeps `plugins` registration with `react-refresh` in one place.
- `tseslint.configs.recommended` (not `recommendedTypeChecked`) — no project service needed, fast, no `tsconfig` changes.
- **`defineConfig` (not `tseslint.config`)**: `tseslint.config()` is deprecated in typescript-eslint v8.66 in favor of ESLint core's `defineConfig` from `eslint/config` (added in ESLint v9.22.0). `defineConfig(...args)` accepts the same rest-arg/array shape and native `extends` on config blocks. Behavior difference vs `tseslint.config`: `files` in extensions are **intersected** rather than overridden — verified against the installed `tseslint.configs.recommended` (`**/*.ts/.tsx/.mts/.cts`); the intersection with our `**/*.{ts,tsx}` yields identical coverage for this project.

### `.prettierrc.json`
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all"
}
```
- Matches existing code style (`App.tsx`, `main.tsx`): no semicolons, single quotes, trailing commas present.

### `.prettierignore`
```
node_modules
dist
dist-ssr
package-lock.json
```

### Editor integration
- **`.vscode/extensions.json`** (committed — `.gitignore` un-ignores this file):
  ```json
  {
    "recommendations": [
      "dbaeumer.vscode-eslint",
      "esbenp.prettier-vscode"
    ]
  }
  ```
- **`.vscode/settings.json`** (local-only — `.gitignore` blocks `.vscode/*`):
  ```json
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  }
  ```
  Local-only by design (personal tooling); note that the config will not be shared with other contributors unless `.gitignore` is amended.

## Known Considerations
- **react-refresh warnings**: `only-export-components` is `warn`; barrel files (`src/pages/index.ts`, `src/components/index.ts`) re-exporting modules may produce non-blocking warnings in the editor. No rule overrides added for this; revisit only if warnings prove noisy.
- **4-space files**: `cn.ts` and several other files use 4-space indentation. They are left untouched (no bulk reformat). If later formatted, they will be converted to 2-space — a deliberate, accepted divergence from AGENTS.md ("Indentation: 4 spaces"), approved by user.

## Verification
- No committed npm scripts (editor-only decision). Run directly:
  - `npx eslint .` — expect zero errors (may show react-refresh warnings on barrel files).
  - `npx prettier --check .` — will report unformatted pre-existing files; expected to fail on 4-space files. Gate the check to new/changed files only, or accept the diff as a known baseline.
  - `npm run build` — ensure no typecheck regressions from config additions (configs are additive; no source changes).

## Files to Create
1. `eslint.config.js`
2. `.prettierrc.json`
3. `.prettierignore`
4. `.vscode/extensions.json`
5. `.vscode/settings.json` (local-only)
6. `package.json` (devDependencies additions only — no new scripts)
