#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const XLSX = require('xlsx')
const { Pool } = require('pg')

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'myuser',
      password: process.env.POSTGRES_PASSWORD || 'passwordsavoir',
      database: process.env.POSTGRES_DB || 'espace-savoir',
    })

function detectType(data) {
  const first = (data[0] || []).map(c => String(c || '').trim())

  if (first.some(c => /prétérit|pretérit|preterit/i.test(c))) return 'verb_table'
  if (first.some(c => /base verbale/i.test(c))) return 'verb_table'

  for (const row of data) {
    const colA = String(row[0] || '').trim()
    if (/^chap\s+\d+/i.test(colA)) return 'vocabulary'
  }

  return 'unknown'
}

function parseVocabulary(data) {
  const chapters = []
  let current = null

  for (const row of data) {
    const colA = String(row[0] || '').trim()
    const colC = String(row[2] || '').trim()
    const colD = String(row[3] || '').trim()

    const match = colA.match(/^chap\s+(\d+)\s+page\s+(\d+)/i)
    if (match) {
      current = {
        chapter_number: parseInt(match[1]),
        page_number: parseInt(match[2]),
        title: colC,
        title_fr: colD,
        entries: [],
      }
      chapters.push(current)
      continue
    }

    if (!current || !colC || !colD) continue
    if (/^anglais$/i.test(colC) || /^français$/i.test(colD)) continue

    current.entries.push({ en: colC, fr: colD })
  }

  return chapters
}

function parseVerbTable(data) {
  const headers = (data[0] || []).map(c => String(c || '').trim()).filter(Boolean)
  const entries = []

  for (const row of data.slice(1)) {
    const entry = {}
    headers.forEach((h, i) => {
      const val = String(row[i] || '').trim()
      if (val) entry[h] = val
    })
    if (Object.keys(entry).length >= 2) entries.push(entry)
  }

  return entries
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chapters (
      id SERIAL PRIMARY KEY,
      subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      title_fr VARCHAR(255),
      chapter_number INTEGER,
      page_number INTEGER,
      position INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )`)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      content JSONB NOT NULL,
      position INTEGER DEFAULT 0
    )`)
}

async function upsertSubject(name) {
  const slug = slugify(name)
  const result = await pool.query(
    `INSERT INTO subjects (name, slug)
     VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, slug]
  )
  return result.rows[0].id
}

async function insertVocabulary(subjectId, chapters, startPosition) {
  let itemCount = 0
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i]
    const chResult = await pool.query(
      `INSERT INTO chapters (subject_id, title, title_fr, chapter_number, page_number, position)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [subjectId, ch.title || `Chapitre ${ch.chapter_number}`, ch.title_fr || null,
       ch.chapter_number, ch.page_number, startPosition + i]
    )
    const chapterId = chResult.rows[0].id

    for (let j = 0; j < ch.entries.length; j++) {
      await pool.query(
        'INSERT INTO items (chapter_id, type, content, position) VALUES ($1, $2, $3, $4)',
        [chapterId, 'vocabulary', JSON.stringify(ch.entries[j]), j]
      )
      itemCount++
    }
  }
  return itemCount
}

async function insertVerbTable(subjectId, fileName, entries, startPosition) {
  const title = path.basename(fileName, path.extname(fileName))
  const chResult = await pool.query(
    `INSERT INTO chapters (subject_id, title, position)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [subjectId, title, startPosition]
  )
  const chapterId = chResult.rows[0].id

  for (let i = 0; i < entries.length; i++) {
    await pool.query(
      'INSERT INTO items (chapter_id, type, content, position) VALUES ($1, $2, $3, $4)',
      [chapterId, 'verb_table', JSON.stringify(entries[i]), i]
    )
  }
  return entries.length
}

async function getChapterCount(subjectId) {
  const result = await pool.query(
    'SELECT COUNT(*)::int AS count FROM chapters WHERE subject_id = $1',
    [subjectId]
  )
  return result.rows[0].count
}

async function main() {
  const [, , filePath, subjectName] = process.argv

  if (!filePath || !subjectName) {
    console.error('Usage: node scripts/import-xlsx.js <fichier.xlsx> <matière>')
    console.error('Ex:    node scripts/import-xlsx.js "Verbes Irreguliers.xlsx" "Anglais"')
    process.exit(1)
  }

  const resolved = filePath.replace(/^~/, process.env.HOME)
  if (!fs.existsSync(resolved)) {
    console.error(`Fichier introuvable : ${resolved}`)
    process.exit(1)
  }

  console.log(`\n📂 Fichier  : ${path.basename(resolved)}`)
  console.log(`📚 Matière  : ${subjectName}`)

  const wb = XLSX.readFile(resolved)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

  const type = detectType(data)
  console.log(`🔍 Type détecté : ${type}`)

  if (type === 'unknown') {
    console.error('\n⚠️  Structure non reconnue. Aucune donnée insérée.')
    console.error('   Lignes 0-3 du fichier :')
    data.slice(0, 4).forEach((r, i) => console.error(`   L${i}: ${JSON.stringify(r)}`))
    process.exit(1)
  }

  await ensureTables()
  const subjectId = await upsertSubject(subjectName)
  const startPos = await getChapterCount(subjectId)

  let chapters = 0
  let items = 0

  if (type === 'vocabulary') {
    const parsed = parseVocabulary(data)
    chapters = parsed.length
    items = await insertVocabulary(subjectId, parsed, startPos)
  } else if (type === 'verb_table') {
    const parsed = parseVerbTable(data)
    chapters = 1
    items = await insertVerbTable(subjectId, resolved, parsed, startPos)
  }

  console.log(`\n✅ Import terminé`)
  console.log(`   ${chapters} chapitre(s) ajouté(s)`)
  console.log(`   ${items} entrée(s) insérée(s)`)

  await pool.end()
}

main().catch(err => {
  console.error('\n❌ Erreur :', err.message)
  process.exit(1)
})
