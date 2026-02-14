# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

- **Dev server:** `pnpm dev` (Vite with HMR)
- **Build:** `pnpm build` (runs `tsc -b && vite build`)
- **Lint:** `pnpm lint` (ESLint with TypeScript + React hooks rules)
- **Preview production build:** `pnpm preview`

Package manager is **pnpm**.

## Architecture

React 19 + TypeScript + Vite 8 (beta) single-page application. The React Compiler (babel-plugin-react-compiler) is enabled via Vite's Babel integration in `vite.config.ts`.

Entry point: `index.html` → `src/main.tsx` → `src/App.tsx`.

TypeScript is configured in strict mode with `noUnusedLocals` and `noUnusedParameters` enabled. The project uses `verbatimModuleSyntax`, so use `import type` for type-only imports.

## Styles

Plain CSS — `src/index.css` for global styles, `src/App.css` for component styles. Supports light/dark mode via `prefers-color-scheme`.
