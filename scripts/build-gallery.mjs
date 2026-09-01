import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const source = resolve(process.argv[2] ?? 'blog/hexo-new/source/相册/photos');
const output = resolve(process.argv[3] ?? '_site/gallery');
const thumbnailSource = resolve(process.argv[4] ?? join(source, '..', 'thumbnails'));
const photosOutput = join(output, 'photos');
const thumbnailsOutput = join(output, 'thumbnails');
const supported = /\.(avif|gif|jpe?g|png|webp)$/i;

const entries = await readdir(source, { withFileTypes: true });
const photos = entries
  .filter((entry) => entry.isFile() && supported.test(entry.name))
  .map((entry) => basename(entry.name))
  .sort((left, right) => left.localeCompare(right, 'zh-Hans-CN', { numeric: true }));
const thumbnailEntries = await readdir(thumbnailSource, { withFileTypes: true });
const thumbnailNames = new Set(thumbnailEntries
  .filter((entry) => entry.isFile() && supported.test(entry.name))
  .map((entry) => basename(entry.name)));
const missingThumbnails = photos.filter((name) => !thumbnailNames.has(name));

if (missingThumbnails.length) throw new Error(`Missing gallery thumbnails: ${missingThumbnails.join(', ')}`);

await mkdir(photosOutput, { recursive: true });
await mkdir(thumbnailsOutput, { recursive: true });
await Promise.all(photos.map((name) => copyFile(join(source, name), join(photosOutput, name))));
await Promise.all(photos.map((name) => copyFile(join(thumbnailSource, name), join(thumbnailsOutput, name))));
await writeFile(join(output, 'photos.json'), `${JSON.stringify({ photos }, null, 2)}\n`);
console.log(`Gallery: copied ${photos.length} photos and thumbnails`);
