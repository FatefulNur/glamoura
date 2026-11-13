# Glamoura site

Static site (no build step). Put these files in the GitHub repo root and enable GitHub Pages.

- `index.html` + `links.json`: home. Add a card by adding an item to a group in `links.json`.
- `calc.html`: order calculator (Pathao courier + 1% COD + net profit). Rates editable on the page.
- `price.html`, `reconcile.html`, `split.html`, `lot.html`, `messages.html`: other tools.
- `checklist.html`: daily / weekly / monthly. `guide.html`: sheet guide.
- `assets/pathao.js`: all Pathao math (single source of truth). `assets/common.js`, `assets/style.css`: shared.
- `manifest.webmanifest`, `sw.js`: installable + offline.

Pathao rates live in `DEFAULT_RATES` in `assets/pathao.js`. When Pathao changes them, edit there
(or on the calc page, which saves per device). Bump `V` in `sw.js` after changing any file so phones refresh the cache.

Tests: `node tests/logic.test.js`

Data: tool inputs stay in the browser's localStorage. Nothing is sent anywhere.
