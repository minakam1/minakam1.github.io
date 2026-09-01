# Current state

- Repository: `minakam1/minakam1.github.io`, branch `main`.
- Root homepage: `poetry-in-noise/`, published at `/`.
- Light archive: `poetry-in-noise/gallery/`, published at `/gallery/`; the legacy `/gallery.html` redirects there. Its photo manifest and files are generated from the Hexo album source during deployment.
- The album source currently contains 118 photos and a matching set of 900 px thumbnails after importing compressed images from the external `照添加` folder.
- Resume Builder: built from `resume-builder/`, published at `/resume-builder/`.
- Character page: `mado-character/`, published at `/mado-character/` when present.
- Hexo source remains in `blog/hexo-new/` but is intentionally absent from the Pages artifact. `/blog/` must stay unavailable until the user reopens it.
- GitHub Pages uses the GitHub Actions build type and is deployed only by `.github/workflows/pages.yml` after pushes to `main`.
