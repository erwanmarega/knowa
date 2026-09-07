#!/usr/bin/env node

// Importe une matière "à documents" : un dossier contenant Cours/ Exos/ Corrections/
// Chaque PDF devient un document typé, rattaché à un chapitre déduit du nom de fichier.
//
// Usage: node scripts/import-documents.js <dossier> <matière>
// Ex:    node scripts/import-documents.js ~/Documents/Knowa/Physique "Physique"

require('dotenv').config()
const path = require('path')
const fs = require('fs')
const { Pool } = require('pg')
const { uploadFile } = require('../src/storage')

const CONTENT_TYPES = {
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
}

// Nom de dossier -> type de document
const KIND_BY_FOLDER = {
  cours: 'cours',
  exo: 'exos',
  exos: 'exos',
  exercice: 'exos',
  exercices: 'exos',
  correction: 'correction',
  corrections: 'correction',
  corrige: 'correction',
  corriges: 'correction',
}

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'myuser',
      password: process.env.POSTGRES_PASSWORD || 'passwordsavoir',
      database: process.env.POSTGRES_DB || 'espace-savoir',
    })

const deaccent = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

function slugify(str) {
  return deaccent(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function kindFromFolder(folder) {
  return KIND_BY_FOLDER[deaccent(folder).toLowerCase()] || null
}

// "Oxydoréduction correction exos.pdf" -> "Oxydoréduction"
function topicFromFilename(file) {
  let t = path.basename(file, path.extname(file))
  t = t.replace(/[\s_-]*(corrig[ée]s?|corrections?)([\s_-]+(des[\s_-]+)?(exos?|exercices?))?[\s_-]*$/i, '')
  t = t.replace(/[\s_-]*(exos?|exercices?|cours)[\s_-]*$/i, '')
  return t.trim()
}

async function upsertSubject(name) {
  const result = await pool.query(
    `INSERT INTO subjects (name, slug) VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, slug`,
    [name, slugify(name)]
  )
  return result.rows[0]
}

async function upsertChapter(subjectId, title) {
  const found = await pool.query(
    'SELECT id FROM chapters WHERE subject_id = $1 AND title = $2',
    [subjectId, title]
  )
  if (found.rows[0]) return found.rows[0].id

  const count = await pool.query(
    'SELECT COUNT(*)::int AS n FROM chapters WHERE subject_id = $1',
    [subjectId]
  )
  const inserted = await pool.query(
    'INSERT INTO chapters (subject_id, title, position) VALUES ($1, $2, $3) RETURNING id',
    [subjectId, title, count.rows[0].n]
  )
  return inserted.rows[0].id
}

function collect(dir) {
  const found = []
  for (const folder of fs.readdirSync(dir)) {
    const sub = path.join(dir, folder)
    if (!fs.statSync(sub).isDirectory()) continue

    const kind = kindFromFolder(folder)
    if (!kind) {
      console.warn(`⚠️  Dossier ignoré (type inconnu) : ${folder}`)
      continue
    }
    for (const file of fs.readdirSync(sub)) {
      if (!CONTENT_TYPES[path.extname(file).toLowerCase()]) continue
      found.push({ kind, file: path.join(sub, file) })
    }
  }
  return found
}

async function main() {
  const [dir, subjectName] = process.argv.slice(2)
  if (!dir || !subjectName) {
    console.error('Usage: node scripts/import-documents.js <dossier> <matière>')
    process.exit(1)
  }

  const resolved = dir.replace(/^~/, process.env.HOME)
  if (!fs.existsSync(resolved)) {
    console.error(`Dossier introuvable : ${resolved}`)
    process.exit(1)
  }

  const files = collect(resolved)
  if (files.length === 0) {
    console.error('Aucun document trouvé (attendu : sous-dossiers Cours/ Exos/ Corrections/)')
    process.exit(1)
  }

  const subject = await upsertSubject(subjectName)
  console.log(`\n📚 Matière : ${subjectName} (${subject.slug})`)

  let added = 0
  let skipped = 0

  for (const { kind, file } of files) {
    const title = topicFromFilename(file)
    const chapterId = await upsertChapter(subject.id, title)
    const filename = path.basename(file)

    const exists = await pool.query(
      'SELECT id FROM documents WHERE chapter_id = $1 AND filename = $2',
      [chapterId, filename]
    )
    if (exists.rows[0]) {
      console.log(`   = ${title} / ${kind} — déjà présent`)
      skipped++
      continue
    }

    const ext = path.extname(file).toLowerCase()
    const key = `${subject.slug}/${kind}/${Date.now()}-${slugify(path.basename(file, ext))}${ext}`
    await uploadFile(key, fs.readFileSync(file), CONTENT_TYPES[ext])
    await pool.query(
      'INSERT INTO documents (chapter_id, r2_key, filename, content_type, kind) VALUES ($1, $2, $3, $4, $5)',
      [chapterId, key, filename, CONTENT_TYPES[ext], kind]
    )
    console.log(`   ✓ ${title} / ${kind} — ${filename}`)
    added++
  }

  console.log(`\n✅ ${added} document(s) importé(s)${skipped ? `, ${skipped} déjà présent(s)` : ''}\n`)
  await pool.end()
}

main().catch((err) => {
  console.error('\n❌ Erreur :', err.message)
  process.exit(1)
})
