# Experiments and results

## 2026-09-01 gallery release

- `resume-builder` production build passed with Vite; only the existing stale Browserslist database warning remained.
- Gallery JavaScript passed `node --check`.
- Static checks found 18 gallery frames, 18 published photos, and no `/blog/` reference under `poetry-in-noise/`.
- Remote visibility was changed from `PRIVATE` to `PUBLIC` through GitHub CLI.
- Desktop and 390 px mobile browser previews rendered without horizontal overflow or console errors; theme switching, lightbox open/close, and previous/next navigation worked.
- Locally assembled artifact returned 200 for `/` and `/gallery/`, and 404 for `/blog/`.
- Online deployment and route checks are recorded here after the push completes.
