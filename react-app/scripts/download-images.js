// scripts/download-images.js
// Run: node scripts/download-images.js
// This script tries to download images from the Unsplash photo page IDs listed in src/assets/remote-images.json
// It attempts common Unsplash CDN URL patterns. If a direct download URL is preferred, replace the entries in the JSON with the direct image URLs.
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const imagesJsonPath = path.join(__dirname, '..', 'src', 'assets', 'remote-images.json');
const outDir = path.join(__dirname, '..', 'src', 'assets');
async function run() {
  if (!fs.existsSync(imagesJsonPath)) {
    console.error('remote-images.json not found at', imagesJsonPath);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));
  const images = data.images || [];
  for (let i = 0; i < images.length; i++) {
    const pageUrl = images[i];
    // attempt to extract the Unsplash photo id from the page URL's last path segment
    const parts = pageUrl.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    // try several candidate CDN URL forms
    const candidates = [
      `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`,
      `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`,
      `https://images.unsplash.com/photo-${id}.jpg?auto=format&fit=crop&w=1600&q=80`,
    ];
    let saved = false;
    for (const url of candidates) {
      try {
        console.log('Trying', url);
        const res = await fetch(url, { redirect: 'follow' });
        if (!res.ok) {
          console.log('  not ok', res.status);
          continue;
        }
        const buffer = await res.buffer();
        const outPath = path.join(outDir, `sample-${i+1}.jpg`);
        fs.writeFileSync(outPath, buffer);
        console.log('Saved', outPath);
        saved = true;
        break;
      } catch (err) {
        console.log('  error', err.message);
      }
    }
    if (!saved) {
      console.log('Failed to download image for', pageUrl, ' — please manually download and place a file named sample-' + (i+1) + '.jpg in src/assets/');
    }
  }
  console.log('Done. Note: If some downloads failed, open src/assets/remote-images.json and replace entries with direct image URLs.');
}
run();
