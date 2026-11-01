#!/usr/bin/env node
/* Copies only the media this site references into public/media.
 *
 * The repo's /images holds every export; /images/web holds the
 * screen-sized, watermarked derivatives built by
 * scripts/derive-web-images.py. Only those ship — never the originals.
 * Reading the same data module the components import means the
 * manifest cannot drift from what the code asks for.
 */
import { mkdir, copyFile, rm, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here    = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(here, '..')
const repo    = resolve(appRoot, '..')

const SRC = {
  full:  join(repo, 'images', 'web', 'full'),
  thumb: join(repo, 'images', 'web', 'thumb'),
  video: join(repo, 'video'),
}
const OUT = join(appRoot, 'public', 'media')

const { CATEGORIES } = await import('../src/data/photos.js')

const wanted = []
for (const cat of CATEGORIES)
  for (const p of cat.photos)
    for (const set of ['full', 'thumb'])
      wanted.push([join(SRC[set], `${p.file}.webp`), join(OUT, set, `${p.file}.webp`)])

// The portrait is not gallery work, so it lives outside photos.js —
// and ships unwatermarked, because it is a picture OF Livio.
wanted.push([
  join(SRC.full, 'portrait-livio.webp'),
  join(OUT, 'full', 'portrait-livio.webp'),
])

if (existsSync(SRC.video))
  for (const f of await readdir(SRC.video))
    if (!f.startsWith('.')) wanted.push([join(SRC.video, f), join(OUT, 'video', f)])

await rm(OUT, { recursive: true, force: true })

let copied = 0, bytes = 0
const missing = []
for (const [from, to] of wanted) {
  if (!existsSync(from)) { missing.push(from.replace(repo + '/', '')); continue }
  await mkdir(dirname(to), { recursive: true })
  await copyFile(from, to)
  bytes += (await stat(to)).size
  copied++
}

console.log(`sync-assets: ${copied} Dateien, ${(bytes / 1048576).toFixed(1)} MB → public/media`)
if (missing.length) {
  console.error(`sync-assets: ${missing.length} Datei(en) fehlen:`)
  for (const m of missing.slice(0, 12)) console.error(`  - ${m}`)
  process.exit(1)
}
