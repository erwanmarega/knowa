// Server Components (fetch pendant le SSR, dans le réseau Docker) -> API_URL, lu au runtime, jamais inliné
const SERVER_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
// Code exécuté dans le navigateur (login/signup) -> doit rester joignable depuis l'extérieur du réseau Docker
const BROWSER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export interface Subject {
  id: number
  name: string
  slug: string
  chapter_count: number
}

export interface Chapter {
  id: number
  subject_id: number
  title: string
  title_fr: string | null
  chapter_number: number | null
  page_number: number | null
  group_name: string | null
  position: number
  item_count: number
}

export interface Item {
  id: number
  chapter_id: number
  type: 'vocabulary' | 'verb_table'
  content: Record<string, string>
  position: number
}

export interface ChapterWithItems {
  chapter: Chapter & { subject_name: string; subject_slug: string }
  items: Item[]
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${SERVER_API_URL}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export interface ChaptersResponse {
  subject_name: string
  chapters: Chapter[]
}

export const getSubjects = () => apiFetch<Subject[]>('/api/subjects')
export const getChapters = (slug: string) => apiFetch<ChaptersResponse>(`/api/subjects/${slug}/chapters`)
export const getChapterItems = (id: string) => apiFetch<ChapterWithItems>(`/api/chapters/${id}/items`)

export interface AuthResponse {
  token: string
  user: { id: number; username: string; email: string }
}

async function authPost(path: string, body: object): Promise<AuthResponse> {
  const res = await fetch(`${BROWSER_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || 'Request failed')
  }
  return res.json()
}

export const loginUser = (email: string, password: string) =>
  authPost('/auth/login', { email, password })

export const registerUser = (username: string, email: string, password: string) =>
  authPost('/auth/register', { username, email, password })
