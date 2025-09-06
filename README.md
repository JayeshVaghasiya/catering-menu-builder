# Catering Menu Project

This ZIP contains a production-ready React + Tailwind app and a static fallback.

## React app (react-app)

Install and run:

```bash
cd react-app
npm install
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173).

Features implemented:
- Branding with Ganapati image
- Select template (festival, minimalist, elegant)
- Add/remove categories and dishes
- Save in localStorage
- Export/Import JSON
- Export a 2-page PDF (branding + menu) using html2canvas + jsPDF

## Static app (static)

Open `static/index.html` directly or serve it:

```bash
cd static
python -m http.server 8000
# then visit http://localhost:8000
```

The static page supports adding categories and exporting a 2-page PDF.

