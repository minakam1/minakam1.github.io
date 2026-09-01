# Experiments and results

## 2026-09-01 gallery release

- `resume-builder` production build passed with Vite; only the existing stale Browserslist database warning remained.
- Gallery JavaScript passed `node --check`.
- The first 18-photo editorial layout was rejected because the target is a full information stream without model-written commentary; it was replaced rather than extended.
- The gallery build script found and copied all 70 source photos into the artifact and generated the matching manifest.
- Remote visibility was changed from `PRIVATE` to `PUBLIC` through GitHub CLI.
- Desktop and 390 px mobile browser previews rendered without horizontal overflow or console errors; theme switching, lightbox open/close, and previous/next navigation worked.
- Locally assembled artifact returned 200 for `/` and `/gallery/`, and 404 for `/blog/`.
- GitHub Pages run `33510191741` completed successfully for commit `985047c`.
- Online checks returned 200 for `/`, `/gallery/`, and `/gallery/photos.json`; the manifest contained all 70 photos. `/blog/` returned 404 and the homepage had no blog link.

## 2026-09-01 external photo import

- Imported 35 JPEG photos from `/Volumes/Extreme SSD/照添加/` without modifying the originals.
- Input total was about 177 MB with a median near 5.7 MB; compressed copies total 15.2 MB and range from 354–472 KB, close to the prior album median of 455 KB.
- Visual spot checks covered landscape, portrait, color, and black-and-white results.
- GitHub Pages run `33514520355` completed successfully for commit `499cd80`; online manifest reported 105 photos, an imported photo returned 200, scanline hooks were absent, and loading-state assets were present.

## 2026-09-01 incremental photo and viewer update

- Switched GitHub Pages from legacy branch/Jekyll publishing to the `workflow` build type. The duplicate legacy build had failed on Hexo front matter with `Invalid Date: '{}' is not a valid datetime`, while the custom deployment workflow was succeeding.
- The reusable importer skipped 36 already-present names and imported 15 new JPEGs from the same external folder without changing the inputs. Outputs total 6.7 MB and range from 427–510 KB against a 453 KB target.
- A second importer run skipped all 51 intake-folder photos and exited successfully without overwriting album files.
- Gallery JavaScript and both Node scripts passed syntax checks; the gallery artifact contained 120 photos and a 120-entry manifest. The Resume Builder production build also passed, with only the existing stale Browserslist-data warning.
