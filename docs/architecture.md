# Architecture

```txt
User enters lab values or uploads PDF/image report
        ↓
React frontend validates input
        ↓
Node.js API receives structured data or PDF file
        ↓
Report parser first attempts native PDF text extraction, then OCR fallback when needed
        ↓
Normalizer maps test names and units
        ↓
Rule engine compares values against provided reference ranges
        ↓
Combination flag engine detects important patterns
        ↓
AI service generates patient-friendly explanation
        ↓
Frontend renders color-coded dashboard
```

## Extraction Pipeline Notes

- Supported upload types are PDF, PNG, JPEG/JPG, and WEBP.
- PDF extraction prefers direct text parsing for speed and quality.
- If a PDF has insufficient selectable text, the API falls back to OCR.
- PDF OCR is capped to the first 5 pages and processed in small concurrent batches to improve throughput while limiting CPU spikes.

## Design Principle

The LLM should not be the source of truth for classification. The API first classifies values using provided reference ranges, then asks the LLM to explain those classifications in plain language.

## Production Deployment Shape

```txt
Browser
  ↓ HTTPS
Nginx on DigitalOcean VPS
  ├── /      → React static frontend container
  └── /api   → Express API container
```
