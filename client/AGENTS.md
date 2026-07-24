# enso — Client

## Commands
- `npm run dev` — Start Vite dev server
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

## Tech Stack
React 18, Vite 8, TypeScript, Tailwind CSS 3, react-router-dom 6, file-saver

## Project Structure
```
src/
├── App.tsx              Root component with BrowserRouter + Routes
├── main.tsx             Entry point (ReactDOM.createRoot)
├── index.css            Tailwind directives + custom styles
├── assets/              Static image imports (barrel: index.ts)
├── components/          Reusable UI (Card, FormField, Loader) (barrel: index.ts)
├── pages/               Route pages (Home, CreatePost) (barrel: index.ts)
├── constants/           Prompt strings array (barrel: index.ts)
└── utils/               Helper functions (barrel: index.ts)
```

## Code Conventions
- **Components**: Arrow functions, `export default`, props typed with `interface` in same file
- **Barrel exports**: Each directory has `index.ts` with named re-exports
- **Imports**: No extension for `.tsx`/`.ts` files; relative imports from barrel files
- **State**: `useState` + `useEffect` only (no external state lib)
- **Styles**: Inline Tailwind utility classes; custom classes (`card`, `prompt`) in `index.css`
- **Class merge**: `cn` utility (`clsx` + `tailwind-merge`) from `src/utils/cn.ts` for all className logic
- **Naming**: PascalCase for components, camelCase for functions/vars, UPPER_SNAKE for constants
- **Indentation**: 4 spaces
- **API calls**: `fetch` to `http://localhost:8080` (hardcoded)

## Pages & Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `Home` | Gallery grid with search/filter |
| `/create-post` | `CreatePost` | Generate image via DALL-E + share form |

## Gotchas
- Server runs on **port 8080** — API base URL is hardcoded throughout
- No tests or testing framework exists
- No environment variable config for API URL — update each `fetch` if port changes
- Tailwind custom `xs` breakpoint at 480px
- Fugaz One (headings) + Work Sans (body) via Google Fonts
