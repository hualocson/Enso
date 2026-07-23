# AI Image Generator

See per-project agent instructions:

- [server/AGENTS.md](server/AGENTS.md) — Backend (Express, MongoDB, Cloudflare AI, Cloudinary)
- [client/AGENTS.md](client/AGENTS.md) — Frontend (React, Vite, Tailwind)

## Coding Guidelines

### 1. Think Before Coding
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.

### 2. Simplicity First
- Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked. No abstractions for single-use code.
- If 200 lines could be 50, rewrite it.

### 3. Surgical Changes
- Touch only what you must. Match existing style.
- Don't "improve" adjacent code, comments, or formatting.
- Remove imports/variables your changes made unused; don't touch pre-existing dead code.

### 4. Goal-Driven Execution
- Define verifiable success criteria before starting.
- For multi-step tasks, state a brief plan with verification checks.
