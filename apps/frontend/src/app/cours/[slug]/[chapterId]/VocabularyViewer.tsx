"use client"

import { Item } from "@/lib/api"
import { useState } from "react"
import { VocabularyQuiz } from "./VocabularyQuiz"

export function VocabularyViewer({ items }: { items: Item[] }) {
  const [mode, setMode] = useState<"grid" | "quiz">("grid")
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const allRevealed = revealed.size === items.length

  const toggle = (id: number) =>
    setRevealed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleRevealAll = () => {
    if (allRevealed) {
      setRevealed(new Set())
    } else {
      setRevealed(new Set(items.map((i) => i.id)))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-white/30">
          {mode === "grid" ? "Clique sur une carte pour révéler la traduction" : "Devine la traduction avant de révéler"}
        </p>
        <div className="flex items-center gap-2">
          {mode === "grid" && (
            <button
              onClick={handleRevealAll}
              className="text-xs font-medium px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] transition-colors text-white/60 hover:text-white"
            >
              {allRevealed ? "Tout masquer" : "Tout révéler"}
            </button>
          )}
          <div className="flex rounded-lg border border-white/[0.08] p-0.5 bg-white/[0.03]">
            <button
              onClick={() => setMode("grid")}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                mode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setMode("quiz")}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                mode === "quiz" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              Quiz
            </button>
          </div>
        </div>
      </div>

      {mode === "quiz" ? (
        <VocabularyQuiz items={items} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => {
            const isRevealed = revealed.has(item.id)
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="group text-left rounded-xl bg-white/[0.04] border border-white/[0.07] p-4 hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-150 cursor-pointer"
              >
                <p className="text-sm font-medium text-white leading-snug mb-2">
                  {item.content.en}
                </p>
                <div
                  className={`text-sm transition-all duration-200 ${
                    isRevealed
                      ? "text-cyan-400/80 opacity-100"
                      : "text-transparent select-none blur-[6px] opacity-40"
                  }`}
                >
                  {item.content.fr}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
