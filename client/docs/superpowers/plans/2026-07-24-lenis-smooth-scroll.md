# Lenis Smooth Scroll Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Lenis smooth scrolling library into the Vite + React + Tailwind client using a custom hook and context provider pattern.

**Architecture:** Create `useLenis` hook for Lenis initialization/cleanup, `LenisContext` for providing the instance, wrap `App.tsx` with `LenisProvider`. Configure Lenis with lerp: 0.1, smoothWheel: true, touch support.

**Tech Stack:** React 18, Vite 8, TypeScript, Tailwind CSS 3, Lenis (npm package)

## Global Constraints

- Use `clsx` + `tailwind-merge` via `cn` utility for all className logic
- Components as arrow functions with `export default`, props typed with `interface` in same file
- Barrel exports: each directory has `index.ts` with named re-exports
- Imports: no extension for `.tsx`/`.ts` files; relative imports from barrel files
- State: `useState` + `useEffect` only (no external state lib)
- Styles: Inline Tailwind utility classes; custom classes in `index.css`
- Naming: PascalCase components, camelCase functions/vars, UPPER_SNAKE constants
- Indentation: 4 spaces
- API calls: `fetch` to `http://localhost:8080` (hardcoded)
- No tests or testing framework exists
- No environment variable config for API URL

---

### Task 1: Install Lenis Package

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `lenis` dependency available for import

- [ ] **Step 1: Install lenis package**

```bash
npm install lenis
```

- [ ] **Step 2: Verify installation**

```bash
npm list lenis
```
Expected: `lenis@^1.x.x` listed

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lenis smooth scroll dependency"
```

---

### Task 2: Create useLenis Hook

**Files:**
- Create: `src/hooks/useLenis.ts`
- Modify: `src/hooks/index.ts` (barrel export)

**Interfaces:**
- Produces: `useLenis(): Lenis | null` - returns Lenis instance or null during SSR

- [ ] **Step 1: Create useLenis hook**

```typescript
// src/hooks/useLenis.ts
import { useEffect, useRef, useState } from 'react'
import { Lenis } from 'lenis'

export function useLenis(): Lenis | null {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const rafRef = useRef<number>()
  const isScrollRestoring = useRef(false)

  useEffect(() => {
    const lenisInstance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      touchMultiplier: 2,
      smoothTouch: false,
      normalizeWheel: true,
    })

    setLenis(lenisInstance)

    const raf = (time: number) => {
      try {
        lenisInstance.raf(time)
      } catch {
        // ignore RAF errors during unmount
      }
      rafRef.current = requestAnimationFrame(raf)
    }

    rafRef.current = requestAnimationFrame(raf)

    const onScrollStart = () => {
      if (isScrollRestoring.current) {
        lenisInstance.start()
        isScrollRestoring.current = false
      }
    }

    const onScrollEnd = () => {
      isScrollRestoring.current = true
      lenisInstance.stop()
    }

    lenisInstance.on('scroll', onScrollStart)
    lenisInstance.on('scroll', onScrollEnd)

    return () => {
      lenisInstance.off('scroll', onScrollStart)
      lenisInstance.off('scroll', onScrollEnd)
      cancelAnimationFrame(rafRef.current)
      lenisInstance.destroy()
    }
  }, [])

  return lenis
}
```

- [ ] **Step 2: Add barrel export**

```typescript
// src/hooks/index.ts
export { cn } from './cn'
export { getErrorMessage, getRandomPrompt, api } from './error'
export { useLenis } from './useLenis'
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useLenis.ts src/hooks/index.ts
git commit -m "feat: add useLenis hook for smooth scroll initialization"
```

---

### Task 3: Create LenisContext Provider

**Files:**
- Create: `src/context/LenisContext.tsx`
- Modify: `src/context/index.ts` (barrel export - create if not exists)

**Interfaces:**
- Consumes: `useLenis()` hook returning `Lenis | null`
- Produces: `LenisProvider` component, `useLenisContext()` hook returning `Lenis`

- [ ] **Step 1: Create LenisContext**

```typescript
// src/context/LenisContext.tsx
import { createContext, useContext, useEffect, ReactNode } from 'react'
import { Lenis } from 'lenis'
import { useLenis } from '../hooks'

