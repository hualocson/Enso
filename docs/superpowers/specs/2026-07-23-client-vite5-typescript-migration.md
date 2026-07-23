# Client: Vite 5 + TypeScript Migration

## Objective
Upgrade the client from Vite 4 (JSX) to Vite 5 (TypeScript) with strict mode, keeping React 18 and Tailwind 3.

## Scope
- Upgrade deps: vite 4→5, @vitejs/plugin-react 3→4, add typescript 5.x
- Add tsconfig.json with strict: true
- Rename .jsx → .tsx, .js → .ts, add type annotations
- Convert vite.config.js → vite.config.ts
- Update Tailwind content glob to include .tsx
- Remove App.css
- No functional changes

## Non-goals
- No React 19 upgrade
- No new features
- No restructuring
