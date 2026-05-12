# TODO Audit (based on architecture + current implementation)

## Completed
- Frontend pages exist for Home, Manual Entry, PDF Upload, and Results dashboard.
- Backend includes API routes for lab analysis and PDF parsing.
- Pipeline stages implemented: PDF extraction, lab normalization, deterministic rules, combination flags, and AI explanation orchestration.
- Medical disclaimers and guardrail language are present across API-generated outputs and UI pages.

## Remaining / Next TODOs

### 1) Replace or harden mock AI fallback for production
- OpenAI integration exists, but runtime can fall back to deterministic mock explanations.
- TODO: Add explicit production policy (fail closed vs fallback), observability, and alerting when fallback is triggered.

### 2) Strengthen PDF extraction quality
- Current parser extracts candidate values from text-based PDFs only.
- TODO: Add OCR path for image/scanned PDFs, confidence scoring, and extraction test corpus.

### 3) Add auth/session boundaries if moving beyond demo
- Current app is portfolio-safe and privacy-first, but has no user auth or session scoping.
- TODO: Add optional authentication and short-lived encrypted session storage if personal history tracking is planned.

### 4) Expand rule engine coverage and clinical nuance
- Rules currently classify primarily by provided ranges and basic severity estimation.
- TODO: Add unit conversion edge cases, age/sex-specific rule profiles, and range provenance metadata.

### 5) Add end-to-end tests for safety-critical flows
- TODO: Add E2E coverage for:
  - upload -> review -> analyze path,
  - malformed PDF handling,
  - structured response validation failures,
  - guardrail assertions (no diagnosis/prescribing text).

### 6) Operational hardening
- TODO: add request correlation IDs, better redaction for logs, rate-limit metrics dashboards, and dependency health checks.

### 7) UX improvements from architecture intent
- TODO: add explicit user correction loop for extracted values inline before analysis submit.
- TODO: add richer severity/risk visual states and clinician follow-up checklist export.

## Suggested Priority Order
1. E2E safety tests
2. AI fallback production policy
3. PDF extraction quality improvements
4. Rule-engine nuance and unit conversion
5. Operational observability hardening
6. UX refinements
