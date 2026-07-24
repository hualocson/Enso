# Lenis Smooth Scroll Integration Design

## Overview
Integrate [Lenis](https://lenis.darkroom.engineering/) smooth scrolling library into the Vite + React + Tailwind client application using a custom React hook and context provider pattern.

## Architecture

### Components
1. **`src/hooks/useLenis.ts`** - Custom hook that:
   - Initializes Lenis instance in `useEffect`
   - Configures Lenis with smooth wheel, touch support, lerp ~0.1
   - Handles cleanup: `lenis.destroy()` on unmount, `lenis.stop()` on scroll restoration
   - Exposes `lenis` instance via return value

2. **`src/context/LenisContext.tsx`** - React Context that:
   - Provides `lenis` instance to consumers
   - Wraps app content in `LenisProvider`

3. **`src/App.tsx`** - Updated to wrap routes with `LenisProvider`

### Configuration
```typescript
const lenis = new Lenis({
  lerp: 0.1,
  smoothWheel: true,
  touchMultiplier: 2,
  smoothTouch: false,
  normalizeWheel: true,
})
```

### Lifecycle
- **Mount**: `lenis.init()` + `requestAnimationFrame` loop via `lenis.raf()`
- **Scroll restoration**: `lenis.stop()` before browser restores scroll, `lenis.start()` after
- **Unmount**: `lenis.destroy()` cleanup

## Data Flow
```
App.tsx
  └── LenisProvider (context)
        └── BrowserRouter
              └── Routes
                    └── Pages (Home, CreatePost)
                          └── Components can access lenis via useLenis()
```

## Error Handling
- Wrap `lenis.raf()` in try/catch
- Guard against SSR: only initialize on client (`useEffect` with empty deps)
- Cleanup on unmount prevents memory leaks

## Testing
- Manual verification: smooth scroll on wheel/touch
- No console errors on mount/unmount/navigation
- Scroll restoration works on back/forward navigation

## Files to Create/Modify
1. **Create**: `src/hooks/useLenis.ts`
2. **Create**: `src/context/LenisContext.tsx`
3. **Modify**: `src/App.tsx` (wrap with LenisProvider)
4. **Install**: `lenis` package via npm