interface LenisContextValue {
  lenis: Lenis | null
}

const LenisContext = createContext<LenisContextValue>({ lenis: null })

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenis = useLenis()

  // Expose lenis to window for debugging (dev only)
  useEffect(() => {
    if (import.meta.env.DEV && lenis) {
      ;(window as Window & { __lenis__?: Lenis }).__lenis__ = lenis
    }
    return () => {
      if (import.meta.env.DEV) {
        delete (window as Window & { __lenis__?: Lenis }).__lenis__
      }
    }
  }, [lenis])

  return (
    <LenisContext.Provider value={{ lenis }}>
      {children}
    </LenisContext.Provider>
  )
}

export function useLenisContext(): Lenis {
  const context = useContext(LenisContext)
  if (!context.lenis) {
    throw new Error('useLenisContext must be used within LenisProvider')
  }
  return context.lenis
}
```

- [ ] **Step 2: Create context barrel export**

```typescript
// src/context/index.ts
export { LenisProvider, useLenisContext } from './LenisContext'
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/context/LenisContext.tsx src/context/index.ts
git commit -m "feat: add LenisContext provider for smooth scroll"
```

---

### Task 4: Wrap App with LenisProvider

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `LenisProvider` from `src/context`

- [ ] **Step 1: Update App.tsx**

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, CreatePost } from './pages'
import { Header } from './components'
import Footer from './components/Footer'
import { LenisProvider } from './context'

const App = () => {
  return (
    <LenisProvider>
      <BrowserRouter>
        <Header />
        <main className="w-full bg-background min-h-[calc(100vh-49px)]">
          <div className="max-w-7xl mx-auto sm:p-8 px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-post" element={<CreatePost />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </BrowserRouter>
    </LenisProvider>
  )
}

export default App
```

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
```
Expected: Vite dev server starts without errors, smooth scroll works on page

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wrap app with LenisProvider for smooth scrolling"
```

---

### Task 5: Verify Build and Manual Test

**Files:** None (verification only)

- [ ] **Step 1: Run production build**

```bash
npm run build
```
Expected: Build completes successfully, `dist/` folder created

- [ ] **Step 2: Preview production build**

```bash
npm run preview
```
Expected: Preview server starts, smooth scroll works in production build

- [ ] **Step 3: Manual verification checklist**

- [ ] Smooth scroll on mouse wheel (desktop)
- [ ] Smooth scroll on touch (mobile/touchpad)
- [ ] No console errors on mount
- [ ] No console errors on route navigation (Home ↔ CreatePost)
- [ ] No console errors on page unmount/refresh
- [ ] Scroll restoration works on browser back/forward
- [ ] DevTools: `window.__lenis__` accessible in development

- [ ] **Step 4: Commit any final changes**

```bash
git add -A
git commit -m "chore: verify lenis integration build and runtime"
```

---

## Self-Review

### Spec Coverage
| Spec Requirement | Task |
|------------------|------|
| Install lenis package | Task 1 |
| Create useLenis hook with init/cleanup | Task 2 |
| Configure lerp: 0.1, smoothWheel, touch support | Task 2 |
| Handle scroll restoration (stop/start) | Task 2 |
| Cleanup on unmount (destroy) | Task 2 |
| Create LenisContext provider | Task 3 |
| Expose lenis via context | Task 3 |
| Wrap App with LenisProvider | Task 4 |
| SSR guard (client-only init) | Task 2 |
| Dev debugging via window.__lenis__ | Task 3 |
| Build verification | Task 5 |

### Placeholder Scan
- No TBD/TODO placeholders
- All code blocks complete with actual implementations
- All commands have expected outputs

### Type Consistency
- `useLenis()` returns `Lenis | null` → `LenisContext` provides same type
- `useLenisContext()` returns `Lenis` (throws if null) - matches consumer expectation
- `LenisProvider` accepts `ReactNode` children - standard React pattern