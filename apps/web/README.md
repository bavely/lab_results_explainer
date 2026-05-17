# Lab Results Explainer Web App

React + TypeScript frontend for the Lab Results Explainer project.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- shadcn-style component primitives
- react-hook-form + Zod for form validation
- TanStack Query for API interaction/caching

## Run locally

From `apps/web`:

```bash
npm install
cp .env.example .env
npm run dev
```

Default dev URL: `http://localhost:5173`

## Environment

- `VITE_API_BASE_URL` — Flask API base URL (for example `http://localhost:4000`)

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — type-check and build production bundle
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Feature Overview

- Manual lab result entry form with validation
- PDF upload flow for candidate lab extraction
- Color-coded dashboard with range indicators and risk flags
- Medical disclaimer and educational framing

For broader architecture context, see `../../docs/architecture.md`.
