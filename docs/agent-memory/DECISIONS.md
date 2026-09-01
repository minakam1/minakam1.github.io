# Decisions

## Public entry and private blog

- `poetry-in-noise` is the sole root homepage.
- Do not link to or publish the Hexo blog while it is closed.
- Preserve blog source in the repository; closing the blog is a deployment decision, not a source deletion.
- The homepage contact block contains only the homepage URL.
- Keep `/mado-character/` deployable by direct URL, but do not show a Madoka ticket on the homepage.

## Light archive

- Use `/gallery/` as the stable second-level route.
- Match the homepage visual language: six paper themes, pixel status bar, marquee, red stamp, printed contact-sheet layout, and subtle grain.
- Present the gallery as a continuous, natural-ratio photo stream without per-photo numbers, filenames, titles, captions, chapters, or commentary.
- Publish every supported image from `blog/hexo-new/source/相册/photos/`. `scripts/build-gallery.mjs` copies the files and generates `photos.json` during deployment, so adding a source photo requires no page edit.
- Keep the original photo files under the Hexo source unchanged.
- Use `scripts/import-gallery-photos.mjs` for new JPEG batches. It keeps input files unchanged, targets the current album median size, caps the longest edge at 2200 px, and refuses filename collisions.
- The gallery keeps the grain layer but has no full-screen scanline texture. Every stream image and the full-screen viewer show loading and failure states.
