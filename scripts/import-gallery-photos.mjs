import { copyFile, mkdir, mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const positional = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const source = resolve(positional[0] ?? '');
const destination = resolve(positional[1] ?? 'blog/hexo-new/source/相册/photos');
const option = (name, fallback) => {
  const prefix = `--${name}=`;
  const value = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return value ? Number(value.slice(prefix.length)) : fallback;
};
const maxEdge = option('max-edge', 2200);
const requestedTargetKb = option('target-kb', 0);
const supported = /\.jpe?g$/i;

if (!positional[0] || !Number.isFinite(maxEdge) || maxEdge < 640) {
  console.error('Usage: node scripts/import-gallery-photos.mjs <source-dir> [destination-dir] [--max-edge=2200] [--target-kb=465]');
  process.exit(1);
}
if (process.platform !== 'darwin') {
  console.error('This importer requires macOS /usr/bin/sips.');
  process.exit(1);
}

await mkdir(destination, { recursive: true });
const sourceEntries = (await readdir(source, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && supported.test(entry.name))
  .sort((left, right) => left.name.localeCompare(right.name, 'zh-Hans-CN', { numeric: true }));
const destinationEntries = (await readdir(destination, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && supported.test(entry.name));

if (!sourceEntries.length) {
  console.error('No JPEG photos found in the source directory.');
  process.exit(1);
}

const existingNames = new Set(destinationEntries.map((entry) => entry.name.toLocaleLowerCase()));
const skipped = sourceEntries.filter((entry) => existingNames.has(entry.name.toLocaleLowerCase()));
const pendingEntries = sourceEntries.filter((entry) => !existingNames.has(entry.name.toLocaleLowerCase()));

if (skipped.length) console.log(`Skipping ${skipped.length} photos already in the album.`);
if (!pendingEntries.length) {
  console.log('No new photos to import.');
  process.exit(0);
}

const existingSizes = await Promise.all(destinationEntries.map(async (entry) => (await stat(join(destination, entry.name))).size));
existingSizes.sort((left, right) => left - right);
const median = existingSizes.length ? existingSizes[Math.floor((existingSizes.length - 1) / 2)] : 475_000;
const targetBytes = requestedTargetKb > 0 ? Math.round(requestedTargetKb * 1024) : median;
const staging = await mkdtemp(join(tmpdir(), 'gallery-import-'));

const encode = (input, output, quality) => {
  const result = spawnSync('/usr/bin/sips', [
    '-Z', String(maxEdge),
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', String(quality),
    input,
    '--out', output,
  ], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `sips failed for ${basename(input)}`);
};

const imported = [];
try {
  for (const entry of pendingEntries) {
    const input = join(source, entry.name);
    let low = 30;
    let high = 88;
    let best;

    for (let attempt = 0; attempt < 7 && low <= high; attempt += 1) {
      const quality = Math.floor((low + high) / 2);
      const candidate = join(staging, `${entry.name}.${quality}.jpg`);
      encode(input, candidate, quality);
      const bytes = (await stat(candidate)).size;
      const difference = Math.abs(bytes - targetBytes);
      if (!best || difference < best.difference) best = { candidate, bytes, difference, quality };
      if (bytes > targetBytes) high = quality - 1;
      else low = quality + 1;
    }

    const output = join(staging, entry.name);
    await copyFile(best.candidate, output);
    imported.push({ name: entry.name, bytes: best.bytes, quality: best.quality, output });
    console.log(`${entry.name}: ${Math.round(best.bytes / 1024)} KB (quality ${best.quality})`);
  }

  for (const photo of imported) await copyFile(photo.output, join(destination, photo.name));
} finally {
  await rm(staging, { recursive: true, force: true });
}

const sizes = imported.map((photo) => photo.bytes).sort((left, right) => left - right);
const total = sizes.reduce((sum, bytes) => sum + bytes, 0);
console.log(`Imported ${imported.length} photos. Target ${Math.round(targetBytes / 1024)} KB; range ${Math.round(sizes[0] / 1024)}–${Math.round(sizes.at(-1) / 1024)} KB; total ${(total / 1024 / 1024).toFixed(1)} MB.`);
