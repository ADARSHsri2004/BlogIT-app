# BlogIT Frontend

React + TypeScript + Vite UI for the BlogIT Medium-like platform.

## What it does
- Provides a clean Medium-inspired interface: landing, feed, reading view, and distraction-free editor.
- Handles authentication, protected routes, and optimistic navigation.
- Renders and edits Markdown with live preview.

## Why it exists
- Separates presentation and UX concerns from the backend APIs.
- Gives writers fast feedback (React Query caching) and responsive layouts.

## How it works
1. Axios instance (`src/services/api.ts`) talks to the Express API with `withCredentials` for cookies.
2. React Router defines routes for landing, feed, blog reading, profile, and writing.
3. React Query manages server state and caches auth + blog data.
4. Markdown editing powered by `@uiw/react-md-editor`; rendering via `react-markdown`.

## Running locally
Prereqs: Node 18+.

```bash
cd client
cp .env.example .env   # set VITE_API_URL if backend differs
npm install
npm run dev            # opens on http://localhost:5173
```

## Common mistakes to avoid
- Forgetting `withCredentials` (already set on axios instance) when hitting auth-protected endpoints.
- Mismatched `VITE_API_URL` vs backend port causing CORS failures.
- Not running backend first; feed/auth calls will fail without it.
- Skipping HTTPS + `secure` cookies in production.

## Routes
- `/` Landing
- `/feed` Published feed
- `/blog/:slug` Public reader view (drafts require ownership)
- `/write` Create (protected)
- `/write/:slug` Edit (protected)
- `/profile` Author dashboard (protected)
- `/auth` Login/Register

## UI notes
- Tailwind CSS with custom palette and serif headlines for readability.
- Framer Motion used sparingly for header/hero transitions.
- Responsive navbar with mobile drawer.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
