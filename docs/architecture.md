# Architecture

```txt
User enters lab values or uploads PDF
        ↓
React frontend validates input
        ↓
Node.js API receives structured data or PDF file
        ↓
PDF parser extracts candidate lab values when needed
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
