# Gallery photo tools

## Import and compress photos

```sh
node scripts/import-gallery-photos.mjs "/path/to/new/photos"
```

The importer:

- reads JPEG photos from the supplied folder without modifying the originals;
- resizes the longest edge to at most 2200 px;
- adjusts JPEG quality per image toward the current gallery's median file size;
- refuses to overwrite an existing filename; and
- writes compressed copies to `blog/hexo-new/source/相册/photos/`.

Optional overrides:

```sh
node scripts/import-gallery-photos.mjs "/path/to/new/photos" --max-edge=2200 --target-kb=465
```

`build-gallery.mjs` runs during deployment and copies the complete source album into the published `/gallery/` artifact.
