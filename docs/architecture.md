# Architecture

## End-to-end flow

```txt
User enters lab values or uploads PDF
        ↓
React frontend validates input with react-hook-form + Zod
        ↓
Flask API receives structured data or PDF file
        ↓
PDF parser extracts candidate values (upload flow)
        ↓
Normalizer maps aliases (for example Hgb → hemoglobin)
        ↓
Rule engine classifies low / normal / high using reference ranges
        ↓
Combination engine adds cross-result risk flags
        ↓
AI service generates plain-language educational explanation
        ↓
Frontend renders cards, range indicators, and disclaimers
```

## Backend (Flask)

### App bootstrap

- `apps/api/src/app.py` creates the Flask app.
- Registers CORS for `/api/*`, upload max size, health route, and global error handlers.
- Mounts lab routes under `/api/labs`.

### Lab analysis module

- `POST /api/labs/analyze` in `modules/lab_analysis/routes.py`
- Validates request with Pydantic schemas.
- Runs deterministic processing in `service.py`:
  - test-name normalization
  - reference range classification
  - combination risk-flag detection
  - explanation generation via AI provider + fallback

### PDF parser module

- `POST /api/labs/upload` expects multipart field `file`.
- `modules/pdf_parser/service.py` extracts text via `pypdf` and parses candidate values.
- Designed to return reviewable candidate values rather than silent auto-finalized clinical outputs.

### AI module

- `modules/ai/ai_service.py` handles provider selection.
- Supports deterministic mock mode and Azure AI Foundry Agent mode.
- Backend keeps classification authoritative; AI explains classifications.

## Frontend (React)

### Page layout

- `pages/HomePage.tsx` composes upload, form, dashboard, and disclaimer sections.
- `components/layout/AppShell.tsx` provides app shell.

### Main lab workflow components

- `PdfUploadDropzone.tsx` uploads report PDFs.
- `LabEntryForm.tsx` handles manual result entry + submission.
- `ResultsDashboard.tsx` renders explanations and risk banners.
- `LabResultCard.tsx` and `RangeIndicator.tsx` visualize status and ranges.
- `MedicalDisclaimer.tsx` reinforces non-diagnostic educational intent.

### API integration

- `src/lib/api.ts` centralizes calls to:
  - `/api/labs/analyze`
  - `/api/labs/upload`
- Uses environment-driven API base URL.

## Safety design principles

1. Deterministic backend logic determines normal/abnormal status.
2. LLM output is explanatory, not diagnostic or classificatory.
3. Privacy-oriented parsing avoids persistent file storage.
4. UI consistently communicates educational-only limitations.
