#!/usr/bin/env node
/* Copies ONLY the media the site actually references into public/media.
 *
 * The repo's /images folder holds every export (107 JPGs, 86 WebPs) and
 * /video holds the encodes. Symlinking those into public/ shipped all
 * of it — a 102 MB build for a site that needs 66 files. This reads the
 * same data modules the components do, so the manifest cannot drift
 * from what the code asks for.
 *
 * Run via the predev / prebuild npm hooks.
 */
import { mkdir, copyFile, rm, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here    = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(here, '..')
const repo    = resolve(appRoot, '..')

const SRC = {
  // Web derivatives, not the originals: screen-sized and watermarked,
  // built by scripts/derive-web-images.py. The full-resolution files in
  // images/ are never shipped.
  full:  join(repo, 'images', 'web', 'full'),
  thumb: join(repo, 'images', 'web', 'thumb'),
  hero:  join(repo, 'images', 'hero'),
  video: join(repo, 'video'),
}
const OUT = join(appRoot, 'public', 'media')

const { CATEGORIES } = await import('../src/data/photos.js')
const { heroFiles }  = await import('../src/data/hero.js')

// ── Build the manifest ────────────────────────────────────
const wanted = []

// Gallery: both derivative sizes per photo.
for (const cat of CATEGORIES)
  for (const p of cat.photos)
    for (const set of ['full', 'thumb'])
      wanted.push([join(SRC[set], `${p.file}.webp`), join(OUT, set, `${p.file}.webp`)])

// Hero corridor: full and @sm variant per frame.
for (const file of heroFiles())
  for (const suffix of ['', '@sm'])
    wanted.push([join(SRC.hero, `${file}${suffix}.webp`), join(OUT, 'hero', `${file}${suffix}.webp`)])

// Video: whatever encodes and posters exist.
if (existsSync(SRC.video))
  for (const f of await readdir(SRC.video))
    if (!f.startsWith('.')) wanted.push([join(SRC.video, f), join(OUT, 'video', f)])

// ── Copy ──────────────────────────────────────────────────
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

const mb = (bytes / 1048576).toFixed(1)
console.log(`sync-assets: ${copied} Dateien, ${mb} MB → public/media`)

if (missing.length) {
  console.error(`sync-assets: ${missing.length} Datei(en) fehlen:`)
  for (const m of missing.slice(0, 12)) console.error(`  - ${m}`)
  process.exit(1)   // a missing asset is a broken page — fail the build
}
