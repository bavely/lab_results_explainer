# Lab Results Explainer

A patient-friendly AI web application that helps users understand common lab results in plain language. Users can manually enter values such as Hemoglobin, A1C, Cholesterol, TSH, LDL, HDL, Triglycerides, Glucose, Creatinine, and eGFR, or upload a lab report PDF for automatic extraction.

> Medical disclaimer: This project is for educational and portfolio purposes only. It does not provide medical advice, diagnosis, or treatment. Lab results should always be interpreted by a licensed healthcare professional.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-style components
- react-hook-form
- Zod
- TanStack Query
- Recharts
- Lucide React

### Backend

- Node.js
- TypeScript
- Express
- Zod
- Multer
- pdf-parse
- OpenAI API with safe mock fallback

### Deployment

- Docker Compose
- Nginx reverse proxy
- DigitalOcean VPS
- Let's Encrypt SSL

## Features in This Starter

- Manual lab result entry
- Dynamic result rows
- Backend classification: normal, low, high, unknown
- Combination follow-up flags
- AI explanation service with safe mock fallback
- PDF upload endpoint with candidate extraction
- Extracted PDF values review page
- Results dashboard
- Range visualization
- Medical disclaimer UX
- Docker-ready production setup

## Repository Structure

```txt
lab-results-explainer/
├── apps/
│   ├── web/                         # React + Tailwind frontend
│   └── api/                         # Express backend
├── packages/
│   ├── shared/                      # Shared Zod schemas and TypeScript types
│   └── reference-data/              # Lab aliases and educational metadata
├── docs/
│   ├── architecture.md
│   ├── deployment-digitalocean.md
│   ├── medical-guardrails.md
│   └── portfolio.md
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

## Local Setup

```bash
pnpm install
cp .env.example apps/api/.env
pnpm dev
```

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:4000/api/health
```

## Build

```bash
pnpm build
```

## Docker Local Run

```bash
docker compose up -d --build
```

Frontend container is exposed locally on:

```txt
http://127.0.0.1:8080
```

API container is exposed locally on:

```txt
http://127.0.0.1:4000/api/health
```

## Important Safety Positioning

This app intentionally does **not** diagnose. The backend classifies values using deterministic rules before the LLM explains them. The LLM should explain the backend classification, not independently decide whether a value is medically normal or abnormal.

For a public portfolio demo:

- Do not store uploaded PDFs.
- Do not store lab values.
- Do not collect names, DOB, MRN, insurance ID, address, or phone number.
- Do not log request bodies.
- Use sample data in the live demo.
- Add a visible disclaimer on every result page.

## Portfolio Talking Point

> I built a healthcare AI tool that combines deterministic lab-range classification with LLM-generated patient explanations. The system uses medical guardrails, structured JSON validation, privacy-aware PDF handling, and a clean patient-facing React UI to make lab reports easier to understand without making diagnoses.
