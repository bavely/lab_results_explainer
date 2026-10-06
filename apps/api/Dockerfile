# Build context is the repo root: build with
#   docker build -f apps/api/Dockerfile .
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# pytesseract shells out to the tesseract binary for OCR of scanned PDFs.
RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY apps/api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY apps/api/run.py ./
COPY apps/api/src ./src

ENV FLASK_ENV=production \
    PORT=5050 \
    MAX_UPLOAD_MB=20

EXPOSE 5050
CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT} --workers 2 --timeout 120 run:app"]
