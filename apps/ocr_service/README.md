# OCR Enhancer Service (Python)

A small Flask microservice inspired by your OpenCV pipeline for improving OCR quality on noisy/scanned lab report images.

## Why this helps your current issue

The uploaded report image appears to include watermark/background artifacts and tight table spacing, which can cause OCR errors like:
- `CHOL/HDL Ratio` being read as `31` instead of `3.1`
- incorrect flag/value splits

This service applies:
1. Contrast normalization (CLAHE)
2. Background suppression (median background divide)
3. Adaptive binarization
4. Morphology cleanup
5. Deskew

Then runs Tesseract and returns candidate test/value rows.

## Run locally

```bash
cd apps/ocr_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Default port: `5051`

## API

### `GET /health`
Returns service status.

### `POST /enhance`
`multipart/form-data` with `file` image.

Response:
- `text`: full OCR text
- `candidateLabs`: regex-derived rows
- `debug.enhancedImagePath`: local temporary PNG path for inspection

Example:

```bash
curl -X POST http://localhost:5051/enhance \
  -F "file=@/path/to/lab_report.png"
```

## Environment variables

- `OCR_SERVICE_PORT` (default `5051`)
- `OCR_MAX_FILE_MB` (default `10`)
- `OCR_UPSCALE_FACTOR` (default `1.8`)
