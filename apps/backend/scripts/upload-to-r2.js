#!/usr/bin/env node

// Usage: node scripts/upload-to-r2.js <fichier-ou-dossier> [prefix]
// Ex:    node scripts/upload-to-r2.js ~/Documents/cours-anglais anglais/

require('dotenv').config()
const path = require('path')
const fs = require('fs')
const { uploadFile } = require('../src/storage')

const CONTENT_TYPES = { '.pdf': 'application/pdf', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }

function collectFiles(target) {
  const stat = fs.statSync(target)
  if (stat.isFile()) return [target]
  return fs.readdirSync(target)
    .filter((f) => ['.pdf', '.xlsx'].includes(path.extname(f).toLowerCase()))
    .map((f) => path.join(target, f))
}

async function main() {
  const target = process.argv[2]
  const prefix = process.argv[3] || ''
  if (!target) {
    console.error('Usage: node scripts/upload-to-r2.js <fichier-ou-dossier> [prefix]')
    process.exit(1)
  }

  const files = collectFiles(path.resolve(target))
  for (const file of files) {
    const ext = path.extname(file).toLowerCase()
    const key = `${prefix}${path.basename(file)}`
    const body = fs.readFileSync(file)
    await uploadFile(key, body, CONTENT_TYPES[ext] || 'application/octet-stream')
    console.log(`✓ ${file} -> ${key}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
