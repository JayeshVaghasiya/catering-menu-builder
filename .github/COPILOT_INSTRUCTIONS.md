Purpose

This file tells GitHub Copilot (and human contributors) how to help develop, test, and extend the Catering Menu app. Use concise prompts below to get targeted, repository-aware suggestions.

Project quick summary

Name: Catering Menu Builder

Tech stack: React + Vite + Tailwind CSS (v3.4.x), html2canvas, jsPDF

Paths of interest:

react-app/src/App.jsx — main entry

react-app/src/components/Preview.jsx — PDF export logic (html2canvas + jsPDF)

react-app/src/components/BrandingEditor.jsx — branding UI (Ganapati image slot)

react-app/src/components/MenuEditor.jsx — categories/dishes editor

react-app/src/assets/ — local sample images (sample-1.jpg ... sample-5.jpg)

static/ — static fallback site (single-page)

react-app/scripts/download-images.js — optional image downloader

How to run locally (for Copilot to assume)

cd react-app

npm install

npm run dev (open http://localhost:5173)

If postinstall downloads images, ensure internet access. Node 18+ recommended.

Goals for Copilot suggestions

When you ask Copilot to write or edit code in this repo, prefer suggestions that:

Preserve file structure and names used in this project.

Match existing coding style: functional React components, Tailwind utility classes, minimal external libs.

Use ESM imports (project uses "type": "module" in package.json).

Keep PDF export client-side using html2canvas + jsPDF and produce two A4 pages (branding + menu).

Respect image licensing — prefer using local src/assets/ copies or explicit Unsplash links (no proprietary downloads).