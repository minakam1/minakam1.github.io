import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const source = resolve(process.argv[2] ?? 'blog/hexo-new/source/相册/photos');
const output = resolve(process.argv[3] ?? '_site/gallery');
const photosOutput = join(output, 'photos');
const supported = /\.(avif|gif|jpe?g|png|webp)$/i;

const entries = await readdir(source, { withFileTypes: true });
const photos = entries
  .filter((entry) => entry.isFile() && supported.test(entry.name))
  .map((entry) => basename(entry.name))
  .sort((left, right) => left.localeCompare(right, 'zh-Hans-CN', { numeric: true }));

await mkdir(photosOutput, { recursive: true });
await Promise.all(photos.map((name) => copyFile(join(source, name), join(photosOutput, name))));
await writeFile(join(output, 'photos.json'), `${JSON.stringify({ photos }, null, 2)}\n`);
console.log(`Gallery: copied ${photos.length} photos`);
