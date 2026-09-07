"use client"

import { useEffect, useRef, useState } from "react"
import { Item } from "@/lib/api"
import { RotateCcw } from "lucide-react"

type Direction = "en-fr" | "fr-en"

type Card = {
  id: number
  en: string
  fr: string
  direction: Direction
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildDeck(items: Item[]): Card[] {
  return shuffle(
    items.map((item) => ({
      id: item.id,
      en: item.content.en,
      fr: item.content.fr,
      direction: Math.random() < 0.5 ? "en-fr" : "fr-en",
    }))
  )
}

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function acceptedAnswers(raw: string): string[] {
  return raw
    .split("/")
    .map((part) => part.trim())
    .flatMap((part) =>
      part.includes("(e)")
        ? [normalize(part.replace(/\(e\)/g, "")), normalize(part.replace(/\(e\)/g, "e"))]
        : [normalize(part)]
    )
}

export function VocabularyQuiz({ items }: { items: Item[] }) {
  const [queue, setQueue] = useState<Card[]>(() => buildDeck(items))
  const [input, setInput] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [knownIds, setKnownIds] = useState<Set<number>>(new Set())
  const [retriedIds, setRetriedIds] = useState<Set<number>>(new Set())
  const [seenCount, setSeenCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const total = items.length
  const current = queue[0]
  const done = queue.length === 0

  useEffect(() => {
    if (!done) inputRef.current?.focus()
  }, [current?.id, done])

  function restart() {
    setQueue(buildDeck(items))
    setInput("")
    setSubmitted(false)
    setIsCorrect(false)
    setKnownIds(new Set())
    setRetriedIds(new Set())
    setSeenCount(0)
  }

  function advance(known: boolean) {
    if (!current) return
    if (known) {
      setKnownIds((prev) => new Set(prev).add(current.id))
      setQueue((q) => q.slice(1))
    } else {
      setQueue((q) => {
        const rest = q.slice(1)
        if (retriedIds.has(current.id)) return rest
        return [...rest, current]
      })
      setRetriedIds((prev) => new Set(prev).add(current.id))
    }
    setInput("")
    setSubmitted(false)
    setSeenCount((c) => c + 1)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!current) return
    if (!submitted) {
      const answerRaw = current.direction === "en-fr" ? current.fr : current.en
      const correct = acceptedAnswers(answerRaw).includes(normalize(input))
      setIsCorrect(correct)
      setSubmitted(true)
    } else {
      advance(isCorrect)
    }
  }

  if (done) {
    const missed = items.filter((i) => !knownIds.has(i.id))
    return (
      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-8 text-center">
        <p className="text-2xl font-extrabold text-white mb-1">
          {knownIds.size} / {total}
        </p>
        <p className="text-xs text-white/40 mb-6">mots retenus</p>

        {missed.length > 0 && (
          <div className="text-left max-w-sm mx-auto mb-6">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">À revoir</p>
            <div className="space-y-1.5">
              {missed.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-white/[0.03]">
                  <span className="text-white/80">{item.content.en}</span>
                  <span className="text-white/40">{item.content.fr}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={restart}
          className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 hover:bg-cyan-500/20 transition-colors text-cyan-300"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Recommencer
        </button>
      </div>
    )
  }

  const prompt = current.direction === "en-fr" ? current.en : current.fr
  const answerRaw = current.direction === "en-fr" ? current.fr : current.en
  const promptLabel = current.direction === "en-fr" ? "Anglais" : "Français"
  const answerLabel = current.direction === "en-fr" ? "Français" : "Anglais"

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/30">
          {seenCount} / {total + retriedIds.size}
        </p>
        <p className="text-xs text-white/30">{knownIds.size} su</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-8 mb-4">
          <p className="text-[11px] text-cyan-400/60 uppercase tracking-widest mb-2">{promptLabel}</p>
          <p className="text-2xl font-bold text-white mb-6">{prompt}</p>

          <p className="text-[11px] text-white/30 uppercase tracking-widest mb-2">{answerLabel}</p>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={submitted}
            placeholder="Écris ta réponse..."
            autoComplete="off"
            className={`w-full bg-transparent text-xl outline-none border-b pb-1 transition-colors ${
              !submitted
                ? "border-white/10 text-white focus:border-cyan-400/50"
                : isCorrect
                  ? "border-emerald-500/40 text-emerald-300"
                  : "border-red-500/40 text-red-300"
            }`}
          />
          {submitted && !isCorrect && (
            <p className="text-sm text-white/50 mt-2">
              Réponse attendue : <span className="text-white/80">{answerRaw}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex-1 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.08] hover:bg-cyan-500/[0.15] py-3 text-sm font-semibold text-cyan-300 transition-colors"
          >
            {!submitted ? "Valider" : "Suivant"}
          </button>
          {submitted && !isCorrect && (
            <button
              type="button"
              onClick={() => advance(true)}
              className="text-xs text-white/40 hover:text-white/70 underline underline-offset-2"
            >
              Je le savais
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
