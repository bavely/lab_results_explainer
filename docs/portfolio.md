# Portfolio Entry

## Title

Lab Results Explainer

## Subtitle

AI-powered healthcare education tool for understanding common lab values.

## Description

Built a full-stack healthcare AI application that helps users understand common lab results in plain language. The system combines deterministic backend range classification with structured LLM explanations, PDF parsing, combination-based follow-up flags, and privacy-aware handling of uploaded reports. Deployed on a DigitalOcean VPS using Docker, Nginx, and HTTPS.

## Bullet Points

- Built a React + TypeScript patient-facing dashboard with Tailwind CSS, shadcn/ui-style components, manual lab entry, PDF upload, result cards, and range visualizations.
- Designed a Node.js API that validates lab inputs, normalizes test names, classifies values against reference ranges, and detects follow-up patterns.
- Integrated OpenAI with medical guardrails to explain results without diagnosing or prescribing.
- Implemented privacy-conscious handling by avoiding persistent storage, limiting uploads, and preventing sensitive request-body logging.
- Deployed the production app on a DigitalOcean VPS with Docker Compose, Nginx reverse proxy, and Let's Encrypt HTTPS.

## Resume Bullet

Built and deployed a full-stack healthcare AI lab-results explainer using React, TypeScript, Tailwind CSS, shadcn/ui, Node.js, Express, OpenAI, PDF parsing, Docker, Nginx, and DigitalOcean; implemented deterministic lab-range classification, combination follow-up flags, medical safety guardrails, and privacy-aware upload handling.
