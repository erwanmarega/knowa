const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')

const app = express()
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production'

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'myuser',
      password: process.env.POSTGRES_PASSWORD || 'passwordsavoir',
      database: process.env.POSTGRES_DB || 'espace-savoir',
    })

app.use(cors({ origin: process.env.CORS_ORIGIN || true }))
app.use(express.json())

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chapters (
      id SERIAL PRIMARY KEY,
      subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      title_fr VARCHAR(255),
      chapter_number INTEGER,
      page_number INTEGER,
      group_name VARCHAR(255),
      position INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await pool.query(`
    ALTER TABLE chapters ADD COLUMN IF NOT EXISTS group_name VARCHAR(255)
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      content JSONB NOT NULL,
      position INTEGER DEFAULT 0
    )
  `)
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' })
  }
  try {
    const hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hash]
    )
    const user = result.rows[0]
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Email ou nom d'utilisateur déjà utilisé" })
    }
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' })
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.get('/api/subjects', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, COUNT(c.id)::int AS chapter_count
       FROM subjects s
       LEFT JOIN chapters c ON c.subject_id = s.id
       GROUP BY s.id
       ORDER BY s.name`
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.get('/api/subjects/:slug/chapters', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, s.name AS subject_name, COUNT(i.id)::int AS item_count
       FROM chapters c
       JOIN subjects s ON s.id = c.subject_id
       LEFT JOIN items i ON i.chapter_id = c.id
       WHERE s.slug = $1
       GROUP BY c.id, s.name
       ORDER BY c.position, c.chapter_number`,
      [req.params.slug]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Matière introuvable' })
    const { subject_name } = result.rows[0]
    const chapters = result.rows.map(({ subject_name: _, ...ch }) => ch)
    res.json({ subject_name, chapters })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.get('/api/chapters/:id/items', async (req, res) => {
  try {
    const chapter = await pool.query(
      `SELECT c.*, s.name AS subject_name, s.slug AS subject_slug
       FROM chapters c JOIN subjects s ON s.id = c.subject_id
       WHERE c.id = $1`,
      [req.params.id]
    )
    if (!chapter.rows[0]) return res.status(404).json({ error: 'Chapitre introuvable' })

    const items = await pool.query(
      'SELECT * FROM items WHERE chapter_id = $1 ORDER BY position',
      [req.params.id]
    )
    res.json({ chapter: chapter.rows[0], items: items.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

initDB()
  .then(() => app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)))
  .catch((err) => {
    console.error('DB init failed:', err)
    process.exit(1)
  })

module.exports = { pool }
