#!/usr/bin/env node

// Upload un fichier vers R2 et le lie à un chapitre en DB.
// Usage: node scripts/attach-document.js <chapterId> <fichier> [prefix]
// Ex:    node scripts/attach-document.js 12 ~/Documents/anglais-chap3.pdf anglais/

require('dotenv').config()
const path = require('path')
const fs = require('fs')
const { Pool } = require('pg')
const { uploadFile } = require('../src/storage')

const CONTENT_TYPES = { '.pdf': 'application/pdf', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'myuser',
      password: process.env.POSTGRES_PASSWORD || 'passwordsavoir',
      database: process.env.POSTGRES_DB || 'espace-savoir',
    })

async function main() {
  const [chapterId, file, prefix = ''] = process.argv.slice(2)
  if (!chapterId || !file) {
    console.error('Usage: node scripts/attach-document.js <chapterId> <fichier> [prefix]')
    process.exit(1)
  }

  const chapter = await pool.query('SELECT id, title FROM chapters WHERE id = $1', [chapterId])
  if (!chapter.rows[0]) {
    console.error(`Chapitre ${chapterId} introuvable`)
    process.exit(1)
  }

  const resolved = path.resolve(file)
  const ext = path.extname(resolved).toLowerCase()
  const filename = path.basename(resolved)
  const key = `${prefix}${Date.now()}-${filename}`
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'

  await uploadFile(key, fs.readFileSync(resolved), contentType)
  await pool.query(
    'INSERT INTO documents (chapter_id, r2_key, filename, content_type) VALUES ($1, $2, $3, $4)',
    [chapterId, key, filename, contentType]
  )

  console.log(`✓ "${filename}" lié au chapitre "${chapter.rows[0].title}" (${key})`)
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
